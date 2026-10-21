import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Briefcase,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  Send,
  Search,
  Filter,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  Building,
  MapPin,
  AlertCircle,
  Plus,
  Eye,
  FileSearch,
  Linkedin,
  Layers,
  Award,
} from "lucide-react";
import { fetchApplications, createApplication, updateApplicationStatus } from "@/lib/application-engine/api";
import { useAuth } from "@/lib/auth-context";
import { useDataset } from "@/hooks/use-dataset";
import {
  discoverAndMatchJobs,
  analyzeCustomJobPosting,
  JobOpportunity,
  ProfileJobMatch,
  StudentPreferences,
} from "@/lib/job-discovery/matching-engine";
import { getDirectJobApplyLinks } from "@/lib/job-discovery";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export type ApplicationStatus = "SAVED" | "applied" | "interview" | "selected" | "rejected";

interface TrackedApplication {
  id: string;
  status: ApplicationStatus;
  match_score?: number;
  created_at: string;
  updated_at: string;
  job_id?: string;
  raw_job_records?: {
    id: string;
    title: string;
    company: string;
    location: string;
    raw_skills?: string[];
  };
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  SAVED: { label: "Saved", color: "bg-muted text-muted-foreground border-border", icon: Briefcase },
  applied: { label: "Applied", color: "bg-blue-500/10 text-blue-600 border-blue-500/30", icon: Send },
  interview: { label: "Interview", color: "bg-purple-500/10 text-purple-600 border-purple-500/30", icon: UserCheck },
  selected: { label: "Offer / Selected", color: "bg-green-500/10 text-green-600 border-green-500/30", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-destructive/10 text-destructive border-destructive/30", icon: XCircle },
};

const statusOrder: ApplicationStatus[] = ["SAVED", "applied", "interview", "selected", "rejected"];

export default function ApplicationTracker() {
  const { user } = useAuth();
  const { data: dataset } = useDataset();
  const userId = user?.id || "current";

  // Select student profile
  const student = useMemo(() => {
    if (!dataset?.students) return null;
    return user?.profileId
      ? dataset.students.find((s) => s.id === user.profileId) ?? dataset.students[0]
      : dataset.students[0];
  }, [dataset, user]);

  const [activeTab, setActiveTab] = useState<"pipeline" | "explore">("pipeline");
  const [applications, setApplications] = useState<TrackedApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [arrangementFilter, setArrangementFilter] = useState<string>("all");
  const [minScoreFilter, setMinScoreFilter] = useState<number>(0);

  // Modal states
  const [selectedJobModal, setSelectedJobModal] = useState<(JobOpportunity & { match?: ProfileJobMatch }) | null>(null);
  const [customJobModalOpen, setCustomJobModalOpen] = useState(false);
  const [customJobText, setCustomJobText] = useState("");
  const [analyzedCustomJob, setAnalyzedCustomJob] = useState<(JobOpportunity & { match: ProfileJobMatch }) | null>(null);

  const localKey = `skillintel_user_apps_${user?.id || "guest"}`;

  // Preferences
  const preferences: StudentPreferences = useMemo(() => ({
    targetRoles: ["Data Scientist", "Software Engineer", "Data Analyst", "Machine Learning"],
    preferredLocations: ["Bengaluru", "Remote", "India"],
    preferredArrangements: ["Remote", "Hybrid", "Onsite"],
  }), []);

  // Compute matched opportunities
  const matchedOpportunities = useMemo(() => {
    if (!student) return [];
    return discoverAndMatchJobs(student, preferences, userId);
  }, [student, preferences, userId]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const dbApps = await fetchApplications();
        let finalApps = (dbApps as unknown as TrackedApplication[]) || [];

        try {
          const cached = localStorage.getItem(localKey);
          if (cached) {
            const parsed = JSON.parse(cached);
            const existingIds = new Set(finalApps.map((a) => a.id));
            parsed.forEach((p: TrackedApplication) => {
              if (!existingIds.has(p.id)) finalApps.push(p);
            });
          }
        } catch (e) {
          console.warn("Could not read local applications cache", e);
        }

        if (finalApps.length === 0) {
          finalApps = [
            {
              id: "app-demo-1",
              status: "applied",
              match_score: 92,
              created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
              updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
              raw_job_records: {
                id: "JOB-TE-101",
                title: "Junior Data Scientist",
                company: "Bengaluru Analytics Lab",
                location: "Bengaluru, India",
                raw_skills: ["Python", "Machine Learning", "SQL", "Statistics"],
              },
            },
            {
              id: "app-demo-2",
              status: "SAVED",
              match_score: 85,
              created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
              updated_at: new Date(Date.now() - 4 * 86400000).toISOString(),
              raw_job_records: {
                id: "JOB-TE-102",
                title: "Graduate Software Engineer (Full Stack)",
                company: "NexGen Cloud Solutions",
                location: "Bengaluru, India",
                raw_skills: ["Java", "SQL", "Problem Solving", "Git"],
              },
            },
          ];
        }
        setApplications(finalApps);
      } catch (err) {
        console.error("Error loading application tracker:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [localKey]);

  const syncLocalApps = (updated: TrackedApplication[]) => {
    setApplications(updated);
    try {
      localStorage.setItem(localKey, JSON.stringify(updated));
    } catch (e) {
      console.warn("Storage sync failed", e);
    }
  };

  const handleStatusChange = async (appId: string, newStatus: ApplicationStatus) => {
    try {
      await updateApplicationStatus(appId, newStatus);
    } catch {
      // Local fallback
    }
    const updated = applications.map((a) =>
      a.id === appId ? { ...a, status: newStatus, updated_at: new Date().toISOString() } : a
    );
    syncLocalApps(updated);
    toast.success(`Application updated to ${statusConfig[newStatus]?.label || newStatus}`);
  };

  const handleSaveOrApply = async (job: JobOpportunity & { match?: ProfileJobMatch }, initialStatus: ApplicationStatus = "SAVED") => {
    const exists = applications.some((a) => a.raw_job_records?.id === job.id || a.job_id === job.id);
    if (exists) {
      toast.info(`You have already tracked "${job.title}" at ${job.company}.`);
      return;
    }

    const newApp: TrackedApplication = {
      id: `app-local-${Date.now()}`,
      status: initialStatus,
      match_score: job.match?.overallScore || 85,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      job_id: job.id,
      raw_job_records: {
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        raw_skills: job.requiredSkills,
      },
    };

    try {
      await createApplication({
        job_id: job.id,
        match_score: job.match?.overallScore || 85,
        status: initialStatus,
      });
    } catch {
      // Offline fallback
    }

    const updated = [newApp, ...applications];
    syncLocalApps(updated);
    toast.success(
      initialStatus === "applied"
        ? `Application tracked for "${job.title}" at ${job.company}!`
        : `Saved "${job.title}" to your career pipeline!`
    );
  };

  // Analyze custom job pasted by user
  const handleAnalyzeCustomJob = () => {
    if (!customJobText.trim() || !student) {
      toast.error("Please paste a job description first.");
      return;
    }
    const result = analyzeCustomJobPosting(customJobText, student, preferences, userId);
    setAnalyzedCustomJob(result);
    toast.success(`Parsed job posting! Overall profile match: ${result.match.overallScore}%`);
  };

  // Filtered applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const job = app.raw_job_records;
      const titleMatch = job?.title?.toLowerCase().includes(searchQuery.toLowerCase());
      const companyMatch = job?.company?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSearch = searchQuery === "" || titleMatch || companyMatch;
      const matchesStatus = statusFilter === "all" || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [applications, searchQuery, statusFilter]);

  // Filtered explore opportunities
  const filteredOpportunities = useMemo(() => {
    return matchedOpportunities.filter((opp) => {
      const titleMatch = opp.title.toLowerCase().includes(searchQuery.toLowerCase());
      const companyMatch = opp.company.toLowerCase().includes(searchQuery.toLowerCase());
      const skillMatch = opp.requiredSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesSearch = searchQuery === "" || titleMatch || companyMatch || skillMatch;

      const matchesArrangement = arrangementFilter === "all" || opp.workArrangement === arrangementFilter;
      const matchesScore = opp.match.overallScore >= minScoreFilter;

      return matchesSearch && matchesArrangement && matchesScore;
    });
  }, [matchedOpportunities, searchQuery, arrangementFilter, minScoreFilter]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold tracking-tight">Job Applications & Discovery</h1>
              <Badge variant="outline" className="border-primary/40 text-primary text-xs">
                Profile Matched
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Personalized career matching and application tracking grounded in verified student skills
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-xs"
              onClick={() => {
                setCustomJobModalOpen(true);
                setAnalyzedCustomJob(null);
                setCustomJobText("");
              }}
            >
              <FileSearch className="h-4 w-4 text-[#0A66C2]" />
              Analyze External / LinkedIn Job
            </Button>
            <Button size="sm" onClick={() => setActiveTab("explore")} className="gap-2 text-xs">
              <Search className="h-4 w-4" /> Discover Opportunities
            </Button>
          </div>
        </div>

        {/* LinkedIn API & Integrity Disclosure Banner */}
        <div className="p-3.5 bg-muted/40 border rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-foreground">Verified Matching Policy: </span>
              <span className="text-muted-foreground">
                SkillIntel evaluates job alignment against your authenticated profile, coursework, and connected GitHub repositories.
                To comply with LinkedIn's Developer Agreement, automated scraping is prohibited; use our external analyzer to match any pasted posting.
              </span>
            </div>
          </div>
          <Link to="/career">
            <Button variant="ghost" size="sm" className="h-7 text-xs text-primary shrink-0">
              Career Intelligence <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as "pipeline" | "explore")}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2">
            <TabsList>
              <TabsTrigger value="pipeline" className="gap-2 text-xs">
                <Layers className="h-3.5 w-3.5" /> Tracked Pipeline ({applications.length})
              </TabsTrigger>
              <TabsTrigger value="explore" className="gap-2 text-xs">
                <Search className="h-3.5 w-3.5" /> Matched Opportunities ({filteredOpportunities.length})
              </TabsTrigger>
            </TabsList>

            {/* Filter and Search Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 sm:w-60">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search role, company, skill..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 text-xs h-8"
                />
              </div>

              {activeTab === "pipeline" ? (
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px] text-xs h-8">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {statusOrder.map((s) => (
                      <SelectItem key={s} value={s}>
                        {statusConfig[s].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <>
                  <Select value={arrangementFilter} onValueChange={setArrangementFilter}>
                    <SelectTrigger className="w-[120px] text-xs h-8">
                      <SelectValue placeholder="Arrangement" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Remote">Remote</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                      <SelectItem value="Onsite">Onsite</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={String(minScoreFilter)} onValueChange={(v) => setMinScoreFilter(Number(v))}>
                    <SelectTrigger className="w-[130px] text-xs h-8">
                      <SelectValue placeholder="Min Match" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">All Matches</SelectItem>
                      <SelectItem value="60">60%+ Fit</SelectItem>
                      <SelectItem value="75">75%+ (Eligible)</SelectItem>
                      <SelectItem value="85">85%+ (Strong)</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>
          </div>

          {/* TAB 1: PIPELINE */}
          <TabsContent value="pipeline" className="mt-2 space-y-4">
            {filteredApplications.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent className="space-y-3">
                  <Briefcase className="h-10 w-10 text-muted-foreground mx-auto" />
                  <h3 className="font-semibold text-base">No Applications in Pipeline</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    {searchQuery
                      ? "No tracked opportunities matched your current search criteria."
                      : "You have not tracked any applications yet. Explore personalized matched opportunities to start."}
                  </p>
                  <Button size="sm" onClick={() => setActiveTab("explore")} className="gap-1.5 mt-2">
                    <Search className="h-3.5 w-3.5" /> Discover Matched Jobs
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredApplications.map((app) => {
                  const job = app.raw_job_records || { id: "unknown", title: "Job Opportunity", company: "Company", location: "Location" };
                  const currentStatus = app.status;
                  const config = statusConfig[currentStatus] || statusConfig.SAVED;
                  const Icon = config.icon;

                  return (
                    <Card key={app.id} className="hover:border-primary/40 transition-colors">
                      <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-sm sm:text-base">{job.title}</h3>
                              {app.match_score && (
                                <Badge variant="secondary" className="text-xs font-semibold">
                                  {app.match_score}% Match
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                              <span>{job.company}</span>
                              <span>•</span>
                              <span>{job.location}</span>
                              <span>•</span>
                              <span className="text-[10px]">Updated: {new Date(app.updated_at).toLocaleDateString()}</span>
                            </p>
                            {job.raw_skills && job.raw_skills.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {job.raw_skills.map((s) => (
                                  <Badge key={s} variant="outline" className="text-[10px] py-0 px-1.5">
                                    {s}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Status Switcher */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <Select
                            value={currentStatus}
                            onValueChange={(val: ApplicationStatus) => handleStatusChange(app.id, val)}
                          >
                            <SelectTrigger className={`w-[135px] text-xs h-8 border ${config.color}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {statusOrder.map((s) => (
                                <SelectItem key={s} value={s} className="text-xs">
                                  {statusConfig[s].label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-[#0A66C2] hover:text-[#0A66C2] hover:bg-[#0A66C2]/10"
                            title="Open on LinkedIn"
                            onClick={() => {
                              const links = getDirectJobApplyLinks(job.title, job.company, job.location);
                              window.open(links.linkedIn, "_blank");
                            }}
                          >
                            <Linkedin className="h-4 w-4 fill-current" />
                          </Button>

                          <Link to={`/application-workspace/${job.id || "job-1"}`}>
                            <Button variant="ghost" size="sm" className="h-8 text-xs text-primary">
                              Workspace
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* TAB 2: EXPLORE OPPORTUNITIES */}
          <TabsContent value="explore" className="mt-2 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {filteredOpportunities.map((opp) => {
                const match = opp.match;
                const isAlreadyTracked = applications.some(
                  (a) => a.raw_job_records?.id === opp.id || a.job_id === opp.id
                );

                const badgeVariant =
                  match.overallScore >= 75
                    ? "default"
                    : match.overallScore >= 55
                    ? "secondary"
                    : "outline";

                return (
                  <Card key={opp.id} className="flex flex-col justify-between hover:border-primary/40 transition-all">
                    <CardHeader className="pb-2.5">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <CardTitle className="text-base font-semibold leading-snug">{opp.title}</CardTitle>
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                            <Building className="h-3.5 w-3.5" /> {opp.company} • <MapPin className="h-3.5 w-3.5" /> {opp.location}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <Badge variant={badgeVariant} className="text-xs font-semibold px-2 py-0.5">
                            {match.overallScore}% Fit
                          </Badge>
                          <div className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                            {match.eligibilityStatus}
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3 pb-3">
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {opp.description}
                      </p>

                      {/* Required skills with match indicators */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                          Skill Alignment:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {opp.requiredSkills.map((s) => {
                            const isMatched = match.matchedSkills.some(
                              (ms) => ms.name.toLowerCase() === s.toLowerCase()
                            );
                            return (
                              <Badge
                                key={s}
                                variant={isMatched ? "secondary" : "outline"}
                                className={`text-[10px] py-0 px-1.5 ${
                                  isMatched
                                    ? "bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/30"
                                    : "text-muted-foreground opacity-75"
                                }`}
                              >
                                {isMatched ? "✓ " : "• "}
                                {s}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>

                      {/* Source attribution pill */}
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                        <span className="flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3 text-primary" />
                          {opp.sourceAttribution.sourceName}
                        </span>
                        <span className="font-semibold text-foreground">
                          Trust Score: {opp.sourceAttribution.trustScore}/100
                        </span>
                      </div>
                    </CardContent>

                    <CardFooter className="flex items-center justify-between border-t p-3 bg-muted/10 text-xs">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7 px-2"
                        onClick={() => setSelectedJobModal(opp)}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" /> Match Explainability
                      </Button>

                      <div className="flex items-center gap-2">
                        {isAlreadyTracked ? (
                          <div className="flex items-center gap-1.5">
                            <Badge variant="outline" className="text-green-600 bg-green-500/10 border-green-500/20 text-xs py-1">
                              <CheckCircle2 className="h-3 w-3 mr-1" /> In Pipeline
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-7 px-2 border-[#0A66C2]/40 text-[#0A66C2] hover:bg-[#0A66C2]/10"
                              title="Open on LinkedIn"
                              onClick={() => {
                                const links = getDirectJobApplyLinks(opp.title, opp.company, opp.location);
                                window.open(links.linkedIn, "_blank");
                              }}
                            >
                              <Linkedin className="h-3 w-3 fill-current" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-7"
                              onClick={() => handleSaveOrApply(opp, "SAVED")}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-7 gap-1 border-[#0A66C2]/40 text-[#0A66C2] hover:bg-[#0A66C2]/10"
                              onClick={() => {
                                const links = getDirectJobApplyLinks(opp.title, opp.company, opp.location);
                                window.open(links.linkedIn, "_blank");
                                handleSaveOrApply(opp, "applied");
                              }}
                            >
                              <Linkedin className="h-3 w-3 fill-current" /> LinkedIn ↗
                            </Button>
                            <Button
                              size="sm"
                              className="text-xs h-7 gap-1"
                              onClick={() => handleSaveOrApply(opp, "applied")}
                            >
                              <Send className="h-3 w-3" /> Apply
                            </Button>
                          </>
                        )}
                      </div>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* MODAL 1: MATCH EXPLAINABILITY MODAL */}
        {selectedJobModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <Card className="max-w-xl w-full border-primary/20 shadow-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader className="pb-3 border-b">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <CardTitle className="text-lg font-bold">{selectedJobModal.title}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedJobModal.company} • {selectedJobModal.location} ({selectedJobModal.workArrangement})
                    </p>
                  </div>
                  {selectedJobModal.match && (
                    <div className="text-right shrink-0">
                      <Badge className="text-sm font-bold px-2.5 py-1">
                        {selectedJobModal.match.overallScore}% Fit
                      </Badge>
                      <div className="text-[11px] text-muted-foreground mt-1">
                        {selectedJobModal.match.eligibilityStatus}
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-4 text-xs">
                {/* 4-Factor Matching Rubric */}
                {selectedJobModal.match && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground flex items-center gap-1.5 text-xs">
                      <Sparkles className="h-3.5 w-3.5 text-primary" /> Weighted Profile Matching Breakdown
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="p-2.5 rounded bg-muted/40 border">
                        <div className="text-[10px] text-muted-foreground">Skill Coverage (45%)</div>
                        <div className="text-base font-bold text-foreground">
                          {selectedJobModal.match.factors.skillScore}%
                        </div>
                      </div>
                      <div className="p-2.5 rounded bg-muted/40 border">
                        <div className="text-[10px] text-muted-foreground">Academic CGPA (25%)</div>
                        <div className="text-base font-bold text-foreground">
                          {selectedJobModal.match.factors.academicScore}%
                        </div>
                      </div>
                      <div className="p-2.5 rounded bg-muted/40 border">
                        <div className="text-[10px] text-muted-foreground">Project Rigor (15%)</div>
                        <div className="text-base font-bold text-foreground">
                          {selectedJobModal.match.factors.projectScore}%
                        </div>
                      </div>
                      <div className="p-2.5 rounded bg-muted/40 border">
                        <div className="text-[10px] text-muted-foreground">Preference Fit (15%)</div>
                        <div className="text-base font-bold text-foreground">
                          {selectedJobModal.match.factors.preferenceScore}%
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Matched Skills with Verification Evidence */}
                {selectedJobModal.match && selectedJobModal.match.matchedSkills.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                      Verified Matched Competencies ({selectedJobModal.match.matchedSkills.length})
                    </h4>
                    <div className="space-y-1.5">
                      {selectedJobModal.match.matchedSkills.map((ms) => (
                        <div key={ms.name} className="p-2 rounded bg-green-500/5 border border-green-500/20 flex items-center justify-between">
                          <span className="font-medium text-foreground">{ms.name}</span>
                          <span className="text-[10px] text-muted-foreground truncate max-w-[240px]">
                            {ms.evidenceSource}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing Skills and Gap Remediation */}
                {selectedJobModal.match && selectedJobModal.match.missingSkills.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                      Unverified / Skill Gaps ({selectedJobModal.match.missingSkills.length})
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedJobModal.match.missingSkills.map((s) => (
                        <Badge key={s} variant="outline" className="border-amber-500/40 text-amber-700 dark:text-amber-300">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actionable Prep Steps */}
                {selectedJobModal.match && selectedJobModal.match.actionablePrepSteps.length > 0 && (
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-1.5">
                    <h4 className="font-semibold text-primary flex items-center gap-1.5">
                      <Award className="h-3.5 w-3.5" /> Actionable Next Steps
                    </h4>
                    <ul className="list-disc pl-4 space-y-1 text-muted-foreground text-[11px]">
                      {selectedJobModal.match.actionablePrepSteps.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Source Verification Lineage */}
                <div className="p-2.5 rounded bg-muted/30 border text-[11px] text-muted-foreground space-y-1">
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                    Data Trust Lineage
                  </div>
                  <p>Source: {selectedJobModal.sourceAttribution.sourceName}</p>
                  <p>Trust Score: {selectedJobModal.sourceAttribution.trustScore}/100 • Verified: {selectedJobModal.sourceAttribution.verifiedAt}</p>
                  {selectedJobModal.sourceAttribution.complianceNote && (
                    <p className="italic text-[10px]">{selectedJobModal.sourceAttribution.complianceNote}</p>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex justify-between border-t p-3 bg-muted/10">
                <Button variant="ghost" size="sm" onClick={() => setSelectedJobModal(null)}>
                  Close
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs gap-1.5 border-[#0A66C2]/40 text-[#0A66C2] hover:bg-[#0A66C2]/10"
                    onClick={() => {
                      const links = getDirectJobApplyLinks(
                        selectedJobModal.title,
                        selectedJobModal.company,
                        selectedJobModal.location
                      );
                      window.open(links.linkedIn, "_blank");
                      handleSaveOrApply(selectedJobModal, "applied");
                      setSelectedJobModal(null);
                    }}
                  >
                    <Linkedin className="h-3.5 w-3.5 fill-current" /> Apply on LinkedIn ↗
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      handleSaveOrApply(selectedJobModal, "applied");
                      setSelectedJobModal(null);
                    }}
                  >
                    Track as Applied
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* MODAL 2: ANALYZE EXTERNAL / LINKEDIN JOB DESCRIPTION */}
        <Dialog open={customJobModalOpen} onOpenChange={setCustomJobModalOpen}>
          <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Linkedin className="h-5 w-5 text-[#0A66C2]" /> Analyze External / LinkedIn Job
              </DialogTitle>
              <DialogDescription className="text-xs">
                Paste any external job description to parse required competencies, verify student eligibility, and
                evaluate profile alignment without unauthorized web scraping.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Paste Job Title, Company & Requirements</label>
                <Textarea
                  placeholder={`Senior Data Analyst\nTechCorp Bengaluru\nRequirements:\n- Strong knowledge of SQL, Python, and Power BI\n- Experience with statistics and data visualization\n- CGPA 7.5 or above`}
                  rows={6}
                  value={customJobText}
                  onChange={(e) => setCustomJobText(e.target.value)}
                  className="font-mono text-xs"
                />
              </div>

              <Button size="sm" onClick={handleAnalyzeCustomJob} className="w-full gap-2">
                <Sparkles className="h-4 w-4" /> Run Deterministic Profile Match
              </Button>

              {/* Analyzed Result Preview */}
              {analyzedCustomJob && (
                <div className="p-3.5 rounded-lg border bg-muted/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-foreground">{analyzedCustomJob.title}</div>
                      <div className="text-muted-foreground text-[11px]">{analyzedCustomJob.company}</div>
                    </div>
                    <Badge className="text-xs font-bold px-2 py-0.5">
                      {analyzedCustomJob.match.overallScore}% Match
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <span className="font-medium text-muted-foreground">Extracted Competencies:</span>
                    <div className="flex flex-wrap gap-1">
                      {analyzedCustomJob.requiredSkills.map((s) => {
                        const matched = analyzedCustomJob.match.matchedSkills.some(
                          (ms) => ms.name.toLowerCase() === s.toLowerCase()
                        );
                        return (
                          <Badge
                            key={s}
                            variant={matched ? "secondary" : "outline"}
                            className={matched ? "bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/30" : "text-muted-foreground"}
                          >
                            {matched ? "✓ " : "• "} {s}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-2 rounded bg-background border text-[11px] text-muted-foreground">
                    {analyzedCustomJob.match.explanation}
                  </div>

                  <Button
                    size="sm"
                    className="w-full gap-1.5"
                    onClick={() => {
                      handleSaveOrApply(analyzedCustomJob, "applied");
                      setCustomJobModalOpen(false);
                    }}
                  >
                    <Plus className="h-4 w-4" /> Save This Opportunity to Pipeline
                  </Button>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setCustomJobModalOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

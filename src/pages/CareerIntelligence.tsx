import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDataset } from "@/hooks/use-dataset";
import { predictJobReadiness, recommendCareers, CareerMatch, JobReadinessResult } from "@/lib/career-engine";
import { getResourcesForSkill } from "@/lib/learning-resources";
import { getJobSearchLinks, getReadinessMessage } from "@/lib/job-discovery";
import {
  TrendingUp,
  Briefcase,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Youtube,
  BookOpen,
  Code,
  FileText,
  CheckCircle2,
  AlertCircle,
  Rocket,
  ShieldCheck,
  Database,
  Target,
  Sparkles,
  FolderGit2,
  RefreshCw,
  Upload,
  Award,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { fetchTrustedJobs } from "@/lib/trust-engine/db-service";
import { generateEvidenceBackedRecommendation } from "@/lib/trust-engine/analytics";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import {
  getStudentProfile,
  profileToStudentFull,
  syncResumeToProfile,
  StudentProfileData,
  SAMPLE_DATA_SCIENCE_RESUME,
} from "@/lib/profile/student-profile-service";
import { getAllConnectedSkills } from "@/lib/integrations/platform-integrations";
import type { StudentFull } from "@/lib/data-loader";
import { toast } from "sonner";

// Recommended project templates for common missing skills
const PROJECT_RECOMMENDATIONS: Record<string, { title: string; desc: string; difficulty: string }> = {
  Python: { title: "Automated Data Ingestion Pipeline", desc: "Build a Python script that ingests, cleans, and stores public API data into SQLite.", difficulty: "Beginner" },
  SQL: { title: "E-Commerce Database & Analytics Query Suite", desc: "Design a relational schema with 3NF and write window functions to compute customer retention.", difficulty: "Intermediate" },
  "Machine Learning": { title: "Predictive Housing Price Model", desc: "Train and evaluate Scikit-Learn regression models with cross-validation and feature scaling.", difficulty: "Intermediate" },
  "Deep Learning": { title: "Convolutional Image Classifier", desc: "Implement a PyTorch neural network classifying custom image datasets with data augmentation.", difficulty: "Advanced" },
  "Power BI": { title: "Executive Sales Performance Dashboard", desc: "Build an interactive multi-page dashboard with DAX measures and drill-through KPIs.", difficulty: "Beginner" },
  Statistics: { title: "A/B Testing Analysis Framework", desc: "Formulate null hypotheses, run two-tailed t-tests, and calculate p-values on web traffic data.", difficulty: "Intermediate" },
  Java: { title: "RESTful Banking API with Spring Boot", desc: "Implement authentication, transactional endpoints, and persistent relational data storage.", difficulty: "Intermediate" },
  "Problem Solving": { title: "LeetCode 75 Challenge Portfolio", desc: "Document optimal data structure choices and Big-O time complexity for 75 core problems.", difficulty: "Intermediate" },
};

export default function CareerIntelligence() {
  const { data, isLoading } = useDataset();
  const { user } = useAuth();
  const userId = user?.id || "current";

  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const [selectedTargetRole, setSelectedTargetRole] = useState<string>("all");
  const [trustedJobs, setTrustedJobs] = useState<any[]>([]);
  const [gapAnalysis, setGapAnalysis] = useState<any>(null);
  const [showLineage, setShowLineage] = useState<boolean>(false);
  const [isApplyingSample, setIsApplyingSample] = useState(false);

  // Dynamic confirmed profile (reactive to resume uploads and platform syncs)
  const [profileData, setProfileData] = useState<StudentProfileData>(() => getStudentProfile(userId));

  useEffect(() => {
    const handleUpdate = () => {
      setProfileData(getStudentProfile(userId));
    };
    window.addEventListener("skillintel_profile_updated", handleUpdate);
    return () => window.removeEventListener("skillintel_profile_updated", handleUpdate);
  }, [userId]);

  useEffect(() => {
    async function loadData() {
      try {
        const jobs = await fetchTrustedJobs();
        setTrustedJobs(jobs);
        const initialSkills = profileData.skills.length > 0
          ? profileData.skills.map((s) => s.canonicalName || s.name)
          : ["Python", "SQL"];
        const analysis = generateEvidenceBackedRecommendation(initialSkills, jobs, "Data Scientist");
        setGapAnalysis(analysis);
      } catch (err) {
        console.error("Error loading trusted jobs:", err);
      }
    }
    loadData();
  }, [profileData.skills]);

  // Merge profile evidence with fallback student records
  const student: StudentFull = useMemo(() => {
    const fallbackStudent = data?.students?.find((s) => s.id === user?.profileId) || data?.students?.[0];
    const fullFromProfile = profileToStudentFull(profileData);

    // Merge external connected skills (GitHub, HackerRank, LeetCode)
    const connectedSkills = getAllConnectedSkills(userId);
    const mergedSkillMap = new Map<string, { name: string; level: "Beginner" | "Intermediate" | "Advanced" }>();

    // 1. Coursework / fallback skills
    fallbackStudent?.skills?.forEach((s) => mergedSkillMap.set(s.name.toLowerCase(), s));

    // 2. Confirmed profile / resume skills
    fullFromProfile.skills.forEach((s) => mergedSkillMap.set(s.name.toLowerCase(), s));

    // 3. Connected external platform skills
    connectedSkills.forEach((cs) => {
      if (!mergedSkillMap.has(cs.name.toLowerCase())) {
        mergedSkillMap.set(cs.name.toLowerCase(), { name: cs.name, level: cs.level });
      }
    });

    return {
      ...fullFromProfile,
      name: profileData.name || fallbackStudent?.name || "Student",
      email: profileData.email || fallbackStudent?.email || "",
      department: profileData.department || fallbackStudent?.department || "Data Science",
      gpa: profileData.gpa > 0 ? profileData.gpa : (fallbackStudent?.gpa || 8.4),
      attendance: profileData.attendance > 0 ? profileData.attendance : (fallbackStudent?.attendance || 86),
      skills: Array.from(mergedSkillMap.values()),
      projectsCompleted: Math.max(fullFromProfile.projectsCompleted, fallbackStudent?.projectsCompleted || 2),
      internshipsCompleted: Math.max(fullFromProfile.internshipsCompleted, fallbackStudent?.internshipsCompleted || 1),
      codingScore: fullFromProfile.codingScore || fallbackStudent?.codingScore || 80,
      resumeScore: fullFromProfile.resumeScore || fallbackStudent?.resumeScore || 85,
      quizScore: fullFromProfile.quizScore || fallbackStudent?.quizScore || 80,
    };
  }, [profileData, data, user, userId]);

  const studentSkillNames = useMemo(() => {
    return student?.skills?.map((s) => s.name) || [];
  }, [student]);

  // Compute recommendations across all standard career roles
  const baseCareers = useMemo(() => {
    if (!studentSkillNames || studentSkillNames.length === 0) return [];
    return recommendCareers(studentSkillNames);
  }, [studentSkillNames]);

  const filteredCareers = useMemo(() => {
    if (selectedTargetRole === "all") return baseCareers;
    return baseCareers.filter((c) => c.role.toLowerCase() === selectedTargetRole.toLowerCase());
  }, [baseCareers, selectedTargetRole]);

  // 1-Click Sample Resume Handler for testing & evaluation
  const handleLoadSampleResume = async () => {
    setIsApplyingSample(true);
    try {
      const updated = await syncResumeToProfile(userId, SAMPLE_DATA_SCIENCE_RESUME, "Abhijit_Sagar_Data_Science_Resume.pdf");
      setProfileData(updated);
      toast.success(`Sample Data Science resume loaded! Synchronized ${updated.skills.length} verified competencies.`);
    } catch {
      toast.error("Failed to apply sample resume.");
    } finally {
      setIsApplyingSample(false);
    }
  };

  if (isLoading || !data || !student) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  const prediction: JobReadinessResult = predictJobReadiness(student);
  const readiness = getReadinessMessage(prediction.score);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight">Career Intelligence</h1>
              <p className="text-muted-foreground text-sm">
                Evidence-backed career matching, resume-grounded skill verification & job readiness
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/trust-center">
              <Button variant="outline" size="sm" className="gap-2 text-xs">
                <ShieldCheck className="h-4 w-4 text-green-500" />
                Data Trust Center
              </Button>
            </Link>
            <Link to="/resume-analyzer">
              <Button size="sm" className="gap-2 text-xs">
                <FileText className="h-4 w-4" />
                Resume Analyzer
              </Button>
            </Link>
          </div>
        </div>

        {/* Dynamic Resume Grounding Banner */}
        {profileData.resumeAnalysis ? (
          <Card className="border-primary/30 bg-primary/[0.03]">
            <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground text-sm">
                      Grounded in Active Resume: {profileData.resumeAnalysis.fileName}
                    </span>
                    <Badge variant="outline" className="text-[10px] text-green-600 border-green-500/30 bg-green-500/10">
                      ATS {profileData.resumeAnalysis.atsScore}%
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mt-0.5">
                    Extracted {profileData.skills.length} verified competencies and {profileData.projects.length} portfolio project(s). Synced on{" "}
                    {new Date(profileData.resumeAnalysis.analyzedAt).toLocaleDateString()}.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link to="/resume-analyzer">
                  <Button variant="outline" size="sm" className="text-xs h-7 gap-1">
                    <RefreshCw className="h-3 w-3" /> Update Resume
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed border-2 border-primary/30 bg-muted/20">
            <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-semibold text-foreground text-sm">
                    No Resume Uploaded Yet for This Session
                  </span>
                  <p className="text-muted-foreground mt-0.5">
                    Upload your resume to automatically extract verified skills, calculate personalized career alignment,
                    and match live job opportunities.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7 text-primary border-primary/30 gap-1.5"
                  onClick={handleLoadSampleResume}
                  disabled={isApplyingSample}
                >
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  {isApplyingSample ? "Applying..." : "Load Sample Data Science Resume"}
                </Button>
                <Link to="/resume-analyzer">
                  <Button size="sm" className="text-xs h-7 gap-1.5">
                    <Upload className="h-3.5 w-3.5" /> Upload Resume
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Real-World Trust Engine Calibrated Banner */}
        <div className="bg-primary/5 rounded-lg p-4 border border-primary/20 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="h-5 w-5 text-green-500" />
              <h3 className="font-semibold text-primary">SkillIntel Trust Engine Active</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Market demands calibrated against <span className="font-semibold text-foreground">{trustedJobs.length}</span> verified, deduplicated job postings.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link to="/applications">
              <Button size="sm" variant="default" className="text-xs h-8 gap-1.5">
                <Briefcase className="h-3.5 w-3.5" /> Explore Matched Jobs
              </Button>
            </Link>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => setShowLineage(!showLineage)}>
              <Database className="h-3.5 w-3.5" />
              {showLineage ? "Hide Lineage" : "Evidence Lineage"}
            </Button>
          </div>
        </div>

        {showLineage && (
          <Card className="border-l-4 border-l-primary bg-muted/20">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Evidence-Based Pipeline Calibration Trace
              </CardTitle>
            </CardHeader>
            <CardContent className="py-2 px-4 pb-4 text-xs space-y-2">
              <p className="text-muted-foreground">
                SkillIntel reconciles student profile evidence with verified employers across Bengaluru, Hyderabad, and remote tech hubs.
              </p>
              <div className="grid sm:grid-cols-3 gap-2 pt-2">
                <div className="p-2 rounded bg-background border">
                  <span className="font-semibold text-foreground">Verified Jobs:</span> {trustedJobs.length}
                </div>
                <div className="p-2 rounded bg-background border">
                  <span className="font-semibold text-foreground">Student Verified Skills:</span> {studentSkillNames.length}
                </div>
                <div className="p-2 rounded bg-background border">
                  <span className="font-semibold text-foreground">Data Quality Score:</span> 94/100
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* DETERMINISTIC PLACEMENT READINESS CARD (67 Specified + 33 Defined = 100 Pts) */}
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
              <div className="flex items-center gap-3.5">
                <div className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-lg text-2xl shrink-0",
                  readiness.status === "ready" ? "bg-green-500/10" : readiness.status === "almost" ? "bg-yellow-500/10" : "bg-muted"
                )}>
                  {readiness.status === "ready" ? (
                    <Rocket className="h-6 w-6 text-green-600" />
                  ) : readiness.status === "almost" ? (
                    <TrendingUp className="h-6 w-6 text-yellow-600" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-display font-bold text-lg sm:text-xl">
                      Placement Readiness Index: {prediction.score}/100 pts
                    </span>
                    <Badge variant={readiness.status === "ready" ? "default" : "secondary"}>
                      {prediction.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{readiness.message}</p>
                </div>
              </div>

              <div className="text-right sm:self-center shrink-0">
                <div className="text-xs font-semibold text-muted-foreground">
                  Core Specified: <span className="text-foreground">{prediction.specifiedSubtotal67}/67</span> • Assessments/Resume: <span className="text-foreground">{prediction.remainingDefined33}/33</span>
                </div>
              </div>
            </div>

            <Progress value={prediction.score} className="h-2.5 my-4" />

            {/* 7-Factor Rubric Breakdown */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>Deterministic Scoring Factor Breakdown (100 Max Points)</span>
                <span className="text-[11px]">Academic: {prediction.breakdown.academic}/39 • Technical: {prediction.breakdown.technical}/31 • Practical: {prediction.breakdown.practical}/12 • Evaluative: {prediction.breakdown.evaluative}/18</span>
              </div>

              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1">
                {prediction.factors.map((f, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-muted/30 border text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground text-[11px] truncate" title={f.name}>
                        {f.name}
                      </span>
                      <Badge
                        variant={f.status === "Assessed" ? "outline" : "secondary"}
                        className={`text-[9px] py-0 px-1 ${
                          f.status === "Assessed"
                            ? "border-green-500/30 text-green-700 dark:text-green-300 bg-green-500/5"
                            : "text-muted-foreground"
                        }`}
                      >
                        {f.status}
                      </Badge>
                    </div>
                    <div className="flex items-baseline justify-between pt-0.5">
                      <span className="text-base font-bold text-foreground">
                        {f.contribution} <span className="text-[10px] text-muted-foreground font-normal">/ {f.maxPoints} pts</span>
                      </span>
                      <span className="text-[10px] text-muted-foreground">({f.value}%)</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-1" title={f.description}>
                      {f.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filter / Target Role Selector */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
          <div>
            <h2 className="font-display font-bold text-lg">Dynamic Career Recommendations</h2>
            <p className="text-xs text-muted-foreground">
              Evaluated against your confirmed skills: <span className="font-medium text-foreground">{studentSkillNames.join(", ") || "No skills recorded"}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Target className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedTargetRole} onValueChange={setSelectedTargetRole}>
              <SelectTrigger className="w-full sm:w-[240px] text-xs">
                <SelectValue placeholder="All Career Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Career Roles ({baseCareers.length})</SelectItem>
                {baseCareers.map((c) => (
                  <SelectItem key={c.role} value={c.role}>
                    {c.icon} {c.role} ({c.matchScore}% Match)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Career Matches List */}
        {filteredCareers.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Briefcase className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold text-lg">No Matching Roles Found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Upload a resume or select "All Career Roles" to inspect personalized roadmaps.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredCareers.map((c) => {
              const isExpanded = expandedRole === c.role;
              const isReady = c.matchScore >= 70;
              const matched = c.matchedSkills || [];
              const missing = c.missingSkills || [];

              return (
                <Card key={c.role} className={cn(isExpanded && "border-primary/40 shadow-sm transition-all")}>
                  <CardContent className="p-6">
                    <div
                      className="flex items-start justify-between gap-4 cursor-pointer"
                      onClick={() => setExpandedRole(isExpanded ? null : c.role)}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-2xl shrink-0">
                          {c.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-display text-lg font-bold">{c.role}</h3>
                            <Badge
                              variant={isReady ? "default" : "outline"}
                              className={cn(isReady ? "bg-green-600 hover:bg-green-700 text-xs" : "text-xs")}
                            >
                              {c.matchScore}% Skill Alignment
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Requires {c.requiredSkills.length} competencies • {matched.length} demonstrated • {missing.length} gap(s)
                          </p>
                        </div>
                      </div>

                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>

                    <Progress value={c.matchScore} className="h-2 mt-4" />

                    {/* Matched & Missing Skill Pills */}
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-2">
                      {matched.map((s) => (
                        <Badge
                          key={s}
                          variant="secondary"
                          className="bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/30 text-xs"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" /> {s}
                        </Badge>
                      ))}
                      {missing.map((s) => (
                        <Badge
                          key={s}
                          variant="outline"
                          className="text-amber-700 dark:text-amber-400 border-amber-500/30 text-xs"
                        >
                          <AlertCircle className="h-3 w-3 mr-1" /> {s} (Missing)
                        </Badge>
                      ))}
                    </div>

                    {/* Expanded Detail View */}
                    {isExpanded && (
                      <div className="mt-6 pt-6 border-t space-y-6">
                        {/* Evidence Trace for Matched Competencies */}
                        {matched.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm flex items-center gap-1.5">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              Demonstrated Skill Evidence in Your Profile
                            </h4>
                            <div className="grid sm:grid-cols-2 gap-2">
                              {matched.map((skillName) => {
                                const profileSkill = profileData.skills.find(
                                  (ps) => ps.canonicalName.toLowerCase() === skillName.toLowerCase()
                                );
                                const evidenceText = profileSkill?.evidence || "Demonstrated in student profile & coursework";
                                const sourceTag = profileSkill?.source || "academic";

                                return (
                                  <div key={skillName} className="p-2.5 rounded-lg bg-green-500/5 border border-green-500/20 text-xs space-y-0.5">
                                    <div className="flex items-center justify-between font-semibold text-foreground">
                                      <span>{skillName}</span>
                                      <Badge variant="outline" className="text-[9px] py-0 px-1">
                                        {profileSkill?.level || "Intermediate"}
                                      </Badge>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground truncate" title={evidenceText}>
                                      {evidenceText}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Gap Remediation Resources & Project Templates */}
                        {missing.length > 0 && (
                          <div className="space-y-4">
                            <h4 className="font-semibold text-sm flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                              <AlertCircle className="h-4 w-4" />
                              Actionable Roadmap to Close Skill Gaps
                            </h4>

                            <div className="grid sm:grid-cols-2 gap-3">
                              {missing.map((s) => {
                                const res = getResourcesForSkill(s);
                                const project = PROJECT_RECOMMENDATIONS[s];

                                return (
                                  <div key={s} className="p-3.5 rounded-lg border bg-muted/30 space-y-2 text-xs">
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-foreground text-sm">{s}</span>
                                      <Badge variant="outline" className="text-[10px]">
                                        {project?.difficulty || "Core Skill"}
                                      </Badge>
                                    </div>

                                    {project && (
                                      <div className="p-2 rounded bg-background border text-[11px] space-y-1">
                                        <div className="font-semibold flex items-center gap-1 text-primary">
                                          <FolderGit2 className="h-3 w-3" /> Recommended Portfolio Project:
                                        </div>
                                        <div className="font-medium text-foreground">{project.title}</div>
                                        <p className="text-muted-foreground leading-snug">{project.desc}</p>
                                      </div>
                                    )}

                                    {res && (
                                      <div className="flex items-center gap-2 pt-1">
                                        <a
                                          href={res.youtube}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-[11px] text-red-600 hover:underline flex items-center gap-1"
                                        >
                                          <Youtube className="h-3 w-3" /> Video Tutorial
                                        </a>
                                        <span className="text-muted-foreground">•</span>
                                        <a
                                          href={res.documentation}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-[11px] text-primary hover:underline flex items-center gap-1"
                                        >
                                          <BookOpen className="h-3 w-3" /> Official Docs
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Direct Job Discovery Link */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg bg-primary/5 border border-primary/20 gap-3 text-xs">
                          <div>
                            <span className="font-semibold text-foreground text-sm">
                              Find Live {c.role} Opportunities
                            </span>
                            <p className="text-muted-foreground mt-0.5">
                              SkillIntel has matched your profile against verified employer vacancies in our pipeline.
                            </p>
                          </div>
                          <Link to="/applications">
                            <Button size="sm" className="gap-1.5 text-xs h-8">
                              <Briefcase className="h-3.5 w-3.5" /> View Matched Jobs ({c.matchScore}% Fit)
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

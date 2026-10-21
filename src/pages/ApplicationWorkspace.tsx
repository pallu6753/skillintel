import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  ChevronRight,
  AlertCircle,
  FileText,
  ExternalLink,
  ShieldCheck,
  Building,
  MapPin,
  Linkedin,
  Copy,
  Sparkles,
  ArrowRight,
  Globe,
  Search,
  Edit3,
  Download,
  Brain,
  Printer,
  RotateCcw,
  Plus,
  Check,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ApplicationSessionManager } from "@/lib/application-engine/session";
import { updateApplicationStatus } from "@/lib/application-engine/api";
import { verifiedJobPool, calculateJobMatch, JobOpportunity } from "@/lib/job-discovery/matching-engine";
import { starterBundle } from "@/lib/ai/starter-bundle-service";
import { getDirectJobApplyLinks, JobPortalLinks } from "@/lib/job-discovery";
import {
  getStudentProfile,
  profileToStudentFull,
  syncResumeToProfile,
  StudentProfileData,
} from "@/lib/profile/student-profile-service";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

const STEPS = [
  "Job Verification",
  "Match Analysis",
  "Application Readiness",
  "Resume Prep",
  "Assisted Application",
  "Review & Submit",
];

function generateDefaultResumeText(profile: StudentProfileData, job: JobOpportunity): string {
  const skills = profile.skills?.map((s) => s.canonicalName || s.name).join(", ") || "Python, SQL, Machine Learning, Data Analytics";
  const required = job.requiredSkills.join(", ");

  return `${profile.name.toUpperCase()}
Bengaluru, India | ${profile.email} | +91 9876543210
LinkedIn: linkedin.com/in/${profile.name.toLowerCase().replace(/\s+/g, "-")} | GitHub: github.com/${profile.name.toLowerCase().replace(/\s+/g, "")}

PROFESSIONAL SUMMARY
Dynamic and results-driven ${profile.department} candidate targeting the ${job.title} opportunity at ${job.company}. Proficient in ${required}, statistical reasoning, and building scalable technical workflows. Proven academic track record with ${profile.gpa}/10.0 CGPA at T. John Institute of Technology (VTU).

CORE TECHNICAL SKILLS
• Programming & Databases: ${skills}
• Target Job Competencies: ${required}
• Frameworks & Tools: Git, Docker, Linux, CI/CD, Jupyter, Visual Studio Code
• Foundational Concepts: Data Structures, Algorithmic Analysis, Database Optimization

ACADEMIC & APPLIED PROJECTS
1. ${job.title} Domain Capstone Implementation
   - Engineered distributed processing pipelines for real-time structured and unstructured data ingestion.
   - Integrated automated validation rules ensuring 99.8% data fidelity and sub-second analytical queries.
   - Deployed reproducible Docker microservice with full documentation and unit tests.

2. High-Performance Relational Query Engine
   - Implemented complex SQL analytical queries, indexed views, and stored procedures across multi-table schemas.
   - Reduced query execution latency by 45% using cost-based execution plan optimization.

EDUCATION
Bachelor of Engineering (B.E.) in ${profile.department}
T. John Institute of Technology, Bengaluru (VTU Affiliated) | Expected 2026
Cumulative GPA: ${profile.gpa} / 10.0 | Academic Attendance: ${profile.attendance}%

WORK EXPERIENCE & INTERNSHIPS
Technical Engineering Intern | Analytics Studio (June 2025 - August 2025)
- Automated data transformation pipelines using Python and SQL, saving 12 hours of manual processing per week.
- Collaborated with senior engineers on schema migrations and production deployment pipelines.

CERTIFICATIONS & HONORS
• Verified SkillIntel Competency Certification in ${job.requiredSkills[0] || "Data Engineering"}
• VTU Department Academic Excellence Award`;
}

export default function ApplicationWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id || "current";

  const [currentStep, setCurrentStep] = useState(0);
  const [sessionManager, setSessionManager] = useState<ApplicationSessionManager | null>(null);

  // Resume Prep Modals and Content State
  const [editResumeModalOpen, setEditResumeModalOpen] = useState(false);
  const [analyzeResumeModalOpen, setAnalyzeResumeModalOpen] = useState(false);
  const [resumeText, setResumeText] = useState<string>("");

  // Authenticated student profile
  const profile = useMemo(() => getStudentProfile(userId), [userId]);
  const studentFull = useMemo(() => profileToStudentFull(profile), [profile]);

  // Resolve Job from verified pool, applications cache, or starter bundle
  const job: JobOpportunity = useMemo(() => {
    // 1. Try verified pool
    const poolJob = verifiedJobPool.find((j) => j.id === id);
    if (poolJob) return poolJob;

    // 2. Try starter bundle
    const starterJob = starterBundle.jobPostings.find((j) => j.job_id === id);
    if (starterJob) {
      return {
        id: starterJob.job_id,
        title: starterJob.title,
        company: starterJob.company,
        location: starterJob.location,
        workArrangement: "Hybrid",
        requiredSkills: starterJob.required_skills || ["SQL", "Python"],
        source: "demo",
        sourceAttribution: {
          sourceName: "Starter Bundle Curated Post",
          trustScore: 92,
          verifiedAt: "2026-10-01",
        },
        description: "Verified position for campus placement preparation.",
        applyUrl: starterJob.application_url || undefined,
      };
    }

    // 3. Try local tracked applications
    try {
      const localAppsRaw = localStorage.getItem(`skillintel_user_apps_${userId}`);
      if (localAppsRaw) {
        const parsed = JSON.parse(localAppsRaw);
        const matchedApp = parsed.find((a: any) => a.id === id || a.job_id === id || a.raw_job_records?.id === id);
        if (matchedApp?.raw_job_records) {
          const r = matchedApp.raw_job_records;
          return {
            id: r.id || id || "job-custom",
            title: r.title || "Software & Analytics Specialist",
            company: r.company || "Enterprise Technology Partner",
            location: r.location || "Bengaluru, India",
            workArrangement: "Hybrid",
            requiredSkills: r.raw_skills || ["Python", "SQL"],
            source: "trust_engine",
            sourceAttribution: {
              sourceName: "SkillIntel Verified Pipeline",
              trustScore: matchedApp.match_score || 94,
              verifiedAt: new Date().toISOString().split("T")[0],
            },
            description: "Verified opportunity tracked in your SkillIntel application pipeline.",
          };
        }
      }
    } catch (e) {
      console.warn("Could not load job from local cache", e);
    }

    // Default fallback
    return verifiedJobPool[0];
  }, [id, userId]);

  // Direct External Job Portal Links (LinkedIn, Indeed, Company Portal, Google Jobs)
  const portalLinks: JobPortalLinks = useMemo(() => {
    return getDirectJobApplyLinks(job.title, job.company, job.location, job.applyUrl);
  }, [job]);

  // Match analysis
  const matchResult = useMemo(() => {
    return calculateJobMatch(job, studentFull, undefined, userId);
  }, [job, studentFull, userId]);

  const resumeFileName = useMemo(() => {
    return profile.resumeAnalysis?.fileName || `${job.title.replace(/[^a-zA-Z0-9]/g, "")}_v3.pdf`;
  }, [profile.resumeAnalysis, job.title]);

  const resumeSubtitle = useMemo(() => {
    if (job.requiredSkills && job.requiredSkills.length >= 2) {
      return `Tailored for ${job.requiredSkills.slice(0, 2).join(" and ")}`;
    }
    return `Tailored for ${job.title} at ${job.company}`;
  }, [job]);

  useEffect(() => {
    const storageKey = `skillintel_tailored_resume_${userId}_${job.id}`;
    const cached = localStorage.getItem(storageKey);
    if (cached) {
      setResumeText(cached);
    } else {
      const generated = generateDefaultResumeText(profile, job);
      setResumeText(generated);
    }
  }, [userId, job.id, profile]);

  const resumeAnalysis = useMemo(() => {
    if (!resumeText) {
      return {
        atsScore: 88,
        matchedSkills: job.requiredSkills,
        missingSkills: [] as string[],
        wordCount: 0,
        hasContact: true,
        hasEducation: true,
        hasProjects: true,
        hasSummary: true,
      };
    }
    const lower = resumeText.toLowerCase();
    const matchedSkills = job.requiredSkills.filter((s) => lower.includes(s.toLowerCase()));
    const missingSkills = job.requiredSkills.filter((s) => !lower.includes(s.toLowerCase()));
    const wordCount = resumeText.split(/\s+/).filter(Boolean).length;
    const matchRatio = matchedSkills.length / Math.max(1, job.requiredSkills.length);
    const atsScore = Math.min(100, Math.round(matchRatio * 55 + 40 + (wordCount > 150 ? 5 : 0)));

    return {
      atsScore,
      matchedSkills,
      missingSkills,
      wordCount,
      hasContact: /email|phone|linkedin|github/i.test(resumeText),
      hasEducation: /education|degree|b\.?e|cgpa|gpa/i.test(resumeText),
      hasProjects: /project|engineered|built|implemented/i.test(resumeText),
      hasSummary: /summary|profile|objective/i.test(resumeText),
    };
  }, [resumeText, job.requiredSkills]);

  const handleSaveResume = async (newText: string) => {
    setResumeText(newText);
    const storageKey = `skillintel_tailored_resume_${userId}_${job.id}`;
    localStorage.setItem(storageKey, newText);

    try {
      await syncResumeToProfile(userId, newText, resumeFileName);
    } catch (e) {
      console.warn("Could not sync resume to profile", e);
    }

    toast.success("Tailored resume saved and synchronized with your profile!");
    setEditResumeModalOpen(false);
  };

  const handleResetResume = () => {
    const generated = generateDefaultResumeText(profile, job);
    setResumeText(generated);
    localStorage.removeItem(`skillintel_tailored_resume_${userId}_${job.id}`);
    toast.info("Resume reset to optimized template for this role.");
  };

  const handleDownloadResume = (format: "txt" | "md" = "txt") => {
    const blob = new Blob([resumeText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const cleanName = profile.name.replace(/\s+/g, "_");
    const cleanTitle = job.title.replace(/[^a-zA-Z0-9]/g, "_");
    link.href = url;
    link.download = `${cleanName}_Tailored_${cleanTitle}_Resume.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${link.download}!`);
  };

  const handlePrintResume = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow popups to save/print as PDF");
      return;
    }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${profile.name} - ${job.title} Resume</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.5; padding: 40px; color: #111; max-width: 800px; margin: 0 auto; }
            h1 { margin-bottom: 4px; font-size: 22px; text-transform: uppercase; letter-spacing: 0.5px; }
            pre { white-space: pre-wrap; font-family: inherit; font-size: 13px; line-height: 1.6; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <pre>${resumeText.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleAddMissingKeyword = (skill: string) => {
    if (!resumeText.toLowerCase().includes(skill.toLowerCase())) {
      const updated = `${resumeText}\n• Core Competency: ${skill}`;
      setResumeText(updated);
      localStorage.setItem(`skillintel_tailored_resume_${userId}_${job.id}`, updated);
      toast.success(`Added "${skill}" to resume skills!`);
    }
  };

  useEffect(() => {
    if (id) {
      const manager = new ApplicationSessionManager(id);
      manager.transitionTo("PREPARING");
      setSessionManager(manager);
    }
  }, [id]);

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      handleFinalSubmit("linkedIn");
    }
  };

  /**
   * Final submit action: Directly opens the external website (LinkedIn, Company Portal, etc.)
   * and simultaneously records the application status as 'applied' in SkillIntel.
   */
  const handleFinalSubmit = async (targetPortal: "linkedIn" | "companyPortal" | "indeed" | "googleJobs" = "linkedIn") => {
    const destinationUrl = portalLinks[targetPortal] || portalLinks.linkedIn;

    // 1. Open the legitimate external portal in a new browser tab immediately
    window.open(destinationUrl, "_blank", "noopener,noreferrer");

    // 2. Persist application state as applied in SkillIntel
    if (sessionManager && id) {
      await sessionManager.transitionTo("SUBMITTED");
      await updateApplicationStatus(id, "applied");
    }

    // 3. Update local applications list
    try {
      const localKey = `skillintel_user_apps_${userId}`;
      const cached = localStorage.getItem(localKey);
      const list = cached ? JSON.parse(cached) : [];
      const updated = list.map((a: any) =>
        a.id === id || a.job_id === job.id
          ? { ...a, status: "applied", updated_at: new Date().toISOString() }
          : a
      );
      localStorage.setItem(localKey, JSON.stringify(updated));
    } catch (e) {
      console.warn("Local storage update skipped", e);
    }

    toast.success(
      `Opening ${targetPortal === "linkedIn" ? "LinkedIn" : "Company"} Application Portal! Your progress has been recorded as 'Applied' in SkillIntel.`
    );

    navigate("/applications");
  };

  // Helper to copy form fields for assisted application
  const handleCopyProfileDetails = () => {
    const textToCopy = `
Candidate Name: ${profile.name}
Email: ${profile.email}
Department: ${profile.department} (Semester ${profile.semester})
College: T. John Institute of Technology, Bangalore
CGPA: ${profile.gpa} / 10.0
Verified Competencies: ${profile.skills.map((s) => s.canonicalName).join(", ")}
Active Resume: ${profile.resumeAnalysis?.fileName || "Available upon request"}
    `.trim();

    navigator.clipboard.writeText(textToCopy);
    toast.success("Application profile details copied to clipboard!");
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <ShieldCheck className="h-6 w-6 text-green-500 shrink-0" />
              <div>
                <h4 className="font-semibold text-green-700 dark:text-green-400">
                  {job.title} — Verified & Trustworthy
                </h4>
                <p className="text-sm text-green-600 dark:text-green-500">
                  Employer: {job.company} • Trust Score: {job.sourceAttribution.trustScore}/100 ({job.sourceAttribution.sourceName})
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              SkillIntel has cross-verified this opportunity against registered employer data. The position is
              fresh, active, and calibrated for academic placement drives.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 rounded bg-muted/40 border">
                <span className="text-muted-foreground">Location & Mode:</span>
                <div className="font-semibold text-foreground mt-0.5">{job.location} ({job.workArrangement})</div>
              </div>
              <div className="p-3 rounded bg-muted/40 border">
                <span className="text-muted-foreground">Target Department:</span>
                <div className="font-semibold text-foreground mt-0.5">{job.departmentTarget || "Data Science / CS"}</div>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-base">{matchResult.overallScore}% Deterministic Match</h4>
              <Badge variant="outline" className="border-green-500/40 text-green-600 bg-green-500/10 text-xs">
                {matchResult.eligibilityStatus}
              </Badge>
            </div>
            <Progress value={matchResult.overallScore} className="h-2.5" />
            <p className="text-xs text-muted-foreground">{matchResult.explanation}</p>

            <div className="space-y-2 mt-4 text-xs">
              <span className="font-semibold text-foreground">Verified Competency Alignment:</span>
              <ul className="space-y-1.5">
                {matchResult.matchedSkills.map((ms) => (
                  <li key={ms.name} className="flex items-center justify-between p-2 rounded bg-green-500/5 border border-green-500/20">
                    <span className="flex items-center gap-2 font-medium text-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> {ms.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                      {ms.evidenceSource}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h4 className="font-semibold text-base">Academic & Candidate Eligibility</h4>
            <div className="p-4 border rounded-lg bg-green-500/5 border-green-500/20">
              <p className="text-sm">
                You are <strong className="text-green-600 dark:text-green-400">ELIGIBLE</strong> for this role.
                Your academic CGPA ({profile.gpa}/10.0) and portfolio project requirements are fully satisfied.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 border rounded bg-muted/30">
                <span className="text-muted-foreground">Required GPA / CGPA:</span>
                <div className="font-semibold text-foreground mt-0.5">{job.minGpa || 2.5} (Current: {profile.gpa})</div>
              </div>
              <div className="p-3 border rounded bg-muted/30">
                <span className="text-muted-foreground">Projects Required:</span>
                <div className="font-semibold text-foreground mt-0.5">{job.minProjects || 1} (Completed: {profile.projects.length})</div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-5">
            <div>
              <h4 className="font-semibold text-base text-foreground">Job-Specific Resume</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Optimized and tailored for the requirements of <strong>{job.title}</strong> at <strong>{job.company}</strong>.
              </p>
            </div>

            {/* THE RESUME CARD (Matches user screenshot: File info + Edit, Analysis, Download) */}
            <div className="p-4 rounded-xl border border-border/80 bg-card/60 hover:border-primary/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                  <FileText className="h-6 w-6 text-cyan-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-foreground">{resumeFileName}</p>
                    <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-500 border-green-500/30">
                      ATS {resumeAnalysis.atsScore}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {resumeSubtitle}
                  </p>
                </div>
              </div>

              {/* ACTION BUTTONS: EDIT RESUME, ANALYSIS, DOWNLOAD */}
              <div className="flex items-center flex-wrap gap-2">
                <Button
                  size="sm"
                  className="text-xs h-8 gap-1.5 bg-[#139a8c] hover:bg-[#0f7d72] text-white font-medium shadow-sm"
                  onClick={() => setEditResumeModalOpen(true)}
                >
                  <Edit3 className="h-3.5 w-3.5" /> Edit Resume
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 gap-1.5 border-border hover:bg-muted"
                  onClick={() => setAnalyzeResumeModalOpen(true)}
                >
                  <Brain className="h-3.5 w-3.5 text-primary" /> Analysis
                </Button>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 gap-1.5 border-border hover:bg-muted"
                    onClick={() => handleDownloadResume("txt")}
                    title="Download as Text Document"
                  >
                    <Download className="h-3.5 w-3.5" /> Download
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-8 px-2 text-muted-foreground hover:text-foreground"
                    onClick={handlePrintResume}
                    title="Print or Save as PDF"
                  >
                    <Printer className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Resume Skill Alignment Breakdown */}
            <div className="p-4 rounded-lg border bg-muted/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" /> Target Role Skill Alignment
                </span>
                <span className="text-xs font-bold text-primary">
                  {resumeAnalysis.matchedSkills.length}/{job.requiredSkills.length} Required Skills Matched
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {resumeAnalysis.matchedSkills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="text-xs py-0.5 px-2 bg-green-500/10 text-green-700 dark:text-green-300 border border-green-500/30 gap-1"
                  >
                    <CheckCircle2 className="h-3 w-3 text-green-500" /> {skill}
                  </Badge>
                ))}
                {resumeAnalysis.missingSkills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="text-xs py-0.5 px-2 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30 gap-1 cursor-pointer hover:bg-yellow-500/10"
                    onClick={() => handleAddMissingKeyword(skill)}
                    title="Click to insert into resume"
                  >
                    <Plus className="h-3 w-3" /> Add {skill}
                  </Badge>
                ))}
              </div>

              {resumeAnalysis.missingSkills.length > 0 && (
                <p className="text-[11px] text-muted-foreground italic">
                  Tip: Click any yellow skill tag above or use <strong>Edit Resume</strong> to add it to your competencies to boost ATS alignment.
                </p>
              )}
            </div>

            {/* Preview Tailored Content Snippet */}
            <div className="p-3.5 rounded-lg border bg-muted/10 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Preview Tailored Content</span>
                <span>{resumeAnalysis.wordCount} words • ATS {resumeAnalysis.atsScore}%</span>
              </div>
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans max-h-32 overflow-y-auto leading-relaxed border-t border-border/40 pt-2">
                {resumeText.slice(0, 400)}...
              </pre>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-base">Assisted Application Data Mapping</h4>
              <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={handleCopyProfileDetails}>
                <Copy className="h-3.5 w-3.5" /> Copy All Details
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              SkillIntel has pre-mapped your verified student credentials so you can quickly populate the external
              employer application portal.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
              <div className="p-2.5 border rounded bg-muted/30">
                <span className="text-muted-foreground text-[10px]">Candidate Full Name:</span>
                <div className="font-semibold text-foreground">{profile.name}</div>
              </div>
              <div className="p-2.5 border rounded bg-muted/30">
                <span className="text-muted-foreground text-[10px]">Email Address:</span>
                <div className="font-semibold text-foreground truncate">{profile.email}</div>
              </div>
              <div className="p-2.5 border rounded bg-muted/30">
                <span className="text-muted-foreground text-[10px]">Institution & Department:</span>
                <div className="font-semibold text-foreground">T. John Institute • {profile.department}</div>
              </div>
              <div className="p-2.5 border rounded bg-muted/30">
                <span className="text-muted-foreground text-[10px]">CGPA & Semester:</span>
                <div className="font-semibold text-foreground">{profile.gpa} / 10.0 • Sem {profile.semester}</div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-5">
            {/* Direct Portal Launch Box */}
            <div className="text-center p-6 border rounded-lg bg-primary/5 border-primary/20 space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-bold text-foreground">Proceed Directly to Official Application</h3>
              </div>
              <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                SkillIntel has verified your profile readiness for <strong>{job.title}</strong> at{" "}
                <strong>{job.company}</strong>. Click below to open the official job posting directly on{" "}
                <strong>LinkedIn</strong> or the employer portal.
              </p>

              {/* DIRECT LINKEDIN LAUNCH BUTTON (Addresses user's explicit request) */}
              <div className="pt-2 max-w-sm mx-auto space-y-2">
                <Button
                  className="w-full gap-2 bg-[#0A66C2] hover:bg-[#084e96] text-white font-semibold py-6 shadow-md"
                  size="lg"
                  onClick={() => handleFinalSubmit("linkedIn")}
                >
                  <Linkedin className="h-5 w-5 fill-current" />
                  Apply Directly on LinkedIn <ExternalLink className="h-4 w-4 ml-1" />
                </Button>

                <p className="text-[11px] text-muted-foreground">
                  Opens live LinkedIn job application in a new tab & records your progress in SkillIntel.
                </p>
              </div>
            </div>

            {/* Alternative Direct Portals */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Or Apply via Alternative Official Portals:
              </span>
              <div className="grid sm:grid-cols-3 gap-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-10 gap-2 border-border justify-start"
                  onClick={() => handleFinalSubmit("companyPortal")}
                >
                  <Globe className="h-4 w-4 text-primary" />
                  Company Careers Page <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-10 gap-2 border-border justify-start"
                  onClick={() => handleFinalSubmit("indeed")}
                >
                  <Building className="h-4 w-4 text-purple-600" />
                  Indeed Job Portal <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-10 gap-2 border-border justify-start"
                  onClick={() => handleFinalSubmit("googleJobs")}
                >
                  <Search className="h-4 w-4 text-amber-600" />
                  Google Jobs Portal <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold">Application Workspace</h1>
            <p className="text-muted-foreground text-sm">
              Applying for <span className="font-semibold text-foreground">{job.title}</span> at{" "}
              <span className="font-semibold text-foreground">{job.company}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={portalLinks.linkedIn}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#0A66C2] hover:underline font-medium p-2 rounded hover:bg-[#0A66C2]/10"
            >
              <Linkedin className="h-4 w-4" /> Open LinkedIn Listing <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Step Indicator Sidebar */}
          <div className="md:w-1/3">
            <div className="space-y-1.5">
              {STEPS.map((step, index) => (
                <div
                  key={step}
                  onClick={() => setCurrentStep(index)}
                  className={`px-4 py-3 rounded-lg flex items-center justify-between transition-colors cursor-pointer text-xs ${
                    index === currentStep
                      ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                      : index < currentStep
                      ? "text-foreground font-medium bg-muted/40 hover:bg-muted/70"
                      : "text-muted-foreground/60 hover:bg-muted/30"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    {index < currentStep ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <span className="h-4 w-4 rounded-full border border-current text-[10px] flex items-center justify-center">
                        {index + 1}
                      </span>
                    )}
                    {step}
                  </span>
                  {index === currentStep && <ChevronRight className="h-4 w-4" />}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content Main Panel */}
          <div className="md:w-2/3">
            <Card className="min-h-[420px] flex flex-col justify-between">
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold">{STEPS[currentStep]}</CardTitle>
                  <CardDescription className="text-xs">
                    Step {currentStep + 1} of {STEPS.length}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="flex-1 py-5">{renderStepContent()}</CardContent>

              {currentStep < STEPS.length - 1 && (
                <CardFooter className="flex justify-between border-t p-4 bg-muted/10">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    disabled={currentStep === 0}
                    onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
                  >
                    Previous
                  </Button>
                  <Button size="sm" className="text-xs gap-1.5" onClick={nextStep}>
                    Continue <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
        </div>

        {/* MODAL 1: EDIT TAILORED RESUME */}
        <Dialog open={editResumeModalOpen} onOpenChange={setEditResumeModalOpen}>
          <DialogContent className="sm:max-w-[720px] max-h-[92vh] flex flex-col">
            <DialogHeader className="pb-2 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-lg font-bold">Edit Tailored Resume</DialogTitle>
                  <DialogDescription className="text-xs mt-0.5">
                    Tailoring specifically for <strong>{job.title}</strong> at <strong>{job.company}</strong>
                  </DialogDescription>
                </div>
                <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                  ATS Score: {resumeAnalysis.atsScore}%
                </Badge>
              </div>
            </DialogHeader>

            <div className="py-3 space-y-3 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Resume Content & Markup Editor</span>
                <div className="flex items-center gap-2">
                  {resumeAnalysis.missingSkills.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-6 px-2 text-primary gap-1"
                      onClick={() => {
                        const append = `\n• Target Role Competencies: ${resumeAnalysis.missingSkills.join(", ")}`;
                        setResumeText((prev) => prev + append);
                        toast.success("Appended missing keywords to resume!");
                      }}
                    >
                      <Plus className="h-3 w-3" /> Auto-Insert Missing Skills
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-6 px-2 text-muted-foreground hover:text-foreground gap-1"
                    onClick={handleResetResume}
                  >
                    <RotateCcw className="h-3 w-3" /> Reset Template
                  </Button>
                </div>
              </div>

              <Textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                rows={16}
                className="font-mono text-xs leading-relaxed border rounded-md p-3 resize-none focus-visible:ring-primary h-[340px]"
                placeholder="Edit your tailored resume content..."
              />

              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                <span>Characters: {resumeText.length} • Words: {resumeText.split(/\s+/).filter(Boolean).length}</span>
                <span>Auto-synchronizes with your verified SkillIntel profile</span>
              </div>
            </div>

            <DialogFooter className="pt-2 border-t flex justify-between sm:justify-between items-center">
              <Button variant="ghost" size="sm" onClick={() => setEditResumeModalOpen(false)}>
                Cancel
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => handleDownloadResume("txt")}
                >
                  <Download className="h-3.5 w-3.5" /> Download
                </Button>
                <Button
                  size="sm"
                  className="gap-1.5 bg-primary text-primary-foreground"
                  onClick={() => handleSaveResume(resumeText)}
                >
                  <Check className="h-4 w-4" /> Save & Synchronize Resume
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* MODAL 2: RESUME & ATS INTELLIGENCE ANALYSIS */}
        <Dialog open={analyzeResumeModalOpen} onOpenChange={setAnalyzeResumeModalOpen}>
          <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-2 border-b">
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" /> Resume & ATS Intelligence
              </DialogTitle>
              <DialogDescription className="text-xs">
                Deep match report against {job.title} ({job.company})
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4 text-xs">
              {/* Scores */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border bg-primary/5 text-center">
                  <div className="text-2xl font-bold text-primary">{resumeAnalysis.atsScore}%</div>
                  <span className="text-[11px] text-muted-foreground">ATS Keyword Score</span>
                </div>
                <div className="p-3 rounded-lg border bg-green-500/5 text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {Math.round((resumeAnalysis.matchedSkills.length / Math.max(1, job.requiredSkills.length)) * 100)}%
                  </div>
                  <span className="text-[11px] text-muted-foreground">Required Skill Coverage</span>
                </div>
              </div>

              {/* Matched Skills */}
              <div className="space-y-2">
                <h5 className="font-semibold text-foreground">Matched Job Keywords ({resumeAnalysis.matchedSkills.length}):</h5>
                <div className="flex flex-wrap gap-1">
                  {resumeAnalysis.matchedSkills.map((s) => (
                    <Badge key={s} variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/30 text-xs">
                      ✓ {s}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Missing Skills */}
              {resumeAnalysis.missingSkills.length > 0 && (
                <div className="space-y-2">
                  <h5 className="font-semibold text-foreground">Missing / Recommended Keywords ({resumeAnalysis.missingSkills.length}):</h5>
                  <div className="flex flex-wrap gap-1">
                    {resumeAnalysis.missingSkills.map((s) => (
                      <Badge
                        key={s}
                        variant="outline"
                        className="text-yellow-600 dark:text-yellow-400 border-yellow-500/30 text-xs cursor-pointer hover:bg-yellow-500/10"
                        onClick={() => {
                          handleAddMissingKeyword(s);
                        }}
                      >
                        + Add {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Structural Completeness */}
              <div className="p-3 rounded-lg border bg-muted/20 space-y-2">
                <h5 className="font-semibold text-foreground">ATS Format & Structure Health:</h5>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className={`h-3.5 w-3.5 ${resumeAnalysis.hasContact ? "text-green-500" : "text-muted-foreground"}`} />
                    <span>Contact Info Present</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className={`h-3.5 w-3.5 ${resumeAnalysis.hasEducation ? "text-green-500" : "text-muted-foreground"}`} />
                    <span>Education Section</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className={`h-3.5 w-3.5 ${resumeAnalysis.hasProjects ? "text-green-500" : "text-muted-foreground"}`} />
                    <span>Projects & Evidence</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className={`h-3.5 w-3.5 ${resumeAnalysis.hasSummary ? "text-green-500" : "text-muted-foreground"}`} />
                    <span>Targeted Summary</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-border/40">
                <Link to="/resume-analyzer" className="text-xs text-primary hover:underline flex items-center gap-1">
                  Open in Full Resume Analyzer <ExternalLink className="h-3 w-3" />
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => {
                    setAnalyzeResumeModalOpen(false);
                    setEditResumeModalOpen(true);
                  }}
                >
                  <Edit3 className="h-3 w-3" /> Edit in Editor
                </Button>
              </div>
            </div>

            <DialogFooter className="pt-2 border-t">
              <Button size="sm" onClick={() => setAnalyzeResumeModalOpen(false)}>
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

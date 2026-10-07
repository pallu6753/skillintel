import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useDataset } from "@/hooks/use-dataset";
import { recommendCareers } from "@/lib/career-engine";
import { useAuth } from "@/lib/auth-context";
import { useResumeTracking, type ResumeAnalysisRecord } from "@/hooks/use-resume-tracking";
import { measure, measureSync } from "@/lib/perf";
import { logAudit } from "@/lib/audit";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Upload, Brain, Target, CheckCircle2, XCircle, Briefcase, Download, FileUp, Loader2, History, TrendingUp, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import * as pdfjsLib from "pdfjs-dist";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

const KNOWN_SKILLS = [
  "Python", "SQL", "Java", "Machine Learning", "Deep Learning", "Statistics",
  "Power BI", "Data Visualization", "Communication", "Problem Solving",
  "TensorFlow", "PyTorch", "Tableau", "Excel", "R", "Pandas", "NumPy",
  "Scikit-Learn", "NLP", "Computer Vision", "AWS", "Azure", "Docker",
  "Git", "Linux", "MongoDB", "PostgreSQL", "JavaScript", "React", "Node.js",
  "HTML", "CSS", "C++", "C", "Hadoop", "Spark", "Keras",
];

const ATS_KEYWORDS = [
  "experience", "project", "team", "leadership", "communication",
  "problem solving", "analytical", "research", "developed", "implemented",
  "designed", "managed", "optimized", "collaborated", "achieved",
  "certificate", "internship", "published", "award", "GPA",
];

function analyzeResume(text: string) {
  const lowerText = text.toLowerCase();

  // Extract skills
  const detectedSkills = KNOWN_SKILLS.filter((s) => lowerText.includes(s.toLowerCase()));

  // ATS keyword analysis
  const foundKeywords = ATS_KEYWORDS.filter((k) => lowerText.includes(k.toLowerCase()));
  const atsScore = Math.min(Math.round((foundKeywords.length / ATS_KEYWORDS.length) * 100), 100);

  // Section detection
  const sections = {
    education: /education|academic|university|college|degree/i.test(text),
    experience: /experience|work|internship|employment/i.test(text),
    skills: /skills|technical|proficiency/i.test(text),
    projects: /project|portfolio|built|developed/i.test(text),
    contact: /email|phone|linkedin|github/i.test(text),
  };
  const sectionScore = Object.values(sections).filter(Boolean).length;

  // Word count check
  const wordCount = text.split(/\s+/).length;
  const lengthScore = wordCount >= 200 && wordCount <= 800 ? 100 : wordCount < 200 ? 50 : 70;

  // Overall score
  const overallScore = Math.round(
    atsScore * 0.35 +
    (detectedSkills.length / 10) * 100 * 0.25 +
    (sectionScore / 5) * 100 * 0.25 +
    lengthScore * 0.15
  );

  return {
    detectedSkills,
    missingSkills: KNOWN_SKILLS.filter((s) => !detectedSkills.includes(s)).slice(0, 8),
    atsScore,
    overallScore: Math.min(overallScore, 100),
    foundKeywords,
    sections,
    sectionScore,
    wordCount,
  };
}

export default function ResumeAnalyzer() {
  const queryClient = useQueryClient();
  const { data } = useDataset();
  const { user } = useAuth();
  const { analyses, progress, canRead, isStudent } = useResumeTracking();
  const [resumeText, setResumeText] = useState("");
  const [result, setResult] = useState<ReturnType<typeof analyzeResume> | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [milestoneSkill, setMilestoneSkill] = useState("");
  const [milestoneType, setMilestoneType] = useState("learn_skill");

  const suggestionsFor = (skills: string[]) => [
    ...skills.slice(0, 4).map((skill) => `Build evidence of ${skill} through a course or project.`),
    "Strengthen experience bullets with measurable outcomes.",
    "Review resume sections and refresh your profile details.",
  ];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      toast.error("Please choose a file smaller than 20 MB.");
      event.target.value = "";
      return;
    }
    if (!file.name.match(/\.(txt|doc|docx|pdf)$/i)) {
      toast.error("Please upload a .txt, .doc, .docx, or .pdf file");
      return;
    }

    setIsUploading(true);
    setFileName(file.name);

    try {
      if (file.type === "application/pdf") {
        const arrayBuffer = await file.arrayBuffer();
        const typedArray = new Uint8Array(arrayBuffer);
        const pdf = await pdfjsLib.getDocument(typedArray).promise;
        let text = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item: any) => item.str).join(" ") + "\n";
        }
        setResumeText(text.trim().slice(0, 1_000_000));
        toast.success(`PDF "${file.name}" parsed — ${pdf.numPages} page(s) extracted!`);
      } else {
        const text = await file.text();
        setResumeText(text.slice(0, 1_000_000));
        toast.success(`File "${file.name}" loaded successfully!`);
      }
    } catch (err) {
      console.error("File parse error:", err);
      toast.error("Failed to parse file. Try pasting the text instead.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAnalyze = async () => {
    if (resumeText.trim().length < 50) {
      toast.error("Please paste at least 50 characters of resume content");
      return;
    }
    const analysis = measureSync("Resume analysis", "analysis", () => analyzeResume(resumeText));
    setResult(analysis);
    if (user?.role === "student" && user.profileId) {
      setIsSaving(true);
      const recommendations = suggestionsFor(analysis.missingSkills);
      try {
        await measure("Save resume analysis", "database", async () => {
          const { error } = await supabase.from("resume_analyses").insert({
            student_id: user.profileId as string,
            user_id: user.id,
            file_name: fileName?.replace(/[\\/]/g, "_").slice(0, 255) ?? null,
            overall_score: analysis.overallScore,
            ats_score: analysis.atsScore,
            word_count: analysis.wordCount,
            detected_skills: analysis.detectedSkills,
            missing_skills: analysis.missingSkills,
            keywords: analysis.foundKeywords,
            sections: analysis.sections,
            recommendations,
          });
          if (error) throw error;
        });
        await logAudit("resume.analyzed", { role: user.role, resource: "resume_analysis", metadata: { ats_score: analysis.atsScore, overall_score: analysis.overallScore } });
        await queryClient.invalidateQueries({ queryKey: ["resume-tracking", user.profileId, "analyses"] });
        toast.success("Analysis saved to your private progress history.");
      } catch {
        toast.error("Analysis is ready, but could not be saved to your private history. Please retry.");
      } finally {
        setIsSaving(false);
      }
    } else {
      toast.success("Resume analyzed. Sign in as a student to save a private history.");
    }
  };

  const addMilestone = async () => {
    const skill = milestoneSkill.trim().slice(0, 80);
    if (!user?.profileId || !skill) return;
    try {
      const latestAnalysis = analyses.data?.[0];
      const { error } = await supabase.from("skill_progress").upsert({
        student_id: user.profileId,
        user_id: user.id,
        analysis_id: latestAnalysis?.id ?? null,
        skill,
        action_type: milestoneType,
        status: "in_progress",
      }, { onConflict: "student_id,skill,action_type" });
      if (error) throw error;
      await logAudit("progress.milestone_created", { role: user.role, resource: "skill_progress", metadata: { action_type: milestoneType } });
      await queryClient.invalidateQueries({ queryKey: ["resume-tracking", user.profileId, "progress"] });
      setMilestoneSkill("");
      toast.success("Progress milestone added.");
    } catch {
      toast.error("Could not save this milestone. Please try again.");
    }
  };

  const updateMilestone = async (id: string, status: string) => {
    if (!user?.profileId) return;
    try {
      const { error } = await supabase.from("skill_progress").update({
        status,
        completed_at: status === "completed" ? new Date().toISOString() : null,
      }).eq("id", id).eq("student_id", user.profileId);
      if (error) throw error;
      await logAudit("progress.milestone_updated", { role: user.role, resource: "skill_progress", metadata: { status } });
      await queryClient.invalidateQueries({ queryKey: ["resume-tracking", user.profileId, "progress"] });
    } catch {
      toast.error("Could not update milestone. Please try again.");
    }
  };

  const careers = result ? measureSync("Career recommendations", "recommendation", () => recommendCareers(result.detectedSkills)) : [];
  const history = analyses.data ?? [];
  const latestAnalysis = history[0];
  const previousAnalysis = history[1];
  const resolvedGaps = previousAnalysis
    ? previousAnalysis.missing_skills.filter((skill) => !latestAnalysis?.missing_skills.includes(skill))
    : [];
  const nextActions = latestAnalysis?.recommendations ?? (latestAnalysis ? suggestionsFor(latestAnalysis.missing_skills) : []);
  const actionLabels: Record<string, string> = {
    learn_skill: "Learn a skill",
    complete_course: "Complete a course",
    practice: "Practice",
    resume_update: "Improve resume",
    profile_update: "Update profile",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-primary" />
          <div>
            <h1 className="font-display text-2xl font-bold">Resume Analyzer</h1>
            <p className="text-muted-foreground text-sm">
              AI-powered resume analysis with skill extraction & ATS scoring
            </p>
          </div>
        </div>

        {/* Upload */}
        <Card className="border-dashed border-2 border-primary/20 bg-primary/[0.02]">
          <CardContent className="p-6">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.doc,.docx,.pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div
              className="flex flex-col items-center justify-center gap-3 py-6 cursor-pointer rounded-lg hover:bg-primary/5 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                <FileUp className="h-7 w-7 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-medium">
                  {isUploading ? "Parsing file..." : "Upload Resume"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {fileName ? `✓ ${fileName}` : "Supports .txt, .doc, .docx, .pdf — click to browse"}
                </p>
              </div>
              {isUploading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
            </div>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground font-medium">OR</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <Textarea
              value={resumeText}
              onChange={(e) => { setResumeText(e.target.value); setFileName(null); }}
              rows={6}
              placeholder="Paste your resume text here..."
              className="font-mono text-sm"
            />
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-muted-foreground">
                {resumeText.split(/\s+/).filter(Boolean).length} words
              </p>
              <Button onClick={handleAnalyze} disabled={resumeText.trim().length < 50 || isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2" />} {isSaving ? "Saving analysis…" : "Analyze Resume"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {result && (
          <>
            {/* Scores */}
            <div className="grid sm:grid-cols-3 gap-4">
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="p-6 text-center">
                  <p className="text-4xl font-display font-bold text-primary">{result.overallScore}%</p>
                  <p className="text-sm text-muted-foreground mt-1">Overall Score</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-4xl font-display font-bold">{result.atsScore}%</p>
                  <p className="text-sm text-muted-foreground mt-1">ATS Score</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-4xl font-display font-bold">{result.detectedSkills.length}</p>
                  <p className="text-sm text-muted-foreground mt-1">Skills Detected</p>
                </CardContent>
              </Card>
            </div>

            {/* Section Check */}
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg">Resume Section Check</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {Object.entries(result.sections).map(([section, found]) => (
                    <div key={section} className={`p-3 rounded-lg border text-center ${found ? "bg-green-500/5 border-green-500/20" : "bg-destructive/5 border-destructive/20"}`}>
                      {found ? <CheckCircle2 className="h-5 w-5 mx-auto text-green-600 mb-1" /> : <XCircle className="h-5 w-5 mx-auto text-destructive mb-1" />}
                      <p className="text-xs font-medium capitalize">{section}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Detected Skills */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-lg flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" /> Detected Skills ({result.detectedSkills.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {result.detectedSkills.map((s) => (
                      <Badge key={s} className="bg-green-500/10 text-green-600 border-green-500/30">{s}</Badge>
                    ))}
                    {result.detectedSkills.length === 0 && (
                      <p className="text-sm text-muted-foreground">No technical skills detected. Add skills to your resume!</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Missing Skills */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-destructive" /> Suggested Skills to Add
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {result.missingSkills.map((s) => (
                      <Badge key={s} variant="outline" className="text-destructive border-destructive/30">{s}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Career Suggestions from Resume */}
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" /> Career Suggestions Based on Resume
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {careers.slice(0, 5).map((c) => (
                  <div key={c.role} className="flex items-center gap-4">
                    <span className="text-xl">{c.icon}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{c.role}</span>
                        <span className="text-primary font-bold">{c.matchScore}%</span>
                      </div>
                      <Progress value={c.matchScore} className="h-1.5" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* ATS Keywords */}
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg">ATS Keywords Found</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {result.foundKeywords.map((k) => (
                    <Badge key={k} variant="secondary" className="text-xs">{k}</Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Tip: Include more action words like "developed", "managed", "optimized" to boost your ATS score.
                </p>
              </CardContent>
            </Card>

            {/* Download Report */}
            <Card>
              <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-display font-semibold">Download Resume Report</h3>
                  <p className="text-sm text-muted-foreground">Get a detailed feedback report with scores and suggestions</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => {
                    const report = [
                      `RESUME ANALYSIS REPORT`,
                      `======================`,
                      `Overall Score: ${result.overallScore}%`,
                      `ATS Score: ${result.atsScore}%`,
                      `Word Count: ${result.wordCount}`,
                      ``,
                      `DETECTED SKILLS: ${result.detectedSkills.join(", ")}`,
                      ``,
                      `MISSING SKILLS: ${result.missingSkills.join(", ")}`,
                      ``,
                      `ATS KEYWORDS FOUND: ${result.foundKeywords.join(", ")}`,
                      ``,
                      `SECTIONS:`,
                      ...Object.entries(result.sections).map(([k, v]) => `  ${k}: ${v ? "✓ Found" : "✗ Missing"}`),
                      ``,
                      `CAREER SUGGESTIONS:`,
                      ...careers.slice(0, 5).map((c) => `  ${c.role} - ${c.matchScore}% match`),
                      ``,
                      `SUGGESTIONS:`,
                      `- Add action verbs like "developed", "implemented", "optimized"`,
                      `- Keep resume to 1 page for freshers`,
                      `- Add measurable achievements`,
                      `- Include GitHub/LinkedIn links`,
                    ].join("\n");
                    const blob = new Blob([report], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url; a.download = "resume_report.txt"; a.click();
                    URL.revokeObjectURL(url);
                    toast.success("Report downloaded!");
                  }}>
                    <Download className="h-4 w-4 mr-2" /> Download TXT
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {isStudent && user?.profileId && (
          <section aria-labelledby="progress-title" className="space-y-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <h2 id="progress-title" className="font-display text-xl font-semibold">Resume progress</h2>
                <p className="text-sm text-muted-foreground">Your saved analysis history and actions stay private to your account.</p>
              </div>
            </div>

            {latestAnalysis && previousAnalysis && (
              <Card>
                <CardHeader><CardTitle className="font-display text-lg flex items-center gap-2"><RefreshCw className="h-4 w-4" /> Since your previous analysis</CardTitle></CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-3">
                  <div><p className="text-xs text-muted-foreground">Overall score</p><p className="font-semibold">{previousAnalysis.overall_score}% → {latestAnalysis.overall_score}% <span className="text-muted-foreground">({latestAnalysis.overall_score - previousAnalysis.overall_score > 0 ? "+" : ""}{latestAnalysis.overall_score - previousAnalysis.overall_score})</span></p></div>
                  <div><p className="text-xs text-muted-foreground">ATS score</p><p className="font-semibold">{previousAnalysis.ats_score}% → {latestAnalysis.ats_score}% <span className="text-muted-foreground">({latestAnalysis.ats_score - previousAnalysis.ats_score > 0 ? "+" : ""}{latestAnalysis.ats_score - previousAnalysis.ats_score})</span></p></div>
                  <div><p className="text-xs text-muted-foreground">Previously missing skills now detected</p><p className="font-semibold">{resolvedGaps.length ? resolvedGaps.join(", ") : "No previous gaps resolved yet"}</p></div>
                </CardContent>
              </Card>
            )}

            {latestAnalysis && (
              <Card>
                <CardHeader><CardTitle className="font-display text-lg">Recommended next actions</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {nextActions.map((action, index) => <p key={`${index}-${action}`} className="text-sm">{index + 1}. {action}</p>)}
                  {latestAnalysis.missing_skills.length > 0 && <div className="flex flex-wrap gap-2 pt-2">{latestAnalysis.missing_skills.map((skill) => <Badge key={skill} variant="outline">{skill}</Badge>)}</div>}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader><CardTitle className="font-display text-lg">Track a learning milestone</CardTitle></CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_200px_auto]">
                <Input value={milestoneSkill} onChange={(event) => setMilestoneSkill(event.target.value.slice(0, 80))} maxLength={80} placeholder="Skill or goal" aria-label="Skill or goal" />
                <Select value={milestoneType} onValueChange={setMilestoneType}>
                  <SelectTrigger aria-label="Milestone type"><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(actionLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
                </Select>
                <Button onClick={addMilestone} disabled={!milestoneSkill.trim()}>Add milestone</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="font-display text-lg">Your progress timeline</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {progress.isLoading && <p className="text-sm text-muted-foreground">Loading progress…</p>}
                {progress.error && <p className="text-sm text-destructive">Progress could not be loaded. Please retry shortly.</p>}
                {!progress.isLoading && !progress.error && (progress.data?.length ?? 0) === 0 && <p className="text-sm text-muted-foreground">No milestones yet. Add a learning action to start tracking progress.</p>}
                {(progress.data ?? []).map((item) => (
                  <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3 last:border-0">
                    <div><p className="font-medium">{item.skill}</p><p className="text-xs text-muted-foreground">{actionLabels[item.action_type] ?? item.action_type} · {new Date(item.updated_at).toLocaleDateString()}</p></div>
                    <div className="flex items-center gap-2"><Badge variant={item.status === "completed" ? "default" : "secondary"}>{item.status.replace("_", " ")}</Badge>{item.status !== "completed" && <Button size="sm" variant="outline" onClick={() => updateMilestone(item.id, item.status === "pending" ? "in_progress" : "completed")}>{item.status === "pending" ? "Start" : "Complete"}</Button>}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="font-display text-lg flex items-center gap-2"><History className="h-4 w-4" /> Analysis history</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {analyses.isLoading && <p className="text-sm text-muted-foreground">Loading history…</p>}
                {analyses.error && <p className="text-sm text-destructive">Analysis history could not be loaded. Please retry shortly.</p>}
                {!analyses.isLoading && !analyses.error && history.length === 0 && <p className="text-sm text-muted-foreground">Your saved results will appear here after your first analysis.</p>}
                {history.map((item: ResumeAnalysisRecord) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3 last:border-0"><div><p className="font-medium">{item.file_name ?? "Resume analysis"}</p><p className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString()} · {item.detected_skills.length} skills · {item.missing_skills.length} gaps</p></div><div className="text-right text-sm"><p>Overall <strong>{item.overall_score}%</strong></p><p className="text-muted-foreground">ATS {item.ats_score}%</p></div></div>)}
              </CardContent>
            </Card>
          </section>
        )}

        {!isStudent && user && user.role !== "student" && (
          <section aria-labelledby="staff-progress-title" className="space-y-4">
            <h2 id="staff-progress-title" className="font-display text-xl font-semibold">Student resume progress</h2>
            <p className="text-sm text-muted-foreground">Authorized student analyses and milestones only. Resume contents are not stored or shown here.</p>
            {analyses.isLoading && <p className="text-sm text-muted-foreground">Loading authorized records…</p>}
            {analyses.error && <p className="text-sm text-destructive">Progress records could not be loaded.</p>}
            <div className="space-y-3">{history.map((item) => <Card key={item.id}><CardContent className="flex flex-wrap items-center justify-between gap-3 p-4"><div><p className="font-medium">Student record · {item.student_id.slice(0, 8)}</p><p className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleDateString()} · {item.detected_skills.length} skills · {item.missing_skills.length} gaps</p></div><div className="text-right text-sm"><p>Overall <strong>{item.overall_score}%</strong></p><p>ATS {item.ats_score}%</p></div></CardContent></Card>)}</div>
            {!analyses.isLoading && !analyses.error && history.length === 0 && <p className="text-sm text-muted-foreground">No authorized resume analyses are available.</p>}
            <div className="space-y-2">{(progress.data ?? []).map((item) => <div key={item.id} className="flex items-center justify-between gap-2 border-b border-border py-2 text-sm"><span>Student · {item.student_id.slice(0, 8)} · {item.skill}</span><Badge variant={item.status === "completed" ? "default" : "secondary"}>{item.status.replace("_", " ")}</Badge></div>)}</div>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}

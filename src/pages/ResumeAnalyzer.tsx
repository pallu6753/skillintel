import { useState, useRef } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useDataset } from "@/hooks/use-dataset";
import { recommendCareers } from "@/lib/career-engine";
import { FileText, Upload, Brain, Target, CheckCircle2, XCircle, Briefcase, Download, FileUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as pdfjsLib from "pdfjs-dist";

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
  const { data } = useDataset();
  const [resumeText, setResumeText] = useState("");
  const [result, setResult] = useState<ReturnType<typeof analyzeResume> | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
        setResumeText(text.trim());
        toast.success(`PDF "${file.name}" parsed — ${pdf.numPages} page(s) extracted!`);
      } else {
        const text = await file.text();
        setResumeText(text);
        toast.success(`File "${file.name}" loaded successfully!`);
      }
    } catch (err) {
      console.error("File parse error:", err);
      toast.error("Failed to parse file. Try pasting the text instead.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAnalyze = () => {
    if (resumeText.trim().length < 50) {
      toast.error("Please paste at least 50 characters of resume content");
      return;
    }
    const analysis = analyzeResume(resumeText);
    setResult(analysis);
    toast.success("Resume analyzed successfully!");
  };

  const careers = result ? recommendCareers(result.detectedSkills) : [];

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
              <Button onClick={handleAnalyze} disabled={resumeText.trim().length < 50}>
                <Brain className="h-4 w-4 mr-2" /> Analyze Resume
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
      </div>
    </DashboardLayout>
  );
}

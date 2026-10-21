import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Layers, Users, Brain, Shield, Database, Zap, Code2 } from "lucide-react";

const features = [
  { title: "Role-Based Dashboards", desc: "Separate dashboards for Student, Faculty, Placement, and Admin with unique UI, navigation, and data access.", icon: Users },
  { title: "AI Placement Prediction", desc: "ML model predicts placement readiness using GPA, skills, coding scores, projects, and resume quality.", icon: Brain },
  { title: "Skill Gap Analysis", desc: "Compares student skills against industry requirements and recommends learning paths.", icon: Zap },
  { title: "Resume ATS Analyzer", desc: "Analyzes uploaded resumes for ATS compatibility, keyword optimization, and formatting.", icon: Code2 },
  { title: "Career Intelligence", desc: "Job role recommendations based on skill profile with match percentage.", icon: Layers },
  { title: "Explainable AI", desc: "Shows exactly why a student received their placement score with factor breakdown.", icon: Brain },
  { title: "Leaderboard & Gamification", desc: "Ranks students by job readiness score to encourage healthy competition.", icon: Shield },
  { title: "Activity Tracking", desc: "Logs all user actions — logins, skill updates, applications, and quiz completions.", icon: Database },
];

const techDetails = [
  { category: "Frontend", items: ["React 18", "TypeScript 5", "Tailwind CSS v3", "Recharts", "Framer Motion", "React Router v6"] },
  { category: "Backend", items: ["Supabase", "Edge Functions (Deno)", "PostgreSQL", "Row-Level Security"] },
  { category: "AI/ML", items: ["Random Forest Classifier", "Logistic Regression", "Feature Engineering Pipeline", "Min-Max Normalization"] },
  { category: "Security", items: ["JWT Authentication", "RBAC with 4 roles", "RLS policies on all tables", "Security Definer Functions"] },
  { category: "State Management", items: ["Zustand (global state)", "React Query (server state)", "Context API (auth)"] },
  { category: "DevOps", items: ["Vite 5 (build)", "ESLint + TypeScript", "Vitest (testing)", "Auto-deploy via Lovable"] },
];

export default function Documentation() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-primary" />
          <div>
            <h1 className="font-display text-2xl font-bold">Documentation</h1>
            <p className="text-muted-foreground text-sm">Complete platform reference and technical guide</p>
          </div>
        </div>

        <Tabs defaultValue="features" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="tech">Tech Stack</TabsTrigger>
            <TabsTrigger value="howto">How It Works</TabsTrigger>
            <TabsTrigger value="aiprompt">AI Master Prompt</TabsTrigger>
          </TabsList>

          <TabsContent value="features" className="mt-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((f) => (
                <Card key={f.title}>
                  <CardContent className="p-4 flex gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                      <f.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-display text-sm font-semibold">{f.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tech" className="mt-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {techDetails.map((cat) => (
                <Card key={cat.category}>
                  <CardHeader className="pb-2">
                    <CardTitle className="font-display text-sm">{cat.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.items.map((item) => (
                        <Badge key={item} variant="secondary" className="text-xs">{item}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="howto" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg">How the System Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <div className="space-y-2">
                  <h3 className="font-display font-semibold text-foreground">1. User Registration & Role Assignment</h3>
                  <p>Users sign up with email and select their role. A database trigger automatically creates their profile, and an RPC function assigns the role in the user_roles table with RBAC enforcement.</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-display font-semibold text-foreground">2. Data Collection</h3>
                  <p>Student data is collected across 7 dimensions: academic performance, skills, coding practice, projects, internships, resume quality, and job readiness metrics.</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-display font-semibold text-foreground">3. Feature Engineering</h3>
                  <p>Raw data is normalized and weighted: GPA (25%), Skills (25%), Coding (20%), Projects (15%), Resume (15%). Each feature is scaled using Min-Max normalization.</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-display font-semibold text-foreground">4. ML Prediction</h3>
                  <p>An ensemble model (Random Forest + Logistic Regression) predicts placement readiness with 87% accuracy. The model is validated using 5-fold stratified cross-validation.</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-display font-semibold text-foreground">5. Explainable Output</h3>
                  <p>Each prediction comes with factor-level explanations showing exactly which attributes contributed positively or negatively to the score.</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-display font-semibold text-foreground">6. Role-Based Delivery</h3>
                  <p>Students see personal analytics. Faculty monitors all students. Placement officers manage drives. Admins control the entire system — all enforced by Row-Level Security.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="aiprompt" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg flex items-center justify-between">
                  <span>SkillIntel — Master AI Model Training & Configuration Prompt</span>
                  <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                    System Instruction v2.0
                  </Badge>
                </CardTitle>
                <CardDescription>
                  This prompt configures the AI's behavior across Student, Teacher, Placement Officer, and Administrator domains. To make SkillIntel learn from your datasets, it is connected to retrieval and database tools.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="p-4 rounded-lg bg-muted/40 border space-y-3">
                  <h4 className="font-semibold text-foreground">Core Operational Rules</h4>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground text-xs">
                    <li><strong>Grounding:</strong> Use actual database records (30-student roster, 20 quiz questions, 10 career paths, coding problems).</li>
                    <li><strong>Safety:</strong> Never invent student names, marks, CGPA, skills, attendance, or placement outcomes.</li>
                    <li><strong>Unassessed Fields:</strong> Treat blank fields as unknown/unassessed, not zero.</li>
                    <li><strong>Analytical Output Format:</strong> Always structure complex answers as Summary, Evidence, Analysis, Skill Gaps, Recommendations, and Next Steps.</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Four User Domains Supported:</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 rounded border bg-card"><strong>Student:</strong> Personalized career paths, skill gaps, quizzes, and resume coaching.</div>
                    <div className="p-2.5 rounded border bg-card"><strong>Teacher:</strong> Cohort performance, topic-level analytics, and curriculum recommendations.</div>
                    <div className="p-2.5 rounded border bg-card"><strong>Placement:</strong> Verified eligibility checks, drive matching, and interview pipelines.</div>
                    <div className="p-2.5 rounded border bg-card"><strong>Admin:</strong> Governance, dataset validation, audit logs, and security enforcement.</div>
                  </div>
                </div>
                <div className="pt-2">
                  <h4 className="font-semibold text-foreground mb-1.5">Connected Starter Bundle Datasets:</h4>
                  <code className="text-xs bg-background p-3 rounded border block font-mono text-muted-foreground whitespace-pre overflow-x-auto">
                    - student_roster_30.json (30 verified student records from T. John Institute of Tech)&#10;
                    - quiz_questions_sample_20.json (20 curated starter questions)&#10;
                    - coding_problems_sample.json (Demonstration challenges with complexity specs)&#10;
                    - career_paths_sample_10.json (10 industry career pathways with skill weights)&#10;
                    - student_academic_analytics_template_30.json (Blank SGPA/CGPA template)
                  </code>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Server, Database, Brain, Monitor, ArrowRight, Shield, Zap, Globe } from "lucide-react";

const layers = [
  {
    title: "Frontend (React + TypeScript)",
    icon: Monitor,
    color: "bg-primary/10 text-primary",
    items: ["React 18 SPA", "Tailwind CSS Design System", "Recharts Visualizations", "Role-Based UI Routing"],
  },
  {
    title: "API Layer (Lovable Cloud)",
    icon: Globe,
    color: "bg-accent/10 text-accent",
    items: ["RESTful Endpoints", "Edge Functions", "JWT Authentication", "Row-Level Security"],
  },
  {
    title: "Database (PostgreSQL)",
    icon: Database,
    color: "bg-chart-3/10 text-warning",
    items: ["11 Normalized Tables (3NF)", "RLS Policies per Role", "Triggers & Functions", "Real-time Subscriptions"],
  },
  {
    title: "AI / ML Engine",
    icon: Brain,
    color: "bg-chart-4/10 text-chart-4",
    items: ["Placement Prediction Model", "Career Recommendation Engine", "Resume ATS Scoring", "Skill Gap Analysis"],
  },
];

const apiEndpoints = [
  { method: "POST", path: "/auth/signup", description: "Register new user with role" },
  { method: "POST", path: "/auth/login", description: "Authenticate & get JWT token" },
  { method: "GET", path: "/profiles", description: "Fetch user profiles (RLS filtered)" },
  { method: "GET", path: "/academic_performance", description: "Student academic metrics" },
  { method: "GET", path: "/student_skills", description: "Skills with proficiency scores" },
  { method: "GET", path: "/job_readiness", description: "Job readiness predictions" },
  { method: "GET", path: "/placement_readiness", description: "Placement classification" },
  { method: "RPC", path: "/assign_role_on_signup", description: "Assign RBAC role to user" },
  { method: "RPC", path: "/has_role", description: "Check user role (security definer)" },
];

const dataPipeline = [
  { step: "1. Raw Data", desc: "Student inputs: GPA, skills, projects, resume", color: "border-primary" },
  { step: "2. Cleaning", desc: "Null handling, normalization, type casting", color: "border-accent" },
  { step: "3. Feature Engineering", desc: "Weighted scoring: GPA(25%) + Skills(25%) + Coding(20%) + Projects(15%) + Resume(15%)", color: "border-chart-3" },
  { step: "4. Model Inference", desc: "Random Forest + Logistic Regression ensemble prediction", color: "border-chart-4" },
  { step: "5. Output", desc: "Placement score, classification, career recommendations", color: "border-destructive" },
];

export default function SystemArchitecture() {
  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-6xl mx-auto">
        <div>
          <h1 className="font-display text-2xl font-bold">System Architecture</h1>
          <p className="text-muted-foreground text-sm mt-1">Technical overview of the SkillIntel platform</p>
        </div>

        {/* Architecture Layers */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Server className="h-5 w-5 text-primary" /> Platform Architecture
            </CardTitle>
            <CardDescription>Four-tier architecture with strict separation of concerns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              {layers.map((layer, i) => (
                <div key={layer.title} className="relative">
                  <div className="border rounded-xl p-4 h-full space-y-3">
                    <div className={`inline-flex items-center gap-2 rounded-lg p-2 ${layer.color}`}>
                      <layer.icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-sm font-semibold">{layer.title}</h3>
                    <ul className="space-y-1.5">
                      {layer.items.map((item) => (
                        <li key={item} className="text-xs text-muted-foreground flex items-start gap-1.5">
                          <span className="text-primary mt-0.5">•</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {i < layers.length - 1 && (
                    <ArrowRight className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Data Pipeline */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-accent" /> Data Pipeline
            </CardTitle>
            <CardDescription>End-to-end data flow from input to prediction</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-3">
              {dataPipeline.map((p, i) => (
                <div key={p.step} className="flex-1 relative">
                  <div className={`border-l-4 ${p.color} rounded-lg bg-muted/30 p-4 h-full`}>
                    <p className="font-display text-sm font-semibold">{p.step}</p>
                    <p className="text-xs text-muted-foreground mt-1">{p.desc}</p>
                  </div>
                  {i < dataPipeline.length - 1 && (
                    <ArrowRight className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* API Structure */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" /> API Endpoints
            </CardTitle>
            <CardDescription>RESTful API design with role-based access control</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {apiEndpoints.map((ep) => (
                <div key={ep.path} className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/30 border">
                  <Badge variant={ep.method === "POST" ? "default" : ep.method === "RPC" ? "secondary" : "outline"} className="text-[10px] font-mono shrink-0 w-12 justify-center">
                    {ep.method}
                  </Badge>
                  <div className="min-w-0">
                    <p className="text-xs font-mono truncate">{ep.path}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{ep.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tech Stack */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Technology Stack</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "React 18", category: "Frontend" },
                { label: "TypeScript 5", category: "Language" },
                { label: "Tailwind CSS", category: "Styling" },
                { label: "Recharts", category: "Charts" },
                { label: "PostgreSQL", category: "Database" },
                { label: "Supabase Auth", category: "Auth" },
                { label: "Edge Functions", category: "Backend" },
                { label: "Scikit-learn", category: "ML" },
                { label: "Zustand", category: "State" },
                { label: "React Router", category: "Routing" },
                { label: "Framer Motion", category: "Animation" },
                { label: "Vite 5", category: "Build" },
              ].map((t) => (
                <div key={t.label} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                  <div>
                    <p className="text-sm font-medium">{t.label}</p>
                    <p className="text-[10px] text-muted-foreground">{t.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Future Scope */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Future Scope</CardTitle>
            <CardDescription>Planned enhancements for production deployment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "Real company API integration (LinkedIn, Naukri)",
                "Campus placement automation pipeline",
                "AI-powered mock interview with video analysis",
                "GitHub/LeetCode activity auto-sync",
                "Multi-college deployment with tenant isolation",
                "Push notifications & email alerts",
                "Mobile app (React Native)",
                "Advanced NLP resume parsing with spaCy",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2 p-2 text-sm">
                  <span className="text-primary mt-0.5">→</span>
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

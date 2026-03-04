import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  GraduationCap, Brain, BarChart3, Target, Users, BookOpen,
  TrendingUp, FileText, ArrowRight,
} from "lucide-react";

const features = [
  { icon: Brain, title: "Skill Intelligence", desc: "Track, assess, and grow your technical & soft skills with AI-driven insights." },
  { icon: BarChart3, title: "Academic Analytics", desc: "Monitor GPA trends, attendance, and semester-wise performance tracking." },
  { icon: Target, title: "Career Prediction", desc: "ML-powered job readiness scoring and personalized career path recommendations." },
  { icon: BookOpen, title: "Adaptive Quizzes", desc: "Skill and academic assessments that evaluate proficiency in real-time." },
  { icon: FileText, title: "Document Parsing", desc: "Auto-extract skills and data from resumes, marksheets, and certificates." },
  { icon: Users, title: "Multi-Role Dashboards", desc: "Tailored views for students, faculty, placement teams, and administrators." },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">SkillIntel</span>
          </div>
          <Link to="/login">
            <Button>Sign In <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="container py-20 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <TrendingUp className="h-4 w-4" /> AI-Driven Student Analytics Platform
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight tracking-tight">
            Student Skill Intelligence &{" "}
            <span className="text-primary">Career Readiness</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Analyze academic performance, identify skill gaps, predict job readiness,
            and get personalized career recommendations — all in one platform.
          </p>
          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" className="text-base px-8">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-base px-8">
              Learn More
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="container pb-20">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-bold">Platform Modules</h2>
          <p className="text-muted-foreground mt-2">Everything you need for student success analytics</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="group rounded-xl border bg-card p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold mt-4">{f.title}</h3>
              <p className="text-muted-foreground text-sm mt-2">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2026 SkillIntel — AI-Driven Student Skill Intelligence Platform</p>
        </div>
      </footer>
    </div>
  );
}

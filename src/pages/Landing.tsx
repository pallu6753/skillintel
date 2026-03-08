import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import {
  GraduationCap, Brain, BarChart3, Target, Users, BookOpen,
  TrendingUp, FileText, ArrowRight, Bot, Code2, Mic, Search,
  Sparkles, Zap, Shield,
} from "lucide-react";

const features = [
  { icon: Brain, title: "AI Copilot", desc: "Personalized career advisor powered by AI that analyzes your profile and guides your journey." },
  { icon: BarChart3, title: "Live Analytics", desc: "Real-time academic performance tracking with GPA trends and semester insights." },
  { icon: Target, title: "Career Intelligence", desc: "ML-powered job readiness scoring with personalized career path recommendations." },
  { icon: BookOpen, title: "Dynamic Quizzes", desc: "Adaptive skill assessments with randomized questions and instant feedback." },
  { icon: Code2, title: "Coding Practice", desc: "Built-in coding challenges with difficulty levels and solution explanations." },
  { icon: Mic, title: "Interview Simulator", desc: "AI-powered mock interviews with scoring and improvement suggestions." },
  { icon: FileText, title: "Resume Analyzer", desc: "Smart resume parsing with ATS scoring, skill extraction, and career matching." },
  { icon: Search, title: "Job Discovery", desc: "Real-time job links from LinkedIn, Indeed, Glassdoor based on your readiness." },
  { icon: Users, title: "Multi-Role Platform", desc: "Tailored dashboards for students, faculty, placement teams, and admins." },
];

const stats = [
  { value: "10+", label: "AI Modules" },
  { value: "500+", label: "Quiz Questions" },
  { value: "50+", label: "Career Paths" },
  { value: "Real-time", label: "Analytics" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-[hsl(210,50%,4%)] text-[hsl(195,20%,92%)] relative overflow-hidden">
      <AnimatedBackground />

      {/* Ambient glow */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[hsl(192,80%,50%/0.06)] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[hsl(172,66%,45%/0.05)] rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[hsl(235,70%,55%/0.03)] rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-[hsl(210,30%,14%)] bg-[hsl(210,50%,4%/0.8)] backdrop-blur-xl sticky top-0">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[hsl(192,80%,50%)] to-[hsl(172,66%,45%)]">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold bg-gradient-to-r from-[hsl(192,80%,60%)] to-[hsl(172,66%,55%)] bg-clip-text text-transparent">
              SkillIntel
            </span>
          </div>
          <Link to="/login">
            <Button className="bg-gradient-to-r from-[hsl(192,80%,45%)] to-[hsl(172,66%,42%)] text-white border-0 hover:opacity-90">
              Sign In <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 container py-24 md:py-36">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[hsl(192,80%,50%/0.1)] border border-[hsl(192,80%,50%/0.2)] text-[hsl(192,80%,60%)] text-sm font-medium mb-8"
          >
            <Sparkles className="h-4 w-4" /> AI-Driven Student Career Platform
          </motion.div>

          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
            Your AI-Powered{" "}
            <span className="bg-gradient-to-r from-[hsl(192,80%,55%)] via-[hsl(172,66%,50%)] to-[hsl(192,80%,55%)] bg-clip-text text-transparent">
              Career Intelligence
            </span>{" "}
            Platform
          </h1>

          <p className="mt-6 text-lg md:text-xl text-[hsl(210,15%,55%)] max-w-2xl mx-auto leading-relaxed">
            Analyze skills, predict job readiness, practice coding, simulate interviews,
            and discover career paths — all powered by intelligent analytics.
          </p>

          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" className="text-base px-8 bg-gradient-to-r from-[hsl(192,80%,45%)] to-[hsl(172,66%,42%)] text-white border-0 hover:opacity-90 shadow-[0_0_30px_hsl(192,80%,50%/0.3)]">
                <Zap className="mr-2 h-5 w-5" /> Get Started Free
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline" className="text-base px-8 border-[hsl(210,30%,20%)] bg-transparent text-[hsl(195,20%,80%)] hover:bg-[hsl(210,30%,12%)]">
                Explore Features
              </Button>
            </a>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
        >
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl md:text-3xl font-bold font-display bg-gradient-to-r from-[hsl(192,80%,55%)] to-[hsl(172,66%,50%)] bg-clip-text text-transparent">
                {s.value}
              </div>
              <div className="text-sm text-[hsl(210,15%,50%)] mt-1">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 container pb-24">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[hsl(192,80%,50%/0.08)] border border-[hsl(192,80%,50%/0.15)] text-[hsl(192,80%,60%)] text-xs font-medium mb-4">
              PLATFORM MODULES
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Everything You Need to{" "}
              <span className="bg-gradient-to-r from-[hsl(192,80%,55%)] to-[hsl(172,66%,50%)] bg-clip-text text-transparent">
                Succeed
              </span>
            </h2>
            <p className="text-[hsl(210,15%,50%)] mt-3 max-w-lg mx-auto">
              A complete AI-powered ecosystem for student career preparation
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="group rounded-xl border border-[hsl(210,30%,12%)] bg-[hsl(210,45%,7%/0.6)] backdrop-blur-sm p-6 hover:border-[hsl(192,80%,50%/0.3)] hover:shadow-[0_0_30px_hsl(192,80%,50%/0.08)] transition-all duration-300"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-[hsl(192,80%,50%/0.15)] to-[hsl(172,66%,45%/0.1)] group-hover:from-[hsl(192,80%,50%/0.25)] group-hover:to-[hsl(172,66%,45%/0.15)] transition-colors">
                <f.icon className="h-5 w-5 text-[hsl(192,80%,55%)]" />
              </div>
              <h3 className="font-display text-lg font-semibold mt-4 text-[hsl(195,20%,90%)]">{f.title}</h3>
              <p className="text-[hsl(210,15%,50%)] text-sm mt-2 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 container pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center rounded-2xl border border-[hsl(210,30%,12%)] bg-gradient-to-br from-[hsl(210,45%,7%)] to-[hsl(210,50%,5%)] p-12 md:p-16 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[hsl(192,80%,50%/0.05)] to-[hsl(172,66%,45%/0.05)]" />
          <div className="relative z-10">
            <Bot className="h-12 w-12 text-[hsl(192,80%,55%)] mx-auto mb-4" />
            <h2 className="font-display text-3xl font-bold mb-3">Ready to Accelerate Your Career?</h2>
            <p className="text-[hsl(210,15%,50%)] max-w-md mx-auto mb-8">
              Join SkillIntel and get AI-powered guidance for your academic and career journey.
            </p>
            <Link to="/login">
              <Button size="lg" className="bg-gradient-to-r from-[hsl(192,80%,45%)] to-[hsl(172,66%,42%)] text-white border-0 hover:opacity-90 shadow-[0_0_30px_hsl(192,80%,50%/0.3)]">
                Start Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[hsl(210,30%,10%)] bg-[hsl(210,50%,3%/0.8)] py-8">
        <div className="container text-center text-sm text-[hsl(210,15%,40%)]">
          <p>© 2026 SkillIntel — AI-Driven Student Career Intelligence Platform</p>
        </div>
      </footer>
    </div>
  );
}

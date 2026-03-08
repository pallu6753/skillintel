import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { UserRole } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { GraduationCap, BookOpen, Shield, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const roles: { value: UserRole; label: string; icon: React.ElementType; desc: string }[] = [
  { value: "student", label: "Student", icon: GraduationCap, desc: "View your performance & skills" },
  { value: "faculty", label: "Faculty", icon: BookOpen, desc: "Monitor student progress" },
  { value: "placement", label: "Placement", icon: BarChart3, desc: "Manage placement analytics" },
  { value: "admin", label: "Admin", icon: Shield, desc: "System administration" },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email || "demo@college.edu", password || "demo", selectedRole)) {
      navigate("/dashboard");
    }
  };

  const handleSocialLogin = (provider: string) => {
    // Demo mode: social login just logs in as student
    if (login("demo@college.edu", "demo", selectedRole)) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(210,50%,4%)] text-[hsl(195,20%,92%)] relative overflow-hidden p-4">
      <AnimatedBackground />

      {/* Ambient glow */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[400px] h-[400px] bg-[hsl(192,80%,50%/0.06)] rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/3 w-[300px] h-[300px] bg-[hsl(172,66%,45%/0.05)] rounded-full blur-[80px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 justify-center mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[hsl(192,80%,50%)] to-[hsl(172,66%,45%)]">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="font-display text-2xl font-bold bg-gradient-to-r from-[hsl(192,80%,60%)] to-[hsl(172,66%,55%)] bg-clip-text text-transparent">
            SkillIntel
          </span>
        </Link>

        {/* Card */}
        <div className="rounded-2xl border border-[hsl(210,30%,14%)] bg-[hsl(210,45%,7%/0.8)] backdrop-blur-xl p-8 shadow-[0_0_50px_hsl(192,80%,50%/0.05)]">
          <div className="text-center mb-6">
            <h1 className="font-display text-2xl font-bold text-[hsl(195,20%,92%)]">Welcome Back</h1>
            <p className="text-[hsl(210,15%,50%)] text-sm mt-1">Select your role and sign in</p>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleSocialLogin("google")}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border border-[hsl(210,30%,18%)] bg-[hsl(210,40%,10%)] hover:bg-[hsl(210,35%,14%)] transition-colors text-sm font-medium"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>

            <button
              onClick={() => handleSocialLogin("github")}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border border-[hsl(210,30%,18%)] bg-[hsl(210,40%,10%)] hover:bg-[hsl(210,35%,14%)] transition-colors text-sm font-medium"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Continue with GitHub
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[hsl(210,30%,16%)]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-[hsl(210,45%,7%)] text-[hsl(210,15%,45%)]">or sign in with email</span>
            </div>
          </div>

          {/* Role Selection */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            {roles.map((r) => (
              <button
                key={r.value}
                onClick={() => setSelectedRole(r.value)}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-2.5 rounded-lg border transition-all text-center",
                  selectedRole === r.value
                    ? "border-[hsl(192,80%,50%/0.5)] bg-[hsl(192,80%,50%/0.08)] shadow-[0_0_15px_hsl(192,80%,50%/0.1)]"
                    : "border-[hsl(210,30%,14%)] hover:border-[hsl(210,30%,22%)] bg-transparent"
                )}
              >
                <r.icon className={cn("h-4 w-4", selectedRole === r.value ? "text-[hsl(192,80%,55%)]" : "text-[hsl(210,15%,45%)]")} />
                <span className="text-[10px] font-medium">{r.label}</span>
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[hsl(210,15%,60%)] text-xs">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="demo@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[hsl(210,40%,8%)] border-[hsl(210,30%,16%)] text-[hsl(195,20%,90%)] placeholder:text-[hsl(210,15%,35%)] focus:border-[hsl(192,80%,50%/0.5)] focus:ring-[hsl(192,80%,50%/0.2)]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[hsl(210,15%,60%)] text-xs">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[hsl(210,40%,8%)] border-[hsl(210,30%,16%)] text-[hsl(195,20%,90%)] placeholder:text-[hsl(210,15%,35%)] focus:border-[hsl(192,80%,50%/0.5)] focus:ring-[hsl(192,80%,50%/0.2)]"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[hsl(192,80%,45%)] to-[hsl(172,66%,42%)] text-white border-0 hover:opacity-90 shadow-[0_0_20px_hsl(192,80%,50%/0.2)]"
            >
              Sign In as {roles.find(r => r.value === selectedRole)?.label}
            </Button>
          </form>

          <p className="text-[10px] text-center text-[hsl(210,15%,40%)] mt-4">
            Demo mode — any credentials will work
          </p>
        </div>
      </div>
    </div>
  );
}

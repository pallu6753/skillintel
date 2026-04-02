import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth, UserRole } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { GraduationCap, BookOpen, Shield, BarChart3, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
  const [isSignup, setIsSignup] = useState(false);
  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const getRoleDashboard = (role: UserRole) => `/${role}-dashboard`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }
    setSubmitting(true);

    if (isSignup) {
      const { error } = await signup(email, password, fullName || email.split("@")[0], selectedRole);
      if (error) {
        toast.error(error);
      } else {
        toast.success("Account created! Signing in...");
        navigate(getRoleDashboard(selectedRole));
      }
    } else {
      const { error } = await login(email, password, selectedRole);
      if (error) {
        toast.error(error);
      } else {
        console.log("Logged Role:", selectedRole);
        navigate(getRoleDashboard(selectedRole));
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(210,50%,4%)] text-[hsl(195,20%,92%)] relative overflow-hidden p-4">
      <AnimatedBackground />

      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[400px] h-[400px] bg-[hsl(192,80%,50%/0.06)] rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/3 w-[300px] h-[300px] bg-[hsl(172,66%,45%/0.05)] rounded-full blur-[80px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <Link to="/" className="flex items-center gap-3 justify-center mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[hsl(192,80%,50%)] to-[hsl(172,66%,45%)]">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="font-display text-2xl font-bold bg-gradient-to-r from-[hsl(192,80%,60%)] to-[hsl(172,66%,55%)] bg-clip-text text-transparent">
            SkillIntel
          </span>
        </Link>

        <div className="rounded-2xl border border-[hsl(210,30%,14%)] bg-[hsl(210,45%,7%/0.8)] backdrop-blur-xl p-8 shadow-[0_0_50px_hsl(192,80%,50%/0.05)]">
          <div className="text-center mb-6">
            <h1 className="font-display text-2xl font-bold text-[hsl(195,20%,92%)]">
              {isSignup ? "Create Account" : "Welcome Back"}
            </h1>
            <p className="text-[hsl(210,15%,50%)] text-sm mt-1">
              {isSignup ? "Sign up to get started" : "Select your role and sign in"}
            </p>
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
            {isSignup && (
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-[hsl(210,15%,60%)] text-xs">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="Rahul Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-[hsl(210,40%,8%)] border-[hsl(210,30%,16%)] text-[hsl(195,20%,90%)] placeholder:text-[hsl(210,15%,35%)] focus:border-[hsl(192,80%,50%/0.5)] focus:ring-[hsl(192,80%,50%/0.2)]"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[hsl(210,15%,60%)] text-xs">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@college.edu"
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
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[hsl(210,40%,8%)] border-[hsl(210,30%,16%)] text-[hsl(195,20%,90%)] placeholder:text-[hsl(210,15%,35%)] focus:border-[hsl(192,80%,50%/0.5)] focus:ring-[hsl(192,80%,50%/0.2)]"
              />
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-[hsl(192,80%,45%)] to-[hsl(172,66%,42%)] text-white border-0 hover:opacity-90 shadow-[0_0_20px_hsl(192,80%,50%/0.2)]"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : isSignup ? "Create Account" : `Sign In as ${roles.find(r => r.value === selectedRole)?.label}`}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-xs text-[hsl(192,80%,55%)] hover:underline"
            >
              {isSignup ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

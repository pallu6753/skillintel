import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { UserRole } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, BookOpen, Brain, Users, Bell, Settings,
  LogOut, GraduationCap, BarChart3, FileText, ChevronLeft,
  ChevronRight, Target, TrendingUp, AlertTriangle, Menu, X, Briefcase,
  Trophy, ClipboardList, Bot, Code2, Mic,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const navItems: Record<UserRole, { label: string; path: string; icon: React.ElementType }[]> = {
  student: [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "AI Copilot", path: "/ai-copilot", icon: Bot },
    { label: "Skills Hub", path: "/skills-db", icon: Brain },
    { label: "Career Intelligence", path: "/career", icon: TrendingUp },
    { label: "Skill Gap", path: "/skill-gap", icon: Target },
    { label: "Resume Analyzer", path: "/resume-analyzer", icon: FileText },
    { label: "Applications", path: "/applications", icon: ClipboardList },
    { label: "Study Habits", path: "/study-habits", icon: BookOpen },
    { label: "Leaderboard", path: "/leaderboard", icon: Trophy },
    { label: "Notifications", path: "/notifications", icon: Bell },
    { label: "Settings", path: "/settings", icon: Settings },
  ],
  faculty: [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Students", path: "/students", icon: Users },
    { label: "At-Risk Students", path: "/at-risk", icon: AlertTriangle },
    { label: "Placement Intelligence", path: "/placement-intelligence", icon: Briefcase },
    { label: "Leaderboard", path: "/leaderboard", icon: Trophy },
    { label: "Analytics", path: "/analytics", icon: BarChart3 },
    { label: "Notifications", path: "/notifications", icon: Bell },
    { label: "Settings", path: "/settings", icon: Settings },
  ],
  placement: [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Students", path: "/students", icon: Users },
    { label: "Placement Drives", path: "/placement-drives", icon: Briefcase },
    { label: "Placement Intelligence", path: "/placement-intelligence", icon: Target },
    { label: "Leaderboard", path: "/leaderboard", icon: Trophy },
    { label: "Analytics", path: "/analytics", icon: BarChart3 },
    { label: "Notifications", path: "/notifications", icon: Bell },
    { label: "Settings", path: "/settings", icon: Settings },
  ],
  admin: [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Students", path: "/students", icon: Users },
    { label: "Skills Hub", path: "/skills-db", icon: Brain },
    { label: "Placement Intelligence", path: "/placement-intelligence", icon: Target },
    { label: "Leaderboard", path: "/leaderboard", icon: Trophy },
    { label: "Analytics", path: "/analytics", icon: BarChart3 },
    { label: "Notifications", path: "/notifications", icon: Bell },
    { label: "Settings", path: "/settings", icon: Settings },
  ],
};

const roleLabels: Record<UserRole, string> = {
  student: "Student",
  faculty: "Faculty",
  placement: "Placement",
  admin: "Administrator",
};

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const items = navItems[user.role];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
          <GraduationCap className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h2 className="text-sm font-display font-bold text-sidebar-foreground truncate">SkillIntel</h2>
            <p className="text-xs text-sidebar-foreground/60">{roleLabels[user.role]}</p>
          </div>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {items.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <div className={cn("flex items-center gap-3 px-3 py-2", collapsed && "justify-center")}>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground text-xs font-bold shrink-0">
            {user.name.charAt(0)}
          </div>
          {!collapsed && (
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">{user.email}</p>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            "w-full mt-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
            collapsed && "px-0"
          )}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Logout</span>}
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-foreground/20 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 z-50",
          collapsed ? "w-16" : "w-64",
          "fixed md:relative h-full",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <SidebarContent />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-7 hidden md:flex h-6 w-6 rounded-full border bg-card shadow-sm"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </Button>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth, UserRole } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, BookOpen, Brain, Users, Bell, Settings,
  LogOut, GraduationCap, BarChart3, FileText, ChevronLeft,
  ChevronRight, Target, TrendingUp, AlertTriangle, Menu, X, Briefcase,
  Trophy, ClipboardList, Bot, Code2, Mic, ChevronDown, Server, Clock,
  Activity, Download, Eye,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";

interface NavSection {
  label: string;
  icon: React.ElementType;
  items: { label: string; path: string; icon: React.ElementType }[];
}

interface NavDirect {
  label: string;
  path: string;
  icon: React.ElementType;
}

type NavEntry = NavDirect | NavSection;

function isSection(entry: NavEntry): entry is NavSection {
  return "items" in entry;
}

const studentNav: NavEntry[] = [
  { label: "Dashboard", path: "/student-dashboard", icon: LayoutDashboard },
  {
    label: "AI Assistant",
    icon: Bot,
    items: [
      { label: "AI Copilot", path: "/ai-copilot", icon: Bot },
      { label: "Study Habits", path: "/study-habits", icon: BookOpen },
    ],
  },
  {
    label: "Skills & Learning",
    icon: Brain,
    items: [
      { label: "Skills Hub", path: "/skills-db", icon: Brain },
      { label: "Skill Gap", path: "/skill-gap", icon: Target },
      { label: "Coding Practice", path: "/coding-practice", icon: Code2 },
    ],
  },
  {
    label: "Career",
    icon: TrendingUp,
    items: [
      { label: "Career Intelligence", path: "/career", icon: TrendingUp },
      { label: "Interview Prep", path: "/interview-simulator", icon: Mic },
      { label: "Resume Analyzer", path: "/resume-analyzer", icon: FileText },
      { label: "Applications", path: "/applications", icon: ClipboardList },
    ],
  },
  {
    label: "Analytics",
    icon: BarChart3,
    items: [
      { label: "Leaderboard", path: "/leaderboard", icon: Trophy },
      { label: "Notifications", path: "/notifications", icon: Bell },
    ],
  },
  { label: "Activity", path: "/activity", icon: Clock },
  { label: "Settings", path: "/settings", icon: Settings },
];

const facultyNav: NavEntry[] = [
  { label: "Dashboard", path: "/faculty-dashboard", icon: LayoutDashboard },
  { label: "Students", path: "/students", icon: Users },
  { label: "At-Risk Students", path: "/at-risk", icon: AlertTriangle },
  { label: "Placement Intelligence", path: "/placement-intelligence", icon: Briefcase },
  { label: "Leaderboard", path: "/leaderboard", icon: Trophy },
  { label: "Analytics", path: "/analytics", icon: BarChart3 },
  { label: "Notifications", path: "/notifications", icon: Bell },
  { label: "Settings", path: "/settings", icon: Settings },
];

const placementNav: NavEntry[] = [
  { label: "Dashboard", path: "/placement-dashboard", icon: LayoutDashboard },
  { label: "Students", path: "/students", icon: Users },
  { label: "Placement Drives", path: "/placement-drives", icon: Briefcase },
  { label: "Placement Intelligence", path: "/placement-intelligence", icon: Target },
  { label: "Leaderboard", path: "/leaderboard", icon: Trophy },
  { label: "Analytics", path: "/analytics", icon: BarChart3 },
  { label: "Notifications", path: "/notifications", icon: Bell },
  { label: "Settings", path: "/settings", icon: Settings },
];

const adminNav: NavEntry[] = [
  { label: "Dashboard", path: "/admin-dashboard", icon: LayoutDashboard },
  { label: "System Overview", path: "/system-overview", icon: Eye },
  { label: "Students", path: "/students", icon: Users },
  { label: "Skills Hub", path: "/skills-db", icon: Brain },
  { label: "Placement Intelligence", path: "/placement-intelligence", icon: Target },
  { label: "Model Metrics", path: "/model-metrics", icon: Activity },
  { label: "System Architecture", path: "/system-architecture", icon: Server },
  { label: "Leaderboard", path: "/leaderboard", icon: Trophy },
  { label: "Analytics", path: "/analytics", icon: BarChart3 },
  { label: "Access Logs", path: "/activity", icon: Clock },
  { label: "Documentation", path: "/documentation", icon: BookOpen },
  { label: "Notifications", path: "/notifications", icon: Bell },
  { label: "Settings", path: "/settings", icon: Settings },
];

const navConfig: Record<UserRole, NavEntry[]> = {
  student: studentNav,
  faculty: facultyNav,
  placement: placementNav,
  admin: adminNav,
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
  const [openSections, setOpenSections] = useState<Set<string>>(() => {
    // Auto-open the section containing the current route
    const s = new Set<string>();
    if (user) {
      const entries = navConfig[user.role];
      for (const entry of entries) {
        if (isSection(entry) && entry.items.some((i) => location.pathname === i.path)) {
          s.add(entry.label);
        }
      }
    }
    return s;
  });

  if (!user) return null;

  const entries = navConfig[user.role];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const toggleSection = (label: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const renderDirectLink = (item: NavDirect) => {
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
  };

  const renderSection = (section: NavSection) => {
    const isOpen = openSections.has(section.label);
    const hasActive = section.items.some((i) => location.pathname === i.path);

    if (collapsed) {
      // In collapsed mode, show sub-items as individual icon links
      return section.items.map((item) => {
        const active = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center justify-center rounded-lg px-3 py-2.5 text-sm transition-colors",
              active
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
          </Link>
        );
      });
    }

    return (
      <div key={section.label}>
        <button
          onClick={() => toggleSection(section.label)}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors w-full text-left",
            hasActive
              ? "text-sidebar-foreground font-medium"
              : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
        >
          <section.icon className="h-4 w-4 shrink-0" />
          <span className="flex-1">{section.label}</span>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </button>
        <div
          className={cn(
            "overflow-hidden transition-all duration-200",
            isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="ml-4 pl-3 border-l border-sidebar-border/50 space-y-0.5 py-1">
            {section.items.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
          <GraduationCap className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden flex-1">
            <h2 className="text-sm font-display font-bold text-sidebar-foreground truncate">SkillIntel</h2>
            <p className="text-xs text-sidebar-foreground/60">{roleLabels[user.role]}</p>
          </div>
        )}
        {!collapsed && <ThemeToggle />}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {entries.map((entry) =>
          isSection(entry) ? renderSection(entry) : renderDirectLink(entry)
        )}
      </nav>

      {/* User + Logout */}
      <div className="p-3 border-t border-sidebar-border space-y-2">
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
            "w-full text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
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

import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { Clock, LogIn, FileText, Brain, Code2, Briefcase, Search, User, Shield } from "lucide-react";

interface ActivityEntry {
  id: string;
  action: string;
  detail: string;
  icon: React.ElementType;
  category: "auth" | "skill" | "resume" | "application" | "system";
  timestamp: string;
  user?: string;
}

const generateActivities = (role: string): ActivityEntry[] => {
  const now = new Date();
  const base: ActivityEntry[] = [
    { id: "1", action: "Logged in", detail: "Session started from Chrome browser", icon: LogIn, category: "auth", timestamp: new Date(now.getTime() - 5 * 60000).toISOString() },
    { id: "2", action: "Skill updated", detail: "Python proficiency changed to Advanced", icon: Brain, category: "skill", timestamp: new Date(now.getTime() - 25 * 60000).toISOString() },
    { id: "3", action: "Resume uploaded", detail: "resume_v3.pdf uploaded for ATS analysis", icon: FileText, category: "resume", timestamp: new Date(now.getTime() - 2 * 3600000).toISOString() },
    { id: "4", action: "Coding practice", detail: "Solved 3 medium problems on Arrays", icon: Code2, category: "skill", timestamp: new Date(now.getTime() - 5 * 3600000).toISOString() },
    { id: "5", action: "Applied to job", detail: "Data Analyst role at TCS", icon: Briefcase, category: "application", timestamp: new Date(now.getTime() - 8 * 3600000).toISOString() },
    { id: "6", action: "Profile updated", detail: "Added 2 new projects to portfolio", icon: User, category: "system", timestamp: new Date(now.getTime() - 24 * 3600000).toISOString() },
    { id: "7", action: "Quiz completed", detail: "Machine Learning quiz — scored 85%", icon: Brain, category: "skill", timestamp: new Date(now.getTime() - 48 * 3600000).toISOString() },
    { id: "8", action: "Logged in", detail: "Session started from mobile", icon: LogIn, category: "auth", timestamp: new Date(now.getTime() - 72 * 3600000).toISOString() },
  ];

  if (role === "admin") {
    return [
      { id: "a1", action: "Admin login", detail: "admin@test.com logged in", icon: Shield, category: "auth", timestamp: new Date(now.getTime() - 2 * 60000).toISOString(), user: "Admin" },
      { id: "a2", action: "User role changed", detail: "Changed user123 role to faculty", icon: Shield, category: "system", timestamp: new Date(now.getTime() - 30 * 60000).toISOString(), user: "Admin" },
      { id: "a3", action: "Student login", detail: "student@test.com logged in", icon: LogIn, category: "auth", timestamp: new Date(now.getTime() - 60 * 60000).toISOString(), user: "Demo Student" },
      { id: "a4", action: "Faculty login", detail: "faculty@test.com logged in", icon: LogIn, category: "auth", timestamp: new Date(now.getTime() - 90 * 60000).toISOString(), user: "Demo Faculty" },
      ...base.map((b) => ({ ...b, user: "Demo Student" })),
    ];
  }
  return base;
};

const categoryColors: Record<string, string> = {
  auth: "bg-primary/10 text-primary",
  skill: "bg-accent/10 text-accent",
  resume: "bg-chart-4/10 text-chart-4",
  application: "bg-chart-3/10 text-warning",
  system: "bg-muted text-muted-foreground",
};

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function ActivityLog() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const activities = generateActivities(user?.role || "student");
  const filtered = activities.filter(
    (a) => a.action.toLowerCase().includes(search.toLowerCase()) || a.detail.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold flex items-center gap-2">
              <Clock className="h-6 w-6 text-primary" />
              {user?.role === "admin" ? "Access Logs" : "Recent Activity"}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {user?.role === "admin" ? "System-wide user activity and access logs" : "Your recent platform activity"}
            </p>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search activity..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {filtered.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg shrink-0 ${categoryColors[activity.category]}`}>
                    <activity.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <Badge variant="outline" className="text-[10px]">{activity.category}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{activity.detail}</p>
                    {activity.user && <p className="text-[10px] text-muted-foreground mt-0.5">User: {activity.user}</p>}
                  </div>
                  <p className="text-xs text-muted-foreground shrink-0">{timeAgo(activity.timestamp)}</p>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-sm">No activity found</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

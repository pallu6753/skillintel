import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useDataset } from "@/hooks/use-dataset";
import { usePlacementStore } from "@/lib/placement-store";
import { useApplicationStore } from "@/lib/application-store";
import { useAuth } from "@/lib/auth-context";
import { Briefcase, Target, TrendingUp, Building2, Users, Calendar, CheckCircle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

const COLORS = ["hsl(142, 71%, 45%)", "hsl(38, 92%, 50%)", "hsl(0, 84%, 60%)"];

export default function PlacementDashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useDataset();
  const { drives } = usePlacementStore();
  const { applications } = useApplicationStore();

  console.log("User Role:", user?.role);
  console.log("Placement Dashboard - Drives:", drives.length, "Applications:", applications.length);

  if (isLoading || !data) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28" />)}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { students, departmentStats } = data;
  const openDrives = drives.filter((d) => d.status === "open");
  const closedDrives = drives.filter((d) => d.status === "closed");
  const totalApplications = applications.length;

  const ready = students.filter((s) => s.jobReadyScore >= 70).length;
  const moderate = students.filter((s) => s.jobReadyScore >= 50 && s.jobReadyScore < 70).length;
  const notReady = students.filter((s) => s.jobReadyScore < 50).length;

  const pieData = [
    { name: "Ready (≥70%)", value: ready },
    { name: "Moderate (50–70%)", value: moderate },
    { name: "Needs Work (<50%)", value: notReady },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">Placement Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage drives, track applications & monitor placement readiness</p>
          </div>
          <Link to="/placement-drives">
            <Button><Briefcase className="h-4 w-4 mr-2" /> Manage Drives</Button>
          </Link>
        </div>

        {/* Placement-specific stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Active Drives" value={openDrives.length} icon={Briefcase} subtitle={`${closedDrives.length} closed`} />
          <StatCard title="Total Applications" value={totalApplications} icon={Target} />
          <StatCard title="Placement Ready" value={ready} icon={CheckCircle} subtitle={`of ${students.length} students`} />
          <StatCard title="Companies" value={new Set(drives.map(d => d.company)).size} icon={Building2} />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Active Placement Drives */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Briefcase className="h-4 w-4" /> Active Placement Drives
              </CardTitle>
            </CardHeader>
            <CardContent>
              {openDrives.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active drives. Create one from the Placement Drives page.</p>
              ) : (
                <div className="space-y-3 max-h-[280px] overflow-y-auto">
                  {openDrives.map((d) => (
                    <div key={d.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="text-sm font-medium">{d.company} — {d.role}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                          <Calendar className="h-3 w-3" /> Deadline: {d.deadline}
                          <span>•</span> {d.package}
                        </p>
                      </div>
                      <Badge variant="default">Open</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Student Readiness Distribution */}
          <Card>
            <CardHeader><CardTitle className="font-display text-lg">Student Readiness</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Department Readiness */}
          <Card>
            <CardHeader><CardTitle className="font-display text-lg">Readiness by Department</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={departmentStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="department" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip />
                  <Bar dataKey="avgReadiness" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Avg Readiness %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Applications */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Users className="h-4 w-4" /> Recent Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <p className="text-sm text-muted-foreground">No applications received yet.</p>
              ) : (
                <div className="space-y-3 max-h-[280px] overflow-y-auto">
                  {applications.slice(0, 10).map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="text-sm font-medium">{app.company} — {app.role}</p>
                        <p className="text-xs text-muted-foreground">{app.appliedDate}</p>
                      </div>
                      <Badge variant={app.status === "applied" ? "default" : app.status === "shortlisted" ? "secondary" : "outline"}>
                        {app.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Placement-Ready Students */}
        <Card>
          <CardHeader><CardTitle className="font-display text-lg">Top 10 Placement-Ready Students</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...students].sort((a, b) => b.jobReadyScore - a.jobReadyScore).slice(0, 10).map((s, i) => (
                <div key={s.id} className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium truncate">{s.name} <span className="text-muted-foreground">({s.department})</span></span>
                      <span className="text-muted-foreground">{s.jobReadyScore.toFixed(0)}%</span>
                    </div>
                    <Progress value={s.jobReadyScore} className="h-1.5 mt-1" />
                  </div>
                  <Badge variant={s.jobReadyScore >= 70 ? "default" : "secondary"} className="shrink-0">
                    {s.jobReadyScore >= 70 ? "Ready" : "Moderate"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

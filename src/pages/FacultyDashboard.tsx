import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useDataset } from "@/hooks/use-dataset";
import { useAuth } from "@/lib/auth-context";
import { DashboardBanner } from "@/components/DashboardBanner";
import { Users, AlertTriangle, TrendingUp, BookOpen, Search, GraduationCap, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export default function FacultyDashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useDataset();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const perPage = 20;

  console.log("User Role:", user?.role);

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
  const atRisk = students.filter((s) => s.riskStatus === "at-risk");
  const avgGpa = (students.reduce((a, s) => a + s.gpa, 0) / students.length).toFixed(2);
  const avgAttendance = (students.reduce((a, s) => a + s.attendance, 0) / students.length).toFixed(0);
  const avgResumeScore = (students.reduce((a, s) => a + s.resumeScore, 0) / students.length).toFixed(0);

  console.log("Faculty Data Loaded:", students.length, "students");

  const filtered = students.filter(
    (s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.department.toLowerCase().includes(search.toLowerCase())
  );
  const paged = filtered.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <DashboardBanner
          icon={Users}
          title="Faculty Dashboard"
          description="Monitor student performance, identify at-risk students, and track academic trends across departments."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Students" value={students.length} icon={Users} />
          <StatCard title="Average GPA" value={avgGpa} icon={GraduationCap} />
          <StatCard title="At-Risk Students" value={atRisk.length} icon={AlertTriangle} subtitle={`${((atRisk.length / students.length) * 100).toFixed(0)}% of total`} />
          <StatCard title="Avg Resume Score" value={`${avgResumeScore}%`} icon={FileText} />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="font-display text-lg">Department Performance</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="department" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="avgGpa" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Avg GPA" />
                  <Bar dataKey="avgReadiness" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} name="Avg Readiness" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" /> At-Risk Students ({atRisk.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[280px] overflow-y-auto">
                {atRisk.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No at-risk students detected.</p>
                ) : (
                  atRisk.slice(0, 15).map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border border-destructive/20 bg-destructive/5">
                      <div>
                        <p className="text-sm font-medium">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.department} — GPA: {s.gpa} | Att: {s.attendance.toFixed(0)}%</p>
                      </div>
                      <Badge variant="destructive">At Risk</Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Distribution */}
        <Card>
          <CardHeader><CardTitle className="font-display text-lg">Student Performance Overview</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              {[
                { label: "High Performers (GPA ≥ 3.5)", count: students.filter(s => s.gpa >= 3.5).length, variant: "default" as const },
                { label: "Average (GPA 2.5-3.5)", count: students.filter(s => s.gpa >= 2.5 && s.gpa < 3.5).length, variant: "secondary" as const },
                { label: "Needs Support (GPA < 2.5)", count: students.filter(s => s.gpa < 2.5).length, variant: "destructive" as const },
              ].map((g) => (
                <div key={g.label} className="p-4 rounded-lg border text-center">
                  <p className="text-2xl font-display font-bold">{g.count}</p>
                  <Badge variant={g.variant} className="mt-1">{g.label}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* All Students Table with resume & performance data */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <CardTitle className="font-display text-lg">All Students — Academic & Resume Status</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search name or dept..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} className="pl-9" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-muted-foreground">Name</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Department</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">GPA</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Attendance</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Resume</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Job Ready</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((s) => (
                    <tr key={s.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="p-3 font-medium">{s.name}</td>
                      <td className="p-3 text-muted-foreground">{s.department}</td>
                      <td className="p-3">{s.gpa.toFixed(2)}</td>
                      <td className="p-3">{s.attendance.toFixed(0)}%</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Progress value={s.resumeScore} className="h-1.5 w-16" />
                          <span className="text-xs">{s.resumeScore.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="p-3">{s.jobReadyScore.toFixed(0)}%</td>
                      <td className="p-3">
                        <Badge variant={s.riskStatus === "safe" ? "default" : s.riskStatus === "moderate" ? "secondary" : "destructive"}>
                          {s.riskStatus}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
              <span>Showing {page * perPage + 1}–{Math.min((page + 1) * perPage, filtered.length)} of {filtered.length}</span>
              <div className="flex gap-2">
                <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="px-3 py-1 rounded border disabled:opacity-50">Prev</button>
                <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="px-3 py-1 rounded border disabled:opacity-50">Next</button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

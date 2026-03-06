import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useDataset } from "@/hooks/use-dataset";
import { Users, Target, TrendingUp, Download, BarChart3 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ["hsl(142, 71%, 45%)", "hsl(38, 92%, 50%)", "hsl(0, 84%, 60%)"];

export default function PlacementDashboard() {
  const { data, isLoading } = useDataset();

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
  const ready = students.filter((s) => s.jobReadyScore >= 70).length;
  const moderate = students.filter((s) => s.jobReadyScore >= 50 && s.jobReadyScore < 70).length;
  const notReady = students.filter((s) => s.jobReadyScore < 50).length;

  const pieData = [
    { name: "Ready (≥70%)", value: ready },
    { name: "Moderate (50–70%)", value: moderate },
    { name: "Needs Work (<50%)", value: notReady },
  ];

  const avgReadiness = Math.round(students.reduce((a, s) => a + s.jobReadyScore, 0) / students.length);
  const topStudents = [...students].sort((a, b) => b.jobReadyScore - a.jobReadyScore).slice(0, 15);

  const handleExport = () => {
    const header = "ID,Name,Department,GPA,Job Ready Score,Status\n";
    const rows = students.map((s) => `${s.id},${s.name},${s.department},${s.gpa},${s.jobReadyScore.toFixed(1)},${s.riskStatus}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "placement_report.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">Placement Dashboard</h1>
            <p className="text-muted-foreground mt-1">{students.length} students analyzed for placement readiness</p>
          </div>
          <Button variant="outline" onClick={handleExport}><Download className="h-4 w-4 mr-2" /> Export Report</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Placement Ready" value={ready} icon={Target} subtitle={`of ${students.length} students`} />
          <StatCard title="Avg Readiness" value={`${avgReadiness}%`} icon={TrendingUp} />
          <StatCard title="Total Students" value={students.length} icon={Users} />
          <StatCard title="Departments" value={departmentStats.length} icon={BarChart3} />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="font-display text-lg">Readiness Distribution</CardTitle></CardHeader>
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
                  <Bar dataKey="totalStudents" fill="hsl(var(--border))" radius={[4, 4, 0, 0]} name="Total Students" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="font-display text-lg">Top 15 Students by Job Readiness</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topStudents.map((s) => (
                <div key={s.id} className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                    {s.name.split("_")[1] || s.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium truncate">{s.name} <span className="text-muted-foreground">({s.department})</span></span>
                      <span className="text-muted-foreground">{s.jobReadyScore.toFixed(0)}%</span>
                    </div>
                    <Progress value={s.jobReadyScore} className="h-1.5 mt-1" />
                  </div>
                  <Badge variant={s.jobReadyScore >= 70 ? "default" : s.jobReadyScore >= 50 ? "secondary" : "destructive"} className="shrink-0">
                    {s.jobReadyScore >= 70 ? "Ready" : s.jobReadyScore >= 50 ? "Moderate" : "Needs Work"}
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

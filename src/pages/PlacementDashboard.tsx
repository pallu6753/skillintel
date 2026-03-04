import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { mockStudents, departmentStats } from "@/lib/mock-data";
import { Users, Target, TrendingUp, Download, BarChart3 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const COLORS = ["hsl(142, 71%, 45%)", "hsl(38, 92%, 50%)", "hsl(0, 84%, 60%)"];

export default function PlacementDashboard() {
  const ready = mockStudents.filter((s) => s.jobReadinessScore >= 70).length;
  const moderate = mockStudents.filter((s) => s.jobReadinessScore >= 40 && s.jobReadinessScore < 70).length;
  const notReady = mockStudents.filter((s) => s.jobReadinessScore < 40).length;

  const pieData = [
    { name: "Ready", value: ready },
    { name: "Moderate", value: moderate },
    { name: "Needs Work", value: notReady },
  ];

  const avgReadiness = Math.round(mockStudents.reduce((a, s) => a + s.jobReadinessScore, 0) / mockStudents.length);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">Placement Dashboard</h1>
            <p className="text-muted-foreground mt-1">Student placement readiness analytics</p>
          </div>
          <Button variant="outline"><Download className="h-4 w-4 mr-2" /> Export Report</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Placement Ready" value={ready} icon={Target} subtitle={`of ${mockStudents.length} students`} />
          <StatCard title="Avg Readiness" value={`${avgReadiness}%`} icon={TrendingUp} trend={{ value: 8, positive: true }} />
          <StatCard title="Total Students" value={mockStudents.length} icon={Users} />
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
            <CardHeader><CardTitle className="font-display text-lg">Placement by Department</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={departmentStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="department" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip />
                  <Bar dataKey="placedStudents" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Placed" />
                  <Bar dataKey="totalStudents" fill="hsl(var(--border))" radius={[4, 4, 0, 0]} name="Total" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Students */}
        <Card>
          <CardHeader><CardTitle className="font-display text-lg">Top Students by Job Readiness</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...mockStudents].sort((a, b) => b.jobReadinessScore - a.jobReadinessScore).map((s) => (
                <div key={s.id} className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                    {s.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium truncate">{s.name}</span>
                      <span className="text-muted-foreground">{s.jobReadinessScore}%</span>
                    </div>
                    <Progress value={s.jobReadinessScore} className="h-1.5 mt-1" />
                  </div>
                  <Badge variant={s.jobReadinessScore >= 70 ? "default" : s.jobReadinessScore >= 40 ? "secondary" : "destructive"} className="shrink-0">
                    {s.jobReadinessScore >= 70 ? "Ready" : s.jobReadinessScore >= 40 ? "Moderate" : "Needs Work"}
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

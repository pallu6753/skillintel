import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDataset } from "@/hooks/use-dataset";
import { Users, GraduationCap, Target, Brain, BarChart3, Code2, FileText, Mic } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ["hsl(192,80%,50%)", "hsl(142,71%,45%)", "hsl(38,92%,50%)", "hsl(280,65%,60%)", "hsl(0,84%,60%)"];

const modules = [
  { icon: Brain, name: "AI Copilot", status: "Active" },
  { icon: BarChart3, name: "Analytics Engine", status: "Active" },
  { icon: Target, name: "Career Intelligence", status: "Active" },
  { icon: Code2, name: "Coding Practice", status: "Active" },
  { icon: Mic, name: "Interview Simulator", status: "Active" },
  { icon: FileText, name: "Resume Analyzer", status: "Active" },
];

export default function SystemOverview() {
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

  const totalStudents = data.students.length;
  const avgGPA = totalStudents > 0
    ? (data.academic.reduce((s, a) => s + (a.gpa ?? 0), 0) / Math.max(data.academic.length, 1)).toFixed(2)
    : "0.00";

  const readyCount = data.jobReadiness.filter(j => (j.job_ready_score ?? 0) >= 70).length;
  const readyPct = totalStudents > 0 ? Math.round((readyCount / totalStudents) * 100) : 0;

  // Skill distribution
  const skillMap: Record<string, number> = {};
  data.studentSkills.forEach(ss => {
    const skill = data.skills.find(s => s.id === ss.skill_id);
    if (skill) skillMap[skill.name] = (skillMap[skill.name] || 0) + 1;
  });
  const topSkills = Object.entries(skillMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }));

  // Readiness distribution
  const readinessBuckets = [
    { name: "High (≥80)", value: data.jobReadiness.filter(j => (j.job_ready_score ?? 0) >= 80).length },
    { name: "Medium (60-79)", value: data.jobReadiness.filter(j => (j.job_ready_score ?? 0) >= 60 && (j.job_ready_score ?? 0) < 80).length },
    { name: "Low (<60)", value: data.jobReadiness.filter(j => (j.job_ready_score ?? 0) < 60).length },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">System Overview</h1>
          <p className="text-muted-foreground mt-1">Complete platform snapshot for quick presentation</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Students" value={totalStudents} icon={Users} subtitle="Registered profiles" />
          <StatCard title="Average GPA" value={avgGPA} icon={GraduationCap} subtitle="Across all students" />
          <StatCard title="Placement Ready" value={`${readyPct}%`} icon={Target} subtitle={`${readyCount} of ${totalStudents} students`} />
          <StatCard title="AI Modules" value={modules.length} icon={Brain} subtitle="Active & integrated" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Top Skills Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={topSkills}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Placement Readiness</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={readinessBuckets} cx="50%" cy="50%" innerRadius={60} outerRadius={95} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {readinessBuckets.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Platform Modules</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {modules.map(m => (
                <div key={m.name} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                  <m.icon className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{m.name}</p>
                    <p className="text-xs text-green-500">{m.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

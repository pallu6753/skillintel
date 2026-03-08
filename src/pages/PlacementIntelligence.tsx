import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useDataset } from "@/hooks/use-dataset";
import { predictJobReadiness } from "@/lib/career-engine";
import { StatCard } from "@/components/StatCard";
import {
  Target, TrendingUp, Users, BarChart3, Download, Search,
  ChevronDown, ChevronUp,
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

const COLORS = ["hsl(142, 71%, 45%)", "hsl(38, 92%, 50%)", "hsl(0, 84%, 60%)"];

export default function PlacementIntelligence() {
  const { data, isLoading } = useDataset();
  const [search, setSearch] = useState("");
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

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
  const avgReadiness = Math.round(students.reduce((a, s) => a + s.jobReadyScore, 0) / students.length);

  const pieData = [
    { name: "Ready (≥70%)", value: ready },
    { name: "Moderate (50–70%)", value: moderate },
    { name: "Needs Work (<50%)", value: notReady },
  ];

  const filtered = students
    .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.department.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.jobReadyScore - a.jobReadyScore)
    .slice(0, 20);

  const handleExport = () => {
    const header = "ID,Name,Department,GPA,Job Ready Score,Status\n";
    const rows = students.map((s) =>
      `${s.id},${s.name},${s.department},${s.gpa},${s.jobReadyScore.toFixed(1)},${s.riskStatus}`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "placement_intelligence_report.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold">Placement Intelligence</h1>
            <p className="text-muted-foreground text-sm">{students.length} students analyzed with AI readiness scoring</p>
          </div>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" /> Export Report
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Placement Ready" value={ready} icon={Target} subtitle={`of ${students.length}`} />
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
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Student readiness with breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Student Readiness Breakdown</CardTitle>
            <div className="relative max-w-sm mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search students..." className="pl-9" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {filtered.map((s) => {
              const prediction = predictJobReadiness(s);
              const isExpanded = expandedStudent === s.id;
              return (
                <div key={s.id} className="border rounded-lg p-4">
                  <div
                    className="flex items-center gap-4 cursor-pointer"
                    onClick={() => setExpandedStudent(isExpanded ? null : s.id)}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                      {s.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-sm">
                        <Link to={`/student/${s.id}`} className="font-medium truncate hover:text-primary" onClick={(e) => e.stopPropagation()}>
                          {s.name} <span className="text-muted-foreground">({s.department})</span>
                        </Link>
                        <span className="font-bold text-primary">{prediction.score}%</span>
                      </div>
                      <Progress value={prediction.score} className="h-1.5 mt-1" />
                    </div>
                    <Badge variant={prediction.score >= 70 ? "default" : prediction.score >= 50 ? "secondary" : "destructive"} className="shrink-0">
                      {prediction.label}
                    </Badge>
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {prediction.factors.map((f) => (
                        <div key={f.name} className="text-center p-2 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground">{f.name}</p>
                          <p className="text-sm font-bold">{Math.round(f.value)}%</p>
                          <p className="text-xs text-muted-foreground">{f.contribution} pts</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

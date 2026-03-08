import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useDataset } from "@/hooks/use-dataset";
import { Users, Database, BarChart3, Brain, X, TrendingUp, Building2 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const DONUT_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(25, 95%, 53%)",
];

export default function AdminDashboard() {
  const { data, isLoading } = useDataset();
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

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

  const { students, skills, departmentStats } = data;

  // Compute analytics for the selected skill
  const skillAnalytics = selectedSkill
    ? (() => {
        const matched = students.filter((s) =>
          s.skills.some((sk) => sk.name === selectedSkill)
        );
        const levels = { Beginner: 0, Intermediate: 0, Advanced: 0 };
        const deptMap: Record<string, number> = {};

        matched.forEach((s) => {
          const sk = s.skills.find((sk) => sk.name === selectedSkill);
          if (sk) levels[sk.level]++;
          deptMap[s.department] = (deptMap[s.department] || 0) + 1;
        });

        const pct = Math.round((matched.length / students.length) * 100);
        const demand = pct > 60 ? "High Demand" : pct >= 30 ? "Medium Demand" : "Emerging Skill";
        const demandVariant = pct > 60 ? "default" : pct >= 30 ? "secondary" : "outline";

        const deptBreakdown = Object.entries(deptMap)
          .map(([dept, count]) => ({ dept, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        const donutData = [
          { name: "Beginner", value: levels.Beginner },
          { name: "Intermediate", value: levels.Intermediate },
          { name: "Advanced", value: levels.Advanced },
        ];

        return { total: matched.length, pct, levels, demand, demandVariant, deptBreakdown, donutData };
      })()
    : null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">System overview — {students.length} students, {departmentStats.length} departments</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Students" value={students.length} icon={Users} />
          <StatCard title="At-Risk" value={students.filter((s) => s.riskStatus === "at-risk").length} icon={BarChart3} />
          <StatCard title="Skills in DB" value={skills.length} icon={Brain} />
          <StatCard title="Departments" value={departmentStats.length} icon={Database} />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="font-display text-lg">Department Overview</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="department" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip />
                  <Bar dataKey="totalStudents" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Total" />
                  <Bar dataKey="atRiskCount" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} name="At Risk" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="font-display text-lg">Skills Database</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => {
                  const isActive = selectedSkill === skill;
                  return (
                    <button
                      key={skill}
                      onClick={() => setSelectedSkill(isActive ? null : skill)}
                      className={`px-4 py-1.5 rounded-full border text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-primary text-primary-foreground border-primary shadow-md scale-105"
                          : "bg-secondary text-secondary-foreground border-border hover:bg-muted hover:border-primary/40 hover:scale-[1.03]"
                      }`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
              <p className="text-sm text-muted-foreground mt-4">{skills.length} skills tracked across all departments</p>
            </CardContent>
          </Card>
        </div>

        {/* Skill Analytics Panel */}
        {selectedSkill && skillAnalytics && (
          <Card className="border-primary/30 bg-primary/5 animate-in fade-in slide-in-from-top-3 duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-display text-xl flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                {selectedSkill} — Skill Analytics
                <Badge variant={skillAnalytics.demandVariant as any} className="ml-2">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {skillAnalytics.demand}
                </Badge>
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setSelectedSkill(null)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Key numbers */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="text-center p-4 rounded-xl bg-background border">
                  <p className="text-3xl font-display font-bold text-primary">{skillAnalytics.pct}%</p>
                  <p className="text-xs text-muted-foreground mt-1">Skill Penetration</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-background border">
                  <p className="text-2xl font-display font-bold">{skillAnalytics.total}<span className="text-sm text-muted-foreground font-normal"> / {students.length}</span></p>
                  <p className="text-xs text-muted-foreground mt-1">Students with Skill</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-background border">
                  <p className="text-2xl font-display font-bold">{skillAnalytics.levels.Advanced}</p>
                  <p className="text-xs text-muted-foreground mt-1">Advanced</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-background border">
                  <p className="text-2xl font-display font-bold">{skillAnalytics.levels.Beginner}</p>
                  <p className="text-xs text-muted-foreground mt-1">Beginner</p>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                {/* Proficiency bars */}
                <div className="space-y-3">
                  <p className="text-sm font-semibold">Proficiency Distribution</p>
                  {(["Beginner", "Intermediate", "Advanced"] as const).map((level) => {
                    const count = skillAnalytics.levels[level];
                    const val = skillAnalytics.total > 0 ? Math.round((count / skillAnalytics.total) * 100) : 0;
                    return (
                      <div key={level} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{level}</span>
                          <span className="font-medium">{count} ({val}%)</span>
                        </div>
                        <Progress value={val} className="h-2.5" />
                      </div>
                    );
                  })}
                </div>

                {/* Department breakdown */}
                <div className="space-y-3">
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <Building2 className="h-4 w-4" /> Top Departments
                  </p>
                  {skillAnalytics.deptBreakdown.map((d) => (
                    <div key={d.dept} className="flex items-center justify-between p-2.5 rounded-lg bg-background border text-sm">
                      <span className="truncate">{d.dept}</span>
                      <Badge variant="outline" className="ml-2 shrink-0">{d.count}</Badge>
                    </div>
                  ))}
                </div>

                {/* Donut chart */}
                <div className="flex flex-col items-center justify-center">
                  <p className="text-sm font-semibold mb-2">Level Distribution</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={skillAnalytics.donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {skillAnalytics.donutData.map((_, i) => (
                          <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
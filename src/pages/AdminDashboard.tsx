import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockStudents, departmentStats, industryRequiredSkills } from "@/lib/mock-data";
import { Users, Database, BarChart3, Shield, Brain } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const totalPlaced = departmentStats.reduce((a, d) => a + d.placedStudents, 0);
  const totalStudents = departmentStats.reduce((a, d) => a + d.totalStudents, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">System overview and management</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Students" value={totalStudents} icon={Users} />
          <StatCard title="Placed Students" value={totalPlaced} icon={BarChart3} />
          <StatCard title="Skills in DB" value={industryRequiredSkills.length} icon={Brain} />
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
                  <Bar dataKey="placedStudents" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} name="Placed" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="font-display text-lg">Industry Skills Database</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {industryRequiredSkills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-sm px-3 py-1">{skill}</Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4">{industryRequiredSkills.length} skills tracked across all departments</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockStudents, departmentStats } from "@/lib/mock-data";
import { Users, AlertTriangle, TrendingUp, BookOpen } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function FacultyDashboard() {
  const atRisk = mockStudents.filter((s) => s.riskStatus === "at-risk");
  const avgGpa = (mockStudents.reduce((a, s) => a + s.gpa, 0) / mockStudents.length).toFixed(1);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Faculty Dashboard</h1>
          <p className="text-muted-foreground mt-1">Monitor student performance and identify at-risk students</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Students" value={mockStudents.length} icon={Users} />
          <StatCard title="Average GPA" value={avgGpa} icon={TrendingUp} trend={{ value: 2.1, positive: true }} />
          <StatCard title="At-Risk Students" value={atRisk.length} icon={AlertTriangle} />
          <StatCard title="Avg Attendance" value="75%" icon={BookOpen} />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="font-display text-lg">Department Performance</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="department" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="avgGpa" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Avg GPA" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="font-display text-lg flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /> At-Risk Students</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {atRisk.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No at-risk students detected.</p>
                ) : (
                  atRisk.map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border border-destructive/20 bg-destructive/5">
                      <div>
                        <p className="text-sm font-medium">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.department} — GPA: {s.gpa} | Att: {s.attendancePercentage}%</p>
                      </div>
                      <Badge variant="destructive">At Risk</Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Student List */}
        <Card>
          <CardHeader><CardTitle className="font-display text-lg">All Students</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-muted-foreground">Name</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Department</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">GPA</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Attendance</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockStudents.map((s) => (
                    <tr key={s.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="p-3 font-medium">{s.name}</td>
                      <td className="p-3 text-muted-foreground">{s.department}</td>
                      <td className="p-3">{s.gpa}</td>
                      <td className="p-3">{s.attendancePercentage}%</td>
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
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useDataset } from "@/hooks/use-dataset";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Users, Database, BarChart3, Brain, Shield, Search, Building2, TrendingUp } from "lucide-react";
import { DashboardBanner } from "@/components/DashboardBanner";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const DONUT_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(25, 95%, 53%)",
  "hsl(280, 65%, 60%)",
];

interface UserWithRole {
  id: string;
  full_name: string;
  email: string;
  department: string | null;
  role: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useDataset();
  const [allUsers, setAllUsers] = useState<UserWithRole[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  console.log("User Role:", user?.role);

  // Fetch ALL users with their roles (admin-specific data)
  useEffect(() => {
    async function fetchAllUsers() {
      setUsersLoading(true);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email, department, user_id");

      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id, role");

      const roleMap = new Map((roles ?? []).map((r) => [r.user_id, r.role]));

      const users: UserWithRole[] = (profiles ?? []).map((p) => ({
        id: p.id,
        full_name: p.full_name,
        email: p.email ?? "",
        department: p.department,
        role: roleMap.get(p.user_id) ?? "student",
      }));

      setAllUsers(users);
      setUsersLoading(false);
      console.log("Admin Data Loaded - All Users:", users.length);
    }
    fetchAllUsers();
  }, []);

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

  // Role distribution from actual users
  const roleCounts = allUsers.reduce<Record<string, number>>((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {});

  const roleData = Object.entries(roleCounts).map(([role, count]) => ({
    name: role.charAt(0).toUpperCase() + role.slice(1),
    value: count,
  }));

  const filteredUsers = allUsers.filter(
    (u) =>
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <DashboardBanner
          icon={Shield}
          title="Admin Dashboard"
          description="Full system control — manage users, monitor platform health, and access all analytics."
        />

        {/* Admin-specific stats: all users across roles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Users" value={allUsers.length} icon={Users} subtitle="All roles" />
          <StatCard title="Students" value={roleCounts["student"] || students.length} icon={BarChart3} />
          <StatCard title="Faculty & Staff" value={(roleCounts["faculty"] || 0) + (roleCounts["placement"] || 0)} icon={Shield} />
          <StatCard title="Skills in DB" value={skills.length} icon={Brain} />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Role Distribution */}
          <Card>
            <CardHeader><CardTitle className="font-display text-lg">User Role Distribution</CardTitle></CardHeader>
            <CardContent>
              {roleData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={roleData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {roleData.map((_, i) => (
                        <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                  {usersLoading ? "Loading user data..." : "No users found"}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Department Overview */}
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
        </div>

        {/* System Health */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader><CardTitle className="font-display text-lg flex items-center gap-2"><Database className="h-4 w-4" /> Database Status</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Profiles", count: allUsers.length },
                { label: "Academic Records", count: students.length },
                { label: "Skills Tracked", count: skills.length },
                { label: "Departments", count: departmentStats.length },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-2 rounded-lg border">
                  <span className="text-sm">{item.label}</span>
                  <Badge variant="outline">{item.count}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="font-display text-lg flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Platform Metrics</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "At-Risk Students", value: students.filter(s => s.riskStatus === "at-risk").length, total: students.length },
                { label: "Placement Ready", value: students.filter(s => s.jobReadyScore >= 70).length, total: students.length },
                { label: "Avg GPA", value: parseFloat((students.reduce((a, s) => a + s.gpa, 0) / (students.length || 1)).toFixed(2)), total: 4 },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{item.label}</span>
                    <span className="font-medium">{item.value} / {item.total}</span>
                  </div>
                  <Progress value={(item.value / item.total) * 100} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="font-display text-lg flex items-center gap-2"><Building2 className="h-4 w-4" /> Department Health</CardTitle></CardHeader>
            <CardContent className="space-y-3 max-h-[220px] overflow-y-auto">
              {departmentStats.map((d) => (
                <div key={d.department} className="flex items-center justify-between p-2 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">{d.department}</p>
                    <p className="text-xs text-muted-foreground">GPA: {d.avgGpa} | Students: {d.totalStudents}</p>
                  </div>
                  {d.atRiskCount > 0 ? (
                    <Badge variant="destructive">{d.atRiskCount} at risk</Badge>
                  ) : (
                    <Badge variant="default">Healthy</Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* User Management Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Shield className="h-4 w-4" /> User Management
              </CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium text-muted-foreground">Name</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Email</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Department</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.slice(0, 20).map((u) => (
                      <tr key={u.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="p-3 font-medium">{u.full_name}</td>
                        <td className="p-3 text-muted-foreground">{u.email}</td>
                        <td className="p-3 text-muted-foreground">{u.department ?? "—"}</td>
                        <td className="p-3">
                          <Badge variant={
                            u.role === "admin" ? "default" :
                            u.role === "faculty" ? "secondary" :
                            u.role === "placement" ? "outline" : "secondary"
                          }>
                            {u.role}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-3">
              Showing {Math.min(filteredUsers.length, 20)} of {filteredUsers.length} users
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

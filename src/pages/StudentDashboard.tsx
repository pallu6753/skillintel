import { useAuth } from "@/lib/auth-context";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { semesterPerformance, skillRadarData, mockNotifications, mockStudents, careerPaths } from "@/lib/mock-data";
import { GraduationCap, Target, Brain, TrendingUp, BookOpen, Bell } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar,
} from "recharts";

export default function StudentDashboard() {
  const { user } = useAuth();
  const student = mockStudents[0];
  const unreadNotifications = mockNotifications.filter((n) => !n.read).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold">Welcome, {user?.name}</h1>
          <p className="text-muted-foreground mt-1">Here's your academic & skill performance overview</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Current GPA" value={student.gpa} icon={GraduationCap} trend={{ value: 3.2, positive: true }} />
          <StatCard title="Job Readiness" value={`${student.jobReadinessScore}%`} icon={Target} trend={{ value: 5, positive: true }} />
          <StatCard title="Skills Tracked" value={student.skills.length} icon={Brain} />
          <StatCard title="Attendance" value={`${student.attendancePercentage}%`} icon={BookOpen} trend={{ value: 2, positive: true }} />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* GPA Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">Semester Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={semesterPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="semester" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
                  <Line type="monotone" dataKey="gpa" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} name="GPA" />
                  <Line type="monotone" dataKey="quizScore" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ r: 4 }} name="Quiz %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Skill Radar */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">Skill Proficiency</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={skillRadarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">My Skills</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {student.skills.map((s) => (
                <div key={s.name} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{s.name}</span>
                  <Badge variant={s.level === "Advanced" ? "default" : s.level === "Intermediate" ? "secondary" : "outline"}>
                    {s.level}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Career Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">Career Paths</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {careerPaths.slice(0, 3).map((c) => (
                <div key={c.career}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{c.career}</span>
                    <span className="text-muted-foreground">{c.readiness}%</span>
                  </div>
                  <Progress value={c.readiness} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Bell className="h-4 w-4" /> Notifications
                {unreadNotifications > 0 && (
                  <Badge variant="destructive" className="text-xs">{unreadNotifications}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockNotifications.slice(0, 4).map((n) => (
                <div key={n.id} className={`p-3 rounded-lg border text-sm ${!n.read ? "bg-primary/5 border-primary/20" : ""}`}>
                  <p className="font-medium">{n.title}</p>
                  <p className="text-muted-foreground text-xs mt-1">{n.date}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

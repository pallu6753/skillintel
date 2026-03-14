import { useAuth } from "@/lib/auth-context";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { ExternalIntegrations } from "@/components/ExternalIntegrations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useDataset } from "@/hooks/use-dataset";
import { useNotificationStore } from "@/lib/notification-store";
import { recommendCareers, predictJobReadiness } from "@/lib/career-engine";
import { GraduationCap, Target, Brain, BookOpen, Bell, TrendingUp } from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export default function StudentDashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useDataset();
  const { notifications } = useNotificationStore();

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

  // Match logged-in demo student by studentId, fallback to first student
  const student = user?.studentId
    ? data.students.find((s) => s.id === user.studentId) ?? data.students[0]
    : data.students[0];
  const visibleNotifications = notifications.filter(
    (n) => n.targetRole === "all" || n.targetRole === "student"
  );
  const unreadCount = visibleNotifications.filter((n) => !n.read).length;

  const levelToScore: Record<string, number> = { Beginner: 33, Intermediate: 66, Advanced: 100 };
  const skillRadarData = student.skills.map((s) => ({ skill: s.name, score: levelToScore[s.level] }));

  const academicData = [
    { metric: "Attendance", value: student.attendance },
    { metric: "Assignment", value: student.assignmentScore },
    { metric: "Quiz", value: student.quizScore },
    { metric: "Exam", value: student.examScore },
  ];

  // Real career recommendations
  const studentSkillNames = student.skills.map((s) => s.name);
  const careers = recommendCareers(studentSkillNames).slice(0, 3);
  const prediction = predictJobReadiness(student);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Welcome, {user?.name}</h1>
          <p className="text-muted-foreground mt-1">Here's your academic & skill performance overview</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Current GPA" value={student.gpa.toFixed(2)} icon={GraduationCap} />
          <StatCard title="AI Readiness" value={`${prediction.score}%`} icon={TrendingUp} />
          <StatCard title="Skills Tracked" value={student.skills.length} icon={Brain} />
          <StatCard title="Attendance" value={`${student.attendance.toFixed(0)}%`} icon={BookOpen} />
        </div>

        {/* ML Prediction Card */}
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
            <div className="text-center">
              <p className="text-4xl font-display font-bold text-primary">{prediction.score}%</p>
              <Badge variant={prediction.label === "Ready for Placement" ? "default" : "destructive"} className="mt-1">
                {prediction.label}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">AI Job Readiness</p>
            </div>
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {prediction.factors.slice(0, 4).map((f) => (
                <div key={f.name} className="text-center p-2 rounded-lg bg-background border">
                  <p className="text-sm font-bold">{f.contribution}</p>
                  <p className="text-xs text-muted-foreground">{f.name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="font-display text-lg">Academic Scores</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={academicData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="metric" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Score" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="font-display text-lg">Skill Proficiency</CardTitle></CardHeader>
            <CardContent>
              {skillRadarData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={skillRadarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground">No skills recorded yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader><CardTitle className="font-display text-lg">My Skills</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {student.skills.map((s) => (
                <div key={s.name} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{s.name}</span>
                  <Badge variant={s.level === "Advanced" ? "default" : s.level === "Intermediate" ? "secondary" : "outline"}>
                    {s.level}
                  </Badge>
                </div>
              ))}
              {student.skills.length === 0 && <p className="text-sm text-muted-foreground">No skills recorded.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="font-display text-lg">Career Matches</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {careers.map((c) => (
                <div key={c.role}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{c.icon} {c.role}</span>
                    <span className="text-muted-foreground">{c.matchScore}%</span>
                  </div>
                  <Progress value={c.matchScore} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Bell className="h-4 w-4" /> Notifications
                {unreadCount > 0 && <Badge variant="destructive" className="text-xs">{unreadCount}</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {visibleNotifications.slice(0, 4).map((n) => (
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

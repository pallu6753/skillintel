import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useDataset } from "@/hooks/use-dataset";
import { recommendCareers, predictJobReadiness } from "@/lib/career-engine";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft, User, GraduationCap, Target, Brain, Briefcase,
  CheckCircle2, XCircle, TrendingUp, BookOpen, Code, MessageSquare, FileText,
} from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";

export default function StudentProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useDataset();

  if (isLoading || !data) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96" />
        </div>
      </DashboardLayout>
    );
  }

  const student = data.students.find((s) => s.id === id);

  if (!student) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">Student not found.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const studentSkillNames = student.skills.map((s) => s.name);
  const careers = recommendCareers(studentSkillNames);
  const prediction = predictJobReadiness(student);
  const missingSkills = data.skills.filter((s) => !studentSkillNames.includes(s));

  const levelToScore: Record<string, number> = { Beginner: 33, Intermediate: 66, Advanced: 100 };
  const skillRadar = student.skills.map((s) => ({ skill: s.name, score: levelToScore[s.level] }));

  const academicData = [
    { metric: "Attendance", value: student.attendance },
    { metric: "Assignment", value: student.assignmentScore },
    { metric: "Quiz", value: student.quizScore },
    { metric: "Exam", value: student.examScore },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-bold">
            {student.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold">{student.name}</h1>
            <p className="text-muted-foreground text-sm">
              {student.department} · Semester {student.semester} · Year {student.yearOfStudy}
            </p>
          </div>
          <Badge
            variant={student.riskStatus === "safe" ? "default" : student.riskStatus === "moderate" ? "secondary" : "destructive"}
            className="text-sm px-3 py-1"
          >
            {student.riskStatus.toUpperCase()}
          </Badge>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { label: "GPA", value: student.gpa.toFixed(2), icon: GraduationCap },
            { label: "Attendance", value: `${student.attendance.toFixed(0)}%`, icon: BookOpen },
            { label: "Projects", value: student.projectsCompleted, icon: Code },
            { label: "Internships", value: student.internshipsCompleted, icon: Briefcase },
            { label: "Coding", value: `${student.codingScore.toFixed(0)}%`, icon: Target },
            { label: "Resume", value: `${student.resumeScore.toFixed(0)}%`, icon: FileText },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4 text-center">
                <s.icon className="h-5 w-5 mx-auto text-primary mb-1" />
                <p className="text-lg font-bold font-display">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ML Prediction */}
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> AI Job Readiness Prediction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="text-center">
                <p className="text-5xl font-display font-bold text-primary">{prediction.score}%</p>
                <Badge variant={prediction.label === "Ready for Placement" ? "default" : "destructive"} className="mt-2">
                  {prediction.label}
                </Badge>
              </div>
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {prediction.factors.map((f) => (
                  <div key={f.name} className="text-center p-2 rounded-lg bg-background border">
                    <p className="text-sm font-bold">{f.contribution}</p>
                    <p className="text-xs text-muted-foreground">{f.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Academic Scores */}
          <Card>
            <CardHeader><CardTitle className="font-display text-lg">Academic Performance</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={academicData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="metric" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Score" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Skill Radar */}
          <Card>
            <CardHeader><CardTitle className="font-display text-lg">Skill Proficiency</CardTitle></CardHeader>
            <CardContent>
              {skillRadar.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={skillRadar}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground py-10 text-center">No skills recorded.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Skills & Skill Gap */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" /> Skills ({student.skills.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {student.skills.map((s) => (
                <div key={s.name} className="flex items-center justify-between p-2 rounded-lg bg-success/5 border border-success/20">
                  <span className="text-sm font-medium">{s.name}</span>
                  <Badge variant="default" className="bg-success text-success-foreground">{s.level}</Badge>
                </div>
              ))}
              {student.skills.length === 0 && <p className="text-sm text-muted-foreground">No skills recorded.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <XCircle className="h-5 w-5 text-destructive" /> Missing Skills ({missingSkills.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {missingSkills.map((s) => (
                <div key={s} className="flex items-center justify-between p-2 rounded-lg bg-destructive/5 border border-destructive/20">
                  <span className="text-sm font-medium">{s}</span>
                  <Badge variant="destructive">Gap</Badge>
                </div>
              ))}
              {missingSkills.length === 0 && <p className="text-sm text-muted-foreground">All skills covered!</p>}
            </CardContent>
          </Card>
        </div>

        {/* Career Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" /> Career Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {careers.slice(0, 5).map((c) => (
              <div key={c.role} className="p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{c.icon}</span>
                    <span className="font-display font-semibold">{c.role}</span>
                  </div>
                  <span className="text-xl font-display font-bold text-primary">{c.matchScore}%</span>
                </div>
                <Progress value={c.matchScore} className="h-2 mb-3" />
                <div className="flex flex-wrap gap-1">
                  {c.matchedSkills.map((s) => (
                    <Badge key={s} variant="default" className="bg-success/10 text-success text-xs">{s} ✓</Badge>
                  ))}
                  {c.missingSkills.map((s) => (
                    <Badge key={s} variant="outline" className="text-destructive border-destructive/30 text-xs">{s}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

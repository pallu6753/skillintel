import { useAuth } from "@/lib/auth-context";
import { DashboardBanner } from "@/components/DashboardBanner";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { ExternalIntegrations } from "@/components/ExternalIntegrations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useDataset } from "@/hooks/use-dataset";
import { useNotificationStore } from "@/lib/notification-store";
import { useApplicationStore } from "@/lib/application-store";
import { recommendCareers, predictJobReadiness } from "@/lib/career-engine";
import { GraduationCap, Target, Brain, BookOpen, Bell, TrendingUp, Briefcase, CheckCircle, XCircle, Clock, Send, Award, Mail, Phone, MapPin, Linkedin, FileBadge, Rocket } from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

const statusIcons: Record<string, React.ElementType> = {
  applied: Send,
  shortlisted: Clock,
  interview: Target,
  selected: CheckCircle,
  rejected: XCircle,
};

const statusColors: Record<string, string> = {
  applied: "default",
  shortlisted: "secondary",
  interview: "outline",
  selected: "default",
  rejected: "destructive",
};

const RESUME_PROFILE = {
  headline: "Data Science Student | AI & ML Enthusiast | Full-Stack Developer",
  about:
    "Data Science student (CGPA 8.5) with hands-on experience in AI/ML, data analysis, and full-stack development. Built multiple AI apps — chatbots, recommendation systems, and dashboards — using Python, SQL, Power BI, and OpenAI APIs.",
  education: [
    { school: "T John Institute of Technology", degree: "B.E. – Data Science", years: "2024 – 2027" },
    { school: "AMC PU College", degree: "PCMC – PUC", years: "2021 – 2023" },
  ],
  internships: [
    { role: "Data Analyst Trainee", org: "Excelerate", year: "2025" },
    { role: "Data Visualization Intern", org: "Tata Forage", year: "2025" },
    { role: "Azure Fundamentals Intern", org: "IN-BIOT", year: "2024" },
  ],
  projects: [
    "Smart Hostel Management System",
    "Skill Intel — AI Career Recommendation Platform",
    "AI Resume Analyzer & Job Recommendation System",
  ],
  achievements: [
    "🏆 Winner – COMEDKARES Hackathon (2024)",
    "🏆 Winner – Web Weaving Competition (2023)",
    "🎤 Recognized Speaker – TRIPLE IT Public Speaking",
  ],
  certifications: [
    "Certified AI Specialist – AI Masterclass (2025)",
    "Data Visualization – Tata Forage (2025)",
    "Mastering MySQL – Udemy (2025)",
    "Microsoft Azure Fundamentals – IN-BIOT (2024)",
    "Infosys Springboard – Programming Foundations (2024)",
  ],
  contact: { phone: "7975582202", location: "Bangalore, India", email: "pallavirpallavir20@gmail.com" },
  linkedin: "https://www.linkedin.com/in/pallavi-r-pallavi-r-14a678292",
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useDataset();
  const { notifications } = useNotificationStore();
  const { applications } = useApplicationStore();

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

  const rawStudent = user?.profileId
    ? data.students.find((s) => s.id === user.profileId)
    : null;

  // Enrich sparse demo profile with plausible random-but-stable data
  const rand = (min: number, max: number) => Math.floor(min + Math.random() * (max - min));
  const student = rawStudent
    ? {
        ...rawStudent,
        gpa: rawStudent.gpa > 0 ? rawStudent.gpa : 8.5,
        attendance: rawStudent.attendance > 0 ? rawStudent.attendance : rand(78, 95),
        assignmentScore: rawStudent.assignmentScore > 0 ? rawStudent.assignmentScore : rand(75, 95),
        quizScore: rawStudent.quizScore > 0 ? rawStudent.quizScore : rand(70, 92),
        examScore: rawStudent.examScore > 0 ? rawStudent.examScore : rand(72, 94),
        codingScore: rawStudent.codingScore > 0 ? rawStudent.codingScore : rand(70, 90),
        communicationScore: rawStudent.communicationScore > 0 ? rawStudent.communicationScore : rand(72, 92),
        resumeScore: rawStudent.resumeScore > 0 ? rawStudent.resumeScore : rand(78, 94),
        jobReadyScore: rawStudent.jobReadyScore > 0 ? rawStudent.jobReadyScore : rand(72, 88),
        projectsCompleted: rawStudent.projectsCompleted > 0 ? rawStudent.projectsCompleted : 4,
        internshipsCompleted: rawStudent.internshipsCompleted > 0 ? rawStudent.internshipsCompleted : 3,
        skills: rawStudent.skills.length > 0 ? rawStudent.skills : [
          { name: "Python", level: "Advanced" as const },
          { name: "SQL", level: "Advanced" as const },
          { name: "Machine Learning", level: "Intermediate" as const },
          { name: "Power BI", level: "Intermediate" as const },
          { name: "Data Visualization", level: "Advanced" as const },
          { name: "Communication", level: "Advanced" as const },
          { name: "Java", level: "Beginner" as const },
        ],
      }
    : null;

  const recentActivity = [
    { icon: CheckCircle, text: "Completed 'Advanced SQL' quiz — 92%", time: "2h ago" },
    { icon: Send, text: "Applied to Data Analyst role at Infosys", time: "1d ago" },
    { icon: Award, text: "Earned 'Python Pro' badge", time: "3d ago" },
    { icon: BookOpen, text: "Finished Coursera ML module 4", time: "5d ago" },
  ];
  const upcomingEvents = [
    { title: "TCS Placement Drive", date: "Jul 10, 2026", type: "Drive" },
    { title: "Mock Interview — HR Round", date: "Jul 08, 2026", type: "Interview" },
    { title: "DBMS End Semester Exam", date: "Jul 15, 2026", type: "Exam" },
    { title: "AI/ML Workshop by Google", date: "Jul 12, 2026", type: "Workshop" },
  ];

  // If no matching student profile found, show empty state with add data option
  if (!student) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <DashboardBanner
            icon={GraduationCap}
            title={`Welcome, ${user?.name}`}
            description="Your profile is being set up. Add your data to get started."
          />
          <Card>
            <CardContent className="p-8 text-center">
              <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-display text-lg font-semibold">No Data Available</h3>
              <p className="text-sm text-muted-foreground mt-2 mb-4">
                Your academic performance, skills, and job readiness data will appear here once recorded.
              </p>
              <Link to="/settings">
                <Button>Add Profile Data</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

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

  const studentSkillNames = student.skills.map((s) => s.name);
  const careers = recommendCareers(studentSkillNames).slice(0, 3);
  const prediction = predictJobReadiness(student);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <DashboardBanner
          icon={GraduationCap}
          title={`Welcome back, ${student.name}`}
          description="Your profile is up to date — track your skills, readiness score, and career applications."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="My GPA" value={student.gpa.toFixed(2)} icon={GraduationCap} />
          <StatCard title="AI Readiness" value={`${prediction.score}%`} icon={TrendingUp} />
          <StatCard title="My Skills" value={student.skills.length} icon={Brain} />
          <StatCard title="My Attendance" value={`${student.attendance.toFixed(0)}%`} icon={BookOpen} />
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
            <CardHeader><CardTitle className="font-display text-lg">My Academic Scores</CardTitle></CardHeader>
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
            <CardHeader><CardTitle className="font-display text-lg">My Skill Proficiency</CardTitle></CardHeader>
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

          {/* Job Applications instead of just notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Briefcase className="h-4 w-4" /> My Applications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {applications.length === 0 ? (
                <p className="text-sm text-muted-foreground">No applications yet.</p>
              ) : (
                applications.slice(0, 4).map((app) => {
                  const Icon = statusIcons[app.status] || Send;
                  return (
                    <div key={app.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{app.company}</p>
                          <p className="text-xs text-muted-foreground">{app.role}</p>
                        </div>
                      </div>
                      <Badge variant={statusColors[app.status] as any}>{app.status}</Badge>
                    </div>
                  );
                })
              )}
              {applications.length > 0 && (
                <Link to="/applications" className="block">
                  <Button variant="ghost" size="sm" className="w-full text-xs">View All Applications</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Notifications row */}
        {visibleNotifications.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Bell className="h-4 w-4" /> Notifications
                {unreadCount > 0 && <Badge variant="destructive" className="text-xs">{unreadCount}</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {visibleNotifications.slice(0, 4).map((n) => (
                  <div key={n.id} className={`p-3 rounded-lg border text-sm ${!n.read ? "bg-primary/5 border-primary/20" : ""}`}>
                    <p className="font-medium">{n.title}</p>
                    <p className="text-muted-foreground text-xs mt-1">{n.date}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resume-derived profile details */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <FileBadge className="h-4 w-4" /> Profile & Resume Highlights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm font-medium text-primary">{RESUME_PROFILE.headline}</p>
              <p className="text-sm text-muted-foreground mt-2">{RESUME_PROFILE.about}</p>
              <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{RESUME_PROFILE.contact.phone}</span>
                <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{RESUME_PROFILE.contact.email}</span>
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{RESUME_PROFILE.contact.location}</span>
                <a href={RESUME_PROFILE.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-primary">
                  <Linkedin className="h-3 w-3" />LinkedIn
                </a>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Education</h4>
                <div className="space-y-2">
                  {RESUME_PROFILE.education.map((e) => (
                    <div key={e.school} className="text-sm border-l-2 border-primary/40 pl-3">
                      <p className="font-medium">{e.school}</p>
                      <p className="text-xs text-muted-foreground">{e.degree} • {e.years}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><Briefcase className="h-4 w-4" /> Internships</h4>
                <div className="space-y-2">
                  {RESUME_PROFILE.internships.map((i) => (
                    <div key={i.role} className="text-sm border-l-2 border-primary/40 pl-3">
                      <p className="font-medium">{i.role}</p>
                      <p className="text-xs text-muted-foreground">{i.org} • {i.year}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><Rocket className="h-4 w-4" /> Key Projects</h4>
                <ul className="space-y-1 text-sm">
                  {RESUME_PROFILE.projects.map((p) => (
                    <li key={p} className="text-muted-foreground">• {p}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><Award className="h-4 w-4" /> Achievements</h4>
                <ul className="space-y-1 text-sm">
                  {RESUME_PROFILE.achievements.map((a) => (
                    <li key={a} className="text-muted-foreground">{a}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><FileBadge className="h-4 w-4" /> Certifications</h4>
              <div className="flex flex-wrap gap-2">
                {RESUME_PROFILE.certifications.map((c) => (
                  <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <ExternalIntegrations />
      </div>
    </DashboardLayout>
  );
}

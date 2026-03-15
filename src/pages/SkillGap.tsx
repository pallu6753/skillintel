import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useDataset } from "@/hooks/use-dataset";
import { useAuth } from "@/lib/auth-context";
import { getResourcesForSkill } from "@/lib/learning-resources";
import { recommendCareers } from "@/lib/career-engine";
import {
  Target, CheckCircle2, XCircle, ArrowRight, Youtube, BookOpen, Code, FileText, ExternalLink, Briefcase,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function SkillGap() {
  const { data, isLoading } = useDataset();
  const { user } = useAuth();

  if (isLoading || !data) {
    return (
      <DashboardLayout>
        <div className="space-y-6"><Skeleton className="h-10 w-64" /><Skeleton className="h-64" /></div>
      </DashboardLayout>
    );
  }

  const student = user?.studentId
    ? data.students.find((s) => s.id === user.studentId) ?? data.students[0]
    : data.students[0];

  const studentSkillNames = student.skills.map((s) => s.name);
  const missingSkills = data.skills.filter((s) => !studentSkillNames.includes(s));
  const matchedSkills = data.skills.filter((s) => studentSkillNames.includes(s));
  const gapPercentage = Math.round((missingSkills.length / data.skills.length) * 100);
  const careers = recommendCareers(studentSkillNames).slice(0, 3);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Target className="h-6 w-6 text-primary" />
          <div>
            <h1 className="font-display text-2xl font-bold">Skill Gap Analysis</h1>
            <p className="text-muted-foreground text-sm">
              {student.name} — {student.skills.length} skills vs {data.skills.length} industry-required
            </p>
          </div>
        </div>

        {/* Gap Overview */}
        <Card className="border-primary/30">
          <CardContent className="p-5">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-3xl font-display font-bold text-primary">{100 - gapPercentage}%</p>
                <p className="text-xs text-muted-foreground">Coverage</p>
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Skill Coverage</span>
                  <span className="font-medium">{matchedSkills.length}/{data.skills.length} skills</span>
                </div>
                <Progress value={100 - gapPercentage} className="h-3" />
                <p className="text-xs text-muted-foreground mt-2">
                  {missingSkills.length === 0
                    ? "🎉 You have all industry-required skills!"
                    : `${missingSkills.length} skill${missingSkills.length > 1 ? "s" : ""} needed to close the gap`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid sm:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" /> Skills You Have ({matchedSkills.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {matchedSkills.map((s) => {
                  const skill = student.skills.find((sk) => sk.name === s);
                  return (
                    <div key={s} className="flex items-center justify-between p-2 rounded-lg bg-green-500/5 border border-green-500/20">
                      <span className="text-sm font-medium">{s}</span>
                      <Badge variant="default" className="bg-green-600 text-white">{skill?.level}</Badge>
                    </div>
                  );
                })}
                {matchedSkills.length === 0 && <p className="text-sm text-muted-foreground">No matching skills yet.</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <XCircle className="h-5 w-5 text-destructive" /> Missing Skills ({missingSkills.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {missingSkills.map((s) => (
                  <div key={s} className="flex items-center justify-between p-2 rounded-lg bg-destructive/5 border border-destructive/20">
                    <span className="text-sm font-medium">{s}</span>
                    <Badge variant="destructive">Gap</Badge>
                  </div>
                ))}
                {missingSkills.length === 0 && <p className="text-sm text-muted-foreground">Great! You have all required skills.</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Learning Roadmap for Missing Skills */}
        {missingSkills.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <ArrowRight className="h-5 w-5 text-primary" /> Learning Roadmap
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {missingSkills.map((s, i) => {
                const res = getResourcesForSkill(s);
                return (
                  <div key={s} className="p-4 rounded-lg border bg-muted/30">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="text-xs">Step {i + 1}</Badge>
                      <p className="font-medium">Learn {s}</p>
                    </div>
                    {res ? (
                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {res.youtube.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1">
                              <Youtube className="h-3 w-3" /> YouTube
                            </p>
                            {res.youtube.slice(0, 1).map((y) => (
                              <a key={y.url} href={y.url} target="_blank" rel="noopener noreferrer"
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(y.url, "_blank", "noopener,noreferrer"); }}
                                className="text-sm text-primary hover:underline flex items-center gap-1 cursor-pointer">
                                <ExternalLink className="h-3 w-3 shrink-0" /> {y.title}
                              </a>
                            ))}
                          </div>
                        )}
                        {res.courses.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1">
                              <BookOpen className="h-3 w-3" /> Course
                            </p>
                            {res.courses.slice(0, 1).map((co) => (
                              <a key={co.url} href={co.url} target="_blank" rel="noopener noreferrer"
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(co.url, "_blank", "noopener,noreferrer"); }}
                                className="text-sm text-primary hover:underline flex items-center gap-1 cursor-pointer">
                                <ExternalLink className="h-3 w-3 shrink-0" /> {co.title}
                              </a>
                            ))}
                          </div>
                        )}
                        {res.practice.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1">
                              <Code className="h-3 w-3" /> Practice
                            </p>
                            {res.practice.slice(0, 1).map((p) => (
                              <a key={p.url} href={p.url} target="_blank" rel="noopener noreferrer"
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(p.url, "_blank", "noopener,noreferrer"); }}
                                className="text-sm text-primary hover:underline flex items-center gap-1 cursor-pointer">
                                <ExternalLink className="h-3 w-3 shrink-0" /> {p.title}
                              </a>
                            ))}
                          </div>
                        )}
                        {res.docs.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1">
                              <FileText className="h-3 w-3" /> Docs
                            </p>
                            {res.docs.slice(0, 1).map((d) => (
                              <a key={d.url} href={d.url} target="_blank" rel="noopener noreferrer"
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(d.url, "_blank", "noopener,noreferrer"); }}
                                className="text-sm text-primary hover:underline flex items-center gap-1 cursor-pointer">
                                <ExternalLink className="h-3 w-3 shrink-0" /> {d.title}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Resources coming soon.</p>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Career Impact */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" /> Career Impact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground mb-3">
              Closing your skill gaps will improve these career match scores:
            </p>
            {careers.map((c) => (
              <div key={c.role} className="flex items-center gap-3">
                <span className="text-lg">{c.icon}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{c.role}</span>
                    <span className="text-muted-foreground">{c.matchScore}% → 100%</span>
                  </div>
                  <Progress value={c.matchScore} className="h-2" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

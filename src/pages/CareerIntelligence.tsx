import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useDataset } from "@/hooks/use-dataset";
import { useAuth } from "@/lib/auth-context";
import { recommendCareers } from "@/lib/career-engine";
import { getResourcesForSkill } from "@/lib/learning-resources";
import { TrendingUp, Briefcase, ExternalLink, ChevronDown, ChevronUp, Youtube, BookOpen, Code, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CareerIntelligence() {
  const { data, isLoading } = useDataset();
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  if (isLoading || !data) {
    return (
      <DashboardLayout>
        <div className="space-y-6"><Skeleton className="h-10 w-64" /><Skeleton className="h-64" /></div>
      </DashboardLayout>
    );
  }

  const student = data.students[0];
  const studentSkillNames = student.skills.map((s) => s.name);
  const careers = recommendCareers(studentSkillNames);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Briefcase className="h-6 w-6 text-primary" />
          <div>
            <h1 className="font-display text-2xl font-bold">Career Intelligence</h1>
            <p className="text-muted-foreground text-sm">
              AI-powered career matching with learning paths for {studentSkillNames.length} skills
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {careers.map((c) => {
            const isExpanded = expandedRole === c.role;
            return (
              <Card key={c.role} className={isExpanded ? "border-primary/30" : ""}>
                <CardContent className="p-6">
                  <div
                    className="flex items-start justify-between gap-4 cursor-pointer"
                    onClick={() => setExpandedRole(isExpanded ? null : c.role)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-2xl">
                        {c.icon}
                      </div>
                      <div>
                        <h3 className="font-display font-semibold text-lg">{c.role}</h3>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {c.matchedSkills.map((s) => (
                            <Badge key={s} variant="default" className="text-xs">✓ {s}</Badge>
                          ))}
                          {c.missingSkills.map((s) => (
                            <Badge key={s} variant="outline" className="text-destructive border-destructive/30 text-xs">✗ {s}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-display font-bold text-primary">{c.matchScore}%</span>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-muted-foreground mb-1">
                      <span>Match Score</span>
                      <span>{c.matchScore >= 70 ? "Strong Match" : c.matchScore >= 50 ? "Moderate" : "Needs Development"}</span>
                    </div>
                    <Progress value={c.matchScore} className="h-2" />
                  </div>

                  {isExpanded && (
                    <div className="mt-6 space-y-6 border-t pt-6">
                      {c.missingSkills.length > 0 && (
                        <div>
                          <h4 className="font-display font-semibold mb-3">📋 Learning Path for Missing Skills</h4>
                          <div className="space-y-4">
                            {c.missingSkills.map((skill, i) => {
                              const res = getResourcesForSkill(skill);
                              return (
                                <div key={skill} className="p-4 rounded-lg border bg-muted/30">
                                  <p className="font-medium mb-3">Step {i + 1}: Learn {skill}</p>
                                  {res ? (
                                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                      {res.youtube.length > 0 && (
                                        <div>
                                          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1">
                                            <Youtube className="h-3 w-3" /> YouTube
                                          </p>
                                          {res.youtube.slice(0, 1).map((y) => (
                                            <a key={y.url} href={y.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
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
                                          {res.courses.slice(0, 1).map((c) => (
                                            <a key={c.url} href={c.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                                              <ExternalLink className="h-3 w-3 shrink-0" /> {c.title}
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
                                            <a key={p.url} href={p.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
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
                                            <a key={d.url} href={d.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                                              <ExternalLink className="h-3 w-3 shrink-0" /> {d.title}
                                            </a>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-muted-foreground">No resources available yet.</p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      {c.missingSkills.length === 0 && (
                        <p className="text-sm text-muted-foreground">🎉 You have all the skills needed for this role!</p>
                      )}
                      <a href={`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(c.role)}`} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="gap-2">
                          <ExternalLink className="h-3 w-3" /> View Jobs on LinkedIn
                        </Button>
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useDataset } from "@/hooks/use-dataset";
import { recommendCareers, predictJobReadiness } from "@/lib/career-engine";
import { getResourcesForSkill } from "@/lib/learning-resources";
import { getJobSearchLinks, getReadinessMessage } from "@/lib/job-discovery";
import {
  TrendingUp, Briefcase, ExternalLink, ChevronDown, ChevronUp,
  Youtube, BookOpen, Code, FileText, CheckCircle2, AlertCircle, Rocket,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

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

  const { user } = useAuth();
  const student = user?.studentId
    ? data.students.find((s) => s.id === user.studentId) ?? data.students[0]
    : data.students[0];
  const studentSkillNames = student.skills.map((s) => s.name);
  const careers = recommendCareers(studentSkillNames);
  const prediction = predictJobReadiness(student);
  const readiness = getReadinessMessage(prediction.score);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Briefcase className="h-6 w-6 text-primary" />
          <div>
            <h1 className="font-display text-2xl font-bold">Career Intelligence</h1>
            <p className="text-muted-foreground text-sm">
              AI-powered career matching & job discovery
            </p>
          </div>
        </div>

        {/* Job Readiness Banner */}
        <Card className={cn(
          "border-2",
          readiness.status === "ready" ? "border-green-500/30 bg-green-500/5" :
          readiness.status === "almost" ? "border-yellow-500/30 bg-yellow-500/5" :
          "border-muted"
        )}>
          <CardContent className="p-5 flex items-center gap-4">
            <div className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full shrink-0",
              readiness.status === "ready" ? "bg-green-500/10" :
              readiness.status === "almost" ? "bg-yellow-500/10" : "bg-muted"
            )}>
              {readiness.status === "ready" ? (
                <Rocket className="h-6 w-6 text-green-600" />
              ) : readiness.status === "almost" ? (
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              ) : (
                <AlertCircle className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-display font-bold text-lg">Placement Readiness: {prediction.score}%</span>
                <Badge variant={readiness.status === "ready" ? "default" : "secondary"}>
                  {prediction.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{readiness.message}</p>
              <Progress value={prediction.score} className="h-2 mt-2" />
            </div>
          </CardContent>
        </Card>

        {/* Career Matches */}
        <div className="space-y-4">
          {careers.map((c) => {
            const isExpanded = expandedRole === c.role;
            const jobLinks = getJobSearchLinks(c.role);
            const isReady = c.matchScore >= 70;

            return (
              <Card key={c.role} className={cn(isExpanded && "border-primary/30")}>
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
                        <div className="flex items-center gap-2">
                          <h3 className="font-display font-semibold text-lg">{c.role}</h3>
                          {isReady && (
                            <Badge className="bg-green-500/10 text-green-700 text-xs">
                              <CheckCircle2 className="h-3 w-3 mr-0.5" /> Job Ready
                            </Badge>
                          )}
                        </div>
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
                      {/* Learning Path */}
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
                                          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1"><Youtube className="h-3 w-3" /> YouTube</p>
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
                                          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1"><BookOpen className="h-3 w-3" /> Course</p>
                                          {res.courses.slice(0, 1).map((co) => (
                                            <a key={co.url} href={co.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                                              <ExternalLink className="h-3 w-3 shrink-0" /> {co.title}
                                            </a>
                                          ))}
                                        </div>
                                      )}
                                      {res.practice.length > 0 && (
                                        <div>
                                          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1"><Code className="h-3 w-3" /> Practice</p>
                                          {res.practice.slice(0, 1).map((p) => (
                                            <a key={p.url} href={p.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                                              <ExternalLink className="h-3 w-3 shrink-0" /> {p.title}
                                            </a>
                                          ))}
                                        </div>
                                      )}
                                      {res.docs.length > 0 && (
                                        <div>
                                          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1"><FileText className="h-3 w-3" /> Docs</p>
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

                      {/* Job Discovery Links */}
                      <div>
                        <h4 className="font-display font-semibold mb-3 flex items-center gap-2">
                          🔍 {isReady ? "Apply for Jobs" : "Explore Job Listings"}
                        </h4>
                        {!isReady && (
                          <p className="text-xs text-muted-foreground mb-3">
                            Build your missing skills first, but feel free to explore what's out there!
                          </p>
                        )}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {jobLinks.map((link) => (
                            <a
                              key={link.platform}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={cn(
                                "flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors",
                                link.color
                              )}
                            >
                              <span>{link.icon}</span>
                              {link.platform}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ))}
                        </div>
                      </div>
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

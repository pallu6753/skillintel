import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useDataset } from "@/hooks/use-dataset";
import { getResourcesForSkill } from "@/lib/learning-resources";
import { careerRoles } from "@/lib/career-engine";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Brain, ExternalLink, Youtube, BookOpen, Code, Users, X,
  TrendingUp, Briefcase, Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";

export default function SkillsDBPage() {
  const { data, isLoading } = useDataset();
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  if (isLoading || !data) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-64" />
        </div>
      </DashboardLayout>
    );
  }

  const { students, skills } = data;

  const skillStats = skills.map((skill) => {
    const studentsWithSkill = students.filter((s) =>
      s.skills.some((sk) => sk.name === skill)
    );
    const levels = { Beginner: 0, Intermediate: 0, Advanced: 0 };
    studentsWithSkill.forEach((s) => {
      const sk = s.skills.find((sk) => sk.name === skill);
      if (sk) levels[sk.level]++;
    });
    const demand = studentsWithSkill.length > 300 ? "High" : studentsWithSkill.length > 150 ? "Medium" : "Low";
    return { skill, total: studentsWithSkill.length, demand, ...levels };
  });

  const filteredStats = skillStats.filter((s) =>
    s.skill.toLowerCase().includes(search.toLowerCase())
  );

  const selected = selectedSkill
    ? skillStats.find((s) => s.skill === selectedSkill)
    : null;
  const resources = selectedSkill
    ? getResourcesForSkill(selectedSkill)
    : null;
  const relatedCareers = selectedSkill
    ? careerRoles.filter((cr) =>
        cr.skills.some((s) => s.toLowerCase() === selectedSkill.toLowerCase())
      )
    : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Brain className="h-6 w-6 text-primary" />
          <div>
            <h1 className="font-display text-2xl font-bold">Skills Database</h1>
            <p className="text-muted-foreground text-sm">
              {skills.length} skills tracked across {students.length} students — click any skill to explore
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search skills..."
            className="pl-9"
          />
        </div>
        {/* Skill Detail Panel */}
        {selected && selectedSkill && (
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-display text-xl flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                {selected.skill}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedSkill(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="text-center p-3 rounded-lg bg-background border">
                  <Users className="h-4 w-4 mx-auto text-primary mb-1" />
                  <p className="text-xl font-display font-bold">{selected.total}</p>
                  <p className="text-xs text-muted-foreground">Students</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-background border">
                  <p className="text-xl font-display font-bold">{selected.Beginner}</p>
                  <p className="text-xs text-muted-foreground">Beginner</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-background border">
                  <p className="text-xl font-display font-bold">{selected.Intermediate}</p>
                  <p className="text-xs text-muted-foreground">Intermediate</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-background border">
                  <p className="text-xl font-display font-bold">{selected.Advanced}</p>
                  <p className="text-xs text-muted-foreground">Advanced</p>
                </div>
              </div>

              {/* Proficiency distribution */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Proficiency Distribution</p>
                {(["Beginner", "Intermediate", "Advanced"] as const).map((level) => {
                  const count = selected[level];
                  const pct = selected.total > 0 ? Math.round((count / selected.total) * 100) : 0;
                  return (
                    <div key={level} className="flex items-center gap-3">
                      <span className="text-xs w-24 text-muted-foreground">{level}</span>
                      <Progress value={pct} className="h-2 flex-1" />
                      <span className="text-xs font-medium w-10 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>

              {/* Career roles using this skill */}
              {relatedCareers.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Briefcase className="h-4 w-4" /> Career Roles Using This Skill
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {relatedCareers.map((cr) => (
                      <Badge key={cr.role} variant="secondary" className="gap-1">
                        {cr.icon} {cr.role}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Learning Resources */}
              {resources && (
                <div className="grid sm:grid-cols-3 gap-4">
                  {/* YouTube */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Youtube className="h-4 w-4 text-red-500" /> YouTube
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {resources.youtube.map((y) => (
                        <a
                          key={y.url}
                          href={y.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted transition-colors group text-sm"
                        >
                          <ExternalLink className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground group-hover:text-primary" />
                          <span className="group-hover:text-primary">{y.title}</span>
                        </a>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Courses */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-blue-500" /> Courses
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {resources.courses.map((c) => (
                        <a
                          key={c.url}
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted transition-colors group text-sm"
                        >
                          <ExternalLink className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground group-hover:text-primary" />
                          <div>
                            <span className="group-hover:text-primary">{c.title}</span>
                            <p className="text-xs text-muted-foreground">{c.platform}</p>
                          </div>
                        </a>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Practice */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Code className="h-4 w-4 text-green-500" /> Practice
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {resources.practice.map((p) => (
                        <a
                          key={p.url}
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted transition-colors group text-sm"
                        >
                          <ExternalLink className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground group-hover:text-primary" />
                          <span className="group-hover:text-primary">{p.title}</span>
                        </a>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              )}

              {!resources && (
                <p className="text-sm text-muted-foreground">
                  No curated resources available yet for this skill.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Skills Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {skillStats.map((s) => (
            <Card
              key={s.skill}
              className={`cursor-pointer transition-all hover:shadow-md hover:border-primary/30 ${
                selectedSkill === s.skill ? "ring-2 ring-primary" : ""
              }`}
              onClick={() =>
                setSelectedSkill(selectedSkill === s.skill ? null : s.skill)
              }
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-semibold text-lg">
                    {s.skill}
                  </h3>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {s.total} students
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{s.Beginner} Beginner</Badge>
                  <Badge variant="secondary">{s.Intermediate} Intermediate</Badge>
                  <Badge variant="default">{s.Advanced} Advanced</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

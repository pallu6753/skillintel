import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useDataset } from "@/hooks/use-dataset";
import { useAuth } from "@/lib/auth-context";
import { recommendCareers } from "@/lib/career-engine";
import { TrendingUp, Briefcase, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function CareerPaths() {
  const { data, isLoading } = useDataset();
  const { user } = useAuth();

  if (isLoading || !data) {
    return (
      <DashboardLayout>
        <div className="space-y-6"><Skeleton className="h-10 w-64" /><Skeleton className="h-64" /></div>
      </DashboardLayout>
    );
  }

  // Use first student as logged-in student (demo)
  const student = data.students[0];
  const studentSkillNames = student.skills.map((s) => s.name);
  const careers = recommendCareers(studentSkillNames);

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-6 w-6 text-primary" />
          <div>
            <h1 className="font-display text-2xl font-bold">Career Recommendations</h1>
            <p className="text-muted-foreground text-sm">
              AI-powered career matching based on your {studentSkillNames.length} skills
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {careers.map((c) => (
            <Card key={c.role}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-2xl">
                      {c.icon}
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-lg">{c.role}</h3>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {c.matchedSkills.map((s) => (
                          <Badge key={s} variant="default" className="bg-success/10 text-success text-xs">{s} ✓</Badge>
                        ))}
                        {c.missingSkills.map((s) => (
                          <Badge key={s} variant="outline" className="text-destructive border-destructive/30 text-xs">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-2xl font-display font-bold text-primary">{c.matchScore}%</span>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-muted-foreground mb-1">
                    <span>Match Score</span>
                    <span>{c.matchScore >= 70 ? "Strong Match" : c.matchScore >= 50 ? "Moderate" : "Needs Development"}</span>
                  </div>
                  <Progress value={c.matchScore} className="h-2" />
                </div>
                <div className="mt-3">
                  <a
                    href={`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(c.role)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="gap-2">
                      <ExternalLink className="h-3 w-3" /> View Jobs on LinkedIn
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDataset } from "@/hooks/use-dataset";
import { Target, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function SkillGap() {
  const { data, isLoading } = useDataset();

  if (isLoading || !data) {
    return (
      <DashboardLayout>
        <div className="space-y-6"><Skeleton className="h-10 w-64" /><Skeleton className="h-64" /></div>
      </DashboardLayout>
    );
  }

  const student = data.students[0];
  const studentSkillNames = student.skills.map((s) => s.name);
  const missingSkills = data.skills.filter((s) => !studentSkillNames.includes(s));
  const matchedSkills = data.skills.filter((s) => studentSkillNames.includes(s));

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Target className="h-6 w-6 text-primary" />
          <div>
            <h1 className="font-display text-2xl font-bold">Skill Gap Analysis</h1>
            <p className="text-muted-foreground text-sm">Compare your {student.skills.length} skills with {data.skills.length} industry-required skills</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" /> Skills You Have ({matchedSkills.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {matchedSkills.map((s) => {
                  const skill = student.skills.find((sk) => sk.name === s);
                  return (
                    <div key={s} className="flex items-center justify-between p-2 rounded-lg bg-success/5 border border-success/20">
                      <span className="text-sm font-medium">{s}</span>
                      <Badge variant="default" className="bg-success text-success-foreground">{skill?.level}</Badge>
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

        <Card>
          <CardHeader><CardTitle className="font-display text-lg">Recommendations</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {missingSkills.slice(0, 4).map((s) => (
              <div key={s} className="flex items-center gap-3 p-3 rounded-lg border">
                <ArrowRight className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-medium">Learn {s}</p>
                  <p className="text-xs text-muted-foreground">This skill is in high demand. Start with online courses and practice projects.</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

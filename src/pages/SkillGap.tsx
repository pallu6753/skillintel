import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockStudents, industryRequiredSkills } from "@/lib/mock-data";
import { Target, CheckCircle2, XCircle, ArrowRight } from "lucide-react";

export default function SkillGap() {
  const student = mockStudents[0];
  const studentSkillNames = student.skills.map((s) => s.name);
  const missingSkills = industryRequiredSkills.filter((s) => !studentSkillNames.includes(s));
  const matchedSkills = industryRequiredSkills.filter((s) => studentSkillNames.includes(s));

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Target className="h-6 w-6 text-primary" />
          <div>
            <h1 className="font-display text-2xl font-bold">Skill Gap Analysis</h1>
            <p className="text-muted-foreground text-sm">Compare your skills with industry requirements</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" /> Skills You Have
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {matchedSkills.map((s) => (
                  <div key={s} className="flex items-center justify-between p-2 rounded-lg bg-success/5 border border-success/20">
                    <span className="text-sm font-medium">{s}</span>
                    <Badge variant="default" className="bg-success text-success-foreground">Matched</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <XCircle className="h-5 w-5 text-destructive" /> Missing Skills
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

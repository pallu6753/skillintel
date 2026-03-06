import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDataset } from "@/hooks/use-dataset";
import { Brain } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function SkillsDBPage() {
  const { data, isLoading } = useDataset();

  if (isLoading || !data) {
    return (
      <DashboardLayout>
        <div className="space-y-6"><Skeleton className="h-10 w-64" /><Skeleton className="h-64" /></div>
      </DashboardLayout>
    );
  }

  const { students, skills } = data;

  const skillStats = skills.map(skill => {
    const studentsWithSkill = students.filter(s => s.skills.some(sk => sk.name === skill));
    const levels = { Beginner: 0, Intermediate: 0, Advanced: 0 };
    studentsWithSkill.forEach(s => {
      const sk = s.skills.find(sk => sk.name === skill);
      if (sk) levels[sk.level]++;
    });
    return { skill, total: studentsWithSkill.length, ...levels };
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Brain className="h-6 w-6 text-primary" />
          <div>
            <h1 className="font-display text-2xl font-bold">Skills Database</h1>
            <p className="text-muted-foreground text-sm">{skills.length} skills tracked across {students.length} students</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {skillStats.map(s => (
            <Card key={s.skill}>
              <CardContent className="p-5">
                <h3 className="font-display font-semibold text-lg mb-3">{s.skill}</h3>
                <p className="text-sm text-muted-foreground mb-3">{s.total} students have this skill</p>
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

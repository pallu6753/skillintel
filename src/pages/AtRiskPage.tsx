import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDataset } from "@/hooks/use-dataset";
import { AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AtRiskPage() {
  const { data, isLoading } = useDataset();

  if (isLoading || !data) {
    return (
      <DashboardLayout>
        <div className="space-y-6"><Skeleton className="h-10 w-64" /><Skeleton className="h-96" /></div>
      </DashboardLayout>
    );
  }

  const atRisk = data.students.filter((s) => s.riskStatus === "at-risk");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-6 w-6 text-destructive" />
          <div>
            <h1 className="font-display text-2xl font-bold">At-Risk Students</h1>
            <p className="text-muted-foreground text-sm">{atRisk.length} students flagged based on low GPA, attendance, or quiz scores</p>
          </div>
        </div>

        <div className="space-y-3">
          {atRisk.length === 0 ? (
            <Card><CardContent className="p-6 text-center text-muted-foreground">No at-risk students detected.</CardContent></Card>
          ) : (
            atRisk.map((s) => (
              <Card key={s.id} className="border-destructive/20">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold">{s.name}</p>
                    <p className="text-sm text-muted-foreground">{s.department} — GPA: {s.gpa} | Attendance: {s.attendance.toFixed(0)}% | Quiz: {s.quizScore.toFixed(0)}%</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {s.gpa < 2.5 && <Badge variant="destructive">Low GPA</Badge>}
                    {s.attendance < 60 && <Badge variant="destructive">Low Attendance</Badge>}
                    {s.quizScore < 40 && <Badge variant="destructive">Low Quiz</Badge>}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

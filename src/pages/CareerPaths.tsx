import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { careerPaths } from "@/lib/mock-data";
import { TrendingUp, Briefcase } from "lucide-react";

export default function CareerPaths() {
  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-6 w-6 text-primary" />
          <div>
            <h1 className="font-display text-2xl font-bold">Career Recommendations</h1>
            <p className="text-muted-foreground text-sm">Suggested career paths based on your skills and quiz results</p>
          </div>
        </div>

        <div className="space-y-4">
          {careerPaths.map((c) => (
            <Card key={c.career}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-lg">{c.career}</h3>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {c.skills.map((s) => (
                          <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-2xl font-display font-bold text-primary">{c.readiness}%</span>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-muted-foreground mb-1">
                    <span>Readiness</span>
                    <span>{c.readiness >= 70 ? "Strong Match" : c.readiness >= 50 ? "Moderate" : "Needs Development"}</span>
                  </div>
                  <Progress value={c.readiness} className="h-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

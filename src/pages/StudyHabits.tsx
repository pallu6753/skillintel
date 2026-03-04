import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { studyHabits } from "@/lib/mock-data";
import { FileText, Clock, Moon, Smartphone, Monitor, RotateCcw, ArrowRight } from "lucide-react";

const habits = [
  { label: "Daily Study Hours", value: studyHabits.dailyStudyHours, max: 10, icon: Clock, unit: "hrs" },
  { label: "Sleep Hours", value: studyHabits.sleepHours, max: 10, icon: Moon, unit: "hrs" },
  { label: "Social Media", value: studyHabits.socialMediaUsage, max: 8, icon: Smartphone, unit: "hrs" },
  { label: "Online Learning", value: studyHabits.onlineLearningHours, max: 6, icon: Monitor, unit: "hrs" },
];

const recommendations = [
  { condition: studyHabits.dailyStudyHours < 5, message: "Increase daily study hours to at least 5 hours for better performance." },
  { condition: studyHabits.sleepHours < 7, message: "Aim for 7-8 hours of sleep for better cognitive function." },
  { condition: studyHabits.socialMediaUsage > 2, message: "Reduce social media usage to under 2 hours to improve focus." },
  { condition: studyHabits.onlineLearningHours < 2, message: "Dedicate at least 2 hours to structured online learning." },
];

export default function StudyHabits() {
  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-primary" />
          <div>
            <h1 className="font-display text-2xl font-bold">Study Habits</h1>
            <p className="text-muted-foreground text-sm">Track and improve your daily study patterns</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {habits.map((h) => (
            <Card key={h.label}>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <h.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{h.label}</p>
                    <p className="text-2xl font-display font-bold">{h.value} <span className="text-sm text-muted-foreground font-normal">{h.unit}</span></p>
                  </div>
                </div>
                <Progress value={(h.value / h.max) * 100} className="h-2" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader><CardTitle className="font-display text-lg">Personalized Recommendations</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {recommendations.filter((r) => r.condition).map((r, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-warning/20 bg-warning/5">
                <ArrowRight className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                <p className="text-sm">{r.message}</p>
              </div>
            ))}
            {recommendations.filter((r) => r.condition).length === 0 && (
              <p className="text-sm text-muted-foreground">Great job! Your study habits look well-balanced.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

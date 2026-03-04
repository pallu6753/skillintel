import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockNotifications } from "@/lib/mock-data";
import { Bell, Briefcase, BookOpen, GraduationCap, Brain, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const typeIcons: Record<string, React.ElementType> = {
  placement: Briefcase,
  internship: GraduationCap,
  exam: BookOpen,
  training: Brain,
  alert: AlertTriangle,
};

const typeColors: Record<string, string> = {
  placement: "bg-primary/10 text-primary",
  internship: "bg-accent/10 text-accent",
  exam: "bg-info/10 text-info",
  training: "bg-success/10 text-success",
  alert: "bg-destructive/10 text-destructive",
};

export default function Notifications() {
  const [notifications] = useState(mockNotifications);

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6 text-primary" />
          <div>
            <h1 className="font-display text-2xl font-bold">Notifications</h1>
            <p className="text-muted-foreground text-sm">{notifications.filter(n => !n.read).length} unread</p>
          </div>
        </div>

        <div className="space-y-3">
          {notifications.map((n) => {
            const Icon = typeIcons[n.type] || Bell;
            return (
              <Card key={n.id} className={cn(!n.read && "border-primary/20")}>
                <CardContent className="p-4 flex gap-4">
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg shrink-0", typeColors[n.type])}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{n.title}</p>
                      {!n.read && <div className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">{n.date}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}

import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useApplicationStore, ApplicationStatus } from "@/lib/application-store";
import { Briefcase, CheckCircle2, XCircle, Clock, UserCheck, Send } from "lucide-react";

const statusConfig: Record<ApplicationStatus, { label: string; color: string; icon: React.ElementType }> = {
  applied: { label: "Applied", color: "bg-blue-500/10 text-blue-600 border-blue-500/30", icon: Send },
  shortlisted: { label: "Shortlisted", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30", icon: Clock },
  interview: { label: "Interview", color: "bg-purple-500/10 text-purple-600 border-purple-500/30", icon: UserCheck },
  selected: { label: "Selected", color: "bg-green-500/10 text-green-600 border-green-500/30", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-destructive/10 text-destructive border-destructive/30", icon: XCircle },
};

const statusOrder: ApplicationStatus[] = ["applied", "shortlisted", "interview", "selected", "rejected"];

export default function ApplicationTracker() {
  const { applications } = useApplicationStore();

  const statusCounts = statusOrder.map((s) => ({
    status: s,
    count: applications.filter((a) => a.status === s).length,
    ...statusConfig[s],
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <Briefcase className="h-6 w-6 text-primary" />
          <div>
            <h1 className="font-display text-2xl font-bold">Application Tracker</h1>
            <p className="text-muted-foreground text-sm">Track your job applications and interview status</p>
          </div>
        </div>

        {/* Status summary */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {statusCounts.map((s) => (
            <Card key={s.status}>
              <CardContent className="p-4 text-center">
                <s.icon className="h-5 w-5 mx-auto mb-1 text-primary" />
                <p className="text-2xl font-display font-bold">{s.count}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pipeline view */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Application Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 mb-6 overflow-x-auto">
              {statusOrder.slice(0, 4).map((s, i) => (
                <div key={s} className="flex items-center">
                  <div className={`px-3 py-1.5 rounded-full text-xs font-medium border ${statusConfig[s].color}`}>
                    {statusConfig[s].label}
                  </div>
                  {i < 3 && <div className="w-8 h-px bg-border mx-1" />}
                </div>
              ))}
            </div>

            {applications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No applications yet. Apply to placement drives to get started!
              </p>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => {
                  const config = statusConfig[app.status];
                  const Icon = config.icon;
                  return (
                    <div
                      key={app.id}
                      className="flex items-center gap-4 p-4 rounded-lg border transition-colors hover:bg-muted/50"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-semibold">{app.company}</p>
                        <p className="text-sm text-muted-foreground">{app.role}</p>
                      </div>
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-muted-foreground">Applied: {app.appliedDate}</p>
                        <p className="text-xs text-muted-foreground">Updated: {app.lastUpdate}</p>
                      </div>
                      <Badge className={`border ${config.color}`}>{config.label}</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

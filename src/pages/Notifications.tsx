import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNotificationStore, AppNotification } from "@/lib/notification-store";
import { useAuth } from "@/lib/auth-context";
import { Bell, Briefcase, BookOpen, GraduationCap, Brain, AlertTriangle, Send, Plus, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const typeIcons: Record<string, React.ElementType> = {
  placement: Briefcase,
  general: Bell,
  exam: BookOpen,
  training: Brain,
  alert: AlertTriangle,
};

const typeColors: Record<string, string> = {
  placement: "bg-primary/10 text-primary",
  general: "bg-accent/10 text-accent-foreground",
  exam: "bg-blue-500/10 text-blue-500",
  training: "bg-green-500/10 text-green-500",
  alert: "bg-destructive/10 text-destructive",
};

const priorityColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-yellow-500/10 text-yellow-600",
  high: "bg-destructive/10 text-destructive",
};

function generateSingleReport(n: AppNotification): string {
  return `════════════════════════════════════════
  SKILLINTEL — NOTIFICATION RECEIPT
════════════════════════════════════════

Title:      ${n.title}
Type:       ${n.type.toUpperCase()}
Priority:   ${n.priority.toUpperCase()}
Date:       ${n.date}
Sent By:    ${n.senderName} (${n.senderRole})
Target:     ${n.targetRole === "all" ? "All Roles" : n.targetRole}
Status:     ${n.read ? "Read" : "Unread"}

────────────────────────────────────────
MESSAGE
────────────────────────────────────────
${n.message}

════════════════════════════════════════
Generated on ${new Date().toLocaleString()}
SkillIntel AI Career Intelligence Platform
════════════════════════════════════════`;
}

function generateFullReport(notifications: AppNotification[], userName: string, role: string): string {
  const header = `╔══════════════════════════════════════════════╗
║   SKILLINTEL — NOTIFICATIONS REPORT          ║
╚══════════════════════════════════════════════╝

Generated for: ${userName} (${role})
Date:          ${new Date().toLocaleString()}
Total:         ${notifications.length} notification(s)

`;

  const body = notifications
    .map(
      (n, i) =>
        `── ${i + 1}. ${n.title} ──
   Type:     ${n.type} | Priority: ${n.priority} | Date: ${n.date}
   From:     ${n.senderName} (${n.senderRole})
   Target:   ${n.targetRole === "all" ? "All" : n.targetRole}
   Status:   ${n.read ? "Read" : "Unread"}
   Message:  ${n.message}
`
    )
    .join("\n");

  return header + body + `\n══ End of Report ══`;
}

function downloadText(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Notifications() {
  const { user } = useAuth();
  const { notifications, addNotification, markRead } = useNotificationStore();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetRole, setTargetRole] = useState<string>("all");
  const [priority, setPriority] = useState<string>("medium");
  const [type, setType] = useState<string>("general");

  const canPost = user?.role === "admin" || user?.role === "faculty" || user?.role === "placement";

  const visibleNotifications = notifications.filter(
    (n) => n.targetRole === "all" || n.targetRole === user?.role
  );
  const unreadCount = visibleNotifications.filter((n) => !n.read).length;

  const handlePost = () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Please fill in title and message");
      return;
    }
    addNotification({
      title: title.trim(),
      message: message.trim(),
      targetRole: targetRole as AppNotification["targetRole"],
      priority: priority as AppNotification["priority"],
      type: type as AppNotification["type"],
      senderRole: user?.role || "admin",
      senderName: user?.name || "Unknown",
    });
    setTitle("");
    setMessage("");
    setTargetRole("all");
    setPriority("medium");
    setType("general");
    setShowForm(false);
    toast.success("Notification posted successfully!");
  };

  const handleDownloadSingle = (n: AppNotification, e: React.MouseEvent) => {
    e.stopPropagation();
    const report = generateSingleReport(n);
    downloadText(report, `notification-${n.id}.txt`);
    toast.success("Receipt downloaded!");
  };

  const handleDownloadAll = () => {
    if (visibleNotifications.length === 0) {
      toast.error("No notifications to download");
      return;
    }
    const report = generateFullReport(visibleNotifications, user?.name || "User", user?.role || "student");
    downloadText(report, `notifications-report-${new Date().toISOString().split("T")[0]}.txt`);
    toast.success("Full report downloaded!");
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6 text-primary" />
            <div>
              <h1 className="font-display text-2xl font-bold">Notifications</h1>
              <p className="text-muted-foreground text-sm">{unreadCount} unread</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDownloadAll}>
              <Download className="h-4 w-4 mr-2" /> Download Report
            </Button>
            {canPost && (
              <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "secondary" : "default"} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                {showForm ? "Cancel" : "Create"}
              </Button>
            )}
          </div>
        </div>

        {/* Create Notification Form */}
        {showForm && canPost && (
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Send className="h-4 w-4" /> Post New Notification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Title</label>
                <Input placeholder="e.g. Python Bootcamp Tomorrow" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Message</label>
                <Textarea placeholder="Write your notification message..." value={message} onChange={(e) => setMessage(e.target.value)} rows={3} />
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Target</label>
                  <Select value={targetRole} onValueChange={setTargetRole}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="student">Students</SelectItem>
                      <SelectItem value="faculty">Faculty</SelectItem>
                      <SelectItem value="placement">Placement</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Priority</label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Type</label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="placement">Placement</SelectItem>
                      <SelectItem value="exam">Exam</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                      <SelectItem value="alert">Alert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handlePost} className="w-full">
                <Send className="h-4 w-4 mr-2" /> Post Notification
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Notification List */}
        <div className="space-y-3">
          {visibleNotifications.length === 0 ? (
            <Card><CardContent className="p-6 text-center text-muted-foreground">No notifications yet.</CardContent></Card>
          ) : (
            visibleNotifications.map((n) => {
              const Icon = typeIcons[n.type] || Bell;
              return (
                <Card
                  key={n.id}
                  className={cn("cursor-pointer transition-colors", !n.read && "border-primary/20")}
                  onClick={() => !n.read && markRead(n.id)}
                >
                  <CardContent className="p-4 flex gap-4">
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg shrink-0", typeColors[n.type] || typeColors.general)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold">{n.title}</p>
                        {!n.read && <div className="h-2 w-2 rounded-full bg-primary" />}
                        <Badge className={cn("text-xs", priorityColors[n.priority])}>{n.priority}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                        <span>{n.date}</span>
                        <span>by {n.senderName} ({n.senderRole})</span>
                        <Badge variant="outline" className="text-xs">{n.targetRole === "all" ? "Everyone" : n.targetRole}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs gap-1 ml-auto"
                          onClick={(e) => handleDownloadSingle(n, e)}
                        >
                          <Download className="h-3 w-3" /> Receipt
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

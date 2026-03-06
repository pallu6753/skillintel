import { create } from "zustand";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  targetRole: "student" | "faculty" | "placement" | "admin" | "all";
  priority: "low" | "medium" | "high";
  senderRole: string;
  senderName: string;
  date: string;
  read: boolean;
  type: "placement" | "training" | "exam" | "alert" | "general";
}

interface NotificationStore {
  notifications: AppNotification[];
  addNotification: (n: Omit<AppNotification, "id" | "date" | "read">) => void;
  markRead: (id: string) => void;
}

const defaultNotifications: AppNotification[] = [
  { id: "n1", title: "Google Placement Drive", message: "Google is visiting campus on March 15. Students with GPA > 7.5 are eligible.", targetRole: "all", priority: "high", senderRole: "placement", senderName: "Placement Officer", date: "2026-03-04", read: false, type: "placement" },
  { id: "n2", title: "Summer Internship at Microsoft", message: "Apply for Microsoft's summer internship program. Deadline: March 20.", targetRole: "student", priority: "high", senderRole: "placement", senderName: "Placement Officer", date: "2026-03-03", read: false, type: "placement" },
  { id: "n3", title: "Mid-Semester Exam Schedule", message: "Mid-semester exams start from March 25. Check the timetable.", targetRole: "all", priority: "medium", senderRole: "admin", senderName: "Admin User", date: "2026-03-02", read: true, type: "exam" },
  { id: "n4", title: "Python Workshop", message: "Free Python workshop on March 10. Register now!", targetRole: "student", priority: "medium", senderRole: "faculty", senderName: "Dr. Meera Iyer", date: "2026-03-01", read: true, type: "training" },
  { id: "n5", title: "Low Attendance Alert", message: "Multiple students have attendance below 60%. Faculty please follow up.", targetRole: "faculty", priority: "high", senderRole: "admin", senderName: "Admin User", date: "2026-02-28", read: false, type: "alert" },
];

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: defaultNotifications,
  addNotification: (n) =>
    set((state) => ({
      notifications: [
        {
          ...n,
          id: `n-${Date.now()}`,
          date: new Date().toISOString().split("T")[0],
          read: false,
        },
        ...state.notifications,
      ],
    })),
  markRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
}));

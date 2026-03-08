import { create } from "zustand";

export type ApplicationStatus = "applied" | "shortlisted" | "interview" | "selected" | "rejected";

export interface JobApplication {
  id: string;
  driveId: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  appliedDate: string;
  lastUpdate: string;
  notes: string;
}

interface ApplicationStore {
  applications: JobApplication[];
  apply: (driveId: string, company: string, role: string) => void;
  updateStatus: (id: string, status: ApplicationStatus) => void;
  hasApplied: (driveId: string) => boolean;
}

const defaultApplications: JobApplication[] = [
  {
    id: "app1",
    driveId: "pd1",
    company: "Google",
    role: "Data Analyst",
    status: "shortlisted",
    appliedDate: "2026-03-05",
    lastUpdate: "2026-03-07",
    notes: "",
  },
  {
    id: "app2",
    driveId: "pd2",
    company: "Microsoft",
    role: "Software Engineer Intern",
    status: "interview",
    appliedDate: "2026-03-04",
    lastUpdate: "2026-03-06",
    notes: "",
  },
  {
    id: "app3",
    driveId: "pd3",
    company: "Infosys",
    role: "Systems Engineer",
    status: "rejected",
    appliedDate: "2026-02-22",
    lastUpdate: "2026-03-01",
    notes: "",
  },
];

export const useApplicationStore = create<ApplicationStore>((set, get) => ({
  applications: defaultApplications,
  apply: (driveId, company, role) =>
    set((state) => ({
      applications: [
        {
          id: `app-${Date.now()}`,
          driveId,
          company,
          role,
          status: "applied",
          appliedDate: new Date().toISOString().split("T")[0],
          lastUpdate: new Date().toISOString().split("T")[0],
          notes: "",
        },
        ...state.applications,
      ],
    })),
  updateStatus: (id, status) =>
    set((state) => ({
      applications: state.applications.map((a) =>
        a.id === id ? { ...a, status, lastUpdate: new Date().toISOString().split("T")[0] } : a
      ),
    })),
  hasApplied: (driveId) => get().applications.some((a) => a.driveId === driveId),
}));

import { create } from "zustand";

export interface PlacementDrive {
  id: string;
  company: string;
  role: string;
  package: string;
  eligibility: string;
  deadline: string;
  description: string;
  createdBy: string;
  createdAt: string;
  status: "open" | "closed";
}

interface PlacementStore {
  drives: PlacementDrive[];
  addDrive: (drive: Omit<PlacementDrive, "id" | "createdAt" | "status">) => void;
  closeDrive: (id: string) => void;
}

const defaultDrives: PlacementDrive[] = [
  {
    id: "pd1",
    company: "Google",
    role: "Data Analyst",
    package: "12 LPA",
    eligibility: "GPA > 3.5, No active backlogs",
    deadline: "2026-03-20",
    description: "Google is hiring Data Analysts for their Bangalore office. Strong SQL and Python skills required.",
    createdBy: "Placement Officer",
    createdAt: "2026-03-01",
    status: "open",
  },
  {
    id: "pd2",
    company: "Microsoft",
    role: "Software Engineer Intern",
    package: "8 LPA (Stipend)",
    eligibility: "GPA > 3.0, 3rd/4th year students",
    deadline: "2026-03-25",
    description: "Summer internship program at Microsoft. Focus on full-stack development and cloud technologies.",
    createdBy: "Placement Officer",
    createdAt: "2026-03-02",
    status: "open",
  },
  {
    id: "pd3",
    company: "Infosys",
    role: "Systems Engineer",
    package: "6 LPA",
    eligibility: "GPA > 2.5",
    deadline: "2026-03-10",
    description: "Mass recruitment drive for fresh graduates. Training provided.",
    createdBy: "Placement Officer",
    createdAt: "2026-02-20",
    status: "closed",
  },
];

export const usePlacementStore = create<PlacementStore>((set) => ({
  drives: defaultDrives,
  addDrive: (drive) =>
    set((state) => ({
      drives: [
        {
          ...drive,
          id: `pd-${Date.now()}`,
          createdAt: new Date().toISOString().split("T")[0],
          status: "open",
        },
        ...state.drives,
      ],
    })),
  closeDrive: (id) =>
    set((state) => ({
      drives: state.drives.map((d) => (d.id === id ? { ...d, status: "closed" } : d)),
    })),
}));

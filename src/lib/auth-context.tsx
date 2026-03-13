import React, { createContext, useContext, useState, useCallback } from "react";
import { UserRole } from "./mock-data";

interface AuthUser {
  name: string;
  email: string;
  role: UserRole;
  studentId?: string;
}

// Demo student accounts mapped to dataset student_ids
const DEMO_STUDENTS: Record<string, { name: string; studentId: string }> = {
  "topper@skillintel.com": { name: "Aditi Sharma", studentId: "3" },       // GPA 4.8, high performer
  "intermediate@skillintel.com": { name: "Rahul Verma", studentId: "9" },  // GPA 3.05, moderate
  "lowstudent@skillintel.com": { name: "Karan Patel", studentId: "13" },   // GPA 2.09, at-risk
};

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string, role: UserRole) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = useCallback((email: string, _password: string, role: UserRole) => {
    const defaultNames: Record<UserRole, string> = {
      student: "Aarav Sharma",
      faculty: "Dr. Meera Iyer",
      placement: "Placement Officer",
      admin: "Admin User",
    };

    const normalizedEmail = email?.toLowerCase() || "demo@college.edu";
    const demoStudent = DEMO_STUDENTS[normalizedEmail];

    let name = defaultNames[role];
    let studentId: string | undefined;

    if (demoStudent) {
      name = demoStudent.name;
      studentId = demoStudent.studentId;
      role = "student"; // force student role for demo accounts
    } else if (email && email !== "demo@college.edu") {
      const localPart = email.split("@")[0];
      name = localPart
        .replace(/[._-]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
    }

    setUser({ name, email: normalizedEmail, role, studentId });
    return true;
  }, []);

  const logout = useCallback(() => setUser(null), []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

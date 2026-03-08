import React, { createContext, useContext, useState, useCallback } from "react";
import { UserRole } from "./mock-data";

interface AuthUser {
  name: string;
  email: string;
  role: UserRole;
}

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

    let name = defaultNames[role];
    if (email && email !== "demo@college.edu") {
      const localPart = email.split("@")[0];
      name = localPart
        .replace(/[._-]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
    }

    setUser({ name, email: email || "demo@college.edu", role });
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

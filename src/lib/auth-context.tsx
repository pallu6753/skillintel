import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { measure } from "@/lib/perf";

export type UserRole = "student" | "faculty" | "placement" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profileId?: string;
}

export const DEMO_USERS: Record<UserRole, AuthUser> = {
  student: {
    id: "demo-student-id",
    name: "Abhijit Sagar",
    email: "student@test.com",
    role: "student",
    profileId: "csv-1",
  },
  faculty: {
    id: "demo-faculty-id",
    name: "Dr. Sarah Jenkins",
    email: "faculty@test.com",
    role: "faculty",
  },
  placement: {
    id: "demo-placement-id",
    name: "Placement Director",
    email: "placement@test.com",
    role: "placement",
  },
  admin: {
    id: "demo-admin-id",
    name: "System Administrator",
    email: "admin@test.com",
    role: "admin",
  },
};

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  login: (email: string, password: string, role: UserRole) => Promise<{ error: string | null; isOfflineDemo?: boolean }>;
  signup: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ error: string | null; isOfflineDemo?: boolean }>;
  loginOfflineDemo: (role: UserRole, email?: string, name?: string) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function fetchUserRole(userId: string): Promise<UserRole> {
  try {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();
    return (data?.role as UserRole) ?? "student";
  } catch {
    return "student";
  }
}

async function fetchProfile(userId: string) {
  try {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("user_id", userId)
      .maybeSingle();
    return data;
  } catch {
    return null;
  }
}

async function buildAuthUser(supaUser: User): Promise<AuthUser> {
  const [role, profile] = await Promise.all([
    fetchUserRole(supaUser.id),
    fetchProfile(supaUser.id),
  ]);
  return {
    id: supaUser.id,
    name: profile?.full_name ?? supaUser.email?.split("@")[0] ?? "User",
    email: supaUser.email ?? "",
    role,
    profileId: profile?.id,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const loginOfflineDemo = useCallback((role: UserRole, email?: string, name?: string) => {
    const defaultUser = DEMO_USERS[role];
    const offlineUser: AuthUser = {
      id: defaultUser.id,
      name: name || (email ? email.split("@")[0] : defaultUser.name),
      email: email || defaultUser.email,
      role,
      profileId: role === "student" ? "csv-1" : undefined,
    };
    setUser(offlineUser);
    try {
      localStorage.setItem("skillintel_offline_user", JSON.stringify(offlineUser));
    } catch (e) {
      console.warn("Could not save offline user to localStorage", e);
    }
  }, []);

  useEffect(() => {
    // 1. Restore local offline user if available
    try {
      const saved = localStorage.getItem("skillintel_offline_user");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.id && parsed?.role) {
          setUser(parsed);
          setLoading(false);
        }
      }
    } catch (e) {
      console.warn("Failed to parse saved offline user", e);
    }

    // 2. Subscribe to Supabase auth state changes
    let subscription: { unsubscribe: () => void } | null = null;
    try {
      const res = supabase.auth.onAuthStateChange((_event, newSession) => {
        setSession(newSession);
        if (newSession?.user) {
          setLoading(true);
          setTimeout(async () => {
            try {
              const authUser = await buildAuthUser(newSession.user);
              setUser(authUser);
              localStorage.removeItem("skillintel_offline_user");
            } catch (err) {
              console.warn("Could not build auth user from Supabase session:", err);
            } finally {
              setLoading(false);
            }
          }, 0);
        } else {
          // If logged out from Supabase, only clear user if NOT in offline demo mode
          const hasOffline = localStorage.getItem("skillintel_offline_user");
          if (!hasOffline) {
            setUser(null);
          }
          setLoading(false);
        }
      });
      subscription = res.data.subscription;
    } catch (err) {
      console.warn("Supabase auth subscription failed:", err);
      setLoading(false);
    }

    // 3. Check existing Supabase session
    try {
      supabase.auth.getSession().then(async ({ data: { session: s } }) => {
        setSession(s);
        if (s?.user) {
          try {
            const authUser = await buildAuthUser(s.user);
            setUser(authUser);
            localStorage.removeItem("skillintel_offline_user");
          } catch (err) {
            console.warn("Failed to load user profile:", err);
          }
        }
        setLoading(false);
      }).catch((err) => {
        console.warn("Supabase getSession failed (offline/paused):", err);
        setLoading(false);
      });
    } catch (err) {
      console.warn("Supabase getSession threw:", err);
      setLoading(false);
    }

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string, role: UserRole) => {
    const isDemoEmail = email.toLowerCase().includes("@test.com") || email.toLowerCase().includes("demo");

    try {
      const { error } = await measure("Email sign-in", "auth", () =>
        supabase.auth.signInWithPassword({ email, password })
      );

      if (error) {
        const errorMsg = error.message || "";
        const isNetworkFailure =
          errorMsg.toLowerCase().includes("fetch") ||
          errorMsg.toLowerCase().includes("network") ||
          errorMsg.toLowerCase().includes("connection") ||
          errorMsg.toLowerCase().includes("failed");

        if (isDemoEmail || isNetworkFailure) {
          loginOfflineDemo(role, email);
          return { error: null, isOfflineDemo: true };
        }
        return { error: errorMsg };
      }

      localStorage.removeItem("skillintel_offline_user");
      return { error: null };
    } catch (err: any) {
      // Network exception (e.g. Failed to fetch when Supabase is paused or down)
      console.warn("Sign in encountered network exception, falling back to demo session:", err);
      loginOfflineDemo(role, email);
      return { error: null, isOfflineDemo: true };
    }
  }, [loginOfflineDemo]);

  const signup = useCallback(async (email: string, password: string, fullName: string, role: UserRole) => {
    const isDemoEmail = email.toLowerCase().includes("@test.com") || email.toLowerCase().includes("demo");

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });

      if (error) {
        const errorMsg = error.message || "";
        const isNetworkFailure =
          errorMsg.toLowerCase().includes("fetch") ||
          errorMsg.toLowerCase().includes("network");

        if (isDemoEmail || isNetworkFailure) {
          loginOfflineDemo(role, email, fullName);
          return { error: null, isOfflineDemo: true };
        }
        return { error: errorMsg };
      }

      if (data?.user) {
        try {
          await supabase.rpc("assign_role_on_signup" as any, {
            _user_id: data.user.id,
            _role: role,
          });
        } catch (err) {
          console.warn("Role assignment warning:", err);
        }
      }

      localStorage.removeItem("skillintel_offline_user");
      return { error: null };
    } catch (err) {
      console.warn("Sign up encountered network exception, falling back to demo session:", err);
      loginOfflineDemo(role, email, fullName);
      return { error: null, isOfflineDemo: true };
    }
  }, [loginOfflineDemo]);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Supabase signOut error:", e);
    }
    try {
      localStorage.removeItem("skillintel_offline_user");
    } catch {}
    setUser(null);
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        login,
        signup,
        loginOfflineDemo,
        logout,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

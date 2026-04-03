import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export type UserRole = "student" | "faculty" | "placement" | "admin";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profileId?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  login: (email: string, password: string, role: UserRole) => Promise<{ error: string | null }>;
  signup: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function fetchUserRole(userId: string): Promise<UserRole> {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();
  return (data?.role as UserRole) ?? "student";
}

async function fetchProfile(userId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("user_id", userId)
    .maybeSingle();
  return data;
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

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        if (newSession?.user) {
          const authUser = await buildAuthUser(newSession.user);
          setUser(authUser);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      setSession(s);
      if (s?.user) {
        const authUser = await buildAuthUser(s.user);
        setUser(authUser);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string, _role: UserRole) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  }, []);

  const signup = useCallback(async (email: string, password: string, fullName: string, role: UserRole) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) return { error: error.message };

    // Assign role (fire-and-forget, don't block signup)
    if (data.user) {
      supabase.rpc("assign_role_on_signup" as any, {
        _user_id: data.user.id,
        _role: role,
      }).catch((err: any) => console.warn("Role assignment warning:", err));
    }

    return { error: null };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, login, signup, logout, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

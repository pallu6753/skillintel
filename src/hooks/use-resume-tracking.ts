import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export interface ResumeAnalysisRecord {
  id: string;
  student_id: string;
  user_id: string;
  file_name: string | null;
  overall_score: number;
  ats_score: number;
  word_count: number;
  detected_skills: string[];
  missing_skills: string[];
  keywords: string[];
  sections: Record<string, boolean>;
  recommendations: string[];
  created_at: string;
}

export interface SkillProgressRecord {
  id: string;
  student_id: string;
  user_id: string;
  analysis_id: string | null;
  skill: string;
  action_type: string;
  status: string;
  notes: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useResumeTracking() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isStudent = user?.role === "student";
  const canRead = isStudent ? Boolean(user?.profileId) : Boolean(user && user.role !== "student");
  const queryKey = ["resume-tracking", user?.profileId ?? user?.role];

  const analyses = useQuery({
    queryKey: [...queryKey, "analyses"],
    enabled: canRead,
    queryFn: async () => {
      let query = supabase.from("resume_analyses").select("*").order("created_at", { ascending: false }).limit(isStudent ? 30 : 100);
      if (isStudent && user?.profileId) query = query.eq("student_id", user.profileId);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as ResumeAnalysisRecord[];
    },
    staleTime: 30_000,
  });

  const progress = useQuery({
    queryKey: [...queryKey, "progress"],
    enabled: canRead,
    queryFn: async () => {
      let query = supabase.from("skill_progress").select("*").order("updated_at", { ascending: false }).limit(isStudent ? 100 : 300);
      if (isStudent && user?.profileId) query = query.eq("student_id", user.profileId);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as SkillProgressRecord[];
    },
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!canRead) return;
    const channel = supabase
      .channel(`resume-progress-${user?.profileId ?? user?.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "resume_analyses" }, () => {
        void queryClient.invalidateQueries({ queryKey: [...queryKey, "analyses"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "skill_progress" }, () => {
        void queryClient.invalidateQueries({ queryKey: [...queryKey, "progress"] });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [canRead, queryClient, user?.id, user?.profileId, user?.role]);

  return { analyses, progress, canRead, isStudent };
}
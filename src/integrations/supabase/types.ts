export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      academic_performance: {
        Row: {
          assignment_score: number | null
          attendance: number | null
          created_at: string
          exam_score: number | null
          gpa: number | null
          id: string
          quiz_score: number | null
          student_id: string
          updated_at: string
        }
        Insert: {
          assignment_score?: number | null
          attendance?: number | null
          created_at?: string
          exam_score?: number | null
          gpa?: number | null
          id?: string
          quiz_score?: number | null
          student_id: string
          updated_at?: string
        }
        Update: {
          assignment_score?: number | null
          attendance?: number | null
          created_at?: string
          exam_score?: number | null
          gpa?: number | null
          id?: string
          quiz_score?: number | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_performance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coding_scores: {
        Row: {
          created_at: string
          easy_solved: number | null
          hard_solved: number | null
          id: string
          medium_solved: number | null
          problems_solved: number | null
          streak_days: number | null
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          easy_solved?: number | null
          hard_solved?: number | null
          id?: string
          medium_solved?: number | null
          problems_solved?: number | null
          streak_days?: number | null
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          easy_solved?: number | null
          hard_solved?: number | null
          id?: string
          medium_solved?: number | null
          problems_solved?: number | null
          streak_days?: number | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coding_scores_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      internships: {
        Row: {
          company: string | null
          created_at: string
          id: string
          internships_completed: number | null
          student_id: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          id?: string
          internships_completed?: number | null
          student_id: string
        }
        Update: {
          company?: string | null
          created_at?: string
          id?: string
          internships_completed?: number | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "internships_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_readiness: {
        Row: {
          coding_score: number | null
          communication_score: number | null
          created_at: string
          id: string
          job_ready_score: number | null
          resume_score: number | null
          student_id: string
          updated_at: string
        }
        Insert: {
          coding_score?: number | null
          communication_score?: number | null
          created_at?: string
          id?: string
          job_ready_score?: number | null
          resume_score?: number | null
          student_id: string
          updated_at?: string
        }
        Update: {
          coding_score?: number | null
          communication_score?: number | null
          created_at?: string
          id?: string
          job_ready_score?: number | null
          resume_score?: number | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_readiness_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      placement_readiness: {
        Row: {
          classification: string | null
          coding_weight: number | null
          created_at: string
          gpa_weight: number | null
          id: string
          projects_weight: number | null
          readiness_score: number | null
          resume_weight: number | null
          skills_weight: number | null
          student_id: string
          updated_at: string
        }
        Insert: {
          classification?: string | null
          coding_weight?: number | null
          created_at?: string
          gpa_weight?: number | null
          id?: string
          projects_weight?: number | null
          readiness_score?: number | null
          resume_weight?: number | null
          skills_weight?: number | null
          student_id: string
          updated_at?: string
        }
        Update: {
          classification?: string | null
          coding_weight?: number | null
          created_at?: string
          gpa_weight?: number | null
          id?: string
          projects_weight?: number | null
          readiness_score?: number | null
          resume_weight?: number | null
          skills_weight?: number | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "placement_readiness_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          email: string | null
          full_name: string
          id: string
          semester: number | null
          updated_at: string
          user_id: string
          year_of_study: number | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          full_name: string
          id?: string
          semester?: number | null
          updated_at?: string
          user_id: string
          year_of_study?: number | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          full_name?: string
          id?: string
          semester?: number | null
          updated_at?: string
          user_id?: string
          year_of_study?: number | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          id: string
          projects_completed: number | null
          student_id: string
          tech_stack: string[] | null
          title: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          projects_completed?: number | null
          student_id: string
          tech_stack?: string[] | null
          title?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          projects_completed?: number | null
          student_id?: string
          tech_stack?: string[] | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_scores: {
        Row: {
          ats_score: number | null
          created_at: string
          experience_score: number | null
          formatting_score: number | null
          id: string
          projects_score: number | null
          skills_score: number | null
          student_id: string
        }
        Insert: {
          ats_score?: number | null
          created_at?: string
          experience_score?: number | null
          formatting_score?: number | null
          id?: string
          projects_score?: number | null
          skills_score?: number | null
          student_id: string
        }
        Update: {
          ats_score?: number | null
          created_at?: string
          experience_score?: number | null
          formatting_score?: number | null
          id?: string
          projects_score?: number | null
          skills_score?: number | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resume_scores_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          category: string | null
          id: string
          name: string
        }
        Insert: {
          category?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      student_skills: {
        Row: {
          created_at: string
          id: string
          proficiency: string | null
          score: number | null
          skill_id: string
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          proficiency?: string | null
          score?: number | null
          skill_id: string
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          proficiency?: string | null
          score?: number | null
          skill_id?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_skills_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_role_on_signup: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "student" | "faculty" | "placement" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["student", "faculty", "placement", "admin"],
    },
  },
} as const

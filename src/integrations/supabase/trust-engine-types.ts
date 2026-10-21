import { Database } from "./types";

export type TrustEngineDatabase = Database & {
  public: {
    Tables: Database["public"]["Tables"] & {
      data_sources: {
        Row: {
          id: string;
          name: string;
          url: string | null;
          reliability_score: number;
          type: string;
          created_at: string;
        };
        Insert: any;
        Update: any;
        Relationships: any[];
      };
      raw_job_records: {
        Row: {
          id: string;
          source_id: string | null;
          raw_payload: any;
          title: string;
          company: string | null;
          location: string | null;
          source_url: string | null;
          salary_min: number | null;
          salary_max: number | null;
          currency: string | null;
          experience_min: number | null;
          experience_max: number | null;
          date_posted: string | null;
          collected_at: string;
          raw_skills: string[] | null;
          ingestion_status: string | null;
        };
        Insert: any;
        Update: any;
        Relationships: any[];
      };
      job_validation_results: {
        Row: {
          job_id: string;
          status: string;
          issues: any;
          validated_at: string;
        };
        Insert: any;
        Update: any;
        Relationships: any[];
      };
      job_cleaning_results: {
        Row: {
          job_id: string;
          cleaned_title: string | null;
          cleaned_company: string | null;
          cleaned_location: string | null;
          cleaned_skills: string[] | null;
          normalized_salary_min: number | null;
          normalized_salary_max: number | null;
          normalized_experience_min: number | null;
          normalized_experience_max: number | null;
          cleaned_at: string;
        };
        Insert: any;
        Update: any;
        Relationships: any[];
      };
      job_quality_scores: {
        Row: {
          job_id: string;
          source_score: number;
          evidence_score: number;
          completeness_score: number;
          consistency_score: number;
          freshness_score: number;
          duplicate_score: number;
          anomaly_score: number;
          final_trust_score: number;
          verification_status: string;
          last_verified_at: string;
        };
        Insert: any;
        Update: any;
        Relationships: any[];
      };
    };
    Views: Database["public"]["Views"] & {
      trusted_jobs: {
        Row: {
          id: string;
          title: string | null;
          company: string | null;
          location: string | null;
          salary_min: number | null;
          salary_max: number | null;
          currency: string | null;
          experience_min: number | null;
          experience_max: number | null;
          skills: string[] | null;
          trust_score: number | null;
          verification_status: string | null;
          date_posted: string | null;
          collected_at: string | null;
          last_verified_at: string | null;
          source_url: string | null;
          source_name: string | null;
        };
      };
    };
  };
};

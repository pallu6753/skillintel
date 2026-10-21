export type RawJobRecord = {
  id: string;
  source_id?: string;
  raw_payload?: any;
  title: string;
  company?: string;
  location?: string;
  source_url?: string;
  salary_min?: number;
  salary_max?: number;
  currency?: string;
  experience_min?: number;
  experience_max?: number;
  date_posted?: string;
  collected_at: string;
  raw_skills?: string[];
  ingestion_status?: string;
};

export type ValidationIssue = {
  field: string;
  message: string;
  severity: 'error' | 'warning';
};

export type ValidationResult = {
  status: 'VALID' | 'WARNING' | 'INVALID';
  issues: ValidationIssue[];
};

export type CleanedJobRecord = {
  job_id: string;
  cleaned_title: string;
  cleaned_company: string;
  cleaned_location: string;
  cleaned_skills: string[];
  normalized_salary_min?: number;
  normalized_salary_max?: number;
  normalized_experience_min?: number;
  normalized_experience_max?: number;
};

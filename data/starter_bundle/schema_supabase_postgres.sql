-- SkillIntel: PostgreSQL / Supabase schema starter
-- Apply only after reviewing against the existing app and testing in a development project.
-- Authentication identities belong to Supabase auth.users; never store passwords here.
create extension if not exists pgcrypto;

create type public.app_role as enum ('student','teacher','placement','admin');
create type public.difficulty_level as enum ('Easy','Medium','Hard');
create type public.application_status as enum ('saved','applied','assessment','interview','offer','rejected','withdrawn');

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  usn text unique,
  full_name text not null,
  email text not null,
  phone text,
  college text,
  department text,
  semester smallint check (semester between 1 and 8),
  graduation_year smallint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  assigned_by uuid references auth.users(id),
  assigned_at timestamptz not null default now(),
  primary key (user_id, role)
);
create table public.academic_records (
  academic_record_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  semester smallint not null check (semester between 1 and 8),
  sgpa numeric(4,2) check (sgpa between 0 and 10),
  cgpa numeric(4,2) check (cgpa between 0 and 10),
  course_completion_status text,
  credit_units numeric(6,2),
  source_reference text,
  verified_at timestamptz,
  unique(user_id, semester)
);
create table public.skills (
  skill_id uuid primary key default gen_random_uuid(),
  canonical_name text not null unique,
  category text not null,
  aliases text[] not null default '{}'
);
create table public.student_skills (
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  skill_id uuid not null references public.skills(skill_id) on delete cascade,
  proficiency text check (proficiency in ('beginner','intermediate','advanced','verified')),
  evidence_ref text,
  updated_at timestamptz not null default now(),
  primary key(user_id, skill_id)
);
create table public.quiz_questions (
  question_id text primary key,
  category text not null,
  difficulty public.difficulty_level not null,
  prompt text not null,
  options jsonb not null check (jsonb_typeof(options) = 'array' and jsonb_array_length(options) >= 2),
  correct_option_index integer not null check (correct_option_index >= 0),
  explanation text not null,
  source_type text not null default 'curated',
  review_status text not null default 'needs_review',
  created_at timestamptz not null default now()
);
create table public.quiz_attempts (
  attempt_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  question_id text not null references public.quiz_questions(question_id),
  selected_option integer,
  is_correct boolean,
  time_taken_sec integer check (time_taken_sec >= 0),
  attempted_at timestamptz not null default now()
);
create table public.coding_problems (
  problem_id text primary key,
  title text not null,
  domain text not null,
  difficulty public.difficulty_level not null,
  description text not null,
  visible_test_cases jsonb not null default '[]',
  hidden_test_cases_ref text,
  expected_time_complexity text,
  expected_space_complexity text,
  starter_code jsonb not null default '{}',
  editorial_summary text,
  source_type text not null,
  review_status text not null default 'needs_review'
);
create table public.coding_submissions (
  submission_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  problem_id text not null references public.coding_problems(problem_id),
  submitted_code text not null,
  language text not null,
  status text not null default 'pending',
  tests_passed integer,
  tests_total integer,
  execution_time_ms integer,
  memory_kb integer,
  submitted_at timestamptz not null default now()
);
create table public.resumes (
  resume_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  storage_path text not null,
  version integer not null default 1 check (version > 0),
  parse_status text not null default 'pending',
  extracted_skills jsonb not null default '[]',
  education_history jsonb not null default '[]',
  experience_months integer check (experience_months >= 0),
  ats_score numeric(5,2) check (ats_score between 0 and 100),
  keyword_density numeric(6,3),
  formatting_issues jsonb not null default '[]',
  scoring_version text,
  analyzed_at timestamptz,
  created_at timestamptz not null default now()
);
create table public.mock_interviews (
  interview_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  module_type text not null check (module_type in ('Behavioral','Technical','Mixed')),
  prompt text not null,
  transcript text,
  relevance_score numeric(5,2) check (relevance_score between 0 and 100),
  clarity_score numeric(5,2) check (clarity_score between 0 and 100),
  technical_accuracy_score numeric(5,2) check (technical_accuracy_score between 0 and 100),
  feedback_summary text,
  created_at timestamptz not null default now()
);
create table public.career_paths (
  path_id text primary key,
  role_title text not null unique,
  required_skills jsonb not null,
  required_certifications jsonb not null default '[]',
  min_cgpa numeric(4,2) check (min_cgpa between 0 and 10),
  demand_score numeric(5,2) check (demand_score between 0 and 100),
  source_type text not null default 'curated',
  last_verified_at timestamptz
);
create table public.companies (
  company_id uuid primary key default gen_random_uuid(),
  company_name text not null,
  website text,
  industry text,
  verified_status text not null default 'unverified',
  created_at timestamptz not null default now()
);
create table public.job_postings (
  job_id text primary key,
  company_id uuid references public.companies(company_id),
  title text not null,
  description text,
  source_platform text not null,
  location text,
  required_skills jsonb not null default '[]',
  application_url text,
  source_url text,
  closing_date date,
  status text not null default 'unverified',
  last_verified_at timestamptz
);
create table public.job_matches (
  match_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  job_id text not null references public.job_postings(job_id) on delete cascade,
  score numeric(5,2) check (score between 0 and 100),
  explanation jsonb not null default '{}',
  scoring_version text,
  created_at timestamptz not null default now(),
  unique(user_id, job_id, scoring_version)
);
create table public.applications (
  application_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  job_id text not null references public.job_postings(job_id),
  status public.application_status not null default 'saved',
  deadline date,
  next_action text,
  follow_up_at timestamptz,
  user_approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.cohorts (
  cohort_id uuid primary key default gen_random_uuid(),
  cohort_name text not null,
  department text not null,
  semester smallint check (semester between 1 and 8),
  academic_year text not null,
  start_date date,
  end_date date
);
create table public.cohort_members (
  cohort_id uuid not null references public.cohorts(cohort_id) on delete cascade,
  student_user_id uuid not null references public.profiles(user_id) on delete cascade,
  primary key(cohort_id, student_user_id)
);
create table public.teacher_assignments (
  teacher_user_id uuid not null references auth.users(id) on delete cascade,
  cohort_id uuid not null references public.cohorts(cohort_id) on delete cascade,
  assigned_by uuid references auth.users(id),
  primary key(teacher_user_id, cohort_id)
);
create table public.training_modules (
  module_id uuid primary key default gen_random_uuid(),
  title text not null,
  objectives jsonb not null default '[]',
  content_ref text,
  estimated_minutes integer check (estimated_minutes > 0),
  version text not null default '1.0',
  active boolean not null default true
);
create table public.training_tasks (
  task_id uuid primary key default gen_random_uuid(),
  module_id uuid references public.training_modules(module_id),
  cohort_id uuid references public.cohorts(cohort_id),
  title text not null,
  instructions text not null,
  due_date date,
  rubric jsonb not null default '{}',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create table public.task_submissions (
  submission_id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.training_tasks(task_id) on delete cascade,
  student_user_id uuid not null references public.profiles(user_id) on delete cascade,
  artifact_ref text,
  status text not null default 'submitted',
  feedback text,
  score numeric(5,2),
  reviewed_by uuid references auth.users(id),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz
);
create table public.placement_drives (
  drive_id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(company_id),
  job_id text references public.job_postings(job_id),
  title text not null,
  event_at timestamptz,
  registration_deadline timestamptz,
  venue_or_link text,
  status text not null default 'draft',
  coordinator_id uuid references auth.users(id)
);
create table public.eligibility_rules (
  rule_id uuid primary key default gen_random_uuid(),
  job_id text references public.job_postings(job_id),
  drive_id uuid references public.placement_drives(drive_id),
  min_cgpa numeric(4,2) check (min_cgpa between 0 and 10),
  allowed_branches text[] not null default '{}',
  graduation_years smallint[] not null default '{}',
  backlog_rule text,
  rule_source text
);
create table public.placement_participants (
  participant_id uuid primary key default gen_random_uuid(),
  drive_id uuid not null references public.placement_drives(drive_id) on delete cascade,
  student_user_id uuid not null references public.profiles(user_id) on delete cascade,
  consented_at timestamptz,
  status text not null default 'registered',
  stage text,
  updated_at timestamptz not null default now(),
  unique(drive_id, student_user_id)
);
create table public.placement_outcomes (
  outcome_id uuid primary key default gen_random_uuid(),
  student_user_id uuid not null references public.profiles(user_id) on delete cascade,
  company_id uuid references public.companies(company_id),
  job_id text references public.job_postings(job_id),
  outcome_status text not null,
  offer_date date,
  package_amount numeric(12,2),
  verification_source text,
  verified_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create table public.audit_logs (
  event_id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id),
  action text not null,
  entity_type text not null,
  entity_id text,
  result text not null,
  reason text,
  created_at timestamptz not null default now()
);
create index idx_quiz_category_difficulty on public.quiz_questions(category, difficulty);
create index idx_quiz_attempts_user_time on public.quiz_attempts(user_id, attempted_at desc);
create index idx_applications_user_status on public.applications(user_id, status);
create index idx_job_postings_status_closing on public.job_postings(status, closing_date);
create index idx_coding_submissions_user_time on public.coding_submissions(user_id, submitted_at desc);

-- RLS must be enabled and policies added before production use.
-- This starter intentionally does not claim to provide a complete authorization policy set.
-- Add and test role-specific policies in a development project before exposing any table.

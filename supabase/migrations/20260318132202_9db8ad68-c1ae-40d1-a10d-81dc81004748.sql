-- ============================================
-- SkillIntel Database Schema
-- ============================================

-- Timestamp update trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============================================
-- 1. User Roles (RBAC)
-- ============================================
CREATE TYPE public.app_role AS ENUM ('student', 'faculty', 'placement', 'admin');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ============================================
-- 2. Profiles
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT,
  department TEXT,
  semester INTEGER DEFAULT 1,
  year_of_study INTEGER DEFAULT 1,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles viewable by authenticated" ON public.profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 3. Skills (master list)
-- ============================================
CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT DEFAULT 'Technical'
);
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Skills readable by all" ON public.skills FOR SELECT TO authenticated USING (true);

-- ============================================
-- 4. Student Academic Performance
-- ============================================
CREATE TABLE public.academic_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  attendance NUMERIC(5,2) DEFAULT 0,
  assignment_score NUMERIC(5,2) DEFAULT 0,
  quiz_score NUMERIC(5,2) DEFAULT 0,
  exam_score NUMERIC(5,2) DEFAULT 0,
  gpa NUMERIC(3,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.academic_performance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Academic data readable by authenticated" ON public.academic_performance
  FOR SELECT TO authenticated USING (true);

CREATE TRIGGER update_academic_updated_at
  BEFORE UPDATE ON public.academic_performance
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 5. Student Skills (proficiency tracking)
-- ============================================
CREATE TABLE public.student_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE NOT NULL,
  proficiency TEXT CHECK (proficiency IN ('Beginner', 'Intermediate', 'Advanced')) DEFAULT 'Beginner',
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, skill_id)
);
ALTER TABLE public.student_skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Student skills readable by authenticated" ON public.student_skills
  FOR SELECT TO authenticated USING (true);

CREATE TRIGGER update_student_skills_updated_at
  BEFORE UPDATE ON public.student_skills
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 6. Projects
-- ============================================
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  tech_stack TEXT[],
  projects_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Projects readable by authenticated" ON public.projects
  FOR SELECT TO authenticated USING (true);

-- ============================================
-- 7. Internships
-- ============================================
CREATE TABLE public.internships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  company TEXT,
  internships_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.internships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Internships readable by authenticated" ON public.internships
  FOR SELECT TO authenticated USING (true);

-- ============================================
-- 8. Job Readiness Scores
-- ============================================
CREATE TABLE public.job_readiness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  coding_score NUMERIC(5,2) DEFAULT 0,
  communication_score NUMERIC(5,2) DEFAULT 0,
  resume_score NUMERIC(5,2) DEFAULT 0,
  job_ready_score NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.job_readiness ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Job readiness readable by authenticated" ON public.job_readiness
  FOR SELECT TO authenticated USING (true);

CREATE TRIGGER update_job_readiness_updated_at
  BEFORE UPDATE ON public.job_readiness
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 9. Coding Scores (practice tracking)
-- ============================================
CREATE TABLE public.coding_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  problems_solved INTEGER DEFAULT 0,
  easy_solved INTEGER DEFAULT 0,
  medium_solved INTEGER DEFAULT 0,
  hard_solved INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.coding_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Coding scores readable by authenticated" ON public.coding_scores
  FOR SELECT TO authenticated USING (true);

-- ============================================
-- 10. Resume Scores
-- ============================================
CREATE TABLE public.resume_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  ats_score INTEGER DEFAULT 0 CHECK (ats_score >= 0 AND ats_score <= 100),
  skills_score INTEGER DEFAULT 0,
  projects_score INTEGER DEFAULT 0,
  experience_score INTEGER DEFAULT 0,
  formatting_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.resume_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Resume scores readable by authenticated" ON public.resume_scores
  FOR SELECT TO authenticated USING (true);

-- ============================================
-- 11. Placement Readiness (ML predictions)
-- ============================================
CREATE TABLE public.placement_readiness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  readiness_score NUMERIC(5,2) DEFAULT 0,
  classification TEXT CHECK (classification IN ('Ready', 'Needs Improvement', 'Not Ready')) DEFAULT 'Not Ready',
  gpa_weight NUMERIC(5,2) DEFAULT 0,
  skills_weight NUMERIC(5,2) DEFAULT 0,
  coding_weight NUMERIC(5,2) DEFAULT 0,
  projects_weight NUMERIC(5,2) DEFAULT 0,
  resume_weight NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.placement_readiness ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Placement readiness readable by authenticated" ON public.placement_readiness
  FOR SELECT TO authenticated USING (true);

-- ============================================
-- Seed Skills Master List
-- ============================================
INSERT INTO public.skills (name, category) VALUES
  ('Python', 'Programming'),
  ('SQL', 'Database'),
  ('Machine Learning', 'AI/ML'),
  ('Data Visualization', 'Analytics'),
  ('Power BI', 'Analytics'),
  ('Communication', 'Soft Skills'),
  ('Problem Solving', 'Soft Skills'),
  ('Statistics', 'Mathematics'),
  ('Deep Learning', 'AI/ML'),
  ('Java', 'Programming'),
  ('Cloud Computing', 'Infrastructure'),
  ('Docker', 'DevOps'),
  ('Git', 'DevOps'),
  ('C Programming', 'Programming'),
  ('Embedded Systems', 'Hardware');
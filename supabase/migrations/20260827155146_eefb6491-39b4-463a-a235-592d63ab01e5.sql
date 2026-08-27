-- 1. RESUME ANALYSES -------------------------------------------------------
CREATE TABLE public.resume_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  file_name text,
  overall_score integer NOT NULL DEFAULT 0,
  ats_score integer NOT NULL DEFAULT 0,
  word_count integer NOT NULL DEFAULT 0,
  detected_skills text[] NOT NULL DEFAULT '{}',
  missing_skills text[] NOT NULL DEFAULT '{}',
  keywords text[] NOT NULL DEFAULT '{}',
  sections jsonb NOT NULL DEFAULT '{}'::jsonb,
  recommendations text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.resume_analyses TO authenticated;
GRANT ALL ON public.resume_analyses TO service_role;

ALTER TABLE public.resume_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students insert own resume analyses"
  ON public.resume_analyses FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = student_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Students view own resume analyses"
  ON public.resume_analyses FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Staff view resume analyses"
  ON public.resume_analyses FOR SELECT TO authenticated
  USING (private.is_staff(auth.uid()));

CREATE INDEX idx_resume_analyses_student ON public.resume_analyses(student_id, created_at DESC);

COMMENT ON TABLE public.resume_analyses IS '@graphql({"visible": false})';

-- 2. SKILL PROGRESS MILESTONES ---------------------------------------------
CREATE TABLE public.skill_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  analysis_id uuid REFERENCES public.resume_analyses(id) ON DELETE SET NULL,
  skill text NOT NULL,
  action_type text NOT NULL DEFAULT 'learn_skill',
  status text NOT NULL DEFAULT 'pending',
  notes text,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT skill_progress_status_chk CHECK (status IN ('pending','in_progress','completed')),
  CONSTRAINT skill_progress_action_chk CHECK (action_type IN ('learn_skill','complete_course','practice','resume_update','profile_update')),
  CONSTRAINT skill_progress_skill_len CHECK (char_length(skill) BETWEEN 1 AND 80),
  CONSTRAINT skill_progress_unique UNIQUE (student_id, skill, action_type)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.skill_progress TO authenticated;
GRANT ALL ON public.skill_progress TO service_role;

ALTER TABLE public.skill_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students manage own skill progress"
  ON public.skill_progress FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = student_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Staff view skill progress"
  ON public.skill_progress FOR SELECT TO authenticated
  USING (private.is_staff(auth.uid()));

CREATE INDEX idx_skill_progress_student ON public.skill_progress(student_id, updated_at DESC);

CREATE TRIGGER update_skill_progress_updated_at
  BEFORE UPDATE ON public.skill_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.skill_progress IS '@graphql({"visible": false})';

-- 3. SECURITY AUDIT LOG -----------------------------------------------------
CREATE TABLE public.security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  actor_role text,
  action text NOT NULL,
  resource text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT audit_action_len CHECK (char_length(action) BETWEEN 1 AND 120)
);

GRANT SELECT, INSERT ON public.security_audit_log TO authenticated;
GRANT ALL ON public.security_audit_log TO service_role;

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users log own actions"
  ON public.security_audit_log FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own audit entries"
  ON public.security_audit_log FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins view all audit entries"
  ON public.security_audit_log FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_audit_created ON public.security_audit_log(created_at DESC);

COMMENT ON TABLE public.security_audit_log IS '@graphql({"visible": false})';

-- 4. REALTIME ---------------------------------------------------------------
ALTER TABLE public.resume_analyses REPLICA IDENTITY FULL;
ALTER TABLE public.skill_progress REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.resume_analyses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.skill_progress;
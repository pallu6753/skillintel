
-- 1. Move SECURITY DEFINER functions out of the exposed public schema
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM anon, authenticated;
GRANT USAGE ON SCHEMA private TO postgres, service_role, authenticated, anon;

-- Recreate has_role in private schema
CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

-- Wrapper helper to check any of the elevated roles
CREATE OR REPLACE FUNCTION private.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin'::public.app_role, 'faculty'::public.app_role, 'placement'::public.app_role)
  )
$$;
REVOKE ALL ON FUNCTION private.is_staff(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.is_staff(uuid) TO authenticated, service_role;

-- Recreate assign_role_on_signup in private schema
CREATE OR REPLACE FUNCTION private.assign_role_on_signup(_user_id uuid, _role public.app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;
REVOKE ALL ON FUNCTION private.assign_role_on_signup(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.assign_role_on_signup(uuid, public.app_role) TO service_role;

-- Lock down the now-redundant public copies so they cannot be invoked over the API
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.assign_role_on_signup(uuid, public.app_role) FROM PUBLIC, anon, authenticated;

-- 2. Rewrite RLS policies to use the new private.has_role / private.is_staff

-- profiles: users see own, staff see all
DROP POLICY IF EXISTS "Profiles viewable by authenticated" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Staff can view all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (private.is_staff(auth.uid()));

-- academic_performance
DROP POLICY IF EXISTS "Academic data readable by authenticated" ON public.academic_performance;
CREATE POLICY "Students can view own academic data"
  ON public.academic_performance FOR SELECT TO authenticated
  USING (auth.uid() = student_id);
CREATE POLICY "Staff can view all academic data"
  ON public.academic_performance FOR SELECT TO authenticated
  USING (private.is_staff(auth.uid()));

-- coding_scores
DROP POLICY IF EXISTS "Coding scores readable by authenticated" ON public.coding_scores;
CREATE POLICY "Students can view own coding scores"
  ON public.coding_scores FOR SELECT TO authenticated
  USING (auth.uid() = student_id);
CREATE POLICY "Staff can view all coding scores"
  ON public.coding_scores FOR SELECT TO authenticated
  USING (private.is_staff(auth.uid()));

-- internships
DROP POLICY IF EXISTS "Internships readable by authenticated" ON public.internships;
CREATE POLICY "Students can view own internships"
  ON public.internships FOR SELECT TO authenticated
  USING (auth.uid() = student_id);
CREATE POLICY "Staff can view all internships"
  ON public.internships FOR SELECT TO authenticated
  USING (private.is_staff(auth.uid()));

-- job_readiness
DROP POLICY IF EXISTS "Job readiness readable by authenticated" ON public.job_readiness;
CREATE POLICY "Students can view own job readiness"
  ON public.job_readiness FOR SELECT TO authenticated
  USING (auth.uid() = student_id);
CREATE POLICY "Staff can view all job readiness"
  ON public.job_readiness FOR SELECT TO authenticated
  USING (private.is_staff(auth.uid()));

-- placement_readiness
DROP POLICY IF EXISTS "Placement readiness readable by authenticated" ON public.placement_readiness;
CREATE POLICY "Students can view own placement readiness"
  ON public.placement_readiness FOR SELECT TO authenticated
  USING (auth.uid() = student_id);
CREATE POLICY "Staff can view all placement readiness"
  ON public.placement_readiness FOR SELECT TO authenticated
  USING (private.is_staff(auth.uid()));

-- projects
DROP POLICY IF EXISTS "Projects readable by authenticated" ON public.projects;
CREATE POLICY "Students can view own projects"
  ON public.projects FOR SELECT TO authenticated
  USING (auth.uid() = student_id);
CREATE POLICY "Staff can view all projects"
  ON public.projects FOR SELECT TO authenticated
  USING (private.is_staff(auth.uid()));

-- resume_scores
DROP POLICY IF EXISTS "Resume scores readable by authenticated" ON public.resume_scores;
CREATE POLICY "Students can view own resume scores"
  ON public.resume_scores FOR SELECT TO authenticated
  USING (auth.uid() = student_id);
CREATE POLICY "Staff can view all resume scores"
  ON public.resume_scores FOR SELECT TO authenticated
  USING (private.is_staff(auth.uid()));

-- student_skills
DROP POLICY IF EXISTS "Student skills readable by authenticated" ON public.student_skills;
CREATE POLICY "Students can view own skills"
  ON public.student_skills FOR SELECT TO authenticated
  USING (auth.uid() = student_id);
CREATE POLICY "Staff can view all student skills"
  ON public.student_skills FOR SELECT TO authenticated
  USING (private.is_staff(auth.uid()));

-- 3. user_roles: allow admins to update and delete role rows
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can update roles"
  ON public.user_roles FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));

-- 4. Revoke anon SELECT on sensitive tables so signed-out clients cannot enumerate rows or discover via GraphQL
REVOKE SELECT ON public.profiles FROM anon;
REVOKE SELECT ON public.academic_performance FROM anon;
REVOKE SELECT ON public.coding_scores FROM anon;
REVOKE SELECT ON public.internships FROM anon;
REVOKE SELECT ON public.job_readiness FROM anon;
REVOKE SELECT ON public.placement_readiness FROM anon;
REVOKE SELECT ON public.projects FROM anon;
REVOKE SELECT ON public.resume_scores FROM anon;
REVOKE SELECT ON public.student_skills FROM anon;
REVOKE SELECT ON public.user_roles FROM anon;

-- 5. Hide these tables from the pg_graphql schema for authenticated users too (RLS still governs data access via REST)
COMMENT ON TABLE public.profiles IS E'@graphql({"skip": true})';
COMMENT ON TABLE public.academic_performance IS E'@graphql({"skip": true})';
COMMENT ON TABLE public.coding_scores IS E'@graphql({"skip": true})';
COMMENT ON TABLE public.internships IS E'@graphql({"skip": true})';
COMMENT ON TABLE public.job_readiness IS E'@graphql({"skip": true})';
COMMENT ON TABLE public.placement_readiness IS E'@graphql({"skip": true})';
COMMENT ON TABLE public.projects IS E'@graphql({"skip": true})';
COMMENT ON TABLE public.resume_scores IS E'@graphql({"skip": true})';
COMMENT ON TABLE public.student_skills IS E'@graphql({"skip": true})';
COMMENT ON TABLE public.user_roles IS E'@graphql({"skip": true})';

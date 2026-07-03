-- 1. Hide sensitive tables from pg_graphql discovery (REST still works, RLS still applies)
COMMENT ON TABLE public.academic_performance IS e'@graphql({"visible": false})';
COMMENT ON TABLE public.coding_scores       IS e'@graphql({"visible": false})';
COMMENT ON TABLE public.internships         IS e'@graphql({"visible": false})';
COMMENT ON TABLE public.job_readiness       IS e'@graphql({"visible": false})';
COMMENT ON TABLE public.placement_readiness IS e'@graphql({"visible": false})';
COMMENT ON TABLE public.profiles            IS e'@graphql({"visible": false})';
COMMENT ON TABLE public.projects            IS e'@graphql({"visible": false})';
COMMENT ON TABLE public.resume_scores       IS e'@graphql({"visible": false})';
COMMENT ON TABLE public.student_skills      IS e'@graphql({"visible": false})';
COMMENT ON TABLE public.user_roles          IS e'@graphql({"visible": false})';
COMMENT ON TABLE public.skills              IS e'@graphql({"visible": false})';

-- 2. Revoke anon SELECT on skills reference table
REVOKE SELECT ON public.skills FROM anon;

-- 3. Revoke EXECUTE on internal SECURITY DEFINER functions in the public schema
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
-- has_role / assign_role_on_signup were already revoked in a prior migration; re-assert for safety
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.assign_role_on_signup(uuid, public.app_role) FROM PUBLIC, anon, authenticated;

-- 4. Drop email from profiles so staff can no longer harvest student emails.
--    Update the signup trigger to stop writing it. Auth session already carries user's own email.
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

ALTER TABLE public.profiles DROP COLUMN IF EXISTS email;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Ensure admin role lifecycle policies exist (idempotent — assert they're in place)
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

CREATE POLICY "Admins can insert roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update roles" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete roles" ON public.user_roles
  FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role));
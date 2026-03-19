
-- Drop the FK constraint on profiles.user_id so we can seed sample profiles without auth.users entries
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

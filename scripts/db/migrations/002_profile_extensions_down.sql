-- Migration Down: 002_profile_extensions
-- Description: Revert profile extensions, drop profile_links and profile_skills

-- 1) Drop child tables first due to FK to profiles
DROP TABLE IF EXISTS public.profile_skills;
DROP TABLE IF EXISTS public.profile_links;

-- 2) Remove added columns from profiles
ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS bio,
  DROP COLUMN IF EXISTS role,
  DROP COLUMN IF EXISTS location,
  DROP COLUMN IF EXISTS cover_image_url;


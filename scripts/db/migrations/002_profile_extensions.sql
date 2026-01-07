-- Migration: 002_profile_extensions
-- Description: Extend profiles and create profile_links and profile_skills with RLS (Neon-compatible using public.current_session_id)
-- Date: 2026-01-06

-- 1) Extend profiles with additional fields used by the new UI
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS role TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- 2) Profile links (normalized)
CREATE TABLE IF NOT EXISTS public.profile_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('website','linkedin','instagram','twitter')),
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (profile_id, kind)
);

-- Enable RLS for profile_links
ALTER TABLE public.profile_links ENABLE ROW LEVEL SECURITY;

-- RLS: Only owner (by user_id via profiles) can view/insert/update/delete
DROP POLICY IF EXISTS "Owner can select profile_links" ON public.profile_links;
CREATE POLICY "Owner can select profile_links"
ON public.profile_links FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = profile_id AND p.user_id = public.current_session_id()
  )
);

DROP POLICY IF EXISTS "Owner can insert profile_links" ON public.profile_links;
CREATE POLICY "Owner can insert profile_links"
ON public.profile_links FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = profile_id AND p.user_id = public.current_session_id()
  )
);

DROP POLICY IF EXISTS "Owner can update profile_links" ON public.profile_links;
CREATE POLICY "Owner can update profile_links"
ON public.profile_links FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = profile_id AND p.user_id = public.current_session_id()
  )
);

DROP POLICY IF EXISTS "Owner can delete profile_links" ON public.profile_links;
CREATE POLICY "Owner can delete profile_links"
ON public.profile_links FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = profile_id AND p.user_id = public.current_session_id()
  )
);

-- 3) Profile skills (user-specific skills with icon)
CREATE TABLE IF NOT EXISTS public.profile_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  favorite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (profile_id, name)
);

-- Enable RLS for profile_skills
ALTER TABLE public.profile_skills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner can select profile_skills" ON public.profile_skills;
CREATE POLICY "Owner can select profile_skills"
ON public.profile_skills FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = profile_id AND p.user_id = public.current_session_id()
  )
);

DROP POLICY IF EXISTS "Owner can insert profile_skills" ON public.profile_skills;
CREATE POLICY "Owner can insert profile_skills"
ON public.profile_skills FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = profile_id AND p.user_id = public.current_session_id()
  )
);

DROP POLICY IF EXISTS "Owner can update profile_skills" ON public.profile_skills;
CREATE POLICY "Owner can update profile_skills"
ON public.profile_skills FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = profile_id AND p.user_id = public.current_session_id()
  )
);

DROP POLICY IF EXISTS "Owner can delete profile_skills" ON public.profile_skills;
CREATE POLICY "Owner can delete profile_skills"
ON public.profile_skills FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = profile_id AND p.user_id = public.current_session_id()
  )
);


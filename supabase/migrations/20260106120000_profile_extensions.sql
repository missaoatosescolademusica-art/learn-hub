-- Migration: profile extensions for Supabase (auth.uid)
-- Date: 2026-01-06

-- 1) Extend profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS role TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- 2) Profile links
CREATE TABLE IF NOT EXISTS public.profile_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('website','linkedin','instagram','twitter')),
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (profile_id, kind)
);

ALTER TABLE public.profile_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner can select profile_links" ON public.profile_links;
CREATE POLICY "Owner can select profile_links"
ON public.profile_links FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = profile_id AND p.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Owner can insert profile_links" ON public.profile_links;
CREATE POLICY "Owner can insert profile_links"
ON public.profile_links FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = profile_id AND p.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Owner can update profile_links" ON public.profile_links;
CREATE POLICY "Owner can update profile_links"
ON public.profile_links FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = profile_id AND p.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Owner can delete profile_links" ON public.profile_links;
CREATE POLICY "Owner can delete profile_links"
ON public.profile_links FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = profile_id AND p.user_id = auth.uid()
  )
);

-- 3) Profile skills
CREATE TABLE IF NOT EXISTS public.profile_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  favorite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (profile_id, name)
);

ALTER TABLE public.profile_skills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner can select profile_skills" ON public.profile_skills;
CREATE POLICY "Owner can select profile_skills"
ON public.profile_skills FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = profile_id AND p.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Owner can insert profile_skills" ON public.profile_skills;
CREATE POLICY "Owner can insert profile_skills"
ON public.profile_skills FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = profile_id AND p.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Owner can update profile_skills" ON public.profile_skills;
CREATE POLICY "Owner can update profile_skills"
ON public.profile_skills FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = profile_id AND p.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Owner can delete profile_skills" ON public.profile_skills;
CREATE POLICY "Owner can delete profile_skills"
ON public.profile_skills FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = profile_id AND p.user_id = auth.uid()
  )
);


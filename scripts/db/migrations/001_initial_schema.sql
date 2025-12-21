-- Migration: 001_initial_schema
-- Description: Replicate Supabase schema for Neon Database (Adapted for Public Schema)
-- Date: 2025-12-21

-- SECTION: Compatibility Setup
-- We use public schema for everything to avoid permission issues with 'auth' schema on some Postgres providers.

-- Create a mock users table in public schema
CREATE TABLE IF NOT EXISTS public.users_mock (
  id UUID NOT NULL PRIMARY KEY,
  email TEXT,
  raw_user_meta_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create a mock current_session_id() function to replace auth.uid()
CREATE OR REPLACE FUNCTION public.current_session_id() 
RETURNS UUID AS $$
BEGIN
  -- Returns null by default. In a real app, you might use a session variable or JWT claim.
  -- For testing, you can set this variable in the transaction: SET app.current_user_id = '...';
  -- RETURN current_setting('app.current_user_id', true)::UUID;
  RETURN NULL::UUID; 
END;
$$ LANGUAGE plpgsql;

-- SECTION: Original Migration Logic (Adapted)

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  -- ADAPTED: References public.users_mock instead of auth.users
  user_id UUID NOT NULL UNIQUE REFERENCES public.users_mock(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
-- ADAPTED: Using public.current_session_id()
USING (public.current_session_id() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (public.current_session_id() = user_id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (public.current_session_id() = user_id);

-- Create video_progress table
CREATE TABLE IF NOT EXISTS public.video_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  -- ADAPTED: References public.users_mock instead of auth.users
  user_id UUID NOT NULL REFERENCES public.users_mock(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL,
  watched_seconds INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  last_watched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, video_id)
);

-- Enable RLS
ALTER TABLE public.video_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for video_progress
DROP POLICY IF EXISTS "Users can view their own progress" ON public.video_progress;
CREATE POLICY "Users can view their own progress"
ON public.video_progress FOR SELECT
USING (public.current_session_id() = user_id);

DROP POLICY IF EXISTS "Users can insert their own progress" ON public.video_progress;
CREATE POLICY "Users can insert their own progress"
ON public.video_progress FOR INSERT
WITH CHECK (public.current_session_id() = user_id);

DROP POLICY IF EXISTS "Users can update their own progress" ON public.video_progress;
CREATE POLICY "Users can update their own progress"
ON public.video_progress FOR UPDATE
USING (public.current_session_id() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
-- ADAPTED: Triggered by public.users_mock instead of auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name');
  RETURN new;
END;
$$;

-- Trigger to auto-create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON public.users_mock;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON public.users_mock
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

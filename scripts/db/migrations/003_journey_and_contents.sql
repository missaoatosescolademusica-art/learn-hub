-- Migration: 003_journey_and_contents
-- Description: Create tables for Journey (Levels, Tasks) and Contents (Catalog, Bookmarks, Progress)
-- Date: 2026-01-06

-- SECTION: Contents System

-- Create contents table
CREATE TABLE IF NOT EXISTS public.contents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('video', 'course', 'event', 'extra')),
  category TEXT, -- e.g., 'Frontend', 'Backend', 'Music Theory'
  thumbnail_url TEXT,
  video_url TEXT, -- URL or ID for the video player
  duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_bookmarks table
CREATE TABLE IF NOT EXISTS public.user_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES public.contents(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, content_id)
);

-- Create content_progress table (replacing/enhancing video_progress usage)
CREATE TABLE IF NOT EXISTS public.content_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES public.contents(id) ON DELETE CASCADE,
  watched_seconds INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  last_watched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, content_id)
);

-- SECTION: Journey System

-- Create levels table
CREATE TABLE IF NOT EXISTS public.levels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sequence_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL, -- Icon name from lucide-react
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(sequence_number)
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  level_id UUID NOT NULL REFERENCES public.levels(id) ON DELETE CASCADE,
  sequence_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL CHECK (task_type IN ('setup', 'deadline', 'content', 'quiz', 'milestone')),
  content_id UUID REFERENCES public.contents(id) ON DELETE SET NULL, -- Optional link to content
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(level_id, sequence_number)
);

-- Create user_level_progress table
CREATE TABLE IF NOT EXISTS public.user_level_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  level_id UUID NOT NULL REFERENCES public.levels(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('locked', 'active', 'completed')) DEFAULT 'locked',
  unlocked_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, level_id)
);

-- Create user_task_progress table
CREATE TABLE IF NOT EXISTS public.user_task_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed')) DEFAULT 'pending',
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, task_id)
);

-- Enable RLS
ALTER TABLE public.contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_level_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_task_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Contents: Everyone can read
CREATE POLICY "Everyone can read contents" ON public.contents
FOR SELECT USING (true);

-- Levels/Tasks: Everyone can read
CREATE POLICY "Everyone can read levels" ON public.levels
FOR SELECT USING (true);

CREATE POLICY "Everyone can read tasks" ON public.tasks
FOR SELECT USING (true);

-- User Bookmarks: User manages their own
CREATE POLICY "Users manage their own bookmarks" ON public.user_bookmarks
FOR ALL USING (public.current_session_id() = (SELECT user_id FROM public.profiles WHERE id = user_bookmarks.user_id));

-- Content Progress: User manages their own
CREATE POLICY "Users manage their own content progress" ON public.content_progress
FOR ALL USING (public.current_session_id() = (SELECT user_id FROM public.profiles WHERE id = content_progress.user_id));

-- Journey Progress: User manages their own
CREATE POLICY "Users manage their own level progress" ON public.user_level_progress
FOR ALL USING (public.current_session_id() = (SELECT user_id FROM public.profiles WHERE id = user_level_progress.user_id));

CREATE POLICY "Users manage their own task progress" ON public.user_task_progress
FOR ALL USING (public.current_session_id() = (SELECT user_id FROM public.profiles WHERE id = user_task_progress.user_id));

-- Triggers for updated_at
CREATE TRIGGER update_contents_updated_at BEFORE UPDATE ON public.contents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_content_progress_updated_at BEFORE UPDATE ON public.content_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_level_progress_updated_at BEFORE UPDATE ON public.user_level_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_task_progress_updated_at BEFORE UPDATE ON public.user_task_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

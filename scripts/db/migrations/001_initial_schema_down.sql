-- Migration Down: 001_initial_schema
-- Description: Revert changes from 001_initial_schema

-- 1. Drop Tables (This will automatically drop triggers and RLS policies attached to them)
-- Order matters due to Foreign Keys
DROP TABLE IF EXISTS public.video_progress;
DROP TABLE IF EXISTS public.profiles;
DROP TABLE IF EXISTS public.users_mock;

-- 2. Drop Functions
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.update_updated_at_column();
DROP FUNCTION IF EXISTS public.current_session_id();

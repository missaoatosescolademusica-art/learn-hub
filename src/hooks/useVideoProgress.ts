import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { VideoProgress } from "@/types/video";



export function useVideoProgress(videoId?: string) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<VideoProgress | null>(null);
  const [allProgress, setAllProgress] = useState<VideoProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch progress for a single video
  const fetchProgress = useCallback(async () => {
    if (!user || !videoId) {
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('video_progress')
      .select('video_id, watched_seconds, completed, last_watched_at')
      .eq('user_id', user.id)
      .eq('video_id', videoId)
      .maybeSingle();

    if (!error && data) {
      setProgress(data);
    }
    setIsLoading(false);
  }, [user, videoId]);

  // Fetch all progress for the user
  const fetchAllProgress = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('video_progress')
      .select('video_id, watched_seconds, completed, last_watched_at')
      .eq('user_id', user.id);

    if (!error && data) {
      setAllProgress(data);
    }
    setIsLoading(false);
  }, [user]);

  // Update progress
  const updateProgress = useCallback(async (
    targetVideoId: string,
    watchedSeconds: number,
    completed: boolean = false
  ) => {
    if (!user) return;

    const { error } = await supabase
      .from('video_progress')
      .upsert({
        user_id: user.id,
        video_id: targetVideoId,
        watched_seconds: watchedSeconds,
        completed,
        last_watched_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,video_id'
      });

    if (!error) {
      if (targetVideoId === videoId) {
        setProgress({
          video_id: targetVideoId,
          watched_seconds: watchedSeconds,
          completed,
          last_watched_at: new Date().toISOString(),
        });
      }
    }
  }, [user, videoId]);

  // Mark video as completed
  const markAsCompleted = useCallback(async (targetVideoId: string) => {
    await updateProgress(targetVideoId, 0, true);
  }, [updateProgress]);

  useEffect(() => {
    if (videoId) {
      fetchProgress();
    } else {
      fetchAllProgress();
    }
  }, [fetchProgress, fetchAllProgress, videoId]);

  return {
    progress,
    allProgress,
    isLoading,
    updateProgress,
    markAsCompleted,
    refreshProgress: videoId ? fetchProgress : fetchAllProgress,
  };
}

export interface VideoProgress {
  video_id: string;
  watched_seconds: number;
  completed: boolean;
  last_watched_at: string;
}
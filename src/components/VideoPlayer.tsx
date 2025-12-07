import { extractYouTubeId } from '@/hooks/useResources';

interface VideoPlayerProps {
  url: string;
  title?: string;
}

export function VideoPlayer({ url, title }: VideoPlayerProps) {
  const videoId = extractYouTubeId(url);

  if (!videoId) {
    return (
      <div className="aspect-video bg-secondary rounded-xl flex items-center justify-center">
        <p className="text-muted-foreground">Vídeo não disponível</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="aspect-video rounded-xl overflow-hidden bg-secondary shadow-card">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
          title={title || 'Video player'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    </div>
  );
}

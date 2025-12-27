import { Play, Clock, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Resource, extractYouTubeId } from '@/hooks/useResources';
import { cn } from '@/lib/utils';

interface VideoCardProps {
  resource: Resource;
  index: number;
}

const gradients = [
  'gradient-cyan',
  'gradient-primary',
  'gradient-magenta',
];

export function VideoCard({ resource, index }: VideoCardProps) {
  const videoId = extractYouTubeId(resource.path);
  const thumbnailUrl = videoId 
    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    : null;

  const formattedDate = new Date(resource.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Link
      to={`/dashboard/aula/${resource.id}`}
      state={{ resource }}
      className="group block animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 shadow-card hover:shadow-lg hover:-translate-y-1">
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={resource.originalName}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
              }}
            />
          ) : (
            <div
              className={cn(
                "w-full h-full",
                gradients[index % gradients.length]
              )}
            />
          )}

          {/* Play overlay */}
          <div className="absolute inset-0 bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300">
              <Play
                className="h-7 w-7 text-primary-foreground ml-1"
                fill="currentColor"
              />
            </div>
          </div>

          {/* Badge */}
          <div className="absolute top-3 right-3">
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-primary text-primary-foreground">
              {resource.categoryPath.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-lg font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {resource.originalName || "Aula sem título"}
          </h3>

          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>Vídeo aula</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { VideoPlayer } from '@/components/VideoPlayer';
import { Resource } from "@/types/resources";
import { ArrowLeft, Calendar, CheckCircle, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

export default function VideoLesson() {
  const location = useLocation();
  const navigate = useNavigate();
  const resource = location.state?.resource as Resource | undefined;
  const [isCompleted, setIsCompleted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  if (!resource) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Aula não encontrada
          </h2>
          <Button onClick={() => navigate("/dashboard")}>
            Voltar para o Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(resource.createdAt).toLocaleDateString(
    "pt-BR",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );

  const handleMarkComplete = () => {
    setIsCompleted(!isCompleted);
    toast.success(
      isCompleted ? "Aula desmarcada" : "Aula marcada como assistida!"
    );
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(
      isBookmarked ? "Removido dos favoritos" : "Adicionado aos favoritos!"
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="lg:pl-64">
        <div className="p-6 lg:p-10">
          {/* Back button */}
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para aulas
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Video Player */}
            <div className="lg:col-span-2 space-y-6">
              <VideoPlayer url={resource.path} title={resource.originalName} />

              {/* Video Info */}
              <div className="space-y-4">
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                  {resource.originalName || "Aula sem título"}
                </h1>

                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formattedDate}</span>
                  </div>
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                    {resource.type.toUpperCase()}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-border">
                  <Button
                    variant={isCompleted ? "default" : "outline"}
                    onClick={handleMarkComplete}
                    className="gap-2"
                  >
                    <CheckCircle className="h-5 w-5" />
                    {isCompleted ? "Assistida" : "Marcar como assistida"}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleBookmark}
                    className={
                      isBookmarked ? "text-primary border-primary" : ""
                    }
                  >
                    <Bookmark
                      className="h-5 w-5"
                      fill={isBookmarked ? "currentColor" : "none"}
                    />
                  </Button>
                </div>
              </div>
            </div>

            {/* Sidebar Content */}
            <div className="space-y-6">
              {/* Course Info Card */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Conteúdo
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-sm font-medium text-foreground flex-1 truncate">
                      {resource.originalName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Materials Card */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Materiais extras
                </h3>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
                    <Bookmark className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Não existem materiais extras relacionados a esta aula
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

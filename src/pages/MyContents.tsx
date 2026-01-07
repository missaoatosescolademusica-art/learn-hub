/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  MonitorPlay, 
  Bookmark,
  Clock,
  PlayCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface ContentItem {
  id: string;
  title: string;
  description: string | null;
  type: 'video' | 'course' | 'event' | 'extra';
  category: string | null;
  thumbnail_url: string | null;
  video_url: string | null;
  duration_seconds: number | null;
}

interface ContentProgress extends ContentItem {
  watched_seconds: number;
  is_completed: boolean;
  last_watched_at: string;
  progress_percent: number;
}

export default function MyContents() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [inProgressContents, setInProgressContents] = useState<ContentProgress[]>([]);
  const [savedContents, setSavedContents] = useState<ContentItem[]>([]);
  const [filterType, setFilterType] = useState<string>('all');

  

  const loadContents = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get profile id
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!profileData) return;

      // Load in-progress contents
      const { data: progressData, error: progressError } = await supabase
        .from('content_progress')
        .select(`
          watched_seconds,
          is_completed,
          last_watched_at,
          content:contents (
            id,
            title,
            description,
            type,
            category,
            thumbnail_url,
            video_url,
            duration_seconds
          )
        `)
        .eq('user_id', profileData.id)
        .eq('is_completed', false)
        .order('last_watched_at', { ascending: false });

      if (progressError) throw progressError;

      // Load saved contents (bookmarks)
      const { data: bookmarksData, error: bookmarksError } = await supabase
        .from('user_bookmarks')
        .select(`
          content:contents (
            id,
            title,
            description,
            type,
            category,
            thumbnail_url,
            video_url,
            duration_seconds
          )
        `)
        .eq('user_id', profileData.id)
        .order('created_at', { ascending: false });

      if (bookmarksError) throw bookmarksError;

      // Format progress data
      const formattedProgress = (progressData || []).map((item: any) => {
        const content = item.content;
        const duration = content.duration_seconds || 1;
        const progress = Math.min(100, Math.round((item.watched_seconds / duration) * 100));
        
        return {
          ...content,
          watched_seconds: item.watched_seconds,
          is_completed: item.is_completed,
          last_watched_at: item.last_watched_at,
          progress_percent: progress
        };
      });

      // Format bookmarks data
      const formattedBookmarks = (bookmarksData || []).map((item: any) => item.content);

      setInProgressContents(formattedProgress);
      setSavedContents(formattedBookmarks);
    } catch (error) {
      console.error('Error loading contents:', error);
      toast.error('Erro ao carregar conteúdos');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);
  
  useEffect(() => {
    if (user) {
      loadContents();
    }
  }, [user, loadContents]);

  const getFilteredProgress = () => {
    if (filterType === 'all') return inProgressContents;
    // Map UI filters to database types if needed, for now simplistic mapping
    // 'FORMAÇÃO' -> 'course', 'CURSO' -> 'course', 'EVENTO' -> 'event', 'EXTRAS' -> 'extra'
    // Adjust logic as per business rules
    return inProgressContents.filter(c => {
      if (filterType === 'course') return c.type === 'course';
      if (filterType === 'event') return c.type === 'event';
      if (filterType === 'extra') return c.type === 'extra';
      return true;
    });
  };

  const filteredProgress = getFilteredProgress();

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Meus conteúdos</h1>
        <p className="text-muted-foreground">
          Acesse seus conteúdos salvos, assistidos e criados
        </p>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="in_progress" className="w-full">
        <TabsList className="bg-transparent p-0 h-auto border-b border-border w-full justify-start rounded-none space-x-6 mb-6">
          <TabsTrigger 
            value="in_progress" 
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 text-muted-foreground data-[state=active]:text-foreground hover:text-foreground transition-colors gap-2"
          >
            <MonitorPlay className="w-4 h-4" />
            Em andamento
          </TabsTrigger>
          <TabsTrigger 
            value="saved" 
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 text-muted-foreground data-[state=active]:text-foreground hover:text-foreground transition-colors gap-2"
          >
            <Bookmark className="w-4 h-4" />
            Salvos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="in_progress" className="space-y-8">
          {/* Filters */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Conteúdos em progresso</h3>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={filterType === 'all' ? "secondary" : "ghost"} 
                size="sm" 
                onClick={() => setFilterType('all')}
                className={`rounded-full px-4 h-7 text-xs font-semibold ${filterType === 'all' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-secondary/30 hover:bg-secondary text-muted-foreground hover:text-foreground border border-transparent hover:border-border'}`}
              >
                TODOS
              </Button>
              <Button 
                variant={filterType === 'course' ? "secondary" : "ghost"} 
                size="sm" 
                onClick={() => setFilterType('course')}
                className={`rounded-full px-4 h-7 text-xs font-semibold ${filterType === 'course' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-secondary/30 hover:bg-secondary text-muted-foreground hover:text-foreground border border-transparent hover:border-border'}`}
              >
                CURSOS/FORMAÇÃO
              </Button>
              <Button 
                variant={filterType === 'event' ? "secondary" : "ghost"} 
                size="sm" 
                onClick={() => setFilterType('event')}
                className={`rounded-full px-4 h-7 text-xs font-semibold ${filterType === 'event' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-secondary/30 hover:bg-secondary text-muted-foreground hover:text-foreground border border-transparent hover:border-border'}`}
              >
                EVENTO GRAVADO
              </Button>
              <Button 
                variant={filterType === 'extra' ? "secondary" : "ghost"} 
                size="sm" 
                onClick={() => setFilterType('extra')}
                className={`rounded-full px-4 h-7 text-xs font-semibold ${filterType === 'extra' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-secondary/30 hover:bg-secondary text-muted-foreground hover:text-foreground border border-transparent hover:border-border'}`}
              >
                CONTEÚDOS EXTRAS
              </Button>
            </div>
          </div>

          {/* Content Grid or Empty State */}
          {filteredProgress.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProgress.map((content) => (
                <Card key={content.id} className="overflow-hidden hover:shadow-lg transition-shadow border-border/50 bg-card/50 backdrop-blur-sm group cursor-pointer">
                  <div className="aspect-video relative bg-muted">
                    {content.thumbnail_url ? (
                      <img 
                        src={content.thumbnail_url} 
                        alt={content.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-secondary/20">
                        <MonitorPlay className="w-12 h-12 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <PlayCircle className="w-12 h-12 text-white drop-shadow-lg" />
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {Math.floor((content.duration_seconds || 0) / 60)} min
                    </div>
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-primary uppercase">{content.category || content.type}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(content.last_watched_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">{content.title}</h3>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progresso</span>
                        <span>{content.progress_percent}%</span>
                      </div>
                      <Progress value={content.progress_percent} className="h-1.5" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-secondary/20 flex items-center justify-center mb-2">
                 <MonitorPlay className="w-8 h-8 text-muted-foreground/50" strokeWidth={1.5} />
              </div>
              <div className="space-y-2 max-w-sm">
                <p className="text-muted-foreground">
                  {filterType === 'all' 
                    ? "Comece a estudar para ver seus conteúdos recentes em progresso"
                    : "Nenhum conteúdo deste tipo em progresso"}
                </p>
              </div>
              <Button className="bg-primary hover:bg-primary/90 text-white font-semibold px-8" onClick={() => navigate('/dashboard')}>
                Explorar catálogo
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="saved" className="space-y-8">
          {savedContents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedContents.map((content) => (
                <Card key={content.id} className="overflow-hidden hover:shadow-lg transition-shadow border-border/50 bg-card/50 backdrop-blur-sm group cursor-pointer">
                  <div className="aspect-video relative bg-muted">
                    {content.thumbnail_url ? (
                      <img 
                        src={content.thumbnail_url} 
                        alt={content.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-secondary/20">
                        <Bookmark className="w-12 h-12 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <PlayCircle className="w-12 h-12 text-white drop-shadow-lg" />
                    </div>
                    <div className="absolute top-2 right-2 bg-primary text-white p-1.5 rounded-full shadow-lg">
                      <Bookmark className="w-4 h-4 fill-current" />
                    </div>
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div className="space-y-1">
                      <span className="text-xs font-medium text-primary uppercase">{content.category || content.type}</span>
                      <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">{content.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">{content.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <div className="w-16 h-16 rounded-2xl bg-secondary/20 flex items-center justify-center mb-6">
                 <Bookmark className="w-8 h-8 text-muted-foreground/50" strokeWidth={1.5} />
              </div>
              <p>Seus conteúdos salvos aparecerão aqui...</p>
              <Button variant="link" onClick={() => navigate('/dashboard')}>
                Explorar conteúdos para salvar
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

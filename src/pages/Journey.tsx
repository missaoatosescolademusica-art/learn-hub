/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Trophy, 
  Lock, 
  Flag, 
  CheckCircle2, 
  Circle,
  Star,
  Monitor,
  Server,
  Smartphone,
  Briefcase,
  Calendar,
  PlayCircle,
  Telescope,
  Flame,
  Zap,
  Target,
  Search,
  Bell,
  Music,
  Layout
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from '@/integrations/supabase/client';
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from '@/components/ui/input';
import { Sidebar } from '@/components/Sidebar';
import { UserDropdown } from '@/components/UserDropdown';
import { toast } from 'sonner';

// Icon mapping
const ICON_MAP: Record<string, any> = {
  Star, Trophy, Lock, Flag, Monitor, Server, Smartphone, Briefcase, Calendar, PlayCircle, Telescope, Flame, Zap, Target, Music, Layout
};

// Types
interface Level {
  id: string;
  name: string;
  sequence_number: number;
  status: 'locked' | 'active' | 'completed';
  icon: any;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'locked' | 'active' | 'completed' | 'pending';
  type: string;
  sequence_number: number;
}

const ACHIEVEMENTS_CATEGORIES = [
  {
    title: "Tempo de estudo",
    items: [
      { id: 1, title: "Dias em sequência 2x", icon: Flame, earned: true, value: "2", label: "Dias" },
      { id: 2, title: "Dias em sequência 5x", icon: Flame, earned: false, value: "5", label: "Dias" },
      { id: 3, title: "Dias em sequência 20x", icon: Flame, earned: false, value: "20", label: "Dias" },
      { id: 4, title: "Semana em sequência 4x", icon: Zap, earned: false, value: "4", label: "Semanas" },
      { id: 5, title: "Semana em sequência 12x", icon: Zap, earned: false, value: "12", label: "Semanas" },
      { id: 6, title: "Semana em sequência 40x", icon: Zap, earned: false, value: "40", label: "Semanas" },
      { id: 7, title: "Mês em sequência 2x", icon: Calendar, earned: false, value: "2", label: "Meses" },
      { id: 8, title: "Mês em sequência 5x", icon: Calendar, earned: false, value: "5", label: "Meses" },
    ]
  },
  {
    title: "Metas de estudo",
    items: [
      { id: 9, title: "Meta semanal 1x", icon: Target, earned: true, value: "1", label: "Meta Semanal" },
      { id: 10, title: "Meta semanal 5x", icon: Target, earned: false, value: "5", label: "Meta Semanal" },
      { id: 11, title: "Meta semanal 15x", icon: Target, earned: false, value: "15", label: "Meta Semanal" },
    ]
  }
];

export default function Journey() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [levels, setLevels] = useState<Level[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [currentLevelId, setCurrentLevelId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock Overview Data (Still mocked as we didn't create tables for this specific dashboard part yet)
  const competencies = [
    { name: 'Frontend', icon: Monitor, progress: 0, time: '00h de estudo' },
    { name: 'Backend', icon: Server, progress: 0, time: '00h de estudo' },
    { name: 'Mobile', icon: Smartphone, progress: 0, time: '00h de estudo' },
    { name: 'Carreira', icon: Briefcase, progress: 0, time: '00h de estudo' },
  ];

  const loadTasks = useCallback(async (levelId: string) => {
    if (!user?.id) return;

    try {
      // 1. Fetch Tasks for Level
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('level_id', levelId)
        .order('sequence_number');

      if (tasksError) throw tasksError;

      // 2. Fetch User Task Progress
      const { data: taskProgress, error: progressError } = await supabase
        .from('user_task_progress')
        .select('*')
        .eq('user_id', user.id)
        .in('task_id', tasksData.map(t => t.id));

      if (progressError) throw progressError;

      // Process tasks
      const processedTasks: Task[] = tasksData.map((task, index) => {
        const progress = taskProgress?.find(p => p.task_id === task.id);
        const isCompleted = progress?.status === 'completed';
        
        let status: Task['status'] = 'active'; 
        
        if (isCompleted) {
          status = 'completed';
        } else {
           if (index > 0) {
             const prevTask = tasksData[index - 1];
             const prevProgress = taskProgress?.find(p => p.task_id === prevTask.id);
             if (prevProgress?.status !== 'completed') {
               status = 'locked';
             }
           }
        }

        return {
          id: task.id,
          title: task.title,
          description: task.description || '',
          status,
          type: task.task_type,
          sequence_number: task.sequence_number
        };
      });

      setTasks(processedTasks);
      if (processedTasks.length > 0) {
        const firstAvailable = processedTasks.find(t => t.status !== 'locked') || processedTasks[0];
        setSelectedTask(firstAvailable);
      }

    } catch (error) {
      console.error("Error loading tasks:", error);
    }
  }, [user?.id]);
  useEffect(() => {
    async function loadJourneyData() {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);

        // 1. Fetch Levels
        const { data: levelsData, error: levelsError } = await supabase
          .from('levels')
          .select('*')
          .order('sequence_number');
        
        if (levelsError) throw levelsError;

        // 2. Fetch User Level Progress
        const { data: userProgress, error: progressError } = await supabase
          .from('user_level_progress')
          .select('*')
          .eq('user_id', user.id);
        
        if (progressError) throw progressError;

        // Merge levels with progress
        const processedLevels: Level[] = levelsData.map(level => {
          const progress = userProgress?.find(p => p.level_id === level.id);
          // Default to locked unless it's the first level or has progress
          let status: Level['status'] = 'locked';
          if (level.sequence_number === 1) status = 'active'; // First level always active by default if no progress
          if (progress) status = progress.status;

          return {
            id: level.id,
            name: level.name,
            sequence_number: level.sequence_number,
            status,
            icon: ICON_MAP[level.icon] || Star
          };
        });

        setLevels(processedLevels);

        // Determine current active level to fetch tasks for
        const activeLevel = processedLevels.find(l => l.status === 'active') || processedLevels[0];
        if (activeLevel) {
          setCurrentLevelId(activeLevel.id);
          await loadTasks(activeLevel.id);
        }

      } catch (error) {
        console.error("Error loading journey:", error);
        toast.error("Erro ao carregar jornada");
      } finally {
        setIsLoading(false);
      }
    }

    loadJourneyData();
  }, [user?.id, loadTasks]);

  

  const handleLevelClick = async (level: Level) => {
    if (level.status === 'locked') return;
    setCurrentLevelId(level.id);
    await loadTasks(level.id);
  };

  const handleTaskStart = async () => {
    if (!selectedTask || !user?.id) return;
    
    // Example: Mark as completed or navigate to content
    // For now, let's just mark it as completed to show interaction
    try {
      const { error } = await supabase.from('user_task_progress').upsert({
        user_id: user.id,
        task_id: selectedTask.id,
        status: 'completed',
        completed_at: new Date().toISOString()
      }, { onConflict: 'user_id,task_id' });

      if (error) throw error;
      
      toast.success("Tarefa iniciada/concluída!");
      
      // Reload tasks to update status
      if (currentLevelId) await loadTasks(currentLevelId);
      
    } catch (error) {
      toast.error("Erro ao atualizar tarefa");
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      
      
      <main className="flex-1 ">
        <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
          
        
      

          {/* Navigation Tabs */}
          <Tabs defaultValue="guide" className="w-full">
            <TabsList className="bg-transparent p-0 h-auto border-b border-border w-full justify-start rounded-none space-x-6">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 text-muted-foreground data-[state=active]:text-foreground hover:text-foreground transition-colors"
              >
                Visão geral
              </TabsTrigger>
              <TabsTrigger 
                value="guide" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 text-muted-foreground data-[state=active]:text-foreground hover:text-foreground transition-colors"
              >
                Guia de Jornada
              </TabsTrigger>
              <TabsTrigger 
                value="achievements" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 text-muted-foreground data-[state=active]:text-foreground hover:text-foreground transition-colors"
              >
                Conquistas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="guide" className="mt-8 space-y-10">
              
              {/* Level Map */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Mapa de níveis</h3>
                <ScrollArea className="w-full pb-4">
                  <div className="flex items-center gap-4 min-w-max px-1">
                    {levels.length === 0 ? (
                        <div className="text-muted-foreground text-sm">Nenhum nível encontrado.</div>
                    ) : (
                        levels.map((level, index) => {
                        const Icon = level.icon;
                        const isLast = index === levels.length - 1;
                        
                        return (
                            <div key={level.id} className="flex items-center">
                            <div 
                                onClick={() => handleLevelClick(level)}
                                className={cn(
                                "relative group flex flex-col items-center justify-center w-24 h-24 rounded-2xl border transition-all duration-300 cursor-pointer",
                                level.status === 'active' 
                                    ? "bg-card border-primary/50 shadow-[0_0_15px_rgba(124,58,237,0.15)]" 
                                    : "bg-card/30 border-border/50 opacity-70",
                                level.id === currentLevelId && "ring-2 ring-primary"
                                )}
                            >
                                <div className={cn(
                                "p-3 rounded-full mb-2 transition-colors",
                                level.status === 'active' ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                                )}>
                                <Icon className="w-5 h-5" />
                                </div>
                                <span className={cn(
                                "text-xs font-medium",
                                level.status === 'active' ? "text-foreground" : "text-muted-foreground"
                                )}>
                                {level.name}
                                </span>
                                
                                {level.status === 'locked' && (
                                <div className="absolute bottom-3 w-12 h-3 bg-foreground/5 blur-sm rounded-full" />
                                )}
                            </div>
                            
                            {!isLast && (
                                <div className="w-8 h-[2px] border-t-2 border-dashed border-border mx-2" />
                            )}
                            </div>
                        );
                        })
                    )}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </div>

              {/* Tasks and Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Tasks List */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-muted-foreground">Tarefas • {levels.find(l => l.id === currentLevelId)?.name || 'Início'}</h3>
                    <span className="text-xs text-muted-foreground">{tasks.length} itens</span>
                  </div>

                  <div className="space-y-3">
                    {tasks.length === 0 ? (
                         <div className="p-4 rounded-xl border border-border border-dashed text-center text-muted-foreground text-sm">
                            Nenhuma tarefa neste nível.
                         </div>
                    ) : (
                        tasks.map((task) => (
                        <div
                            key={task.id}
                            onClick={() => task.status !== 'locked' && setSelectedTask(task)}
                            className={cn(
                            "p-4 rounded-xl border cursor-pointer transition-all duration-200 flex items-center gap-3",
                            selectedTask?.id === task.id 
                                ? "bg-primary/5 border-primary shadow-sm" 
                                : "bg-card border-border hover:border-primary/30",
                            task.status === 'locked' && "opacity-60 cursor-not-allowed hover:border-border"
                            )}
                        >
                            {task.status === 'completed' ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                            ) : task.status === 'locked' ? (
                            <Lock className="w-5 h-5 text-muted-foreground shrink-0" />
                            ) : (
                            <Circle className={cn(
                                "w-5 h-5 shrink-0",
                                selectedTask?.id === task.id ? "text-primary" : "text-muted-foreground"
                            )} />
                            )}
                            
                            <span className={cn(
                            "text-sm font-medium",
                            selectedTask?.id === task.id ? "text-foreground" : "text-muted-foreground"
                            )}>
                            {task.title}
                            </span>
                        </div>
                        ))
                    )}
                  </div>
                </div>

                {/* Task Details */}
                <div className="lg:col-span-8 space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Detalhes da tarefa</h3>
                  
                  {selectedTask ? (
                    <div className="bg-card rounded-2xl border border-border p-8 min-h-[400px] flex flex-col relative overflow-hidden">
                        <div className="flex-1">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                            <h2 className="text-2xl font-bold text-foreground mb-2">{selectedTask.title}</h2>
                            <p className="text-muted-foreground text-lg">{selectedTask.description}</p>
                            </div>
                        </div>
                        
                        {/* Content placeholder */}
                        <div className="mt-8 p-6 bg-secondary/20 rounded-xl border border-border/50 border-dashed">
                            <p className="text-center text-muted-foreground text-sm">
                            Conteúdo da tarefa: {selectedTask.type}
                            </p>
                        </div>
                        </div>

                        {/* Footer / Action */}
                        <div className="mt-8 flex justify-end">
                        <Button className="gap-2" onClick={handleTaskStart}>
                            {selectedTask.status === 'completed' ? 'Refazer tarefa' : 'Começar tarefa'}
                            <ArrowLeft className="w-4 h-4 rotate-180" />
                        </Button>
                        </div>

                        {/* Background Decorative Flag */}
                        <Flag className="absolute -bottom-6 -right-6 w-64 h-64 text-secondary/5 rotate-[-15deg]" />
                    </div>
                  ) : (
                      <div className="bg-card rounded-2xl border border-border p-8 min-h-[400px] flex items-center justify-center text-muted-foreground">
                          Selecione uma tarefa para ver os detalhes
                      </div>
                  )}
                </div>

              </div>
            </TabsContent>
            
            <TabsContent value="overview" className="mt-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column */}
                <div className="lg:col-span-1 space-y-6">
                  
                  {/* Profile Card */}
                  <Card className="overflow-hidden border-border bg-card">
                    <div className="h-24 bg-gradient-to-r from-purple-900 to-indigo-900 relative">
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="absolute top-4 right-4 h-7 text-xs bg-black/20 hover:bg-black/40 text-white border-none backdrop-blur-sm"
                      >
                        Ver perfil
                      </Button>
                    </div>
                    <CardContent className="pt-0 relative">
                      <div className="flex items-end -mt-10 mb-3 px-1">
                        <Avatar className="w-20 h-20 border-4 border-card rounded-full shadow-lg">
                          <AvatarImage src={user?.image || "https://github.com/shadcn.png"} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                            {user?.name?.substring(0, 2).toUpperCase() || "UN"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-3 mb-2 overflow-hidden">
                          <h3 className="font-bold text-lg truncate" title={user?.name || "Usuário"}>
                            {user?.name || "Usuário"}
                          </h3>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Competencies Card */}
                  <Card className="border-border bg-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Competências estudadas
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {competencies.map((comp) => (
                        <div key={comp.name} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-secondary/50 text-foreground">
                                <comp.icon className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="font-medium text-sm text-foreground">{comp.name}</p>
                                <p className="text-xs text-muted-foreground">{comp.time}</p>
                              </div>
                            </div>
                            <span className="text-sm font-medium text-foreground">{comp.progress}%</span>
                          </div>
                          <Progress value={comp.progress} className="h-1.5" />
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                </div>

                {/* Middle Column - Technologies/Catalog */}
                <div className="lg:col-span-1">
                  <Card className="h-full border-border bg-card flex flex-col">
                    <CardHeader className="pb-0">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Tecnologias estudadas
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center text-muted-foreground mb-2">
                        <PlayCircle className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-foreground">
                          Defina uma meta e acompanhe o seu progresso semanal
                        </h3>
                      </div>
                      <Button variant="secondary" className="mt-4">
                        Ir para o catálogo
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column - Weekly Goal & Journey Shortcut */}
                <div className="lg:col-span-1 space-y-6">
                  
                  {/* Weekly Goal */}
                  <Card className="border-border bg-card">
                    <CardHeader className="pb-0">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Meta semanal
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                      <div className="w-12 h-12 rounded-lg bg-transparent border-2 border-dashed border-muted-foreground/30 flex items-center justify-center text-muted-foreground mb-2">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">
                          Defina uma meta e acompanhe o seu progresso semanal
                        </h3>
                      </div>
                      <Button variant="secondary" className="w-full">
                        Definir meta
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Journey Shortcut */}
                  <Card className="border-border bg-card">
                    <CardHeader className="pb-0">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Guia de Jornada
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between p-6">
                      <div className="flex-1">
                         <div className="w-full h-12 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg flex items-center justify-center">
                            {/* Placeholder for small visualization */}
                         </div>
                      </div>
                      <Button variant="secondary" className="ml-4 gap-2">
                        <Telescope className="w-4 h-4" />
                        Definir objetivo
                      </Button>
                    </CardContent>
                  </Card>

                </div>

              </div>
            </TabsContent>
            
            <TabsContent value="achievements" className="mt-8 space-y-10">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-foreground">Suas conquistas</h2>
              </div>

              {ACHIEVEMENTS_CATEGORIES.map((category, index) => (
                <div key={index} className="space-y-6">
                  <h3 className="text-sm font-medium text-muted-foreground">{category.title}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {category.items.map((achievement) => (
                      <div 
                        key={achievement.id}
                        className={cn(
                          "group flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 min-h-[160px] text-center relative overflow-hidden",
                          achievement.earned 
                            ? "bg-card border-primary/20 shadow-[0_0_15px_rgba(124,58,237,0.1)]" 
                            : "bg-card/30 border-border/50 opacity-60 hover:opacity-100 hover:bg-card/50"
                        )}
                      >
                        <div className={cn(
                          "w-20 h-20 rounded-full flex items-center justify-center mb-4 border-2 relative z-10",
                          achievement.earned 
                            ? "border-primary/50 bg-primary/5 text-primary" 
                            : "border-muted-foreground/20 bg-muted/5 text-muted-foreground"
                        )}>
                          {/* Inner Circle Decoration */}
                          <div className={cn(
                            "absolute inset-1 rounded-full border border-dashed",
                            achievement.earned ? "border-primary/30" : "border-muted-foreground/20"
                          )} />
                          
                          <div className="flex flex-col items-center justify-center">
                             <achievement.icon className={cn("w-6 h-6 mb-1", achievement.earned && "fill-primary/20")} strokeWidth={1.5} />
                             {/* <span className="text-[10px] uppercase font-bold tracking-wider">{achievement.label}</span> */}
                          </div>

                          {/* Badge Value - Center overlay */}
                          {achievement.value && (
                             <div className={cn(
                               "absolute inset-0 flex items-center justify-center pointer-events-none opacity-10",
                               achievement.earned ? "text-primary" : "text-foreground"
                             )}>
                                <span className="text-6xl font-black">{achievement.value}</span>
                             </div>
                          )}
                        </div>
                        
                        <span className={cn(
                          "text-sm font-medium leading-tight z-10",
                          achievement.earned ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {achievement.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>

        </div>
      </main>
    </div>
  );
}

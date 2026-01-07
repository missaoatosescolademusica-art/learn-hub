/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Pencil, 
  Share2, 
  CheckCircle2, 
  Circle, 
  Globe, 
  Linkedin, 
  Instagram, 
  Twitter, 
  MapPin, 
  Camera,
  Trash2,
  Plus,
  Music,
  Music2,
  Mic2,
  Guitar,
  Piano,
  Drum,
  Speaker,
  Headphones,
  Radio,
  Disc,
  Play,
  ListMusic,
  Mic,
  Star,
  Code2,
  Database,
  Layers
} from 'lucide-react';
import { toast } from 'sonner';

// Map of icon names to components
const ICON_MAP: Record<string, any> = {
  "Music": Music,
  "Music2": Music2,
  "Mic2": Mic2,
  "Guitar": Guitar,
  "Piano": Piano,
  "Drum": Drum,
  "Speaker": Speaker,
  "Headphones": Headphones,
  "Radio": Radio,
  "Disc": Disc,
  "Play": Play,
  "ListMusic": ListMusic,
  "Mic": Mic,
  "Code2": Code2,
  "Database": Database,
  "Layers": Layers,
};

// Available icons for selection (Music related)
const AVAILABLE_ICONS = [
  "Music", "Music2", "Mic2", "Guitar", "Piano", "Drum", 
  "Speaker", "Headphones", "Radio", "Disc", "Play", "ListMusic", "Mic"
];

interface Skill {
  id?: string;
  name: string;
  icon: string;
  favorite?: boolean;
}

export default function Profile() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  // State for user profile details
  const [profile, setProfile] = useState({
    bio: "",
    role: "",
    location: "",
    joinDate: "",
    tags: [] as Skill[],
    coverImage: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop",
    avatarUrl: "" as string | null,
    links: {
      website: "",
      linkedin: "",
      instagram: "",
      twitter: ""
    }
  });

  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioTemp, setBioTemp] = useState("");
  
  const [isEditingLinks, setIsEditingLinks] = useState(false);
  const [linksTemp, setLinksTemp] = useState(profile.links);

  // Skills Editing State
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [skillsTemp, setSkillsTemp] = useState<Skill[]>([]);
  const [newSkillName, setNewSkillName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("Music");
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [isSyncingAvatar, setIsSyncingAvatar] = useState(false);
  const isDataUrl = (url?: string | null) => !!url && url.startsWith('data:');
  const ensureBucket = async () => {
    const { data } = await supabase.storage.getBucket('avatars');
    if (!data) {
      await supabase.storage.createBucket('avatars', { public: true });
    }
  };
  const syncPendingAvatar = useCallback(async () => {
    if (!user?.id || !navigator.onLine || isSyncingAvatar) return;
    try {
      setIsSyncingAvatar(true);
      let dataUrl: string | null = null;
      try { dataUrl = localStorage.getItem('pendingAvatar'); } catch (e) { void e; }
      if (!dataUrl && isDataUrl(profile.avatarUrl)) {
        dataUrl = profile.avatarUrl as string;
      }
      if (!dataUrl) return;
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      await ensureBucket();
      const ext = (blob.type?.split('/')[1]) || 'png';
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, blob, {
        upsert: true,
        contentType: blob.type || 'image/png'
      });
      if (uploadError) throw uploadError;
      const { data: publicData } = supabase.storage.from('avatars').getPublicUrl(path);
      const publicUrl = publicData.publicUrl;
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);
      if (updateError) throw updateError;
      setProfile(prev => ({ ...prev, avatarUrl: publicUrl }));
      try { localStorage.removeItem('pendingAvatar'); } catch (e) { void e; }
      toast.success("Foto sincronizada com sucesso!");
    } catch (e) {
      void e;
    } finally {
      setIsSyncingAvatar(false);
    }
  }, [user?.id, profile.avatarUrl, isSyncingAvatar]);

  // Load profile data
  useEffect(() => {
    async function loadProfile() {
      if (!user?.id) return;

      try {
        setIsLoading(true);

        // 1. Get Profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error loading profile:', profileError);
          return;
        }

        // 2. Get Links
        const { data: linksData, error: linksError } = await supabase
          .from('profile_links')
          .select('*')
          .eq('profile_id', profileData?.id);

        if (linksError) console.error('Error loading links:', linksError);

        // 3. Get Skills
        const { data: skillsData, error: skillsError } = await supabase
          .from('profile_skills')
          .select('*')
          .eq('profile_id', profileData?.id);

        if (skillsError) console.error('Error loading skills:', skillsError);

        // Transform links to object
        const linksObj = {
          website: linksData?.find(l => l.kind === 'website')?.url || "",
          linkedin: linksData?.find(l => l.kind === 'linkedin')?.url || "",
          instagram: linksData?.find(l => l.kind === 'instagram')?.url || "",
          twitter: linksData?.find(l => l.kind === 'twitter')?.url || ""
        };

        // Transform skills
        const skillsList = skillsData?.map(s => ({
          id: s.id,
          name: s.name,
          icon: s.icon_name, // Map from DB column 'icon_name'
          favorite: s.favorite
        })) || [];

        setProfile({
          bio: profileData?.bio || "",
          role: profileData?.role || "Estudante",
          location: profileData?.location || "",
          joinDate: profileData?.created_at ? new Date(profileData.created_at).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR'),
          tags: skillsList,
          coverImage: profileData?.cover_image_url || "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop",
          avatarUrl: profileData?.avatar_url || null,
          links: linksObj
        });

      } catch (error) {
        console.error('Error:', error);
        toast.error('Erro ao carregar perfil');
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [user?.id]);
  useEffect(() => {
    const handleOnline = () => {
      syncPendingAvatar();
    };
    window.addEventListener('online', handleOnline);
    if (navigator.onLine) {
      syncPendingAvatar();
    }
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [user?.id, profile.avatarUrl, syncPendingAvatar]);

  const handleOpenSkillsModal = () => {
    setSkillsTemp([...profile.tags]);
    setIsEditingSkills(true);
    setNewSkillName("");
    setSelectedIcon("Music");
    setIsIconPickerOpen(false);
  };

  const handleAddSkill = () => {
    if (!newSkillName.trim()) {
      toast.error("Digite o nome da habilidade");
      return;
    }
    // Add locally first with temporary ID
    setSkillsTemp([...skillsTemp, { name: newSkillName, icon: selectedIcon, favorite: false }]);
    setNewSkillName("");
    setSelectedIcon("Music");
    setIsIconPickerOpen(false);
  };

  const handleRemoveSkill = (index: number) => {
    setSkillsTemp(skillsTemp.filter((_, i) => i !== index));
  };

  const handleSaveSkills = async () => {
    try {
      // Get profile ID first
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!profileData) return;

      // Determine which to delete (in original but not in temp)
      const originalIds = profile.tags.map(t => t.id).filter(Boolean) as string[];
      const currentIds = skillsTemp.map(t => t.id).filter(Boolean) as string[];
      const toDelete = originalIds.filter(id => !currentIds.includes(id));

      // Delete removed skills
      if (toDelete.length > 0) {
        await supabase.from('profile_skills').delete().in('id', toDelete);
      }

      // Upsert current skills
      // We process one by one or batch, but we need to handle "new" ones (no ID) vs existing
      for (const skill of skillsTemp) {
        if (skill.id) {
          // Update existing if needed (though we only really add/remove here currently, name/icon edit isn't UI supported yet)
           await supabase
            .from('profile_skills')
            .update({ name: skill.name, icon_name: skill.icon, favorite: skill.favorite || false })
            .eq('id', skill.id);
        } else {
          // Insert new
          await supabase
            .from('profile_skills')
            .insert({
              profile_id: profileData.id,
              name: skill.name,
              icon_name: skill.icon,
              favorite: skill.favorite || false
            });
        }
      }

      setProfile(prev => ({ ...prev, tags: skillsTemp }));
      setIsEditingSkills(false);
      toast.success("Habilidades atualizadas com sucesso!");
      
      // Reload to get new IDs
      window.location.reload(); // Simple reload or re-fetch would be better
      
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar habilidades");
    }
  };

  const handleSaveBio = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ bio: bioTemp })
        .eq('user_id', user?.id);

      if (error) throw error;

      setProfile(prev => ({ ...prev, bio: bioTemp }));
      setIsEditingBio(false);
      toast.success("Sobre atualizado com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar bio");
    }
  };

  const handleSaveLinks = async () => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!profileData) return;

      const linkKinds = ['website', 'linkedin', 'instagram', 'twitter'] as const;
      for (const kind of linkKinds) {
        const url = linksTemp[kind];
        // Check if exists
        const { data: existing } = await supabase
          .from('profile_links')
          .select('id')
          .eq('profile_id', profileData.id)
          .eq('kind', kind)
          .single();

        if (existing) {
            if (url) {
                await supabase.from('profile_links').update({ url }).eq('id', existing.id);
            } else {
                await supabase.from('profile_links').delete().eq('id', existing.id);
            }
        } else if (url) {
            await supabase.from('profile_links').insert({
                profile_id: profileData.id,
                kind,
                url
            });
        }
      }

      setProfile(prev => ({ ...prev, links: linksTemp }));
      setIsEditingLinks(false);
      toast.success("Links atualizados com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar links");
    }
  };

  const handleCoverUpload = () => {
    // Mock upload
    toast.success("Imagem de capa atualizada!");
  };

  const handleAvatarUploadOpen = () => {
    setIsAvatarDialogOpen(true);
  };
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    setAvatarFile(file);
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
  };
  const handleAvatarPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          setAvatarFile(file);
          const url = URL.createObjectURL(file);
          setAvatarPreview(url);
        }
        break;
      }
    }
  };
  
  const handleSaveAvatar = async () => {
    if (!user?.id || !avatarFile) return;
    try {
      setIsSavingAvatar(true);
      let newUrl: string | null = null;
      try {
        if (!navigator.onLine) {
          const toDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          newUrl = await toDataUrl(avatarFile);
          try { localStorage.setItem('pendingAvatar', newUrl); } catch (e) { void e; }
          setProfile(prev => ({ ...prev, avatarUrl: newUrl }));
          setIsAvatarDialogOpen(false);
          setAvatarPreview(null);
          setAvatarFile(null);
          toast.success("Foto atualizada localmente (offline)");
          return;
        }
        await ensureBucket();
        const ext = avatarFile.type.split('/')[1] || 'png';
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('avatars').upload(path, avatarFile, {
          upsert: true,
          contentType: avatarFile.type
        });
        if (uploadError) throw uploadError;
        const { data: publicData } = supabase.storage.from('avatars').getPublicUrl(path);
        newUrl = publicData.publicUrl;
      } catch {
        const toDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        newUrl = await toDataUrl(avatarFile);
        try { localStorage.setItem('pendingAvatar', newUrl); } catch (e) { void e; }
      }
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: newUrl })
        .eq('user_id', user.id);
      if (updateError) throw updateError;
      setProfile(prev => ({ ...prev, avatarUrl: newUrl }));
      setIsAvatarDialogOpen(false);
      setAvatarPreview(null);
      setAvatarFile(null);
      toast.success("Foto de perfil atualizada!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao atualizar foto de perfil");
    } finally {
      setIsSavingAvatar(false);
    }
  };
  

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Profile Card */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="overflow-hidden border-border/50 bg-[#1a1b26]">
          {/* Cover Image */}
          <div className="h-32 relative group">
            <img 
              src={profile.coverImage} 
              alt="Capa" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button variant="secondary" size="sm" className="gap-2" onClick={handleCoverUpload}>
                <Camera className="w-4 h-4" /> Alterar capa
              </Button>
            </div>
          </div>

          <div className="px-6 pb-6 relative">
            {/* Avatar */}
            <div className="relative -mt-16 mb-4 flex justify-between items-end">
              <div className="relative group">
                <Avatar className="w-32 h-32 border-4 border-[#1a1b26] ring-2 ring-purple-500/20">
                  <AvatarImage src={profile.avatarUrl || user?.image || undefined} />
                  <AvatarFallback className="text-2xl">{user?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={handleAvatarUploadOpen}>
                  <Camera className="w-8 h-8 text-white" />
                </div>
                {/* Flag Icon Mock */}
                <div className="absolute bottom-2 right-2 bg-[#1a1b26] rounded-full p-1 border border-border/50">
                   <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center text-[10px] text-white font-bold border border-yellow-400">BR</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mb-2">
                <Dialog open={isEditingLinks} onOpenChange={setIsEditingLinks}>
                  <DialogTrigger asChild>
                    <Button variant="secondary" size="icon" className="h-8 w-8 rounded-lg bg-secondary/20 hover:bg-secondary/40 text-muted-foreground hover:text-foreground">
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px] bg-[#1a1b26] border-border text-foreground">
                    <DialogHeader>
                      <DialogTitle className="flex justify-between items-center">
                        Editar links
                      </DialogTitle>
                      <DialogDescription>Atualize seus links públicos do perfil.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Site pessoal</Label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500" />
                          <Input 
                            value={linksTemp.website} 
                            onChange={(e) => setLinksTemp({...linksTemp, website: e.target.value})}
                            className="pl-10 bg-secondary/20 border-border/50" 
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>LinkedIn</Label>
                        <div className="relative">
                          <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500" />
                          <Input 
                            value={linksTemp.linkedin} 
                            onChange={(e) => setLinksTemp({...linksTemp, linkedin: e.target.value})}
                            className="pl-10 bg-secondary/20 border-border/50" 
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Instagram</Label>
                        <div className="relative">
                          <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input 
                            value={linksTemp.instagram} 
                            onChange={(e) => setLinksTemp({...linksTemp, instagram: e.target.value})}
                            className="pl-10 bg-secondary/20 border-border/50" 
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>X (Twitter)</Label>
                        <div className="relative">
                          <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input 
                            value={linksTemp.twitter} 
                            onChange={(e) => setLinksTemp({...linksTemp, twitter: e.target.value})}
                            className="pl-10 bg-secondary/20 border-border/50" 
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="ghost" onClick={() => setIsEditingLinks(false)}>Cancelar</Button>
                      <Button onClick={handleSaveLinks} className="bg-purple-600 hover:bg-purple-700 text-white">Salvar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                <Button variant="secondary" size="icon" className="h-8 w-8 rounded-lg bg-secondary/20 hover:bg-secondary/40 text-purple-400 hover:text-purple-300">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
              <DialogContent className="sm:max-w-[480px] bg-[#1a1b26] border-border text-foreground">
                <DialogHeader>
                  <DialogTitle>Alterar foto de perfil</DialogTitle>
                  <DialogDescription>Cole uma imagem ou envie um arquivo para atualizar seu avatar.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div 
                    className="border border-border/50 rounded-xl p-4 bg-secondary/10 flex flex-col items-center justify-center text-center gap-3"
                    onPaste={handleAvatarPaste}
                  >
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Preview" className="w-32 h-32 rounded-full object-cover border border-border/50" />
                    ) : (
                      <>
                        <Camera className="w-8 h-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Cole uma imagem aqui ou faça upload</p>
                      </>
                    )}
                    <input type="file" accept="image/*" onChange={handleAvatarFileChange} className="hidden" id="avatar-file-input" />
                    <Button variant="secondary" size="sm" onClick={() => document.getElementById('avatar-file-input')?.click()}>Enviar imagem</Button>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => { setIsAvatarDialogOpen(false); setAvatarPreview(null); setAvatarFile(null); }}>Cancelar</Button>
                  <Button onClick={handleSaveAvatar} disabled={isSavingAvatar || !avatarFile} className="bg-purple-600 hover:bg-purple-700 text-white">
                    {isSavingAvatar ? "Salvando..." : "Salvar"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* User Info */}
            <div className="text-center space-y-4">
              <div>
                <h2 className="text-xl font-bold text-white">{user?.name}</h2>
                <p className="text-muted-foreground text-sm">@{user?.email?.split('@')[0]}</p>
                <p className="text-muted-foreground text-sm mt-1">{profile.role}</p>
                <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs mt-1">
                  <MapPin className="w-3 h-3" />
                  {profile.location}
                </div>
              </div>

              {/* Tags Section with Edit Button */}
              <div className="relative group/tags pt-2">
                <div className="absolute -top-6 right-0 opacity-100 transition-opacity">
                  <Dialog open={isEditingSkills} onOpenChange={(open) => {
                    if (open) handleOpenSkillsModal();
                    else setIsEditingSkills(false);
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-white">
                        <Pencil className="w-3 h-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] bg-[#1a1b26] border-border text-foreground">
                      <DialogHeader>
                        <DialogTitle className="flex justify-between items-center">
                          Cadastrar habilidades
                        </DialogTitle>
                        <p className="text-sm text-muted-foreground mt-1.5">
                          Adicione as tecnologias e habilidades musicais que você domina
                        </p>
                      </DialogHeader>
                      
                      <div className="space-y-6 py-4">
                        {/* Input Area */}
                        <div className="space-y-3">
                          <Label>Nova habilidade</Label>
                          <div className="flex gap-2">
                            <div className="relative">
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="w-10 h-10 border-border/50 bg-secondary/20 shrink-0"
                                onClick={() => setIsIconPickerOpen(!isIconPickerOpen)}
                              >
                                {selectedIcon && ICON_MAP[selectedIcon] ? 
                                  (() => {
                                    const Icon = ICON_MAP[selectedIcon];
                                    return <Icon className="w-5 h-5 text-purple-500" />;
                                  })() : 
                                  <Music className="w-5 h-5 text-purple-500" />
                                }
                              </Button>
                              
                              {/* Icon Picker Popover/Grid */}
                              {isIconPickerOpen && (
                                <div className="absolute top-12 left-0 z-50 w-64 p-2 bg-[#1a1b26] border border-border/50 rounded-lg shadow-xl grid grid-cols-5 gap-2">
                                  {AVAILABLE_ICONS.map((iconName) => {
                                    const Icon = ICON_MAP[iconName];
                                    return (
                                      <button
                                        key={iconName}
                                        onClick={() => {
                                          setSelectedIcon(iconName);
                                          setIsIconPickerOpen(false);
                                        }}
                                        className={`p-2 rounded hover:bg-secondary/40 flex items-center justify-center transition-colors ${selectedIcon === iconName ? 'bg-secondary/40 ring-1 ring-purple-500' : ''}`}
                                      >
                                        <Icon className="w-4 h-4 text-purple-400" />
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                            
                            <Input 
                              placeholder="Ex: Violão Clássico, Teoria Musical..." 
                              value={newSkillName}
                              onChange={(e) => setNewSkillName(e.target.value)}
                              className="flex-1 bg-secondary/20 border-border/50"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAddSkill();
                              }}
                            />
                            <Button onClick={handleAddSkill} size="icon" className="bg-purple-600 hover:bg-purple-700">
                              <Plus className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>

                        {/* Skills List */}
                        <div className="space-y-2">
                          <Label>Habilidades cadastradas</Label>
                          <ScrollArea className="h-[200px] pr-4">
                            <div className="space-y-2">
                              {skillsTemp.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                  Nenhuma habilidade cadastrada ainda.
                                </div>
                              ) : (
                                skillsTemp.map((skill, index) => {
                                  const Icon = ICON_MAP[skill.icon] || Music;
                                  return (
                                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/10 border border-border/30 group">
                                      <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-md bg-secondary/20">
                                          <Icon className="w-4 h-4 text-purple-400" />
                                        </div>
                                        <span className="text-sm font-medium text-white">{skill.name}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Star className="w-4 h-4 text-muted-foreground hover:text-yellow-400 cursor-pointer transition-colors" />
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-400/10"
                                          onClick={() => handleRemoveSkill(index)}
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </ScrollArea>
                        </div>
                      </div>

                      <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsEditingSkills(false)}>Cancelar</Button>
                        <Button onClick={handleSaveSkills} className="bg-purple-600 hover:bg-purple-700 text-white">Salvar</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="flex flex-wrap justify-center gap-2">
                  {profile.tags.map((tag, i) => {
                    const Icon = ICON_MAP[tag.icon] || Music;
                    return (
                      <div key={i} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/20 border border-border/30 text-[10px] font-bold text-muted-foreground hover:text-white hover:border-purple-500/50 transition-all cursor-default">
                        <Icon className="w-3 h-3 text-purple-400" />
                        {tag.name}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Social Links Display */}
              <div className="flex justify-center gap-3 pt-2">
                {profile.links.website && (
                  <a href={profile.links.website} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-white transition-colors">
                    <Globe className="w-4 h-4" />
                  </a>
                )}
                {profile.links.linkedin && (
                  <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-blue-500 transition-colors">
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
                {profile.links.instagram && (
                  <a href={profile.links.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-pink-500 transition-colors">
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {profile.links.twitter && (
                  <a href={profile.links.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-white transition-colors">
                    <Twitter className="w-4 h-4" />
                  </a>
                )}
              </div>

              {/* Join Date */}
              <div className="pt-4 border-t border-border/30">
                <p className="text-xs text-muted-foreground">Embarcou na musicatos {profile.joinDate}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Right Column */}
      <div className="lg:col-span-2 space-y-6">
        {/* About Section */}
        <Card className="border-border/50 bg-[#1a1b26]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold text-muted-foreground">Sobre Mim</CardTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-white/10"
              onClick={() => setIsEditingBio(true)}
            >
              <Pencil className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {isEditingBio ? (
              <div className="space-y-4">
                <Textarea 
                  value={bioTemp}
                  onChange={(e) => setBioTemp(e.target.value)}
                  className="min-h-[150px] bg-secondary/20 border-border/50 text-white"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setIsEditingBio(false)}>Cancelar</Button>
                  <Button size="sm" onClick={handleSaveBio} className="bg-purple-600 hover:bg-purple-700 text-white">Salvar</Button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {profile.bio}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { 
  LogOut, 
  Settings, 
  Award, 
  Gift, 
  User 
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export function UserDropdown() {  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-9 w-9 border border-border/50 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all">
          <AvatarImage src={user?.image} />
          <AvatarFallback className="bg-secondary text-xs">
            {user?.name?.substring(0, 2).toUpperCase() || "UN"}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-80 p-0 bg-[#1a1b26] border-border/50 text-foreground"
        align="end"
        forceMount
      >
        {/* Header - User Info */}
        <div className="p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <Avatar className="h-10 w-10 border border-border/50">
              <AvatarImage src={user?.image} />
              <AvatarFallback className="bg-secondary text-xs">
                {user?.name?.substring(0, 2).toUpperCase() || "UN"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="font-semibold text-sm truncate text-white">
                {user?.name || "Usuário"}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                @{user?.email?.split("@")[0] || "usuario"}
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs font-semibold bg-transparent border-white/20 hover:bg-white/10 text-white shrink-0"
            onClick={() => navigate('/dashboard/perfil')}
          >
            VER PERFIL
          </Button>
        </div>

        <DropdownMenuSeparator className="bg-border/30 m-0" />

        {/* Menu Items */}
        <div className="p-2 space-y-1">
          <DropdownMenuItem className="flex items-start gap-3 p-3 cursor-pointer focus:bg-white/5 rounded-lg group">
            <div className="mt-0.5 p-1">
              <Settings className="w-5 h-5 text-purple-500" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-white group-focus:text-purple-400 transition-colors">
                Minha conta
              </span>
              <span className="text-xs text-muted-foreground">
                Gerencie dados e preferências
              </span>
            </div>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="bg-border/30 m-0" />

        {/* Footer - Logout */}
        <div className="p-2">
          <DropdownMenuItem
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 cursor-pointer focus:bg-red-500/10 rounded-lg group text-red-400 hover:text-red-400"
          >
            <div className="p-1">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="text-sm font-semibold">Sair da conta</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

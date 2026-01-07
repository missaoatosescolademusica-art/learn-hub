import { Search, Bell, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserDropdown } from "@/components/UserDropdown";

export function TopBar() {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
      {/* Search */}
      <div className="relative w-full md:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Busque por assuntos e aulas"
          className="pl-10 pr-10 bg-secondary/30 border-transparent focus:bg-background focus:border-primary/20 h-10 transition-all"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 border border-border bg-muted/50 px-1.5 py-0.5 rounded text-[10px] text-muted-foreground font-mono">
          /
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 self-end md:self-auto">
        {/* Streak */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30 border border-transparent hover:border-border/50 transition-colors cursor-help group/streak" title="Dias em sequência">
          <Flame className="w-4 h-4 text-muted-foreground fill-muted-foreground/10 group-hover/streak:text-orange-500 group-hover/streak:fill-orange-500/20 transition-colors" />
          <span className="font-bold text-sm text-muted-foreground group-hover/streak:text-foreground">0</span>
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-lg hover:bg-secondary/30">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-[9px] text-white font-bold ring-2 ring-background">
            9+
          </span>
        </Button>

        {/* User Dropdown */}
        <div className="pl-2 border-l border-border/50 ml-1">
          <UserDropdown />
        </div>
      </div>
    </div>
  );
}

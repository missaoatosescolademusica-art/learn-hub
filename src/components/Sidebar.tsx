import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  Map, 
  FolderOpen, 
  Calendar, 
  MessageCircle,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

const navigation = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Meus Conteúdos', href: '/dashboard/conteudos', icon: BookOpen },
  { name: 'Minha Jornada', href: '/dashboard/jornada', icon: Map },
];

const learning = [
  { name: 'Catálogo', href: '/dashboard/catalogo', icon: FolderOpen },
  { name: 'Aulas', href: '/dashboard/aulas', icon: Calendar },
  { name: 'Comunidade', href: '/dashboard/comunidade', icon: MessageCircle },
];

export function Sidebar() {
  const location = useLocation();
  const { user, profile, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Usuário';

  const NavLink = ({ item }: { item: typeof navigation[0] }) => {
    const isActive = location.pathname === item.href;
    
    return (
      <Link
        to={item.href}
        onClick={() => setIsOpen(false)}
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
          isActive
            ? 'bg-primary/10 text-primary border-l-2 border-primary'
            : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
        )}
      >
        <item.icon className="h-5 w-5" />
        {item.name}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-secondary text-foreground"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-6 border-b border-sidebar-border">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">EduPlay</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
            <div>
              <p className="px-4 mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Progresso
              </p>
              <div className="space-y-1">
                {navigation.map((item) => (
                  <NavLink key={item.name} item={item} />
                ))}
              </div>
            </div>

            <div>
              <p className="px-4 mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Aprendizado
              </p>
              <div className="space-y-1">
                {learning.map((item) => (
                  <NavLink key={item.name} item={item} />
                ))}
              </div>
            </div>
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {displayName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email || ''}
                </p>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

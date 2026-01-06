import {
  Home,
  BookOpen,
  Map,
  FolderOpen,
  Calendar,
  MessageCircle
} from "lucide-react";
export const navigation = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Meus Conteúdos", href: "/dashboard/conteudos", icon: BookOpen },
  { name: "Minha Jornada", href: "/dashboard/jornada", icon: Map },
];

export const learning = [
  { name: "Catálogo", href: "/dashboard/catalogo", icon: FolderOpen },
  { name: "Aulas", href: "/dashboard/aulas", icon: Calendar },
  { name: "Comunidade", href: "/dashboard/comunidade", icon: MessageCircle },
];

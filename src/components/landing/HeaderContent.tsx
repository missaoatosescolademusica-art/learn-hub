import { BookOpen } from "lucide-react";

import { Link } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function HeaderContent() {
  return (
    <div className="container mx-auto px-6 h-16 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
          <BookOpen className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold text-foreground">Missão Play</span>
      </div>

      <div className="flex items-center gap-4">
        <Link to="/login">
          <Button variant="ghost">Entrar</Button>
        </Link>
        <Link to="/registro">
          <Button variant="hero">Criar conta</Button>
        </Link>
      </div>
    </div>
  );
}
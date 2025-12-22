import { Link, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const CTA = () => {
  return (
    <div className="container mx-auto max-w-4xl">
      <div className="rounded-3xl gradient-primary p-1">
        <div className="rounded-[22px] bg-card p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Pronto para começar?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Junte-se a milhares de alunos que já estão aprendendo na nossa
            plataforma.
          </p>
          <Link to="/registro">
            <Button variant="hero" size="xl">
              Criar conta gratuita
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

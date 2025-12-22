import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

type HeroInfoProps = {
  videoAulasRef: React.RefObject<HTMLSpanElement>;
};

export default function HeroInfo({ videoAulasRef }: HeroInfoProps) {
  return (
    <div className="container mx-auto text-center max-w-4xl">
      <div className="hero-element opacity-0 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
        <Play className="h-4 w-4" />
        <span>Plataforma 100% gratuita</span>
      </div>

      <h1 className="hero-element opacity-0 text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6">
        Aprenda no seu ritmo com{" "}
        <span
          ref={videoAulasRef}
          className="text-gradient inline-block opacity-0"
        >
          vídeo aulas
        </span>{" "}
        gratuitas
      </h1>

      <p className="hero-element opacity-0 text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
        Acesse aulas de musica com alta qualidade para te ajudar na prática'.
      </p>

      <div className="hero-element opacity-0 flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/registro">
          <Button variant="hero" size="xl">
            Começar agora
            <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>
        <Link to="/login">
          <Button variant="outline" size="xl">
            Já tenho conta
          </Button>
        </Link>
      </div>
    </div>
  );
}

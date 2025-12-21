import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Play,
  BookOpen,
  Users,
  Award,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { animate, createTimeline, stagger } from "animejs";

export default function Landing() {
  const videoAulasRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Hero Animation Timeline
    const tl = createTimeline({
      defaults: {
        ease: "outExpo",
        duration: 1000,
      },
    });

    tl.add(".hero-element", {
      y: [20, 0],
      opacity: [0, 1],
      delay: stagger(200), // Stagger the hero elements
    }).add(
      videoAulasRef.current,
      {
        x: [-50, 0],
        opacity: [0, 1],
        color: ["#ff0000", "inherit"], // Optional: flash color or just slide
        duration: 1200,
      },
      "-=800"
    ); // Start before previous animation ends

    // Features Animation
    animate(".feature-card", {
      scale: [0.9, 1],
      opacity: [0, 1],
      delay: stagger(200, { start: 1000 }),
      ease: "outElastic(1, .8)",
    });

    // Benefits Animation
    animate(".benefit-item", {
      x: [-50, 0],
      opacity: [0, 1],
      delay: stagger(100, { start: 1500 }),
      ease: "outQuad",
    });
  }, []);

  const features = [
    {
      icon: BookOpen,
      title: "Conteúdo de Qualidade",
      description: "Aulas gravadas por profissionais com anos de experiência.",
    },
    {
      icon: Users,
      title: "Comunidade Ativa",
      description: "Conecte-se com outros alunos e tire suas dúvidas.",
    },
    {
      icon: Award,
      title: "Certificados",
      description: "Receba certificados ao concluir os cursos.",
    },
  ];

  const benefits = [
    "Acesso vitalício aos cursos",
    "Suporte da comunidade",
    "Atualizações constantes",
    "Material complementar",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">EduPlay</span>
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
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
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
            Acesse centenas de aulas de alta qualidade, construa seu portfólio e
            acelere sua carreira na tecnologia.
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
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-card/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Por que escolher o EduPlay?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Uma plataforma completa para você desenvolver suas habilidades
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="feature-card opacity-0 p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 group"
              >
                <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Tudo que você precisa para{" "}
                <span className="text-gradient">evoluir</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Nossa plataforma oferece recursos completos para você aprender
                de forma eficiente e organizada.
              </p>

              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li
                    key={benefit}
                    className="benefit-item opacity-0 flex items-center gap-3"
                  >
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-10">
                <Link to="/registro">
                  <Button variant="hero" size="lg">
                    Criar minha conta grátis
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-video rounded-2xl gradient-primary p-1">
                <div className="w-full h-full rounded-xl bg-card flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                      <Play
                        className="h-10 w-10 text-primary"
                        fill="currentColor"
                      />
                    </div>
                    <p className="text-muted-foreground">
                      Preview da plataforma
                    </p>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 gradient-cyan rounded-xl opacity-50 blur-2xl" />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 gradient-magenta rounded-xl opacity-50 blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
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
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="container mx-auto text-center text-muted-foreground text-sm">
          <p>© 2024 EduPlay. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

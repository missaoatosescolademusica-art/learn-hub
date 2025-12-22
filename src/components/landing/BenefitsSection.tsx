import { benefits } from "@/helpers/content-delivery-data";
import { CheckCircle, Link, ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export const BenefitsSection = () => {
  return (
    <div className="container mx-auto max-w-6xl">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Tudo que você precisa para{" "}
            <span className="text-gradient">evoluir</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Nossa plataforma oferece recursos completos para você aprender de
            forma eficiente e organizada.
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
                <p className="text-muted-foreground">Preview da plataforma</p>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -top-6 -right-6 w-24 h-24 gradient-cyan rounded-xl opacity-50 blur-2xl" />
          <div className="absolute -bottom-6 -left-6 w-32 h-32 gradient-magenta rounded-xl opacity-50 blur-2xl" />
        </div>
      </div>
    </div>
  );
}
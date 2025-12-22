import { features } from "@/helpers/content-delivery-data";

export const FeaturesData = () => {
  return (
    <div className="container mx-auto max-w-6xl">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Por que escolher o Musicatos Hub?
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Uma plataforma completa e gratuita para você desenvolver suas
          habilidades musicais de forma prática e interativa.
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
  );
}
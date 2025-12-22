import { useEffect, useRef } from "react";

import { animate, createTimeline, stagger } from "animejs";

import HeaderContent from "@/components/landing/HeaderContent";
import HeroInfo from "@/components/landing/HeroInfo";
import { FeaturesData } from "@/components/landing/FeaturesData";
import { BenefitsSection } from "@/components/landing/BenefitsSection";
import { CTA } from "@/components/landing/CTA";

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

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <HeaderContent />
      </header>
      <section className="pt-32 pb-20 px-6">
        <HeroInfo videoAulasRef={videoAulasRef} />
      </section>
      <section className="py-20 px-6 bg-card/50">
        <FeaturesData />
      </section>
      <section className="py-20 px-6">
        <BenefitsSection />
      </section>
      <section className="py-20 px-6">
        <CTA />
      </section>
      <footer className="py-8 px-6 border-t border-border">
        <div className="container mx-auto text-center text-muted-foreground text-sm">
          <p>© 2024 EduPlay. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

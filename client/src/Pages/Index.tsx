import HeroSection from "@/components/Home/HeroSection";
import ServicesSection from "@/components/Home/ServicesSection";
import PricingSection from "@/components/Home/PricingSection";
import ProfileSection from "@/components/Home/ProfileSection";
import TestimonialsSection from "@/components/Home/TestimonialsSection";
import FAQSection from "@/components/Home/FAQSection";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const Index = () => {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <PricingSection />
      <ProfileSection />
      <TestimonialsSection />
      <FAQSection />

      {/* CTA final */}
      <section className="bg-background py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="container mx-auto px-4 text-center"
        >
          <h2 className="font-heading text-3xl font-bold text-foreground md:text-4xl">
            ¿Lista/o para dar el primer paso?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            No tienes que hacerlo solo. Agenda tu primera sesión y comencemos
            juntos este camino.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link to="/agendar">
                <Calendar className="mr-2 h-5 w-5" />
                Agendar mi cita
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/registro">
                Soy paciente nuevo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </section>
    </>
  );
};

export default Index;

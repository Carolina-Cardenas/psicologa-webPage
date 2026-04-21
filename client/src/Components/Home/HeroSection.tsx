import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import heroImage from "@/assets/psychologist-hero.jpg";


const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-background-alt">
      <div className="container mx-auto grid items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="space-y-6"
        >
          <span className="inline-block rounded-full border border-secondary bg-secondary/20 px-4 py-1 text-xs font-medium text-foreground">
            Psicóloga Clínica · Santiago, Chile
          </span>
          <h1 className="font-heading text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl">
            Tu bienestar emocional{" "}
            <span className="text-secondary">es mi prioridad</span>
          </h1>
          <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
            Soy Nataly Cárdenas Astudillo. Te acompaño en un espacio seguro y
            confidencial para explorar tus emociones y encontrar el equilibrio
            que buscas.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link to="/agendar">
                <Calendar className="mr-2 h-5 w-5" />
                Agendar cita
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/registro">
                <UserPlus className="mr-2 h-5 w-5" />
                Soy paciente nuevo
              </Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative"
        >
          <div className="relative mx-auto max-w-md overflow-hidden rounded-2xl border-4 border-card shadow-2xl">
            <img
              src={heroImage}
              alt="Psicóloga Nataly Cárdenas Astudillo en su consultorio"
              width={800}
              height={1024}
              className="h-auto w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-4 -left-4 rounded-xl border bg-card p-4 shadow-lg">
            <p className="text-sm font-medium text-foreground">+500 pacientes</p>
            <p className="text-xs text-muted-foreground">han confiado en nosotros</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;

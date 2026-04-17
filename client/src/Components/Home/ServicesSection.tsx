import { motion } from "framer-motion";
import { Brain, Heart, Users, Sparkles, Baby, Briefcase } from "lucide-react";

const services = [
  {
    icon: Brain,
    title: "Terapia individual",
    description: "Sesiones personalizadas para trabajar ansiedad, depresión, autoestima y crecimiento personal.",
  },
  {
    icon: Users,
    title: "Terapia de pareja",
    description: "Fortalece la comunicación y resuelve conflictos en tu relación de forma saludable.",
  },
  {
    icon: Heart,
    title: "Manejo emocional",
    description: "Aprende herramientas para gestionar tus emociones y responder de forma consciente.",
  },
  {
    icon: Baby,
    title: "Orientación a padres",
    description: "Guía profesional para mejorar la crianza y el vínculo con tus hijos.",
  },
  {
    icon: Briefcase,
    title: "Estrés laboral",
    description: "Estrategias para manejar el burnout, la presión y mejorar tu calidad de vida.",
  },
  {
    icon: Sparkles,
    title: "Desarrollo personal",
    description: "Descubre tu potencial y establece metas que te acerquen a la vida que deseas.",
  },
];

const ServicesSection = () => {
  return (
    <section className="bg-background py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="font-heading text-3xl font-bold text-foreground md:text-4xl">
            ¿En qué puedo ayudarte?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Cada persona es única. Ofrezco diferentes enfoques terapéuticos
            adaptados a tus necesidades específicas.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group rounded-xl border bg-card p-6 transition-all hover:shadow-lg hover:-translate-y-1"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/20 text-secondary transition-colors group-hover:bg-secondary group-hover:text-primary-foreground">
                <service.icon className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground">
                {service.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;

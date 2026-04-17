import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    initials: "A.R.",
    comment: "Nataly me ayudó a encontrar herramientas para manejar mi ansiedad. Ahora duermo mejor y me siento más en control de mi vida.",
    date: "Marzo 2024",
    rating: 5,
  },
  {
    initials: "C.M.",
    comment: "La terapia de pareja con Nataly salvó nuestra relación. Aprendimos a comunicarnos de verdad.",
    date: "Enero 2024",
    rating: 5,
  },
  {
    initials: "L.G.",
    comment: "Un espacio seguro donde pude ser yo misma. La recomiendo ampliamente a cualquier persona que busque apoyo.",
    date: "Febrero 2024",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="relative overflow-hidden py-20" style={{ backgroundColor: "hsl(188, 9%, 22%)" }}>
      {/* Decorative soft pastel overlays acordes a la paleta */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background:
            "radial-gradient(ellipse at 20% 30%, hsl(137, 16%, 61%), transparent 55%), radial-gradient(ellipse at 80% 70%, hsl(35, 32%, 71%), transparent 55%)",
        }}
      />

      <div className="container relative mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="font-heading text-3xl font-bold md:text-4xl" style={{ color: "hsl(60, 10%, 95%)" }}>
            Lo que dicen mis pacientes
          </h2>
          <p className="mx-auto mt-3 max-w-xl" style={{ color: "hsl(137, 16%, 78%)" }}>
            La confianza de quienes han pasado por mi consultorio es mi mejor carta de presentación.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.initials}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative rounded-xl border p-6 backdrop-blur-sm"
              style={{
                backgroundColor: "hsl(188, 9%, 28%)",
                borderColor: "hsl(137, 16%, 45%)",
              }}
            >
              <Quote className="mb-3 h-8 w-8 opacity-40" style={{ color: "hsl(137, 16%, 71%)" }} />
              <div className="mb-3 flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" style={{ color: "hsl(39, 66%, 60%)" }} />
                ))}
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "hsl(60, 10%, 92%)" }}>
                "{t.comment}"
              </p>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold"
                    style={{ backgroundColor: "hsl(137, 16%, 61%)", color: "hsl(188, 9%, 22%)" }}
                  >
                    {t.initials}
                  </div>
                  <span className="text-xs" style={{ color: "hsl(137, 16%, 78%)" }}>
                    Paciente verificado
                  </span>
                </div>
                <span className="text-xs" style={{ color: "hsl(35, 20%, 70%)" }}>{t.date}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

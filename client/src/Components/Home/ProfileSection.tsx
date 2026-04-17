import { motion } from "framer-motion";
import { Award, GraduationCap, Clock, Shield } from "lucide-react";

const credentials = [
  { icon: GraduationCap, label: "Magíster en Psicología Clínica" },
  { icon: Award, label: "Especialista en Psicoterapia Individual, Pareja y Familiar" },
  { icon: Clock, label: "+10 años de experiencia clínica" },
  { icon: Shield, label: "Atención presencial y online (telemedicina)" },
];

const ProfileSection = () => {
  return (
    <section className="bg-card py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="font-heading text-3xl font-bold text-foreground md:text-4xl">
            Sobre mí
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground leading-relaxed">
            Soy Nataly Cárdenas Astudillo, psicóloga clínica con más de 10 años
            de experiencia acompañando personas en su proceso de
            autoconocimiento y bienestar. Atiendo en mi consulta en Santiago y
            también ofrezco psicoterapia online para pacientes en Chile y en el
            extranjero.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {credentials.map((cred, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 rounded-lg border bg-background p-4 text-left"
              >
                <cred.icon className="h-5 w-5 shrink-0 text-secondary" />
                <span className="text-sm text-foreground">{cred.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProfileSection;

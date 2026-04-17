import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Video, ArrowRight } from "lucide-react";

const plans = [
  {
    title: "Psicoterapia",
    modality: "Presencial",
    icon: MapPin,
    duration: "45 min",
    priceCLP: "$40.000 CLP",
    priceUSD: null,
    types: ["Individual", "Pareja", "Familiar"],
    cta: "Agenda tu hora",
  },
  {
    title: "Psicoterapia pacientes en el extranjero",
    modality: "Online",
    icon: Video,
    duration: "45 min",
    priceCLP: "$40.000 CLP",
    priceUSD: "41.96 USD",
    types: ["Online · sesión por videollamada"],
    cta: "Ver horas",
    featured: true,
  },
  {
    title: "Psicoterapia Telemedicina",
    modality: "Online",
    icon: Video,
    duration: "45 min",
    priceCLP: "$40.000 CLP",
    priceUSD: "41.4 USD",
    types: ["Online · pacientes en Chile"],
    cta: "Ver horas",
  },
];

const PricingSection = () => {
  return (
    <section className="bg-background-alt py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="font-heading text-3xl font-bold text-foreground md:text-4xl">
            Servicios y modalidades
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Escoge la modalidad que mejor se adapte a ti. Atiendo de forma
            presencial en Santiago y online para Chile y el extranjero.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative flex flex-col rounded-xl border bg-card p-6 transition-all hover:shadow-lg ${
                plan.featured ? "ring-2 ring-secondary" : ""
              }`}
            >
              {plan.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-primary-foreground">
                  Recomendado
                </span>
              )}

              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/20 text-secondary">
                <plan.icon className="h-6 w-6" />
              </div>

              <h3 className="font-heading text-lg font-semibold text-foreground">
                {plan.title}
              </h3>

              <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <span className="font-medium text-foreground">Modalidad:</span>{" "}
                  {plan.modality}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {plan.duration}
                </span>
              </div>

              <div className="mt-4">
                <p className="font-heading text-2xl font-bold text-foreground">
                  {plan.priceCLP}
                </p>
                {plan.priceUSD && (
                  <p className="text-sm text-muted-foreground">{plan.priceUSD}</p>
                )}
              </div>

              <ul className="mt-4 flex flex-1 flex-col gap-1.5 text-sm text-muted-foreground">
                {plan.types.map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
                    {t}
                  </li>
                ))}
              </ul>

              <Button className="mt-6 w-full" asChild>
                <Link to="/agendar">
                  {plan.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;

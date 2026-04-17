import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/Components/ui/accordion";
  import { motion } from "framer-motion";
  
  const faqs = [
    {
      q: "¿Cómo es la primera sesión?",
      a: "En la primera sesión nos conocemos. Exploraremos juntos qué te trae a terapia, tus expectativas y diseñaremos un plan de trabajo personalizado. Es un espacio libre de juicios.",
    },
    {
      q: "¿Cuánto dura una sesión?",
      a: "Cada sesión tiene una duración de 50 minutos. En casos especiales, como terapia de pareja, puede extenderse a 90 minutos.",
    },
    {
      q: "¿Ofrecen sesiones en línea?",
      a: "Sí, ofrezco sesiones tanto presenciales como en línea a través de videollamada. Ambas modalidades son igual de efectivas.",
    },
    {
      q: "¿Con cuánta anticipación puedo cancelar?",
      a: "Las cancelaciones deben realizarse con al menos 24 horas de anticipación. Cancelaciones tardías no son reembolsables.",
    },
    {
      q: "¿Cuánto cuesta una sesión?",
      a: "Los honorarios varían según el tipo de terapia. Puedes consultar los precios al agendar tu cita o contactarme directamente.",
    },
    {
      q: "¿Es confidencial?",
      a: "Absolutamente. Todo lo que compartas en sesión es estrictamente confidencial, protegido por el código ético profesional.",
    },
  ];
  
  const FAQSection = () => {
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
              Preguntas frecuentes
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Resuelve tus dudas antes de dar el primer paso.
            </p>
          </motion.div>
  
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl"
          >
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`faq-${index}`}
                  className="rounded-xl border bg-card px-6"
                >
                  <AccordionTrigger className="text-left font-heading text-base font-medium text-foreground hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>
    );
  };
  
  export default FAQSection;
  
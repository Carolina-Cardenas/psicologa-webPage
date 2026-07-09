import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { motion, AnimatePresence } from "framer-motion";
import { format, addDays, isBefore, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, MapPin, Video, CalendarIcon } from "lucide-react";

interface AppointmentDetails {
  _id: string;
  date: string;
  time: string;
  modalidad: string;
  status: string;
}


 
  const BookAppointment = () => {
  const [step, setStep] = useState(0);
  const [appointmentDetails, setAppointmentDetails] = useState<AppointmentDetails | null>(null);
  const [modality, setModality] = useState<"online" | "presencial" | null>(null);
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  useEffect(() => {
    if (!date) return;

    const fetchSlots = async () => {
      const formatted = format(date, "yyyy-MM-dd");
      const res = await fetch(`http://localhost:4000/api/appointments/available/${formatted}`);
      const data = await res.json();
      setAvailableSlots(data);
    };
  
    fetchSlots();
  }, [date]);
  

  const stepLabels = ["Modalidad", "Fecha y hora", "Confirmación"];

  const handleConfirm = async () => {
    if (!date || !time || !modality) return;
  
    setIsSubmitting(true);
    
    
    const tipoModalidad = modality === "online" ? "en línea" : "presencial";
  
    const appointmentData = {
      date: format(date, "yyyy-MM-dd"),
      time: time,
      modality: modality, 
      patientName: "Carolina Cárdenas", 
      patientEmail: "carolina.beatriz.cardenas@gmail.com"
    };
  
    try {
      const res = await fetch("http://localhost:4000/api/appointments/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(appointmentData),
      });
  
      const data = await res.json();
  
      if (res.ok) {
        setAppointmentDetails(data);
        setStep(3); 
      } else {
     
        console.log("Error detallado del backend:", data);
        alert(`Error del Servidor: ${data.message || JSON.stringify(data.errors || data)}`);
      }
    } catch (error) {
      console.error(error);
      alert("Hubo un fallo de red.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background-alt px-4 py-12">
      <div className="container mx-auto max-w-3xl">
        {/* Step indicator */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {stepLabels.map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                i < step ? "bg-success text-success-foreground" : i === step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`hidden text-sm sm:inline ${i === step ? "font-medium text-foreground" : "text-muted-foreground"}`}>{label}</span>
              {i < stepLabels.length - 1 && <div className={`h-0.5 w-8 ${i < step ? "bg-success" : "bg-muted"}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 0: Modality */}
          {step === 0 && (
            <motion.div key="modality" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="text-center">
                <h1 className="font-heading text-3xl font-bold text-foreground">¿Cómo prefieres tu sesión?</h1>
                <p className="mt-2 text-muted-foreground">Ambas modalidades son igual de efectivas</p>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  { value: "presencial" as const, icon: MapPin, title: "Presencial", desc: "En el consultorio de Col. Del Valle, CDMX" },
                  { value: "online" as const, icon: Video, title: "En línea", desc: "Videollamada segura desde la comodidad de tu hogar" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setModality(opt.value); setStep(1); }}
                    className={`group rounded-xl border p-6 text-left transition-all hover:shadow-lg hover:-translate-y-1 ${
                      modality === opt.value ? "border-primary bg-primary/5" : "bg-card"
                    }`}
                  >
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/20 text-secondary">
                      <opt.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-heading text-lg font-semibold text-foreground">{opt.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 1: Date & Time */}
          {step === 1 && (
            <motion.div key="datetime" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="text-center">
                <h1 className="font-heading text-3xl font-bold text-foreground">Elige fecha y hora</h1>
                <p className="mt-2 text-muted-foreground">
                  Sesión {modality === "online" ? "en línea" : "presencial"} · 45 minutos
                </p>
              </div>
              <div className="mt-8 grid gap-6 md:grid-cols-2 place-items-center">

              <div className="rounded-xl border bg-card p-6 w-fit">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => { setDate(d); setTime(null); }}
                    disabled={(d) => isBefore(d, startOfDay(new Date())) || d.getDay() === 0}
                    locale={es}
                    className="pointer-events-auto"
                  />
                </div>
                <div>
                  {date ? (
                    <>
                      <h3 className="mb-3 font-heading text-sm font-semibold text-foreground">
                        <CalendarIcon className="mr-1 inline h-4 w-4" />
                        {format(date, "EEEE d 'de' MMMM", { locale: es })}
                      </h3>
                      {availableSlots.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                          {availableSlots.map((slot) => (
                            <button
                              key={slot}
                              onClick={() => setTime(slot)}
                              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                                time === slot
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "bg-card text-foreground hover:border-secondary hover:bg-secondary/10"
                              }`}
                            >
                              <Clock className="mr-1 inline h-3 w-3" />
                              {slot}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No hay horarios disponibles este día.</p>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                    Selecciona una fecha en el calendario
                  </div>
                  
                  
                  )}
                </div>
              </div>
              <div className="mt-8 flex justify-between">
                <Button variant="ghost" onClick={() => setStep(0)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
                </Button>
                <Button onClick={() => setStep(2)} disabled={!date || !time}>
                  Siguiente <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Confirmation */}
          {step === 2 && (
            <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="text-center">
                <h1 className="font-heading text-3xl font-bold text-foreground">Confirma tu cita</h1>
                <p className="mt-2 text-muted-foreground">Revisa los detalles antes de confirmar</p>
              </div>
              <div className="mx-auto mt-8 max-w-md rounded-xl border bg-card p-6 shadow-lg">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/20">
                      {modality === "online" ? <Video className="h-5 w-5 text-secondary" /> : <MapPin className="h-5 w-5 text-secondary" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Modalidad</p>
                      <p className="text-sm text-muted-foreground">{modality === "online" ? "En línea (videollamada)" : "Presencial (consultorio)"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/20">
                      <CalendarIcon className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Fecha y hora</p>
                      <p className="text-sm text-muted-foreground">
                        {date && format(date, "EEEE d 'de' MMMM, yyyy", { locale: es })} a las {time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/20">
                      <Clock className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Duración</p>
                      <p className="text-sm text-muted-foreground">45 minutos</p>
                    </div>
                  </div>
                </div>
                <hr className="my-6 border-border" />
               
                <Button 
                className="w-full" 
                size="lg" 
                onClick={handleConfirm}   
                disabled={isSubmitting}  
              >
                <CheckCircle2 className="mr-2 h-5 w-5" /> 
                {isSubmitting ? "Procesando..." : "Confirmar cita"} 
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Recibirás un correo de confirmación con los detalles de tu cita.
              </p>
            </div>
            <div className="mt-6 text-center">
              <Button 
                variant="ghost" 
                onClick={() => setStep(1)} 
                disabled={isSubmitting}   
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Cambiar fecha y hora
              </Button>
            </div>
          </motion.div>
        )}

        {/* --- PANTALLA DE ÉXITO FINAL (Paso 3) --- */}
        {step === 3 && appointmentDetails && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center p-8 space-y-4 bg-white rounded-xl shadow-sm border border-muted"
          >
            <CheckCircle2 className="mx-auto h-16 w-16 text-green-500 animate-bounce" />
            <h2 className="text-2xl font-bold text-gray-900">¡Cita Agendada con Éxito!</h2>
            <p className="text-muted-foreground">
              Tu sesión quedó confirmada para el día{" "}
              <strong>{date ? format(date, "dd 'de' MMMM, yyyy", { locale: es }) : ""}</strong>{" "}
              a las <strong>{time}</strong> hs en modalidad{" "}
              <strong>{modality === "online" ? "En línea (videollamada)" : "Presencial"}</strong>.
            </p>
            <div className="pt-4">
              <Button className="mt-2" variant="outline" onClick={() => window.location.reload()}>
                Agendar otra cita
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>
);
};

export default BookAppointment;
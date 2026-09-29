import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

import { AnimatePresence, motion } from "framer-motion";

import {
  format,
  isBefore,
  startOfDay,
} from "date-fns";

import { es } from "date-fns/locale";

import {
  ArrowLeft,
  ArrowRight,
  CalendarIcon,
  CheckCircle2,
  Clock,
  MapPin,
  Video,
} from "lucide-react";

interface AppointmentDetails {
  _id: string;
  clientId: string;
  date: string;
  time: string;
  modality: "online" | "presencial";
  status: "pendiente" | "confirmada" | "cancelada";
}

const BookAppointment = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(0);

  const [appointmentDetails, setAppointmentDetails] =
    useState<AppointmentDetails | null>(null);

  const [modality, setModality] = useState<
    "online" | "presencial" | null
  >(null);

  const [date, setDate] = useState<Date | undefined>();

  const [time, setTime] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  useEffect(() => {
    if (!date) {
      return;
    }

    const fetchSlots = async () => {
      try {
        const formattedDate = format(
          date,
          "yyyy-MM-dd"
        );

        const response = await fetch(
          `http://localhost:4000/api/appointments/available/${formattedDate}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "No fue posible obtener los horarios."
          );
        }

        if (!Array.isArray(data)) {
          throw new Error(
            "El servidor devolvió un formato de horarios inválido."
          );
        }

        setAvailableSlots(data);
      } catch (error) {
        console.error(
          "Error al obtener horarios disponibles:",
          error
        );

        setAvailableSlots([]);
      }
    };

    void fetchSlots();
  }, [date]);

  const stepLabels = [
    "Modalidad",
    "Fecha y hora",
    "Confirmación",
  ];

  const isDateDisabled = (day: Date): boolean => {
    const isPast = isBefore(
      day,
      startOfDay(new Date())
    );

    if (isPast) {
      return true;
    }

    const dayOfWeek = day.getDay();

    // Domingo: no hay atención.
    if (dayOfWeek === 0) {
      return true;
    }

    // Presencial: únicamente jueves y viernes.
    if (modality === "presencial") {
      const isInPersonDay =
        dayOfWeek === 4 || dayOfWeek === 5;

      return !isInPersonDay;
    }

    // Online: lunes a sábado.
    return false;
  };

  const handleModalitySelection = (
    selectedModality: "online" | "presencial"
  ) => {
    setModality(selectedModality);

    /*
     * Si el paciente vuelve atrás y cambia de modalidad,
     * eliminamos una fecha anterior que podría dejar de ser válida.
     */
    setDate(undefined);
    setTime(null);
    setAvailableSlots([]);

    setStep(1);
  };

  const handleConfirm = async () => {
    if (!date || !time || !modality) {
      return;
    }

    const token = localStorage.getItem("clientToken");

    if (!token) {
      alert(
        "Debes iniciar sesión para agendar una cita."
      );

      navigate("/login", {
        replace: true,
      });

      return;
    }

    setIsSubmitting(true);

    try {
      const appointmentData = {
        date: format(date, "yyyy-MM-dd"),
        time,
        modality,
      };

      const response = await fetch(
        "http://localhost:4000/api/appointments/",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify(appointmentData),
        }
      );

      const data = await response.json();

      // Sesión expirada o token inválido.
      if (
        response.status === 401 &&
        (
          data.code === "TOKEN_EXPIRED" ||
          data.code === "TOKEN_INVALID" ||
          data.code === "TOKEN_MISSING"
        )
      ) {
        localStorage.removeItem("clientToken");
        localStorage.removeItem("clientUser");

        alert(
          data.code === "TOKEN_EXPIRED"
            ? "Tu sesión ha expirado. Inicia sesión nuevamente."
            : "Tu sesión ya no es válida. Inicia sesión nuevamente."
        );

        navigate("/login", {
          replace: true,
          state: {
            from: "/agendar",
          },
        });

        return;
      }

      // Otros errores del backend.
      if (!response.ok) {
        console.error(
          "Error detallado del backend:",
          data
        );

        alert(
          data.message ||
            "No fue posible solicitar la cita."
        );

        return;
      }

      // Cita creada correctamente.
      setAppointmentDetails(data);
      setStep(3);
    } catch (error) {
      console.error(
        "Error al crear la cita:",
        error
      );

      alert("Hubo un fallo de red.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background-alt px-4 py-12">
      <div className="container mx-auto max-w-3xl">

        {/* INDICADOR DE PASOS */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {stepLabels.map((label, index) => (
            <div
              key={label}
              className="flex items-center gap-2"
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  index < step
                    ? "bg-success text-success-foreground"
                    : index === step
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {index < step ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </div>

              <span
                className={`hidden text-sm sm:inline ${
                  index === step
                    ? "font-medium text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {label}
              </span>

              {index < stepLabels.length - 1 && (
                <div
                  className={`h-0.5 w-8 ${
                    index < step
                      ? "bg-success"
                      : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* PASO 0: MODALIDAD */}
          {step === 0 && (
            <motion.div
              key="modality"
              initial={{
                opacity: 0,
                x: 20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              exit={{
                opacity: 0,
                x: -20,
              }}
            >
              <div className="text-center">
                <h1 className="font-heading text-3xl font-bold text-foreground">
                  ¿Cómo prefieres tu sesión?
                </h1>

                <p className="mt-2 text-muted-foreground">
                  Ambas modalidades están disponibles según agenda.
                </p>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() =>
                    handleModalitySelection(
                      "presencial"
                    )
                  }
                  className={`group rounded-xl border p-6 text-left transition-all hover:-translate-y-1 hover:shadow-lg ${
                    modality === "presencial"
                      ? "border-primary bg-primary/5"
                      : "bg-card"
                  }`}
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/20 text-secondary">
                    <MapPin className="h-6 w-6" />
                  </div>

                  <h3 className="font-heading text-lg font-semibold text-foreground">
                    Presencial
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Atención presencial disponible los jueves y viernes.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleModalitySelection(
                      "online"
                    )
                  }
                  className={`group rounded-xl border p-6 text-left transition-all hover:-translate-y-1 hover:shadow-lg ${
                    modality === "online"
                      ? "border-primary bg-primary/5"
                      : "bg-card"
                  }`}
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/20 text-secondary">
                    <Video className="h-6 w-6" />
                  </div>

                  <h3 className="font-heading text-lg font-semibold text-foreground">
                    En línea
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Videollamada desde cualquier país.
                  </p>
                </button>
              </div>
            </motion.div>
          )}

          {/* PASO 1: FECHA Y HORA */}
          {step === 1 && (
            <motion.div
              key="datetime"
              initial={{
                opacity: 0,
                x: 20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              exit={{
                opacity: 0,
                x: -20,
              }}
            >
              <div className="text-center">
                <h1 className="font-heading text-3xl font-bold text-foreground">
                  Elige fecha y hora
                </h1>

                <p className="mt-2 text-muted-foreground">
                  Sesión{" "}
                  {modality === "online"
                    ? "en línea"
                    : "presencial"}{" "}
                  · 45 minutos
                </p>

                {modality === "presencial" && (
                  <p className="mt-1 text-sm font-medium text-secondary">
                    Atención presencial únicamente jueves y viernes.
                  </p>
                )}
              </div>

              <div className="mt-8 grid place-items-center gap-6 md:grid-cols-2">
                <div className="w-fit rounded-xl border bg-card p-6">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(selectedDate) => {
                      setDate(selectedDate);
                      setTime(null);
                      setAvailableSlots([]);
                    }}
                    disabled={isDateDisabled}
                    locale={es}
                    className="pointer-events-auto"
                  />
                </div>

                <div>
                  {date ? (
                    <>
                      <h3 className="mb-3 font-heading text-sm font-semibold text-foreground">
                        <CalendarIcon className="mr-1 inline h-4 w-4" />

                        {format(
                          date,
                          "EEEE d 'de' MMMM",
                          {
                            locale: es,
                          }
                        )}
                      </h3>

                      {availableSlots.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                          {availableSlots.map(
                            (slot) => (
                              <button
                                type="button"
                                key={slot}
                                onClick={() =>
                                  setTime(slot)
                                }
                                className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                                  time === slot
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "bg-card text-foreground hover:border-secondary hover:bg-secondary/10"
                                }`}
                              >
                                <Clock className="mr-1 inline h-3 w-3" />
                                {slot}
                              </button>
                            )
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No hay horarios disponibles este día.
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      Selecciona una fecha en el calendario
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <Button
                  variant="ghost"
                  onClick={() => setStep(0)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Anterior
                </Button>

                <Button
                  onClick={() => setStep(2)}
                  disabled={!date || !time}
                >
                  Siguiente
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* PASO 2: CONFIRMACIÓN */}
          {step === 2 && (
            <motion.div
              key="confirm"
              initial={{
                opacity: 0,
                x: 20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              exit={{
                opacity: 0,
                x: -20,
              }}
            >
              <div className="text-center">
                <h1 className="font-heading text-3xl font-bold text-foreground">
                  Confirma tu cita
                </h1>

                <p className="mt-2 text-muted-foreground">
                  Revisa los detalles antes de confirmar
                </p>
              </div>

              <div className="mx-auto mt-8 max-w-md rounded-xl border bg-card p-6 shadow-lg">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/20">
                      {modality === "online" ? (
                        <Video className="h-5 w-5 text-secondary" />
                      ) : (
                        <MapPin className="h-5 w-5 text-secondary" />
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Modalidad
                      </p>

                      <p className="text-sm text-muted-foreground">
                        {modality === "online"
                          ? "En línea (videollamada)"
                          : "Presencial (consultorio)"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/20">
                      <CalendarIcon className="h-5 w-5 text-secondary" />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Fecha y hora
                      </p>

                      <p className="text-sm text-muted-foreground">
                        {date &&
                          format(
                            date,
                            "EEEE d 'de' MMMM, yyyy",
                            {
                              locale: es,
                            }
                          )}{" "}
                        a las {time}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/20">
                      <Clock className="h-5 w-5 text-secondary" />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Duración
                      </p>

                      <p className="text-sm text-muted-foreground">
                        45 minutos
                      </p>
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

                  {isSubmitting
                    ? "Procesando..."
                    : "Solicitar cita"}
                </Button>

                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Recibirás un correo con los detalles de tu solicitud.
                </p>
              </div>

              <div className="mt-6 text-center">
                <Button
                  variant="ghost"
                  onClick={() => setStep(1)}
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Cambiar fecha y hora
                </Button>
              </div>
            </motion.div>
          )}

          {/* PASO 3: SOLICITUD CREADA */}
          {step === 3 &&
            appointmentDetails && (
              <motion.div
                key="success"
                initial={{
                  opacity: 0,
                  scale: 0.95,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.95,
                }}
                className="space-y-4 rounded-xl border border-muted bg-white p-8 text-center shadow-sm"
              >
                <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />

                <h2 className="text-2xl font-bold text-gray-900">
                  Cita solicitada correctamente
                </h2>

                <p className="text-muted-foreground">
                  Tu solicitud fue registrada para el día{" "}
                  <strong>
                    {date
                      ? format(
                          date,
                          "dd 'de' MMMM, yyyy",
                          {
                            locale: es,
                          }
                        )
                      : ""}
                  </strong>{" "}
                  a las <strong>{time}</strong> en modalidad{" "}
                  <strong>
                    {modality === "online"
                      ? "En línea"
                      : "Presencial"}
                  </strong>
                  .
                </p>

                <p className="text-sm text-muted-foreground">
                  Estado actual:{" "}
                  <strong className="text-foreground">
                    Pendiente de confirmación
                  </strong>
                  .
                </p>

                {modality === "online" && (
                  <p className="text-sm text-muted-foreground">
                    Una vez confirmada, recibirás la información para conectarte a la sesión.
                  </p>
                )}

                <div className="pt-4">
                  <Button
                    className="mt-2"
                    variant="outline"
                    onClick={() =>
                      window.location.reload()
                    }
                  >
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
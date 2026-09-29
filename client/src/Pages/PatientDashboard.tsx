import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import {
  Calendar,
  Clock,
  Video,
  MapPin,
  XCircle,
  RefreshCw,
  FileText,
  ExternalLink,
} from "lucide-react";

import { motion } from "framer-motion";

import {
  format,
  parseISO,
} from "date-fns";

import { es } from "date-fns/locale";

interface Appointment {
  _id: string;

  date: string;

  time: string;

  modality: "online" | "presencial";

  status:
    | "pendiente"
    | "confirmada"
    | "cancelada"
    | "completada";

  duration?: number;

  videoPlatform?:
    | "zoom"
    | "teams"
    | "whatsapp"
    | "otro"
    | null;

  videoLink?: string | null;

  receiptUrl?: string;
}

const statusColors: Record<string, string> = {
  pendiente:
    "bg-yellow-500/20 text-yellow-700 border-yellow-500/30",

  confirmada:
    "bg-success/20 text-success border-success/30",

  completada:
    "bg-secondary/20 text-secondary-foreground border-secondary/30",

  cancelada:
    "bg-destructive/20 text-destructive border-destructive/30",
};

const statusLabels: Record<string, string> = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  completada: "Completada",
  cancelada: "Cancelada",
};

const platformLabels: Record<string, string> = {
  zoom: "Zoom",
  teams: "Microsoft Teams",
  whatsapp: "WhatsApp",
  otro: "Otra plataforma",
};

const PatientDashboard = () => {
  const [appointments, setAppointments] = useState<
    Appointment[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  /*
   * Estados utilizados para reagendar.
   */
  const [
    reschedulingAppointmentId,
    setReschedulingAppointmentId,
  ] = useState<string | null>(null);

  const [
    rescheduleDate,
    setRescheduleDate,
  ] = useState("");

  const [
    rescheduleTime,
    setRescheduleTime,
  ] = useState("");

  const [
    availableSlots,
    setAvailableSlots,
  ] = useState<string[]>([]);

  const [
    loadingSlots,
    setLoadingSlots,
  ] = useState(false);

  const [
    rescheduling,
    setRescheduling,
  ] = useState(false);

  const [
    rescheduleError,
    setRescheduleError,
  ] = useState("");

  useEffect(() => {
    const fetchAppointments = async () => {
      const token =
        localStorage.getItem("clientToken");

      if (!token) {
        setError(
          "Debes iniciar sesión para ver tus citas."
        );

        setLoading(false);

        return;
      }

      try {
        const response = await fetch(
          "http://localhost:4000/api/appointments/mine",
          {
            method: "GET",

            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(
            data.message ||
              "No se pudieron cargar tus citas."
          );

          return;
        }

        if (!Array.isArray(data)) {
          setError(
            "El servidor devolvió un formato de citas inválido."
          );

          return;
        }

        setAppointments(data);
        setError("");
      } catch (error) {
        console.error(
          "Error al obtener las citas:",
          error
        );

        setError(
          "No se pudieron cargar tus citas."
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchAppointments();
  }, []);

  const handleCancelAppointment = async (
    appointmentId: string
  ) => {
    const token =
      localStorage.getItem("clientToken");

    if (!token) {
      alert(
        "Debes iniciar sesión."
      );

      return;
    }

    const confirmCancel =
      window.confirm(
        "¿Estás segura de que quieres cancelar esta cita?"
      );

    if (!confirmCancel) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:4000/api/appointments/${appointmentId}/cancel`,
        {
          method: "PATCH",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "No fue posible cancelar la cita."
        );
      }

      setAppointments(
        (previousAppointments) =>
          previousAppointments.map(
            (appointment) =>
              appointment._id ===
              appointmentId
                ? {
                    ...appointment,
                    status:
                      "cancelada",
                  }
                : appointment
          )
      );

      /*
       * Si por algún motivo estaba abierto
       * el formulario de reagendamiento de
       * esta misma cita, lo cerramos.
       */
      if (
        reschedulingAppointmentId ===
        appointmentId
      ) {
        closeReschedule();
      }

      alert(
        "Cita cancelada correctamente."
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No fue posible cancelar la cita.";

      alert(message);
    }
  };

  /*
   * Abrir el formulario de reagendamiento.
   *
   * No modificamos ni cancelamos la cita
   * en este momento.
   */
  const openReschedule = (
    appointmentId: string
  ) => {
    setReschedulingAppointmentId(
      appointmentId
    );

    setRescheduleDate("");
    setRescheduleTime("");
    setAvailableSlots([]);
    setRescheduleError("");
  };

  /*
   * Cerrar el formulario sin modificar
   * la cita existente.
   */
  const closeReschedule = () => {
    setReschedulingAppointmentId(null);
    setRescheduleDate("");
    setRescheduleTime("");
    setAvailableSlots([]);
    setRescheduleError("");
    setLoadingSlots(false);
    setRescheduling(false);
  };

  /*
   * Obtener los horarios disponibles
   * cuando el paciente selecciona una fecha.
   */
  const handleRescheduleDateChange = async (
    appointment: Appointment,
    selectedDate: string
  ) => {
    setRescheduleDate(selectedDate);
    setRescheduleTime("");
    setAvailableSlots([]);
    setRescheduleError("");

    if (!selectedDate) {
      return;
    }

    /*
     * Interpretamos la fecha a mediodía para
     * evitar desplazamientos de día por zona
     * horaria en el navegador.
     */
    const selected =
      new Date(
        `${selectedDate}T12:00:00`
      );

    if (
      Number.isNaN(
        selected.getTime()
      )
    ) {
      setRescheduleError(
        "La fecha seleccionada no es válida."
      );

      return;
    }

    const day =
      selected.getDay();

    /*
     * Domingo cerrado.
     */
    if (day === 0) {
      setRescheduleError(
        "No hay atención los domingos."
      );

      return;
    }

    /*
     * Las citas presenciales solamente
     * pueden mantenerse en jueves o viernes.
     */
    if (
      appointment.modality ===
        "presencial" &&
      day !== 4 &&
      day !== 5
    ) {
      setRescheduleError(
        "Las sesiones presenciales solo están disponibles los jueves y viernes."
      );

      return;
    }

    try {
      setLoadingSlots(true);

      const response = await fetch(
        `http://localhost:4000/api/appointments/available/${selectedDate}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "No fue posible obtener los horarios disponibles."
        );
      }

      if (!Array.isArray(data)) {
        throw new Error(
          "El servidor devolvió un formato de horarios inválido."
        );
      }

      setAvailableSlots(data);

      if (data.length === 0) {
        setRescheduleError(
          "No hay horarios disponibles para esta fecha."
        );
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No fue posible obtener los horarios disponibles.";

      setRescheduleError(message);
    } finally {
      setLoadingSlots(false);
    }
  };

  /*
   * Confirmar el reagendamiento.
   *
   * Recién aquí se modifica la cita
   * en la base de datos.
   */
  const handleRescheduleAppointment =
    async (
      appointment: Appointment
    ) => {
      const token =
        localStorage.getItem(
          "clientToken"
        );

      if (!token) {
        alert(
          "Debes iniciar sesión."
        );

        return;
      }

      if (
        !rescheduleDate ||
        !rescheduleTime
      ) {
        setRescheduleError(
          "Selecciona una nueva fecha y un horario."
        );

        return;
      }

      const confirmReschedule =
        window.confirm(
          `¿Quieres cambiar tu cita al ${rescheduleDate} a las ${rescheduleTime}?`
        );

      if (!confirmReschedule) {
        return;
      }

      try {
        setRescheduling(true);
        setRescheduleError("");

        const response = await fetch(
          `http://localhost:4000/api/appointments/${appointment._id}/reschedule`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              date: rescheduleDate,
              time: rescheduleTime,
            }),
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "No fue posible reagendar la cita."
          );
        }

        /*
         * Actualizamos inmediatamente la cita
         * mostrada en el portal.
         *
         * El backend devuelve la cita ya
         * modificada.
         */
        setAppointments(
          (previousAppointments) =>
            previousAppointments.map(
              (currentAppointment) =>
                currentAppointment._id ===
                appointment._id
                  ? {
                      ...currentAppointment,
                      ...data.appointment,
                    }
                  : currentAppointment
            )
        );

        closeReschedule();

        alert(
          data.message ||
            "Cita reagendada correctamente. Está pendiente de nueva confirmación."
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "No fue posible reagendar la cita.";

        setRescheduleError(message);
      } finally {
        setRescheduling(false);
      }
    };

  /*
   * Fecha mínima permitida por el input.
   */
  const getTodayString = () => {
    const today = new Date();

    const year =
      today.getFullYear();

    const month =
      String(
        today.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        today.getDate()
      ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const upcoming =
    appointments.filter(
      (appointment) =>
        appointment.status ===
          "pendiente" ||
        appointment.status ===
          "confirmada"
    );

  const history =
    appointments.filter(
      (appointment) =>
        appointment.status ===
          "completada" ||
        appointment.status ===
          "cancelada"
    );

  const AppointmentCard = ({
    apt,
  }: {
    apt: Appointment;
  }) => {
    const appointmentDate =
      parseISO(apt.date);

    const isRescheduling =
      reschedulingAppointmentId ===
      apt._id;

    return (
      <motion.div
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-md"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/20">
              {apt.modality ===
              "online" ? (
                <Video className="h-5 w-5 text-secondary" />
              ) : (
                <MapPin className="h-5 w-5 text-secondary" />
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-foreground">
                {format(
                  appointmentDate,
                  "EEEE d 'de' MMMM",
                  {
                    locale: es,
                  }
                )}
              </p>

              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />

                {apt.time}

                {" · "}

                {apt.modality ===
                "online"
                  ? "En línea"
                  : "Presencial"}
              </p>

              {apt.status ===
                "confirmada" &&
                apt.modality ===
                  "online" &&
                apt.videoPlatform && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Plataforma:{" "}
                    {platformLabels[
                      apt.videoPlatform
                    ] ||
                      apt.videoPlatform}
                  </p>
                )}
            </div>
          </div>

          <Badge
            variant="outline"
            className={
              statusColors[
                apt.status
              ] || ""
            }
          >
            {statusLabels[
              apt.status
            ] || apt.status}
          </Badge>
        </div>

        {apt.status ===
          "confirmada" && (
          <div className="mt-4 flex flex-wrap gap-2">
            {apt.videoLink && (
              <Button
                size="sm"
                variant="outline"
                asChild
              >
                <a
                  href={
                    apt.videoLink
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-1 h-3 w-3" />

                  Videollamada
                </a>
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (isRescheduling) {
                  closeReschedule();
                } else {
                  openReschedule(
                    apt._id
                  );
                }
              }}
            >
              <RefreshCw className="mr-1 h-3 w-3" />

              {isRescheduling
                ? "Cerrar"
                : "Reagendar"}
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="text-destructive hover:bg-destructive/10"
              onClick={() =>
                handleCancelAppointment(
                  apt._id
                )
              }
            >
              <XCircle className="mr-1 h-3 w-3" />

              Cancelar
            </Button>
          </div>
        )}

        {isRescheduling && (
          <div className="mt-5 rounded-lg border bg-background-alt p-4">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-foreground">
                Reagendar cita
              </h3>

              <p className="mt-1 text-xs text-muted-foreground">
                Tu cita actual se mantendrá
                hasta que confirmes el nuevo
                horario.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor={`reschedule-date-${apt._id}`}
                  className="mb-1 block text-sm font-medium text-foreground"
                >
                  Nueva fecha
                </label>

                <input
                  id={`reschedule-date-${apt._id}`}
                  type="date"
                  min={getTodayString()}
                  value={
                    rescheduleDate
                  }
                  onChange={(event) =>
                    void handleRescheduleDateChange(
                      apt,
                      event.target.value
                    )
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                />
              </div>

              {loadingSlots && (
                <p className="text-sm text-muted-foreground">
                  Buscando horarios
                  disponibles...
                </p>
              )}

              {!loadingSlots &&
                rescheduleDate &&
                availableSlots.length >
                  0 && (
                  <div>
                    <p className="mb-2 text-sm font-medium text-foreground">
                      Horarios disponibles
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {availableSlots.map(
                        (slot) => (
                          <Button
                            key={slot}
                            type="button"
                            size="sm"
                            variant={
                              rescheduleTime ===
                              slot
                                ? "default"
                                : "outline"
                            }
                            onClick={() => {
                              setRescheduleTime(
                                slot
                              );

                              setRescheduleError(
                                ""
                              );
                            }}
                          >
                            {slot}
                          </Button>
                        )
                      )}
                    </div>
                  </div>
                )}

              {rescheduleError && (
                <p className="text-sm text-destructive">
                  {rescheduleError}
                </p>
              )}

              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  type="button"
                  size="sm"
                  disabled={
                    !rescheduleDate ||
                    !rescheduleTime ||
                    loadingSlots ||
                    rescheduling
                  }
                  onClick={() =>
                    void handleRescheduleAppointment(
                      apt
                    )
                  }
                >
                  {rescheduling
                    ? "Reagendando..."
                    : "Confirmar nuevo horario"}
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={
                    rescheduling
                  }
                  onClick={
                    closeReschedule
                  }
                >
                  Mantener cita actual
                </Button>
              </div>
            </div>
          </div>
        )}

        {apt.receiptUrl && (
          <div className="mt-3">
            <Button
              size="sm"
              variant="ghost"
              asChild
            >
              <a
                href={
                  apt.receiptUrl
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                <FileText className="mr-1 h-3 w-3" />

                Ver comprobante
              </a>
            </Button>
          </div>
        )}
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background-alt px-4 py-8">
        <div className="container mx-auto max-w-3xl">
          <div className="rounded-xl border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Cargando tus citas...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background-alt px-4 py-8">
        <div className="container mx-auto max-w-3xl">
          <div className="rounded-xl border bg-card p-8 text-center">
            <p className="text-sm text-destructive">
              {error}
            </p>

            <Button
              className="mt-4"
              onClick={() =>
                window.location.reload()
              }
            >
              Intentar nuevamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background-alt px-4 py-8">
      <div className="container mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-foreground">
            Mi portal
          </h1>

          <p className="mt-1 text-muted-foreground">
            Gestiona tus citas y consulta
            tu historial
          </p>
        </div>

        <Tabs
          defaultValue="upcoming"
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming">
              <Calendar className="mr-2 h-4 w-4" />

              Próximas (
              {upcoming.length})
            </TabsTrigger>

            <TabsTrigger value="history">
              <Clock className="mr-2 h-4 w-4" />

              Historial (
              {history.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="upcoming"
            className="space-y-4"
          >
            {upcoming.length >
            0 ? (
              upcoming.map(
                (apt) => (
                  <AppointmentCard
                    key={
                      apt._id
                    }
                    apt={apt}
                  />
                )
              )
            ) : (
              <div className="rounded-xl border bg-card p-8 text-center">
                <Calendar className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />

                <p className="text-sm text-muted-foreground">
                  No tienes citas
                  próximas
                </p>

                <Button
                  className="mt-4"
                  asChild
                >
                  <a href="/agendar">
                    Agendar cita
                  </a>
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent
            value="history"
            className="space-y-4"
          >
            {history.length >
            0 ? (
              history.map(
                (apt) => (
                  <AppointmentCard
                    key={
                      apt._id
                    }
                    apt={apt}
                  />
                )
              )
            ) : (
              <div className="rounded-xl border bg-card p-8 text-center">
                <Clock className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />

                <p className="text-sm text-muted-foreground">
                  Todavía no tienes
                  historial de citas
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PatientDashboard;
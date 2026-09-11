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
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface Appointment {
  _id: string;
  date: string;
  time: string;
  modality: "online" | "presencial";
  status: "pendiente" | "confirmada" | "cancelada" | "completada";
  duration?: number;
  videoLink?: string;
  receiptUrl?: string;
}

const statusColors: Record<string, string> = {
  pendiente: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30",
  confirmada: "bg-success/20 text-success border-success/30",
  completada: "bg-secondary/20 text-secondary-foreground border-secondary/30",
  cancelada: "bg-destructive/20 text-destructive border-destructive/30",
};

const statusLabels: Record<string, string> = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  completada: "Completada",
  cancelada: "Cancelada",
};

const PatientDashboard = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAppointments = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Debes iniciar sesión para ver tus citas.");
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
          setError(data.message || "No se pudieron cargar tus citas.");
          return;
        }

        setAppointments(data);
      } catch (error) {
        console.error("Error al obtener las citas:", error);
        setError("No se pudieron cargar tus citas.");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // AQUÍ VA LA FUNCIÓN PARA CANCELAR
    const handleCancelAppointment = async (appointmentId: string) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Debes iniciar sesión.");
      return;
    }

    const confirmCancel = window.confirm(
      "¿Estás segura de que quieres cancelar esta cita?"
    );

    if (!confirmCancel) return;

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
          data.message || "No fue posible cancelar la cita."
        );
      }

      setAppointments((previousAppointments) =>
        previousAppointments.map((appointment) =>
          appointment._id === appointmentId
            ? {
                ...appointment,
                status: "cancelada",
              }
            : appointment
        )
      );

      alert("Cita cancelada correctamente.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No fue posible cancelar la cita.";

      alert(message);
    }
  };

  // DESPUÉS SIGUE LO QUE YA TENÍAS
  const upcoming = appointments.filter(
    (appointment) =>
      appointment.status === "pendiente" ||
      appointment.status === "confirmada"
  );

  const history = appointments.filter(
    (appointment) =>
      appointment.status === "completada" ||
      appointment.status === "cancelada"
  );

  const AppointmentCard = ({ apt }: { apt: Appointment }) => {
    const appointmentDate = parseISO(apt.date);

    
  


    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-md"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/20">
              {apt.modality === "online" ? (
                <Video className="h-5 w-5 text-secondary" />
              ) : (
                <MapPin className="h-5 w-5 text-secondary" />
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-foreground">
                {format(appointmentDate, "EEEE d 'de' MMMM", {
                  locale: es,
                })}
              </p>

              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />

                {apt.time}

                {" · "}

                {apt.modality === "online"
                  ? "En línea"
                  : "Presencial"}
              </p>
            </div>
          </div>

          <Badge
            variant="outline"
            className={statusColors[apt.status] || ""}
          >
            {statusLabels[apt.status] || apt.status}
          </Badge>
        </div>

        {apt.status === "confirmada" && (
          <div className="mt-4 flex flex-wrap gap-2">
            {apt.videoLink && (
              <Button size="sm" variant="outline" asChild>
                <a
                  href={apt.videoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-1 h-3 w-3" />
                  Videollamada
                </a>
              </Button>
            )}

            <Button size="sm" variant="outline">
              <RefreshCw className="mr-1 h-3 w-3" />
              Reagendar
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="text-destructive hover:bg-destructive/10"
              onClick={() => handleCancelAppointment(apt._id)}
            >
              <XCircle className="mr-1 h-3 w-3" />
              Cancelar
            </Button>
          </div>
        )}

        {apt.receiptUrl && (
          <div className="mt-3">
            <Button size="sm" variant="ghost" asChild>
              <a
                href={apt.receiptUrl}
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
            <p className="text-sm text-destructive">{error}</p>

            <Button
              className="mt-4"
              onClick={() => window.location.reload()}
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
            Gestiona tus citas y consulta tu historial
          </p>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming">
              <Calendar className="mr-2 h-4 w-4" />
              Próximas ({upcoming.length})
            </TabsTrigger>

            <TabsTrigger value="history">
              <Clock className="mr-2 h-4 w-4" />
              Historial ({history.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="upcoming"
            className="space-y-4"
          >
            {upcoming.length > 0 ? (
              upcoming.map((apt) => (
                <AppointmentCard
                  key={apt._id}
                  apt={apt}
                />
              ))
            ) : (
              <div className="rounded-xl border bg-card p-8 text-center">
                <Calendar className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />

                <p className="text-sm text-muted-foreground">
                  No tienes citas próximas
                </p>

                <Button className="mt-4" asChild>
                  <a href="/agendar">Agendar cita</a>
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent
            value="history"
            className="space-y-4"
          >
            {history.length > 0 ? (
              history.map((apt) => (
                <AppointmentCard
                  key={apt._id}
                  apt={apt}
                />
              ))
            ) : (
              <div className="rounded-xl border bg-card p-8 text-center">
                <Clock className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />

                <p className="text-sm text-muted-foreground">
                  Todavía no tienes historial de citas
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
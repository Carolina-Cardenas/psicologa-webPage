import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Video, MapPin, XCircle, RefreshCw, FileText, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { format, addDays } from "date-fns";
import { es } from "date-fns/locale";

interface Appointment {
  id: string;
  date: Date;
  time: string;
  modality: "online" | "presencial";
  status: "confirmada" | "cancelada" | "completada";
  videoLink?: string;
  receiptUrl?: string;
}

const mockAppointments: Appointment[] = [
  { id: "1", date: addDays(new Date(), 3), time: "10:00", modality: "online", status: "confirmada", videoLink: "https://meet.google.com/abc" },
  { id: "2", date: addDays(new Date(), 10), time: "14:00", modality: "presencial", status: "confirmada" },
  { id: "3", date: addDays(new Date(), -7), time: "11:00", modality: "online", status: "completada", receiptUrl: "#" },
  { id: "4", date: addDays(new Date(), -14), time: "09:00", modality: "presencial", status: "completada", receiptUrl: "#" },
  { id: "5", date: addDays(new Date(), -5), time: "16:00", modality: "online", status: "cancelada" },
];

const statusColors: Record<string, string> = {
  confirmada: "bg-success/20 text-success border-success/30",
  completada: "bg-secondary/20 text-secondary-foreground border-secondary/30",
  cancelada: "bg-destructive/20 text-destructive border-destructive/30",
};

const PatientDashboard = () => {
  const [appointments] = useState(mockAppointments);
  const upcoming = appointments.filter((a) => a.status === "confirmada");
  const history = appointments.filter((a) => a.status !== "confirmada");

  const AppointmentCard = ({ apt }: { apt: Appointment }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/20">
            {apt.modality === "online" ? <Video className="h-5 w-5 text-secondary" /> : <MapPin className="h-5 w-5 text-secondary" />}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {format(apt.date, "EEEE d 'de' MMMM", { locale: es })}
            </p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" /> {apt.time} · {apt.modality === "online" ? "En línea" : "Presencial"}
            </p>
          </div>
        </div>
        <Badge variant="outline" className={statusColors[apt.status]}>
          {apt.status}
        </Badge>
      </div>

      {apt.status === "confirmada" && (
        <div className="mt-4 flex flex-wrap gap-2">
          {apt.videoLink && (
            <Button size="sm" variant="outline" asChild>
              <a href={apt.videoLink} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-1 h-3 w-3" /> Videollamada
              </a>
            </Button>
          )}
          <Button size="sm" variant="outline">
            <RefreshCw className="mr-1 h-3 w-3" /> Reagendar
          </Button>
          <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10">
            <XCircle className="mr-1 h-3 w-3" /> Cancelar
          </Button>
        </div>
      )}

      {apt.receiptUrl && (
        <div className="mt-3">
          <Button size="sm" variant="ghost" asChild>
            <a href={apt.receiptUrl}>
              <FileText className="mr-1 h-3 w-3" /> Ver comprobante
            </a>
          </Button>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background-alt px-4 py-8">
      <div className="container mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-foreground">Mi portal</h1>
          <p className="mt-1 text-muted-foreground">Gestiona tus citas y consulta tu historial</p>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming">
              <Calendar className="mr-2 h-4 w-4" /> Próximas ({upcoming.length})
            </TabsTrigger>
            <TabsTrigger value="history">
              <Clock className="mr-2 h-4 w-4" /> Historial ({history.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcoming.length > 0 ? (
              upcoming.map((apt) => <AppointmentCard key={apt.id} apt={apt} />)
            ) : (
              <div className="rounded-xl border bg-card p-8 text-center">
                <Calendar className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No tienes citas próximas</p>
                <Button className="mt-4" asChild>
                  <a href="/agendar">Agendar cita</a>
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {history.map((apt) => <AppointmentCard key={apt.id} apt={apt} />)}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PatientDashboard;

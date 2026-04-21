import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Calendar as CalendarIcon, Clock, Video, MapPin, Search, Filter, XCircle,
  RefreshCw, Lock, User, FileText, Plus, ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { format, addDays, subDays } from "date-fns";
import { es } from "date-fns/locale";

interface AdminAppointment {
  id: string;
  patientName: string;
  date: Date;
  time: string;
  modality: "online" | "presencial";
  status: "confirmada" | "cancelada" | "completada";
  reason?: string;
}

const mockAdminAppointments: AdminAppointment[] = [
  { id: "1", patientName: "Ana Rodríguez", date: new Date(), time: "09:00", modality: "online", status: "confirmada" },
  { id: "2", patientName: "Carlos Mendoza", date: new Date(), time: "10:00", modality: "presencial", status: "confirmada" },
  { id: "3", patientName: "Laura García", date: new Date(), time: "11:00", modality: "online", status: "confirmada" },
  { id: "4", patientName: "Pedro Sánchez", date: addDays(new Date(), 1), time: "14:00", modality: "presencial", status: "confirmada" },
  { id: "5", patientName: "María Fernández", date: subDays(new Date(), 1), time: "09:00", modality: "online", status: "completada" },
  { id: "6", patientName: "Jorge Ruiz", date: subDays(new Date(), 2), time: "16:00", modality: "presencial", status: "cancelada", reason: "Paciente solicitó cancelación" },
];

interface BlockedSlot {
  id: string;
  date: string;
  reason: string;
}

const mockBlocked: BlockedSlot[] = [
  { id: "b1", date: format(addDays(new Date(), 5), "yyyy-MM-dd"), reason: "Vacaciones" },
];

const statusColors: Record<string, string> = {
  confirmada: "bg-success/20 text-success border-success/30",
  completada: "bg-secondary/20 text-secondary-foreground border-secondary/30",
  cancelada: "bg-destructive/20 text-destructive border-destructive/30",
};

const AdminDashboard = () => {
  const [appointments] = useState(mockAdminAppointments);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [modalityFilter, setModalityFilter] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [blockedSlots] = useState(mockBlocked);
  const [blockDate, setBlockDate] = useState<Date | undefined>();
  const [blockReason, setBlockReason] = useState("");

  const todayAppointments = appointments.filter(
    (a) => format(a.date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") && a.status === "confirmada"
  );

  const filteredAppointments = appointments.filter((a) => {
    const matchesSearch = a.patientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    const matchesModality = modalityFilter === "all" || a.modality === modalityFilter;
    return matchesSearch && matchesStatus && matchesModality;
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background-alt px-4 py-8">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Panel administrativo</h1>
            <p className="mt-1 text-muted-foreground">
              {format(new Date(), "EEEE d 'de' MMMM, yyyy", { locale: es })}
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Lock className="mr-2 h-4 w-4" /> Bloquear horario
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-heading">Bloquear horario</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Calendar
                  mode="single"
                  selected={blockDate}
                  onSelect={setBlockDate}
                  locale={es}
                  className="pointer-events-auto mx-auto"
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Motivo</label>
                  <Select value={blockReason} onValueChange={setBlockReason}>
                    <SelectTrigger><SelectValue placeholder="Selecciona el motivo" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vacaciones">Vacaciones</SelectItem>
                      <SelectItem value="enfermedad">Enfermedad</SelectItem>
                      <SelectItem value="emergencia">Emergencia</SelectItem>
                      <SelectItem value="personal">Motivo personal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" disabled={!blockDate || !blockReason}>
                  <Lock className="mr-2 h-4 w-4" /> Bloquear día
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Today's summary */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Citas hoy", value: todayAppointments.length, icon: CalendarIcon },
            { label: "Total pacientes", value: "24", icon: User },
            { label: "Días bloqueados", value: blockedSlots.length, icon: Lock },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="rounded-xl border bg-card p-5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/20">
                  <stat.icon className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="appointments">Citas</TabsTrigger>
            <TabsTrigger value="patients">Pacientes</TabsTrigger>
            <TabsTrigger value="schedule">Agenda</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Buscar paciente..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="confirmada">Confirmadas</SelectItem>
                  <SelectItem value="completada">Completadas</SelectItem>
                  <SelectItem value="cancelada">Canceladas</SelectItem>
                </SelectContent>
              </Select>
              <Select value={modalityFilter} onValueChange={setModalityFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Modalidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="online">En línea</SelectItem>
                  <SelectItem value="presencial">Presencial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Appointments list */}
            <div className="space-y-3">
              {filteredAppointments.map((apt) => (
                <motion.div key={apt.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-heading text-sm font-semibold text-primary">
                        {apt.patientName.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{apt.patientName}</p>
                        <p className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CalendarIcon className="h-3 w-3" />
                          {format(apt.date, "d MMM yyyy", { locale: es })}
                          <Clock className="h-3 w-3" /> {apt.time}
                          {apt.modality === "online" ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                          {apt.modality === "online" ? "En línea" : "Presencial"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={statusColors[apt.status]}>{apt.status}</Badge>
                      {apt.status === "confirmada" && (
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8" title="Reagendar">
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" title="Cancelar">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="patients" className="space-y-4">
            <div className="rounded-xl border bg-card p-6">
              <h3 className="mb-4 font-heading text-lg font-semibold text-foreground">Lista de pacientes</h3>
              {["Ana Rodríguez", "Carlos Mendoza", "Laura García", "Pedro Sánchez", "María Fernández", "Jorge Ruiz"].map((name, i) => (
                <div key={i} className="flex items-center justify-between border-b py-3 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{name}</p>
                      <p className="text-xs text-muted-foreground">{3 + i} sesiones</p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">
                    Ver ficha <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border bg-card p-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(d) => d && setSelectedDate(d)}
                  locale={es}
                  className="pointer-events-auto"
                />
              </div>
              <div className="rounded-xl border bg-card p-6">
                <h3 className="mb-4 font-heading text-sm font-semibold text-foreground">
                  {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                </h3>
                {appointments
                  .filter((a) => format(a.date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd"))
                  .map((apt) => (
                    <div key={apt.id} className="mb-3 flex items-center gap-3 rounded-lg border p-3">
                      <span className="text-sm font-medium text-primary">{apt.time}</span>
                      <span className="text-sm text-foreground">{apt.patientName}</span>
                      <Badge variant="outline" className={`ml-auto ${statusColors[apt.status]}`}>{apt.status}</Badge>
                    </div>
                  ))}

                {blockedSlots
                  .filter((b) => b.date === format(selectedDate, "yyyy-MM-dd"))
                  .map((b) => (
                    <div key={b.id} className="mb-3 flex items-center gap-3 rounded-lg border border-warning/30 bg-warning/10 p-3">
                      <Lock className="h-4 w-4 text-warning" />
                      <span className="text-sm text-foreground">Día bloqueado: {b.reason}</span>
                    </div>
                  ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;

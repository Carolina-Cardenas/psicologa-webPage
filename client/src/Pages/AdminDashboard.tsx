import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Calendar } from "@/components/ui/calendar";

import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  MapPin,
  Search,
  Filter,
  XCircle,
  RefreshCw,
  Lock,
  User,
  ChevronRight,
} from "lucide-react";

import { motion } from "framer-motion";

import {
  format,
  parseISO,
  isValid,
} from "date-fns";

import { es } from "date-fns/locale";

interface AppointmentClient {
  _id: string;
  nombre: string;
  apellidos: string;
  email: string;
  telefono?: string;
  pais?: string;
}

interface AdminAppointment {
  _id: string;

  clientId: AppointmentClient | null;

  date: string;

  time: string;

  duration: number;

  modality: "online" | "presencial";

  status:
    | "pendiente"
    | "confirmada"
    | "cancelada"
    | "completada";

  videoLink?: string | null;

  createdAt?: string;
  updatedAt?: string;
}

interface BlockedSlot {
  id: string;
  date: string;
  reason: string;
}

interface PatientSummary {
  id: string;
  name: string;
  email: string;
  sessions: number;
}

const statusColors: Record<string, string> = {
  pendiente:
    "bg-warning/20 text-warning-foreground border-warning/30",

  confirmada:
    "bg-success/20 text-success border-success/30",

  completada:
    "bg-secondary/20 text-secondary-foreground border-secondary/30",

  cancelada:
    "bg-destructive/20 text-destructive border-destructive/30",
};

const AdminDashboard = () => {
  const [appointments, setAppointments] = useState<
    AdminAppointment[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<string>("all");

  const [modalityFilter, setModalityFilter] =
    useState<string>("all");

  const [selectedDate, setSelectedDate] =
    useState<Date>(new Date());

  const [blockedSlots] = useState<BlockedSlot[]>([]);

  const [blockDate, setBlockDate] =
    useState<Date | undefined>();

  const [blockReason, setBlockReason] = useState("");

  useEffect(() => {
    const fetchAppointments = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError(
          "No hay una sesión administrativa activa."
        );

        setLoading(false);

        return;
      }

      try {
        const response = await fetch(
          "http://localhost:4000/api/appointments/admin/all",
          {
            method: "GET",

            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "No fue posible obtener las citas."
          );
        }

        if (!Array.isArray(data)) {
          throw new Error(
            "El servidor devolvió un formato de citas inválido."
          );
        }

        setAppointments(data);
      } catch (error) {
        console.error(
          "Error cargando citas del administrador:",
          error
        );

        const message =
          error instanceof Error
            ? error.message
            : "No fue posible obtener las citas.";

        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const getAppointmentDate = (
    date: string
  ): Date | null => {
    const parsedDate = parseISO(date);

    return isValid(parsedDate) ? parsedDate : null;
  };

  const getPatientName = (
    appointment: AdminAppointment
  ) => {
    if (!appointment.clientId) {
      return "Paciente no disponible";
    }

    return `${appointment.clientId.nombre} ${appointment.clientId.apellidos}`.trim();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const todayAppointments = appointments.filter(
    (appointment) => {
      const appointmentDate =
        getAppointmentDate(appointment.date);

      if (!appointmentDate) {
        return false;
      }

      return (
        format(appointmentDate, "yyyy-MM-dd") ===
          format(new Date(), "yyyy-MM-dd") &&
        appointment.status !== "cancelada"
      );
    }
  );

  const filteredAppointments = appointments.filter(
    (appointment) => {
      const patientName =
        getPatientName(appointment).toLowerCase();

      const patientEmail =
        appointment.clientId?.email.toLowerCase() ?? "";

      const normalizedSearch =
        searchQuery.trim().toLowerCase();

      const matchesSearch =
        patientName.includes(normalizedSearch) ||
        patientEmail.includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" ||
        appointment.status === statusFilter;

      const matchesModality =
        modalityFilter === "all" ||
        appointment.modality === modalityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesModality
      );
    }
  );

  const patients = useMemo<PatientSummary[]>(() => {
    const patientMap = new Map<
      string,
      PatientSummary
    >();

    appointments.forEach((appointment) => {
      const client = appointment.clientId;

      if (!client) {
        return;
      }

      const existingPatient = patientMap.get(
        client._id
      );

      if (existingPatient) {
        existingPatient.sessions += 1;

        return;
      }

      patientMap.set(client._id, {
        id: client._id,

        name: `${client.nombre} ${client.apellidos}`.trim(),

        email: client.email,

        sessions: 1,
      });
    });

    return Array.from(patientMap.values()).sort(
      (a, b) => a.name.localeCompare(b.name)
    );
  }, [appointments]);

  const appointmentsForSelectedDate =
    appointments.filter((appointment) => {
      const appointmentDate =
        getAppointmentDate(appointment.date);

      if (!appointmentDate) {
        return false;
      }

      return (
        format(appointmentDate, "yyyy-MM-dd") ===
        format(selectedDate, "yyyy-MM-dd")
      );
    });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background-alt px-4 py-8">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">
              Panel administrativo
            </h1>

            <p className="mt-1 text-muted-foreground">
              {format(
                new Date(),
                "EEEE d 'de' MMMM, yyyy",
                {
                  locale: es,
                }
              )}
            </p>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Lock className="mr-2 h-4 w-4" />
                Bloquear horario
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-heading">
                  Bloquear horario
                </DialogTitle>
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
                  <label className="text-sm font-medium text-foreground">
                    Motivo
                  </label>

                  <Select
                    value={blockReason}
                    onValueChange={setBlockReason}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el motivo" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="vacaciones">
                        Vacaciones
                      </SelectItem>

                      <SelectItem value="enfermedad">
                        Enfermedad
                      </SelectItem>

                      <SelectItem value="emergencia">
                        Emergencia
                      </SelectItem>

                      <SelectItem value="personal">
                        Motivo personal
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full"
                  disabled={!blockDate || !blockReason}
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Bloquear día
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
          >
            {error}
          </div>
        )}

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {[
            {
              label: "Citas hoy",
              value: todayAppointments.length,
              icon: CalendarIcon,
            },

            {
              label: "Total pacientes",
              value: patients.length,
              icon: User,
            },

            {
              label: "Días bloqueados",
              value: blockedSlots.length,
              icon: Lock,
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: index * 0.1,
              }}
              className="rounded-xl border bg-card p-5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/20">
                  <stat.icon className="h-5 w-5 text-secondary" />
                </div>

                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <Tabs
          defaultValue="appointments"
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="appointments">
              Citas
            </TabsTrigger>

            <TabsTrigger value="patients">
              Pacientes
            </TabsTrigger>

            <TabsTrigger value="schedule">
              Agenda
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="appointments"
            className="space-y-4"
          >
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  placeholder="Buscar paciente..."
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(event.target.value)
                  }
                  className="pl-10"
                />
              </div>

              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-40">
                  <Filter className="mr-2 h-4 w-4" />

                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">
                    Todos
                  </SelectItem>

                  <SelectItem value="pendiente">
                    Pendientes
                  </SelectItem>

                  <SelectItem value="confirmada">
                    Confirmadas
                  </SelectItem>

                  <SelectItem value="completada">
                    Completadas
                  </SelectItem>

                  <SelectItem value="cancelada">
                    Canceladas
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={modalityFilter}
                onValueChange={setModalityFilter}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Modalidad" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">
                    Todas
                  </SelectItem>

                  <SelectItem value="online">
                    En línea
                  </SelectItem>

                  <SelectItem value="presencial">
                    Presencial
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="rounded-xl border bg-card p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Cargando citas...
                </p>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="rounded-xl border bg-card p-8 text-center">
                <CalendarIcon className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />

                <p className="text-sm text-muted-foreground">
                  No hay citas para mostrar.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAppointments.map(
                  (appointment) => {
                    const patientName =
                      getPatientName(appointment);

                    const appointmentDate =
                      getAppointmentDate(
                        appointment.date
                      );

                    return (
                      <motion.div
                        key={appointment._id}
                        initial={{
                          opacity: 0,
                        }}
                        animate={{
                          opacity: 1,
                        }}
                        className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-heading text-sm font-semibold text-primary">
                              {getInitials(patientName)}
                            </div>

                            <div>
                              <p className="font-medium text-foreground">
                                {patientName}
                              </p>

                              {appointment.clientId && (
                                <p className="mb-1 text-xs text-muted-foreground">
                                  {
                                    appointment.clientId
                                      .email
                                  }
                                </p>
                              )}

                              <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <CalendarIcon className="h-3 w-3" />

                                {appointmentDate
                                  ? format(
                                      appointmentDate,
                                      "d MMM yyyy",
                                      {
                                        locale: es,
                                      }
                                    )
                                  : "Fecha inválida"}

                                <Clock className="h-3 w-3" />

                                {appointment.time}

                                {appointment.modality ===
                                "online" ? (
                                  <Video className="h-3 w-3" />
                                ) : (
                                  <MapPin className="h-3 w-3" />
                                )}

                                {appointment.modality ===
                                "online"
                                  ? "En línea"
                                  : "Presencial"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={
                                statusColors[
                                  appointment.status
                                ]
                              }
                            >
                              {appointment.status}
                            </Badge>

                            {appointment.status ===
                              "confirmada" && (
                              <div className="flex gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8"
                                  title="Reagendar"
                                >
                                  <RefreshCw className="h-4 w-4" />
                                </Button>

                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-destructive"
                                  title="Cancelar"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  }
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent
            value="patients"
            className="space-y-4"
          >
            <div className="rounded-xl border bg-card p-6">
              <h3 className="mb-4 font-heading text-lg font-semibold text-foreground">
                Lista de pacientes
              </h3>

              {loading ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Cargando pacientes...
                </p>
              ) : patients.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Todavía no hay pacientes con citas.
                </p>
              ) : (
                patients.map((patient) => (
                  <div
                    key={patient.id}
                    className="flex items-center justify-between border-b py-3 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {getInitials(patient.name)}
                      </div>

                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {patient.name}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {patient.email}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {patient.sessions}{" "}
                          {patient.sessions === 1
                            ? "cita"
                            : "citas"}
                        </p>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      disabled
                      title="La ficha clínica se conectará en el siguiente módulo"
                    >
                      Ver ficha
                      <ChevronRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent
            value="schedule"
            className="space-y-4"
          >
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border bg-card p-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) =>
                    date && setSelectedDate(date)
                  }
                  locale={es}
                  className="pointer-events-auto"
                />
              </div>

              <div className="rounded-xl border bg-card p-6">
                <h3 className="mb-4 font-heading text-sm font-semibold text-foreground">
                  {format(
                    selectedDate,
                    "EEEE d 'de' MMMM",
                    {
                      locale: es,
                    }
                  )}
                </h3>

                {appointmentsForSelectedDate.length ===
                0 ? (
                  <p className="text-sm text-muted-foreground">
                    No hay citas para este día.
                  </p>
                ) : (
                  appointmentsForSelectedDate.map(
                    (appointment) => (
                      <div
                        key={appointment._id}
                        className="mb-3 flex items-center gap-3 rounded-lg border p-3"
                      >
                        <span className="text-sm font-medium text-primary">
                          {appointment.time}
                        </span>

                        <span className="text-sm text-foreground">
                          {getPatientName(
                            appointment
                          )}
                        </span>

                        <Badge
                          variant="outline"
                          className={`ml-auto ${
                            statusColors[
                              appointment.status
                            ]
                          }`}
                        >
                          {appointment.status}
                        </Badge>
                      </div>
                    )
                  )
                )}

                {blockedSlots
                  .filter(
                    (blocked) =>
                      blocked.date ===
                      format(
                        selectedDate,
                        "yyyy-MM-dd"
                      )
                  )
                  .map((blocked) => (
                    <div
                      key={blocked.id}
                      className="mb-3 flex items-center gap-3 rounded-lg border border-warning/30 bg-warning/10 p-3"
                    >
                      <Lock className="h-4 w-4 text-warning" />

                      <span className="text-sm text-foreground">
                        Día bloqueado:{" "}
                        {blocked.reason}
                      </span>
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
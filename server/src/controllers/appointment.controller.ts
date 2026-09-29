import { Request, Response } from "express";

import Appointment from "../models/Appointment";
import Client from "../models/client";

import { getSlotsForDay } from "../constants/slots";

import {
  sendAppointmentCancellationNotificationToAdmin,
  sendAppointmentConfirmationEmail,
  sendNewAppointmentNotificationToAdmin,
} from "../services/email.service";

const getDayRange = (dateStr: string) => {
  const start = new Date(`${dateStr}T00:00:00.000Z`);
  const end = new Date(`${dateStr}T23:59:59.999Z`);

  return { start, end };
};

const getChileAppointmentDateTime = (
  appointmentDate: Date,
  appointmentTime: string
) => {
  const dateString = appointmentDate
    .toISOString()
    .slice(0, 10);

  const [year, month, day] = dateString
    .split("-")
    .map(Number);

  const [hour, minute] = appointmentTime
    .split(":")
    .map(Number);

  if (
    !year ||
    !month ||
    !day ||
    Number.isNaN(hour) ||
    Number.isNaN(minute)
  ) {
    return null;
  }

  const approximateUtc = new Date(
    Date.UTC(
      year,
      month - 1,
      day,
      hour,
      minute,
      0,
      0
    )
  );

  const formatter = new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone: "America/Santiago",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    }
  );

  const parts = formatter.formatToParts(
    approximateUtc
  );

  const values: Record<string, string> = {};

  for (const part of parts) {
    if (part.type !== "literal") {
      values[part.type] = part.value;
    }
  }

  const chileAsUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second)
  );

  const offset =
    chileAsUtc - approximateUtc.getTime();

  return new Date(
    approximateUtc.getTime() - offset
  );
};

/**
 * El paciente solamente puede cancelar o
 * reagendar cuando faltan MÁS de 24 horas
 * para la cita.
 */
const canModifyAppointment = (
  appointmentDate: Date,
  appointmentTime: string
) => {
  const appointmentDateTime =
    getChileAppointmentDateTime(
      appointmentDate,
      appointmentTime
    );

  if (!appointmentDateTime) {
    return false;
  }

  const millisecondsUntilAppointment =
    appointmentDateTime.getTime() -
    Date.now();

  const twentyFourHoursInMilliseconds =
    24 * 60 * 60 * 1000;

  return (
    millisecondsUntilAppointment >
    twentyFourHoursInMilliseconds
  );
};

/**
 * Crear una nueva cita.
 */
export const createAppointment = async (
  req: Request,
  res: Response
) => {
  try {
    const { date, time, modality } = req.body;

    const clientId = (req as any).user?.id;

    if (!clientId) {
      return res.status(401).json({
        message: "Usuario no autenticado.",
      });
    }

    if (
      modality !== "online" &&
      modality !== "presencial"
    ) {
      return res.status(400).json({
        message: "Modalidad inválida.",
      });
    }

    const { start, end } = getDayRange(date);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return res.status(400).json({
        message:
          "La fecha seleccionada no es válida.",
      });
    }

    const appointmentDay =
      start.getUTCDay();

    const allowedSlots =
      getSlotsForDay(appointmentDay);

    /**
     * Domingo cerrado.
     */
    if (allowedSlots.length === 0) {
      return res.status(400).json({
        message:
          "No hay atención los domingos.",
      });
    }

    /**
     * Validar que la hora exista para
     * el día seleccionado.
     */
    if (!allowedSlots.includes(time)) {
      return res.status(400).json({
        message:
          appointmentDay === 1
            ? "Los lunes la atención es de 12:00 a 19:00."
            : "El horario seleccionado no está dentro del horario de atención.",
      });
    }

    /**
     * Presencial solamente jueves y viernes.
     */
    const isInPersonDay =
      appointmentDay === 4 ||
      appointmentDay === 5;

    if (
      modality === "presencial" &&
      !isInPersonDay
    ) {
      return res.status(400).json({
        message:
          "Las sesiones presenciales solo están disponibles los jueves y viernes.",
      });
    }

    /**
     * No permitir fechas pasadas.
     */
    const startOfToday = new Date();

    startOfToday.setUTCHours(
      0,
      0,
      0,
      0
    );

    if (start < startOfToday) {
      return res.status(400).json({
        message:
          "No se pueden agendar citas en fechas pasadas.",
      });
    }

    /**
     * Comprobar disponibilidad.
     *
     * Las citas canceladas no bloquean
     * el horario.
     */
    const existingAppointment =
      await Appointment.findOne({
        date: {
          $gte: start,
          $lte: end,
        },
        time,
        status: {
          $ne: "cancelada",
        },
      });

    if (existingAppointment) {
      return res.status(409).json({
        message:
          "Este horario ya ha sido reservado.",
      });
    }

    /**
     * Crear cita pendiente.
     */
    const appointment =
      await Appointment.create({
        clientId,
        modality,
        date: start,
        time,
        status: "pendiente",
      });

    /**
     * Buscar paciente.
     */
    const client =
      await Client.findById(clientId);

    /**
     * Avisar a la psicóloga.
     *
     * Si falla el correo, la cita sigue creada.
     */
    if (client) {
      const adminEmail =
        process.env.ADMIN_NOTIFICATION_EMAIL;

      if (adminEmail) {
        try {
          const patientName =
            `${client.nombre} ${client.apellidos}`.trim();

          await sendNewAppointmentNotificationToAdmin(
            adminEmail,
            patientName,
            date,
            time,
            modality
          );
        } catch (emailError) {
          console.error(
            "La cita fue creada, pero no se pudo enviar la notificación al administrador:",
            emailError
          );
        }
      } else {
        console.warn(
          "ADMIN_NOTIFICATION_EMAIL no está configurado. La cita fue creada, pero no se envió notificación al administrador."
        );
      }
    }

    return res
      .status(201)
      .json(appointment);
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: number }).code ===
        11000
    ) {
      return res.status(409).json({
        message:
          "Este horario ya ha sido reservado.",
      });
    }

    console.error(
      "Error al crear cita:",
      error
    );

    return res.status(500).json({
      message: "Error al crear la cita.",
    });
  }
};

/**
 * Obtener horarios disponibles para una fecha.
 */
export const getAvailableSlots = async (
  req: Request<{ date: string }>,
  res: Response
) => {
  try {
    const { date } = req.params;

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date)
    ) {
      return res.status(400).json({
        message:
          "Formato de fecha inválido.",
      });
    }

    const { start, end } =
      getDayRange(date);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return res.status(400).json({
        message: "Fecha inválida.",
      });
    }

    const dayOfWeek =
      start.getUTCDay();

    const daySlots =
      getSlotsForDay(dayOfWeek);

    /**
     * Domingo cerrado.
     */
    if (daySlots.length === 0) {
      return res.status(200).json([]);
    }

    /**
     * Buscar horarios ocupados.
     */
    const appointments =
      await Appointment.find({
        date: {
          $gte: start,
          $lte: end,
        },
        status: {
          $ne: "cancelada",
        },
      });

    const takenSlots =
      appointments.map(
        (appointment) =>
          appointment.time
      );

    const available =
      daySlots.filter(
        (slot) =>
          !takenSlots.includes(slot)
      );

    return res
      .status(200)
      .json(available);
  } catch (error) {
    console.error(
      "Error al obtener horarios disponibles:",
      error
    );

    return res.status(500).json({
      message:
        "Error al obtener horarios disponibles.",
    });
  }
};

/**
 * Obtener las citas del paciente autenticado.
 */
export const getMyAppointments = async (
  req: Request,
  res: Response
) => {
  try {
    const clientId =
      (req as any).user?.id;

    if (!clientId) {
      return res.status(401).json({
        message:
          "Usuario no autenticado.",
      });
    }

    const appointments =
      await Appointment.find({
        clientId,
      })
        .sort({
          date: 1,
          time: 1,
        })
        .lean();

    return res
      .status(200)
      .json(appointments);
  } catch (error) {
    console.error(
      "Error al obtener mis citas:",
      error
    );

    return res.status(500).json({
      message:
        "Error al obtener tus citas.",
    });
  }
};

/**
 * Cancelar una cita del paciente.
 */
/**
 * Cancelar una cita del paciente.
 */
export const cancelMyAppointment = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const clientId = (req as any).user?.id;
    const { id } = req.params;

    if (!clientId) {
      return res.status(401).json({
        message: "Usuario no autenticado.",
      });
    }

    const appointment = await Appointment.findOne({
      _id: id,
      clientId,
    });

    if (!appointment) {
      return res.status(404).json({
        message: "Cita no encontrada.",
      });
    }

    if (appointment.status === "cancelada") {
      return res.status(400).json({
        message: "La cita ya está cancelada.",
      });
    }

    if (appointment.status === "completada") {
      return res.status(400).json({
        message:
          "No se puede cancelar una cita completada.",
      });
    }

    /**
     * REGLA DE 24 HORAS.
     *
     * La cancelación solamente puede realizarse
     * cuando faltan MÁS de 24 horas para la cita.
     */
    if (
      !canModifyAppointment(
        appointment.date,
        appointment.time
      )
    ) {
      return res.status(400).json({
        message:
          "Esta cita ya no puede cancelarse en línea porque faltan 24 horas o menos. Contacta directamente con la psicóloga.",
        code: "APPOINTMENT_CHANGE_DEADLINE",
      });
    }

    /**
     * Guardamos los datos originales antes
     * de modificar el estado.
     */
    const appointmentDate =
      appointment.date
        .toISOString()
        .slice(0, 10);

    const appointmentTime =
      appointment.time;

    const appointmentModality =
      appointment.modality;

    
    appointment.status = "cancelada";

    await appointment.save();

  
    try {
      const client =
        await Client.findById(clientId);

      const adminEmail =
        process.env.ADMIN_NOTIFICATION_EMAIL;

      if (client && adminEmail) {
        const patientName =
          `${client.nombre} ${client.apellidos}`.trim();

        await sendAppointmentCancellationNotificationToAdmin(
          adminEmail,
          patientName,
          appointmentDate,
          appointmentTime,
          appointmentModality
        );
      } else if (!adminEmail) {
        console.warn(
          "ADMIN_NOTIFICATION_EMAIL no está configurado. La cita fue cancelada, pero no se envió notificación al administrador."
        );
      } else if (!client) {
        console.warn(
          "La cita fue cancelada, pero no se encontró al paciente para enviar la notificación al administrador."
        );
      }
    } catch (emailError) {
      console.error(
        "La cita fue cancelada, pero no se pudo enviar la notificación al administrador:",
        emailError
      );
    }

    return res.status(200).json({
      message: "Cita cancelada correctamente.",
      appointment,
    });
  } catch (error) {
    console.error(
      "Error al cancelar cita:",
      error
    );

    return res.status(500).json({
      message:
        "Error al cancelar la cita.",
    });
  }
};

/**
 * Reagendar una cita del paciente.
 *
 * Se modifica la cita existente.
 * No se crea una segunda cita.
 */
export const rescheduleMyAppointment =
  async (
    req: Request<{ id: string }>,
    res: Response
  ) => {
    try {
      const clientId =
        (req as any).user?.id;

      const { id } = req.params;

      const { date, time } = req.body;

      if (!clientId) {
        return res.status(401).json({
          message:
            "Usuario no autenticado.",
        });
      }

      const appointment =
        await Appointment.findOne({
          _id: id,
          clientId,
        });

      if (!appointment) {
        return res.status(404).json({
          message:
            "Cita no encontrada.",
        });
      }

      /**
       * Solo las citas confirmadas pueden
       * reagendarse desde el portal.
       */
      if (
        appointment.status !==
        "confirmada"
      ) {
        return res.status(400).json({
          message:
            "Solo puedes reagendar una cita confirmada.",
        });
      }

      /**
       * REGLA DE 24 HORAS.
       *
       * Se comprueba la cita actual antes
       * de modificarla.
       */
      if (
        !canModifyAppointment(
          appointment.date,
          appointment.time
        )
      ) {
        return res.status(400).json({
          message:
            "Esta cita ya no puede reagendarse en línea porque faltan 24 horas o menos. Contacta directamente con la psicóloga.",
          code:
            "APPOINTMENT_CHANGE_DEADLINE",
        });
      }

      const { start, end } =
        getDayRange(date);

      if (
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime())
      ) {
        return res.status(400).json({
          message:
            "La fecha seleccionada no es válida.",
        });
      }

      /**
       * No permitir fechas pasadas.
       */
      const startOfToday =
        new Date();

      startOfToday.setUTCHours(
        0,
        0,
        0,
        0
      );

      if (start < startOfToday) {
        return res.status(400).json({
          message:
            "No puedes reagendar una cita a una fecha pasada.",
        });
      }

      const appointmentDay =
        start.getUTCDay();

      const allowedSlots =
        getSlotsForDay(
          appointmentDay
        );

      /**
       * Domingo cerrado.
       */
      if (allowedSlots.length === 0) {
        return res.status(400).json({
          message:
            "No hay atención los domingos.",
        });
      }

      /**
       * Validar horario.
       */
      if (!allowedSlots.includes(time)) {
        return res.status(400).json({
          message:
            appointmentDay === 1
              ? "Los lunes la atención es de 12:00 a 19:00."
              : "El horario seleccionado no está dentro del horario de atención.",
        });
      }

      /**
       * Si la cita es presencial,
       * debe continuar siendo jueves o viernes.
       */
      const isInPersonDay =
        appointmentDay === 4 ||
        appointmentDay === 5;

      if (
        appointment.modality ===
          "presencial" &&
        !isInPersonDay
      ) {
        return res.status(400).json({
          message:
            "Las sesiones presenciales solo están disponibles los jueves y viernes.",
        });
      }

      /**
       * Evitar reagendar exactamente
       * a la misma fecha y hora.
       */
      const currentDate =
        appointment.date
          .toISOString()
          .slice(0, 10);

      if (
        currentDate === date &&
        appointment.time === time
      ) {
        return res.status(400).json({
          message:
            "Selecciona una fecha u hora diferente a la cita actual.",
        });
      }

      /**
       * Comprobar disponibilidad.
       *
       * Excluimos la cita actual.
       */
      const existingAppointment =
        await Appointment.findOne({
          _id: {
            $ne: appointment._id,
          },
          date: {
            $gte: start,
            $lte: end,
          },
          time,
          status: {
            $ne: "cancelada",
          },
        });

      if (existingAppointment) {
        return res.status(409).json({
          message:
            "Este horario ya ha sido reservado.",
        });
      }

      /**
       * Mover la cita.
       */
      appointment.date = start;
      appointment.time = time;

      /**
       * Después del reagendamiento vuelve
       * a quedar pendiente.
       */
      appointment.status =
        "pendiente";

      /**
       * La confirmación anterior deja
       * de ser válida.
       */
      appointment.videoPlatform =
        null;

      appointment.videoLink =
        null;

      await appointment.save();

      /**
       * Avisar nuevamente a la psicóloga.
       *
       * Si falla el correo, no revertimos
       * el reagendamiento.
       */
      try {
        const client =
          await Client.findById(
            clientId
          );

        const adminEmail =
          process.env
            .ADMIN_NOTIFICATION_EMAIL;

        if (client && adminEmail) {
          const patientName =
            `${client.nombre} ${client.apellidos}`.trim();

          await sendNewAppointmentNotificationToAdmin(
            adminEmail,
            patientName,
            date,
            time,
            appointment.modality
          );
        } else if (!adminEmail) {
          console.warn(
            "ADMIN_NOTIFICATION_EMAIL no está configurado. La cita fue reagendada, pero no se envió notificación al administrador."
          );
        }
      } catch (emailError) {
        console.error(
          "La cita fue reagendada, pero no se pudo enviar la notificación al administrador:",
          emailError
        );
      }

      return res.status(200).json({
        message:
          "Cita reagendada correctamente. Está pendiente de nueva confirmación.",
        appointment,
      });
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: number })
          .code === 11000
      ) {
        return res.status(409).json({
          message:
            "Este horario ya ha sido reservado.",
        });
      }

      console.error(
        "Error al reagendar cita:",
        error
      );

      return res.status(500).json({
        message:
          "Error al reagendar la cita.",
      });
    }
  };

/**
 * Obtener todas las citas para administración.
 */
export const getAllAppointmentsForAdmin =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const appointments =
        await Appointment.find()
          .populate(
            "clientId",
            "nombre apellidos email telefono pais rut direccion"
          )
          .sort({
            date: 1,
            time: 1,
          })
          .lean();

      return res
        .status(200)
        .json(appointments);
    } catch (error) {
      console.error(
        "Error al obtener citas para admin:",
        error
      );

      return res.status(500).json({
        message:
          "Error al obtener las citas.",
      });
    }
  };

/**
 * Obtener citas de una fecha para administración.
 */
export const getAppointmentsByDate =
  async (
    req: Request<{
      date: string;
    }>,
    res: Response
  ) => {
    try {
      const { date } = req.params;

      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(
          date
        )
      ) {
        return res.status(400).json({
          message:
            "Formato de fecha inválido.",
        });
      }

      const { start, end } =
        getDayRange(date);

      if (
        Number.isNaN(
          start.getTime()
        ) ||
        Number.isNaN(
          end.getTime()
        )
      ) {
        return res.status(400).json({
          message:
            "Fecha inválida.",
        });
      }

      const appointments =
        await Appointment.find({
          date: {
            $gte: start,
            $lte: end,
          },
        })
          .populate(
            "clientId",
            "nombre apellidos email telefono pais rut direccion"
          )
          .sort({
            time: 1,
          })
          .lean();

      return res
        .status(200)
        .json(appointments);
    } catch (error) {
      console.error(
        "Error al obtener citas:",
        error
      );

      return res.status(500).json({
        message:
          "Error al obtener las citas de este día.",
      });
    }
  };

/**
 * Confirmar una cita desde administración.
 */
export const confirmAppointment =
  async (
    req: Request<{
      id: string;
    }>,
    res: Response
  ) => {
    try {
      const { id } = req.params;

      const body = req.body ?? {};

      const {
        videoPlatform,
        videoLink,
      }: {
        videoPlatform?:
          | "zoom"
          | "teams"
          | "whatsapp"
          | "otro";

        videoLink?: string;
      } = body;

      const appointment =
        await Appointment.findById(id);

      if (!appointment) {
        return res.status(404).json({
          message:
            "Cita no encontrada.",
        });
      }

      /**
       * Compatibilidad con citas antiguas
       * sin paciente asociado.
       */
      if (!appointment.clientId) {
        return res.status(409).json({
          message:
            "Esta es una cita antigua sin paciente asociado. Crea una nueva cita desde una cuenta de paciente para poder confirmarla.",
        });
      }

      if (
        appointment.status ===
        "cancelada"
      ) {
        return res.status(400).json({
          message:
            "No se puede confirmar una cita cancelada.",
        });
      }

      if (
        appointment.status ===
        "completada"
      ) {
        return res.status(400).json({
          message:
            "No se puede confirmar una cita completada.",
        });
      }

      if (
        appointment.status ===
        "confirmada"
      ) {
        return res.status(400).json({
          message:
            "La cita ya está confirmada.",
        });
      }

      /**
       * Para citas online debe existir
       * una plataforma.
       */
      if (
        appointment.modality ===
        "online"
      ) {
        const allowedPlatforms = [
          "zoom",
          "teams",
          "whatsapp",
          "otro",
        ] as const;

        if (
          !videoPlatform ||
          !allowedPlatforms.includes(
            videoPlatform
          )
        ) {
          return res.status(400).json({
            message:
              "Debes seleccionar la plataforma de videollamada.",
          });
        }

        appointment.videoPlatform =
          videoPlatform;

        /**
         * WhatsApp utiliza el teléfono
         * registrado del paciente.
         */
        if (
          videoPlatform ===
          "whatsapp"
        ) {
          const client =
            await Client.findById(
              appointment.clientId
            ).select("telefono");

          if (
            !client ||
            !client.telefono?.trim()
          ) {
            return res.status(400).json({
              message:
                "El paciente no tiene un número de teléfono registrado para utilizar WhatsApp.",
            });
          }

          appointment.videoLink =
            null;
        } else {
          /**
           * Zoom, Teams y Otra plataforma
           * necesitan enlace.
           */
          const normalizedVideoLink =
            videoLink?.trim();

          if (!normalizedVideoLink) {
            return res.status(400).json({
              message:
                "Debes ingresar el enlace de la videollamada.",
            });
          }

          try {
            const parsedUrl =
              new URL(
                normalizedVideoLink
              );

            if (
              parsedUrl.protocol !==
                "https:" &&
              parsedUrl.protocol !==
                "http:"
            ) {
              return res
                .status(400)
                .json({
                  message:
                    "El enlace debe utilizar HTTP o HTTPS.",
                });
            }
          } catch {
            return res.status(400).json({
              message:
                "El enlace de videollamada no es válido.",
            });
          }

          appointment.videoLink =
            normalizedVideoLink;
        }
      }

      /**
       * Las citas presenciales no necesitan
       * plataforma ni enlace.
       */
      if (
        appointment.modality ===
        "presencial"
      ) {
        appointment.videoPlatform =
          null;

        appointment.videoLink =
          null;
      }

      /**
       * Confirmar primero en MongoDB.
       */
      appointment.status =
        "confirmada";

      await appointment.save();

      /**
       * Enviar correo al paciente.
       *
       * Si falla el correo, la cita continúa
       * confirmada.
       */
      try {
        const client =
          await Client.findById(
            appointment.clientId
          );

        if (!client) {
          console.warn(
            "La cita fue confirmada, pero no se encontró al paciente para enviar el correo."
          );
        } else {
          const appointmentDate =
            appointment.date
              .toISOString()
              .slice(0, 10);

          await sendAppointmentConfirmationEmail(
            client.email,
            client.nombre,
            appointmentDate,
            appointment.time,
            appointment.modality,
            appointment.videoPlatform,
            appointment.videoLink
          );
        }
      } catch (emailError) {
        console.error(
          "La cita fue confirmada, pero el correo de confirmación no pudo enviarse:",
          emailError
        );
      }

      return res.status(200).json({
        message:
          "Cita confirmada correctamente.",
        appointment,
      });
    } catch (error) {
      console.error(
        "Error al confirmar cita:",
        error
      );

      return res.status(500).json({
        message:
          "Error al confirmar la cita.",
      });
    }
  };
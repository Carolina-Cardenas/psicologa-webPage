import { Request, Response } from "express";

import Appointment from "../models/Appointment";
import Client from "../models/client";

import { ALL_SLOTS } from "../constants/slots";

import {
  sendAppointmentConfirmationEmail,
} from "../services/email.service";

const getDayRange = (dateStr: string) => {
  const start = new Date(`${dateStr}T00:00:00.000Z`);
  const end = new Date(`${dateStr}T23:59:59.999Z`);

  return { start, end };
};

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

    if (!ALL_SLOTS.includes(time)) {
      return res.status(400).json({
        message: "El horario seleccionado no es válido.",
      });
    }

    const { start, end } = getDayRange(date);

    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);

    if (start < startOfToday) {
      return res.status(400).json({
        message: "No se pueden agendar citas en fechas pasadas.",
      });
    }

    const existingAppointment = await Appointment.findOne({
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
      return res.status(400).json({
        message: "Este horario ya ha sido reservado.",
      });
    }

    const appointment = await Appointment.create({
      clientId,
      modality,
      date: start,
      time,
      status: "pendiente",
    });

    const client = await Client.findById(clientId);

    if (client) {
      try {
        await sendAppointmentConfirmationEmail(
          client.email,
          client.nombre,
          date,
          time,
          modality
        );
      } catch (emailError) {
        console.error(
          "La cita fue creada, pero el correo no pudo enviarse:",
          emailError
        );
      }
    }

    return res.status(201).json(appointment);
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Este horario ya ha sido reservado.",
      });
    }

    console.error("Error al crear cita:", error);

    return res.status(500).json({
      message: "Error al crear la cita.",
    });
  }
};

export const getAvailableSlots = async (
  req: Request<{ date: string }>,
  res: Response
) => {
  try {
    const { date } = req.params;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        message: "Formato de fecha inválido.",
      });
    }

    const { start, end } = getDayRange(date);

    const appointments = await Appointment.find({
      date: {
        $gte: start,
        $lte: end,
      },
      status: {
        $ne: "cancelada",
      },
    });

    const takenSlots = appointments.map(
      (appointment) => appointment.time
    );

    const available = ALL_SLOTS.filter(
      (slot) => !takenSlots.includes(slot)
    );

    return res.json(available);
  } catch (error) {
    console.error(
      "Error al obtener horarios disponibles:",
      error
    );

    return res.status(500).json({
      message: "Error al obtener horarios disponibles.",
    });
  }
};

export const getMyAppointments = async (
  req: Request,
  res: Response
) => {
  try {
    const clientId = (req as any).user?.id;

    if (!clientId) {
      return res.status(401).json({
        message: "Usuario no autenticado.",
      });
    }

    const appointments = await Appointment.find({
      clientId,
    })
      .sort({
        date: 1,
        time: 1,
      })
      .lean();

    return res.status(200).json(appointments);
  } catch (error) {
    console.error(
      "Error al obtener mis citas:",
      error
    );

    return res.status(500).json({
      message: "Error al obtener tus citas.",
    });
  }
};

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

    appointment.status = "cancelada";

    await appointment.save();

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
      message: "Error al cancelar la cita.",
    });
  }
};

export const getAllAppointmentsForAdmin = async (
  req: Request,
  res: Response
) => {
  try {
    const appointments = await Appointment.find()
      .populate(
        "clientId",
        "nombre apellidos email telefono pais"
      )
      .sort({
        date: 1,
        time: 1,
      })
      .lean();

    return res.status(200).json(appointments);
  } catch (error) {
    console.error(
      "Error al obtener citas para admin:",
      error
    );

    return res.status(500).json({
      message: "Error al obtener las citas.",
    });
  }
};

export const getAppointmentsByDate = async (
  req: Request<{ date: string }>,
  res: Response
) => {
  try {
    const { date } = req.params;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        message: "Formato de fecha inválido.",
      });
    }

    const { start, end } = getDayRange(date);

    const appointments = await Appointment.find({
      date: {
        $gte: start,
        $lte: end,
      },
    })
      .populate(
        "clientId",
        "nombre apellidos email telefono pais"
      )
      .sort({
        time: 1,
      })
      .lean();

    return res.status(200).json(appointments);
  } catch (error) {
    console.error(
      "Error al obtener citas:",
      error
    );

    return res.status(500).json({
      message: "Error al obtener las citas de este día.",
    });
  }
};
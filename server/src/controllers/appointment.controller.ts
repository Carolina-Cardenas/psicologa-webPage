import { Request, Response } from "express";
import Appointment from "../models/Appointment";
import { ALL_SLOTS } from "../constants/slots";

// Función utilitaria para obtener el rango del día en UTC
const getDayRange = (dateStr: string) => {
  const start = new Date(`${dateStr}T00:00:00.000Z`);
  const end = new Date(`${dateStr}T23:59:59.999Z`);
  return { start, end };
};

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const { date, time } = req.body;
    const { start, end } = getDayRange(date);

    // Seguridad: Verificar si el slot ya está ocupado antes de guardar
    const existingAppointment = await Appointment.findOne({
      date: { $gte: start, $lte: end },
      time,
      status: { $ne: "cancelada" }
    });

    if (existingAppointment) {
       return res.status(400).json({ message: "Este horario ya ha sido reservado." });
    }

    // Guardamos con la fecha normalizada al inicio del día
    const appointment = await Appointment.create({
      ...req.body,
      date: start, 
      status: "pendiente" // Forzamos que empiece en pendiente por seguridad
    });

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: "Error al crear la cita" });
  }
};

export const getAvailableSlots = async (req: Request<{ date: string }>, res: Response) => {
  try {
    const { date } = req.params; // Espera "YYYY-MM-DD"
    const { start, end } = getDayRange(date);

    const appointments = await Appointment.find({
      date: { $gte: start, $lte: end },
      status: { $ne: "cancelada" }
    });

    const takenSlots = appointments.map((a) => a.time);
    const available = ALL_SLOTS.filter((slot) => !takenSlots.includes(slot));

    res.json(available);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener horarios disponibles" });
  }
};

// --- AGREGAMOS ESTA FUNCIÓN PARA LA RUTA PROTEGIDA ---
export const getAppointmentsByDate = async (
  req: Request<{ date: string }>,
  res: Response
) => {
  try {
    const { date } = req.params; // Espera "YYYY-MM-DD"
    const { start, end } = getDayRange(date);

    const appointments = await Appointment.find({
      date: { $gte: start, $lte: end }
    });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener las citas de este día", error });
  }
};
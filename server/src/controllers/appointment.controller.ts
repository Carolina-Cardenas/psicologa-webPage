import { Request, Response } from "express";
import Appointment from "../models/Appointment";

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const appointment = await Appointment.create(req.body);
    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: "Error al crear la cita", error });
  }
};

export const getAppointmentsByDate = async (
  req: Request<{ date: string }>,
  res: Response
) => {
  try {
    const { date } = req.params;

    const appointments = await Appointment.find({
      date: new Date(date),
    });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener citas", error });
  }
};

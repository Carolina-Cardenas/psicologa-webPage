import { Request, Response, NextFunction } from "express";
import { z } from "zod";

export const appointmentSchemaVal = z.object({
  modality: z.enum(["online", "presencial"]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha debe ser YYYY-MM-DD"),
  time: z.string(), 
  patientName: z.string().min(3, "El nombre es obligatorio"),
  patientEmail: z.string().email("Email inválido"),
});

export const validateAppointment = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validamos el body y reemplazamos req.body con los datos limpios
    req.body = appointmentSchemaVal.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ message: "Datos de cita inválidos", error });
  }
};
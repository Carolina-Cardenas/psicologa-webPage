import { z } from "zod";

export const clientRegisterSchema = z.object({
  nombre: z.string().min(2).max(100),
  apellidos: z.string().min(2).max(100),
  fechaNacimiento: z.string().refine((val) => !isNaN(Date.parse(val)), "Fecha inválida"),
  genero: z.string().optional(),
  telefono: z.string().min(6).max(20),
  email: z.string().email(),
  pais: z.string().optional(),
  modalidadPreferida: z.enum(["presencial", "online"]).optional(),
  motivoConsulta: z.string().min(1).max(2000),
  terapiaPrevia: z.string().optional(),
  password: z.string().min(8).max(72),
});

export const clientLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const clientForgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8).max(72),
});

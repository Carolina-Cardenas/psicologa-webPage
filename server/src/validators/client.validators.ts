import { z } from "zod";

const rutRegex = /^\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]$/;

export const clientRegisterSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2)
    .max(100),

  apellidos: z
    .string()
    .trim()
    .min(2)
    .max(100),

  fechaNacimiento: z
    .string()
    .refine(
      (value) => !Number.isNaN(Date.parse(value)),
      "Fecha inválida"
    ),

  genero: z
    .string()
    .trim()
    .optional(),

  telefono: z
    .string()
    .trim()
    .min(6)
    .max(20),

  email: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase()),

  pais: z
    .string()
    .trim()
    .optional(),

  rut: z
    .string()
    .trim()
    .regex(
      rutRegex,
      "RUT inválido. Usa un formato como 12.345.678-5."
    ),

  direccion: z
    .string()
    .trim()
    .min(5, "La dirección es demasiado corta.")
    .max(250, "La dirección es demasiado larga."),

  modalidadPreferida: z
    .enum(["presencial", "online"])
    .optional(),

  motivoConsulta: z
    .string()
    .trim()
    .min(1)
    .max(2000),

  terapiaPrevia: z
    .string()
    .trim()
    .optional(),

  password: z
    .string()
    .min(8)
    .max(72),
});

export const clientLoginSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase()),

  password: z
    .string()
    .min(1),
});

export const clientForgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase()),
});

export const resetPasswordSchema = z.object({
  token: z
    .string()
    .min(1),

  newPassword: z
    .string()
    .min(8)
    .max(72),
});
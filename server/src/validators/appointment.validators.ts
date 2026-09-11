import { z } from "zod";

export const appointmentSchemaVal = z.object({
  modality: z.enum(["online", "presencial"]),

  date: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "Formato de fecha debe ser YYYY-MM-DD"
    ),

  time: z.string(),
});
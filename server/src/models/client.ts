import { Document, Schema, model } from "mongoose";

const clientSchema = new Schema(
  {
    nombre: { type: String, required: true, trim: true },
    apellidos: { type: String, required: true, trim: true },
    fechaNacimiento: { type: Date, required: true },
    genero: { type: String, trim: true },
    telefono: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    pais: { type: String, trim: true },
    password: { type: String, required: true, select: false },
    perfilClinico: {
      modalidadPreferida: { type: String, enum: ["presencial", "online"] },
      motivoConsulta: { type: String, select: false },
      terapiaPrevia: { type: String, select: false },
    },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

export default model("Client", clientSchema);

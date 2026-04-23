import { Schema, model } from "mongoose";

const appointmentSchema = new Schema(
  {
    modality: {
      type: String,
      enum: ["online", "presencial"],
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      default: 45,
    },
    patientName: {
      type: String,
    },
    patientEmail: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pendiente", "confirmada", "cancelada"],
      default: "pendiente",
    },
  },
  { timestamps: true }
);

export default model("Appointment", appointmentSchema);

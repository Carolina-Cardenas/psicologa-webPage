import { Schema, model } from "mongoose";

const appointmentSchema = new Schema(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },

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

    status: {
      type: String,
      enum: ["pendiente", "confirmada", "cancelada"],
      default: "pendiente",
    },
  },
  { timestamps: true }
);

appointmentSchema.index(
  { date: 1, time: 1 },
  { unique: true }
);

export default model("Appointment", appointmentSchema);
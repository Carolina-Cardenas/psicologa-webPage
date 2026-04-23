import express from "express";
import cors from "cors";
import appointmentRoutes from "./routes/appointment.routes";

const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/appointments", appointmentRoutes);

export default app;

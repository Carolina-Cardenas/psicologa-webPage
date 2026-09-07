import { Router } from "express";
import {
  createAppointment,
  getAvailableSlots,
  getAppointmentsByDate,
} from "../controllers/appointment.controller";
import { validateBody } from "../middleware/validate";
import { appointmentSchemaVal } from "../validators/appointment.validators";
import { protectRoute, requireRole } from "../middleware/auth.middleware";
import rateLimit from "express-rate-limit";

const router = Router();

const appointmentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: "Demasiadas solicitudes de cita. Intenta más tarde." },
});

// --- RUTAS PÚBLICAS (pacientes) ---
router.get("/available/:date", getAvailableSlots);
router.post(
  "/",
  appointmentLimiter,
  validateBody(appointmentSchemaVal),
  createAppointment
);

// --- RUTA PROTEGIDA (solo admin/psicóloga) ---
router.get("/:date", protectRoute, requireRole("admin"), getAppointmentsByDate);

export default router;

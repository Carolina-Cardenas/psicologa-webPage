import { Router } from "express";
import {
  createAppointment,
  getAvailableSlots,
  cancelMyAppointment,
  getAppointmentsByDate,
  getMyAppointments,
} from "../controllers/appointment.controller";
import { validateBody } from "../middleware/validate";
import { appointmentSchemaVal } from "../validators/appointment.validators";
import {
  protectRoute,
  requireRole,
  requireAccountType,
} from "../middleware/auth.middleware";
import rateLimit from "express-rate-limit";

const router = Router();

const appointmentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    message: "Demasiadas solicitudes de cita. Intenta más tarde.",
  },
});

router.patch(
  "/:id/cancel",
  protectRoute,
  requireAccountType("client"),
  cancelMyAppointment
);

// Horarios disponibles
router.get("/available/:date", getAvailableSlots);

// Citas del paciente autenticado
router.get(
  "/mine",
  protectRoute,
  requireAccountType("client"),
  getMyAppointments
);

// Crear cita
router.post(
  "/",
  protectRoute,
  requireAccountType("client"),
  appointmentLimiter,
  validateBody(appointmentSchemaVal),
  createAppointment
);

// Citas para psicóloga/admin
router.get(
  "/:date",
  protectRoute,
  requireRole("admin"),
  getAppointmentsByDate
);

export default router;
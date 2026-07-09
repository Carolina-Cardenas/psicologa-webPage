import { Router } from "express";
import { 
  createAppointment, 
  getAvailableSlots, 
  getAppointmentsByDate
} from "../controllers/appointment.controller";
import { validateAppointment } from "../middleware/validate";
import { protectRoute } from "../middleware/auth.middleware";
import rateLimit from "express-rate-limit";

const router = Router();

// Limitador para evitar que colapsen el sistema de citas (Max 5 intentos por IP cada 15 min en creación)
const appointmentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: "Demasiadas solicitudes de cita. Intenta más tarde." }
});

// --- RUTAS PÚBLICAS (Para los Pacientes) ---
router.get("/available/:date", getAvailableSlots);
router.post("/",  validateAppointment, createAppointment);


router.get("/:date", protectRoute, getAppointmentsByDate); 

export default router;
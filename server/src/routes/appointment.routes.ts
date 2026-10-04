import { Router } from "express";
import rateLimit from "express-rate-limit";

import {
  createAppointment,
  getAvailableSlots,
  cancelMyAppointment,
  rescheduleMyAppointment,
  cancelAppointmentByAdmin,
  rescheduleAppointmentByAdmin,
  getAppointmentsByDate,
  getMyAppointments,
  getAllAppointmentsForAdmin,
  confirmAppointment,
} from "../controllers/appointment.controller";

import { validateBody } from "../middleware/validate";

import {
  appointmentSchemaVal,
  rescheduleAppointmentSchemaVal,
} from "../validators/appointment.validators";

import {
  protectRoute,
  requireRole,
  requireAccountType,
} from "../middleware/auth.middleware";

const router = Router();

const appointmentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    message:
      "Demasiadas solicitudes de cita. Intenta más tarde.",
  },
});

/**
 * HORARIOS DISPONIBLES
 */
router.get(
  "/available/:date",
  getAvailableSlots
);

/**
 * CITAS DEL PACIENTE
 */
router.get(
  "/mine",
  protectRoute,
  requireAccountType("client"),
  getMyAppointments
);

/**
 * CREAR CITA
 */
router.post(
  "/",
  protectRoute,
  requireAccountType("client"),
  appointmentLimiter,
  validateBody(appointmentSchemaVal),
  createAppointment
);

/**
 * CANCELAR CITA - PACIENTE
 */
router.patch(
  "/:id/cancel",
  protectRoute,
  requireAccountType("client"),
  cancelMyAppointment
);

/**
 * REAGENDAR CITA - PACIENTE
 */
router.patch(
  "/:id/reschedule",
  protectRoute,
  requireAccountType("client"),
  validateBody(rescheduleAppointmentSchemaVal),
  rescheduleMyAppointment
);

/**
 * TODAS LAS CITAS - ADMIN
 */
router.get(
  "/admin/all",
  protectRoute,
  requireRole("admin"),
  getAllAppointmentsForAdmin
);

/**
 * CANCELAR CITA - ADMIN
 *
 * El admin NO está sujeto a la regla de 24 horas.
 */
router.patch(
  "/admin/:id/cancel",
  protectRoute,
  requireRole("admin"),
  cancelAppointmentByAdmin
);

/**
 * REAGENDAR CITA - ADMIN
 *
 * El admin NO está sujeto a la regla de 24 horas.
 */
router.patch(
  "/admin/:id/reschedule",
  protectRoute,
  requireRole("admin"),
  validateBody(rescheduleAppointmentSchemaVal),
  rescheduleAppointmentByAdmin
);

/**
 * CONFIRMAR CITA - ADMIN
 */
router.patch(
  "/:id/confirm",
  protectRoute,
  requireRole("admin"),
  confirmAppointment
);

/**
 * CITAS POR FECHA - ADMIN
 *
 * IMPORTANTE:
 * esta ruta queda al final porque /:date
 * es una ruta dinámica.
 */
router.get(
  "/:date",
  protectRoute,
  requireRole("admin"),
  getAppointmentsByDate
);

export default router;
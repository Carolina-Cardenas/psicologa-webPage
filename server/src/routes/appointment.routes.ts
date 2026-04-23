import { Router } from "express";
import {
  createAppointment,
  getAppointmentsByDate,
} from "../controllers/appointment.controller";

const router = Router();

router.post("/", createAppointment);
router.get("/:date", getAppointmentsByDate);

export default router;

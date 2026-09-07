import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  login,
  register,
  forgotPassword,
} from "../controllers/admin.auth.controller";
import { protectRoute, requireRole } from "../middleware/auth.middleware";
import { validateBody } from "../middleware/validate";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
} from "../validators/admin.validators";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: "Demasiados intentos. Intenta más tarde." },
});

router.post(
  "/register",
  protectRoute,
  requireRole("admin"),
  validateBody(registerSchema),
  register
);
router.post("/login", authLimiter, validateBody(loginSchema), login);
router.post(
  "/forgotPassword",
  authLimiter,
  validateBody(forgotPasswordSchema),
  forgotPassword
);

export default router;

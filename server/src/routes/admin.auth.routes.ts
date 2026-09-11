import { Router } from "express";
import rateLimit from "express-rate-limit";

import {
  login,
  register,
  forgotPassword,
  resetPassword,
} from "../controllers/admin.auth.controller";

import {
  protectRoute,
  requireRole,
} from "../middleware/auth.middleware";

import { validateBody } from "../middleware/validate";

import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validators/admin.validators";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Demasiados intentos. Intenta más tarde.",
  },
});

router.post(
  "/register",
  protectRoute,
  requireRole("admin"),
  validateBody(registerSchema),
  register
);

router.post(
  "/login",
  authLimiter,
  validateBody(loginSchema),
  login
);

router.post(
  "/forgot-password",
  authLimiter,
  validateBody(forgotPasswordSchema),
  forgotPassword
);

router.post(
  "/reset-password",
  authLimiter,
  validateBody(resetPasswordSchema),
  resetPassword
);

export default router;
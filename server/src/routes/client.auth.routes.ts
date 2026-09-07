import { Router } from "express";
import rateLimit from "express-rate-limit";

import {
  registerClient,
  loginClient,
  forgotPasswordClient,
  resetPasswordClient,
} from "../controllers/client.auth.controller";

import { validateBody } from "../middleware/validate";

import {
  clientRegisterSchema,
  clientLoginSchema,
  clientForgotPasswordSchema,
  resetPasswordSchema,
} from "../validators/client.validators";

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
  authLimiter,
  validateBody(clientRegisterSchema),
  registerClient
);

router.post(
  "/login",
  authLimiter,
  validateBody(clientLoginSchema),
  loginClient
);

router.post(
  "/forgot-password",
  authLimiter,
  validateBody(clientForgotPasswordSchema),
  forgotPasswordClient
);

router.post(
  "/reset-password",
  authLimiter,
  validateBody(resetPasswordSchema),
  resetPasswordClient
);

export default router;

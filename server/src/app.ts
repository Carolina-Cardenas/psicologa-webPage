import express, { NextFunction, Request, Response } from "express";

import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import { sanitizeBody } from "./middleware/sanitize";

import adminAuthRoutes from "./routes/admin.auth.routes";
import clientAuthRoutes from "./routes/client.auth.routes";
import appointmentRoutes from "./routes/appointment.routes";

const app = express();

/**
 * =========================================================
 * CONFIGURACIÓN
 * =========================================================
 */

const clientUrl = process.env.CLIENT_URL;

if (!clientUrl) {
  throw new Error(
    "CLIENT_URL no está configurada en las variables de entorno."
  );
}

/**
 * =========================================================
 * SECURITY HEADERS
 * =========================================================
 */

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

/**
 * =========================================================
 * CORS
 * =========================================================
 */

app.use(
  cors({
    origin: clientUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/**
 * =========================================================
 * GLOBAL RATE LIMIT
 * =========================================================
 */

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Demasiadas solicitudes. Intenta nuevamente más tarde.",
  },
});

app.use(globalLimiter);

/**
 * =========================================================
 * BODY PARSER
 * =========================================================
 */

app.use(
  express.json({
    limit: "10kb",
  })
);

/**
 * =========================================================
 * INPUT SANITIZATION
 * =========================================================
 */

app.use(sanitizeBody);

/**
 * =========================================================
 * ROUTES
 * =========================================================
 */

app.use("/api/appointments", appointmentRoutes);

app.use("/api/admin/auth", adminAuthRoutes);

app.use("/api/client/auth", clientAuthRoutes);

/**
 * =========================================================
 * 404 HANDLER
 * =========================================================
 */

app.use((req: Request, res: Response) => {
  return res.status(404).json({
    message: "Ruta no encontrada.",
  });
});

/**
 * =========================================================
 * GLOBAL ERROR HANDLER
 * =========================================================
 */

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  console.error("Error interno:", err);

  if (res.headersSent) {
    return next(err);
  }

  return res.status(500).json({
    message: "Error interno del servidor.",
  });
});

export default app;

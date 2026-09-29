import {
  Request,
  Response,
  NextFunction,
} from "express";

import jwt, {
  JwtPayload,
  TokenExpiredError,
} from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    type: "admin" | "client";
    role?: "admin" | "psicologa";
  };
}

interface AppJwtPayload extends JwtPayload {
  id: string;
  type: "admin" | "client";
  role?: "admin" | "psicologa";
}

export const protectRoute = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Response | void => {
  const authorization =
    req.header("Authorization");

  if (!authorization) {
    return res.status(401).json({
      code: "TOKEN_MISSING",
      message:
        "Acceso denegado. No se proporcionó un token.",
    });
  }

  const [scheme, token] =
    authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      code: "TOKEN_INVALID",
      message:
        "Formato de autorización inválido.",
    });
  }

  const jwtSecret =
    process.env.JWT_SECRET;

  if (!jwtSecret) {
    console.error(
      "JWT_SECRET no está configurado."
    );

    return res.status(500).json({
      code: "SERVER_CONFIGURATION_ERROR",
      message:
        "Error de configuración del servidor.",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      jwtSecret,
      {
        algorithms: ["HS256"],
      }
    );

    if (
      typeof decoded !== "object" ||
      decoded === null ||
      typeof decoded.id !== "string" ||
      (
        decoded.type !== "admin" &&
        decoded.type !== "client"
      )
    ) {
      return res.status(401).json({
        code: "TOKEN_INVALID",
        message: "Token inválido.",
      });
    }

    const payload =
      decoded as AppJwtPayload;

    /*
     * Cliente:
     * solamente necesita id y type.
     */
    if (payload.type === "client") {
      req.user = {
        id: payload.id,
        type: "client",
      };

      next();
      return;
    }

    /*
     * Admin:
     * además debe tener un role válido.
     */
    if (
      payload.role !== "admin" &&
      payload.role !== "psicologa"
    ) {
      return res.status(401).json({
        code: "TOKEN_INVALID",
        message:
          "El token administrativo no contiene un rol válido.",
      });
    }

    req.user = {
      id: payload.id,
      type: "admin",
      role: payload.role,
    };

    next();
  } catch (error) {
    if (
      error instanceof TokenExpiredError
    ) {
      return res.status(401).json({
        code: "TOKEN_EXPIRED",
        message:
          "Tu sesión ha expirado. Inicia sesión nuevamente.",
      });
    }

    console.error(
      "Error verificando JWT:",
      error
    );

    return res.status(401).json({
      code: "TOKEN_INVALID",
      message:
        "La sesión no es válida. Inicia sesión nuevamente.",
    });
  }
};

export const requireRole = (
  requiredRole: "admin" | "psicologa"
) => {
  return (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Response | void => {
    if (!req.user) {
      return res.status(401).json({
        code: "NOT_AUTHENTICATED",
        message:
          "Usuario no autenticado.",
      });
    }

    if (
      req.user.type !== "admin" ||
      req.user.role !== requiredRole
    ) {
      return res.status(403).json({
        code: "FORBIDDEN",
        message:
          "No tienes permisos para realizar esta acción.",
      });
    }

    next();
  };
};

export const requireAccountType = (
  requiredType: "admin" | "client"
) => {
  return (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Response | void => {
    if (!req.user) {
      return res.status(401).json({
        code: "NOT_AUTHENTICATED",
        message:
          "Usuario no autenticado.",
      });
    }

    if (
      req.user.type !== requiredType
    ) {
      return res.status(403).json({
        code: "FORBIDDEN",
        message:
          "No tienes permisos para realizar esta acción.",
      });
    }

    next();
  };
};
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    type: "admin" | "client";
  };
}

export const protectRoute = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Response | void => {
  const authorization = req.header("Authorization");

  if (!authorization) {
    return res.status(401).json({
      message: "Acceso denegado. No se proporcionó un token.",
    });
  }

  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      message: "Formato de autorización inválido.",
    });
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    console.error("JWT_SECRET no está configurado.");

    return res.status(500).json({
      message: "Error de configuración del servidor.",
    });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);

    if (
      typeof decoded !== "object" ||
      decoded === null ||
      typeof decoded.id !== "string" ||
      (decoded.type !== "admin" && decoded.type !== "client")
    ) {
      return res.status(401).json({
        message: "Token inválido.",
      });
    }

    req.user = {
      id: decoded.id,
      type: decoded.type,
    };

    next();
  } catch (error) {
    console.error("Error verificando JWT:", error);

    return res.status(401).json({
      message: "Token inválido o expirado.",
    });
  }
};

export const requireRole = (requiredRole: "admin" | "client") => {
  return (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Response | void => {
    if (!req.user) {
      return res.status(401).json({
        message: "Usuario no autenticado.",
      });
    }

    if (req.user.type !== requiredRole) {
      return res.status(403).json({
        message: "No tienes permisos para realizar esta acción.",
      });
    }

    next();
  };
};

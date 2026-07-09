import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: any;
}

export const protectRoute = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.header("Authorization")?.split(" ")[1]; // Espera formato "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ message: "Acceso denegado. No se proporcionó un token." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded; // Guardamos los datos del usuario en la petición
    next();
  } catch (error) {
    res.status(401).json({ message: "Token inválido o expirado" });
  }
};
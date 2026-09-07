import { Request, Response, NextFunction } from "express";

const sanitizeObject = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  if (obj !== null && typeof obj === "object") {
    const clean: any = {};
    for (const key of Object.keys(obj)) {
      if (key.startsWith("$") || key.includes(".")) continue;
      clean[key] = sanitizeObject(obj[key]);
    }
    return clean;
  }
  return obj;
};

export const sanitizeBody = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.body) req.body = sanitizeObject(req.body);
  next();
};

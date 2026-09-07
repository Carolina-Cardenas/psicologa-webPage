import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

export const validateBody = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Datos de entrada inválidos.",
        errors: result.error.flatten().fieldErrors,
      });
    }

    req.body = result.data;
    next();
  };
};

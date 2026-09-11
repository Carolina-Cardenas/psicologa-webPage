import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body; // ya validado por zod (registerSchema)

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "El email ya está registrado" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });
    res
      .status(201)
      .json({ message: "Usuario creado con éxito", userId: newUser._id });
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ message: "Error en el registro" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // .select("+password") es necesario porque el modelo oculta el password por defecto
    const user = await User.findOne({ email }).select("+password");
    if (!user)
      return res.status(400).json({ message: "Credenciales inválidas" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Credenciales inválidas" });

    // "type: admin" distingue este token de uno de cliente (ver auth.middleware.ts)
    const token = jwt.sign(
      {
        id: user._id.toString(),
        role: user.role,
        type: "admin",
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1d",
        algorithm: "HS256",
      }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    return res.status(200).json({
      message:
        "Si el correo está registrado, recibirás un enlace de recuperación.",
    });
  } catch (error) {
    console.error("Error en forgotPassword:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

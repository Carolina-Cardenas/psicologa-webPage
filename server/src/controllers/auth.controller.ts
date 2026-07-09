import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "El email ya está registrado" });

    // Encriptar contraseña antes de guardar
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({ name, email, password: hashedPassword });
    res.status(201).json({ message: "Usuario creado con éxito", userId: newUser._id });
  } catch (error) {
    res.status(500).json({ message: "Error en el registro" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Credenciales inválidas" });

    // Verificar si la contraseña coincide
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Credenciales inválidas" });

    // Generar el Token JWT protegido (Expira en 1 día)
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "El correo electrónico es requerido." });
    }

    // Buscamos si el usuario existe de verdad en la base de datos
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "El correo ingresado no se encuentra registrado." });
    }

    console.log(`Solicitud de recuperación para: ${email}`);
    
    // Respondemos con un 200 OK para que el frontend active la vista de éxito
    return res.status(200).json({ message: "Enlace de recuperación enviado con éxito." });
  } catch (error) {
    console.error("Error en forgotPassword:", error);
    return res.status(500).json({ message: "Error interno del servidor al procesar la solicitud." });
  }
};
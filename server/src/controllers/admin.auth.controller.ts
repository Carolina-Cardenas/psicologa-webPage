import { Request, Response } from "express";

import User from "../models/User";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import { sendAdminResetPasswordEmail } from "../services/email.service";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    const normalizedEmail = email.trim().toLowerCase();

    const userExists = await User.findOne({
      email: normalizedEmail,
    });

    if (userExists) {
      return res.status(400).json({
        message: "El email ya está registrado.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role,
    });

    return res.status(201).json({
      message: "Usuario creado con éxito.",
      userId: newUser._id,
    });
  } catch (error) {
    console.error("Error en registro:", error);

    return res.status(500).json({
      message: "Error en el registro.",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Credenciales inválidas.",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Credenciales inválidas.",
      });
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error(
        "JWT_SECRET no está configurado."
      );
    }

    const token = jwt.sign(
      {
        id: user._id.toString(),
        role: user.role,
        type: "admin",
      },
      jwtSecret,
      {
        expiresIn: "1d",
        algorithm: "HS256",
      }
    );

    return res.status(200).json({
      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        type: "admin",
      },
    });
  } catch (error) {
    console.error("Error en login:", error);

    return res.status(500).json({
      message: "Error en el servidor.",
    });
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response
) => {
  try {
    const { email } = req.body;

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(200).json({
        message:
          "Si el correo está registrado, recibirás un enlace de recuperación.",
      });
    }

    const resetToken = crypto
      .randomBytes(32)
      .toString("hex");

    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = new Date(
      Date.now() + 15 * 60 * 1000
    );

    await user.save();

    await sendAdminResetPasswordEmail(
      user.email,
      resetToken
    );

    return res.status(200).json({
      message:
        "Si el correo está registrado, recibirás un enlace de recuperación.",
    });
  } catch (error) {
    console.error(
      "Error en forgotPassword:",
      error
    );

    return res.status(500).json({
      message:
        "No fue posible procesar la solicitud.",
    });
  }
};

export const resetPassword = async (
  req: Request,
  res: Response
) => {
  try {
    const { token, newPassword } = req.body;

    const resetTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,

      resetPasswordExpires: {
        $gt: new Date(),
      },
    }).select(
      "+password +resetPasswordToken +resetPasswordExpires"
    );

    if (!user) {
      return res.status(400).json({
        message:
          "El enlace de recuperación es inválido o ha expirado.",
      });
    }

    user.password = await bcrypt.hash(
      newPassword,
      12
    );

    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    return res.status(200).json({
      message:
        "Contraseña actualizada correctamente.",
    });
  } catch (error) {
    console.error(
      "Error al restablecer contraseña:",
      error
    );

    return res.status(500).json({
      message:
        "No fue posible restablecer la contraseña.",
    });
  }
};
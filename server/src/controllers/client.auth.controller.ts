import { Request, Response } from "express";

import bcrypt from "bcrypt";

import jwt from "jsonwebtoken";

import crypto from "crypto";

import Client from "../models/client";

import { sendResetPasswordEmail } from "../services/email.service";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET no está configurado en las variables de entorno."
  );
}

const generateClientToken = (
  clientId: string
): string => {
  return jwt.sign(
    {
      id: clientId,
      type: "client",
    },
    JWT_SECRET,
    {
      expiresIn: "1d",
      algorithm: "HS256",
    }
  );
};

/**
 * REGISTRO DE CLIENTE
 *
 * POST /api/client/auth/register
 */
export const registerClient = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const {
      nombre,
      apellidos,
      fechaNacimiento,
      genero,
      telefono,
      email,
      pais,
      rut,
      direccion,
      modalidadPreferida,
      motivoConsulta,
      terapiaPrevia,
      password,
    } = req.body;

    const normalizedNombre = nombre.trim();

    const normalizedApellidos =
      apellidos.trim();

    const normalizedEmail =
      email.toLowerCase().trim();

    const normalizedTelefono =
      telefono.trim();

    const normalizedRut = rut
      .trim()
      .toUpperCase();

    const normalizedDireccion =
      direccion.trim();

    const normalizedMotivoConsulta =
      motivoConsulta.trim();

    const existingClient =
      await Client.findOne({
        email: normalizedEmail,
      });

    if (existingClient) {
      return res.status(409).json({
        message:
          "Ya existe una cuenta con este correo electrónico.",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 12);

    const client = await Client.create({
      nombre: normalizedNombre,
      apellidos: normalizedApellidos,
      fechaNacimiento:
        new Date(fechaNacimiento),
      genero:
        genero?.trim() || undefined,
      telefono: normalizedTelefono,
      email: normalizedEmail,
      pais:
        pais?.trim() || undefined,
      rut: normalizedRut,
      direccion: normalizedDireccion,
      password: hashedPassword,
      perfilClinico: {
        modalidadPreferida:
          modalidadPreferida || undefined,
        motivoConsulta:
          normalizedMotivoConsulta,
        terapiaPrevia:
          terapiaPrevia?.trim() || undefined,
      },
    });

    const token =
      generateClientToken(
        client._id.toString()
      );

    return res.status(201).json({
      message:
        "Cuenta creada correctamente.",
      token,
      client: {
        id: client._id,
        nombre: client.nombre,
        apellidos: client.apellidos,
        email: client.email,
      },
    });
  } catch (error: unknown) {
    console.error(
      "Error al registrar cliente:",
      error
    );

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: number }).code ===
        11000
    ) {
      return res.status(409).json({
        message:
          "Ya existe una cuenta con este correo electrónico.",
      });
    }

    return res.status(500).json({
      message:
        "Error interno del servidor.",
    });
  }
};

/**
 * LOGIN DE CLIENTE
 *
 * POST /api/client/auth/login
 */
export const loginClient = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const {
      email,
      password,
    } = req.body;

    const normalizedEmail =
      email.toLowerCase().trim();

    const client =
      await Client.findOne({
        email: normalizedEmail,
      }).select("+password");

    if (!client) {
      return res.status(401).json({
        message:
          "Correo electrónico o contraseña incorrectos.",
      });
    }

    const passwordMatches =
      await bcrypt.compare(
        password,
        client.password
      );

    if (!passwordMatches) {
      return res.status(401).json({
        message:
          "Correo electrónico o contraseña incorrectos.",
      });
    }

    const token =
      generateClientToken(
        client._id.toString()
      );

    return res.status(200).json({
      message:
        "Inicio de sesión correcto.",
      token,
      client: {
        id: client._id,
        nombre: client.nombre,
        apellidos: client.apellidos,
        email: client.email,
      },
    });
  } catch (error: unknown) {
    console.error(
      "Error al iniciar sesión:",
      error
    );

    return res.status(500).json({
      message:
        "Error interno del servidor.",
    });
  }
};

/**
 * SOLICITAR RECUPERACIÓN DE CONTRASEÑA
 *
 * POST /api/client/auth/forgot-password
 */
export const forgotPasswordClient = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { email } = req.body;

    const normalizedEmail =
      email.toLowerCase().trim();

    const client =
      await Client.findOne({
        email: normalizedEmail,
      });

    if (!client) {
      return res.status(200).json({
        message:
          "Si existe una cuenta asociada a este correo, recibirás instrucciones para restablecer tu contraseña.",
      });
    }

    const resetToken = crypto
      .randomBytes(32)
      .toString("hex");

    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const resetTokenExpires =
      new Date(
        Date.now() +
          15 * 60 * 1000
      );

    await Client.updateOne(
      {
        _id: client._id,
      },
      {
        $set: {
          resetPasswordToken:
            resetTokenHash,
          resetPasswordExpires:
            resetTokenExpires,
        },
      }
    );

    await sendResetPasswordEmail(
      client.email,
      resetToken
    );

    return res.status(200).json({
      message:
        "Si existe una cuenta asociada a este correo, recibirás instrucciones para restablecer tu contraseña.",
    });
  } catch (error: unknown) {
    console.error(
      "Error al solicitar recuperación de contraseña:",
      error
    );

    return res.status(500).json({
      message:
        "No fue posible procesar la solicitud.",
    });
  }
};

/**
 * RESTABLECER CONTRASEÑA
 *
 * POST /api/client/auth/reset-password
 */
export const resetPasswordClient = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const {
      token,
      newPassword,
    } = req.body;

    const resetTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const client =
      await Client.findOne({
        resetPasswordToken:
          resetTokenHash,
        resetPasswordExpires: {
          $gt: new Date(),
        },
      }).select("+password");

    if (!client) {
      return res.status(400).json({
        message:
          "El enlace de recuperación es inválido o ha expirado.",
      });
    }

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        12
      );

    await Client.updateOne(
      {
        _id: client._id,
        resetPasswordToken:
          resetTokenHash,
        resetPasswordExpires: {
          $gt: new Date(),
        },
      },
      {
        $set: {
          password: hashedPassword,
        },
        $unset: {
          resetPasswordToken: 1,
          resetPasswordExpires: 1,
        },
      }
    );

    return res.status(200).json({
      message:
        "Contraseña actualizada correctamente. Ya puedes iniciar sesión.",
    });
  } catch (error: unknown) {
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
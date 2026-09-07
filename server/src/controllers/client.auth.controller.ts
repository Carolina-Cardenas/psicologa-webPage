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

/**
 * Genera un JWT para un cliente.
 *
 * @param clientId - ID del cliente autenticado.
 * @returns Token JWT firmado.
 */
const generateClientToken = (clientId: string): string => {
  return jwt.sign(
    {
      id: clientId,
      type: "client",
    },
    JWT_SECRET,
    {
      expiresIn: "1d",
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
      modalidadPreferida,
      motivoConsulta,
      terapiaPrevia,
      password,
    } = req.body;

    /**
     * Normalización de datos.
     *
     * El schema de Zod ya garantiza que estos campos
     * existen y tienen el tipo correcto.
     */
    const normalizedNombre = nombre.trim();
    const normalizedApellidos = apellidos.trim();
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedTelefono = telefono.trim();
    const normalizedMotivoConsulta = motivoConsulta.trim();

    /**
     * Verificar si el email ya existe.
     */
    const existingClient = await Client.findOne({
      email: normalizedEmail,
    });

    if (existingClient) {
      return res.status(409).json({
        message: "Ya existe una cuenta con este correo electrónico.",
      });
    }

    /**
     * Hash de contraseña.
     *
     * Nunca guardamos la contraseña original.
     */
    const hashedPassword = await bcrypt.hash(password, 12);

    /**
     * Crear cliente.
     *
     * Los datos clínicos se mantienen dentro de perfilClinico,
     * siguiendo la estructura definida en el modelo MongoDB.
     */
    const client = await Client.create({
      nombre: normalizedNombre,
      apellidos: normalizedApellidos,
      fechaNacimiento: new Date(fechaNacimiento),
      genero: genero || undefined,
      telefono: normalizedTelefono,
      email: normalizedEmail,
      pais: pais || undefined,
      password: hashedPassword,

      perfilClinico: {
        modalidadPreferida: modalidadPreferida || undefined,
        motivoConsulta: normalizedMotivoConsulta,
        terapiaPrevia: terapiaPrevia || undefined,
      },
    });

    /**
     * Generar JWT.
     */
    const token = generateClientToken(client._id.toString());

    return res.status(201).json({
      message: "Cuenta creada correctamente.",
      token,
      client: {
        id: client._id,
        nombre: client.nombre,
        apellidos: client.apellidos,
        email: client.email,
      },
    });
  } catch (error: unknown) {
    console.error("Error al registrar cliente:", error);

    /**
     * MongoDB duplicate key.
     */
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: number }).code === 11000
    ) {
      return res.status(409).json({
        message: "Ya existe una cuenta con este correo electrónico.",
      });
    }

    return res.status(500).json({
      message: "Error interno del servidor.",
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
    const { email, password } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    /**
     * La contraseña tiene select: false en el modelo,
     * por eso debemos solicitarla explícitamente.
     */
    const client = await Client.findOne({
      email: normalizedEmail,
    }).select("+password");

    /**
     * No revelar si el email existe.
     *
     * Esto evita user enumeration.
     */
    if (!client) {
      return res.status(401).json({
        message: "Correo electrónico o contraseña incorrectos.",
      });
    }

    /**
     * Comparar contraseña enviada contra el hash.
     */
    const passwordMatches = await bcrypt.compare(password, client.password);

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Correo electrónico o contraseña incorrectos.",
      });
    }

    /**
     * Generar JWT.
     */
    const token = generateClientToken(client._id.toString());

    return res.status(200).json({
      message: "Inicio de sesión correcto.",
      token,
      client: {
        id: client._id,
        nombre: client.nombre,
        apellidos: client.apellidos,
        email: client.email,
      },
    });
  } catch (error: unknown) {
    console.error("Error al iniciar sesión:", error);

    return res.status(500).json({
      message: "Error interno del servidor.",
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

    const normalizedEmail = email.toLowerCase().trim();

    const client = await Client.findOne({
      email: normalizedEmail,
    });

    /**
     * No revelar si el usuario existe.
     */
    if (!client) {
      return res.status(200).json({
        message:
          "Si existe una cuenta asociada a este correo, recibirás instrucciones para restablecer tu contraseña.",
      });
    }

    /**
     * Generar token aleatorio criptográficamente seguro.
     */
    const resetToken = crypto.randomBytes(32).toString("hex");

    /**
     * Guardar solamente el hash del token.
     *
     * Si alguien obtiene acceso a MongoDB,
     * no podrá utilizar directamente el token.
     */
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    /**
     * El token expira en 15 minutos.
     */
    const resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000);

    client.resetPasswordToken = resetTokenHash;
    client.resetPasswordExpires = resetTokenExpires;

    await client.save();

    /**
     * Enviar el token original por email.
     *
     * MongoDB solamente contiene el hash.
     */
    await sendResetPasswordEmail(client.email, resetToken);

    return res.status(200).json({
      message:
        "Si existe una cuenta asociada a este correo, recibirás instrucciones para restablecer tu contraseña.",
    });
  } catch (error: unknown) {
    console.error("Error al solicitar recuperación de contraseña:", error);

    return res.status(500).json({
      message: "No fue posible procesar la solicitud.",
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
    const { token, newPassword } = req.body;

    /**
     * Hashear el token recibido.
     *
     * Debe coincidir con el hash almacenado en MongoDB.
     */
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    /**
     * Buscar cliente con:
     *
     * 1. Token correcto.
     * 2. Token todavía vigente.
     */
    const client = await Client.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: {
        $gt: new Date(),
      },
    }).select("+password");

    if (!client) {
      return res.status(400).json({
        message: "El enlace de recuperación es inválido o ha expirado.",
      });
    }

    /**
     * Generar nuevo hash de contraseña.
     */
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    client.password = hashedPassword;

    /**
     * El token solamente puede utilizarse una vez.
     */
    client.resetPasswordToken = null;
    client.resetPasswordExpires = null;

    await client.save();

    return res.status(200).json({
      message:
        "Contraseña actualizada correctamente. Ya puedes iniciar sesión.",
    });
  } catch (error: unknown) {
    console.error("Error al restablecer contraseña:", error);

    return res.status(500).json({
      message: "No fue posible restablecer la contraseña.",
    });
  }
};

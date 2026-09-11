import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  throw new Error(
    "RESEND_API_KEY no está configurada en las variables de entorno."
  );
}

const resend = new Resend(resendApiKey);

export const sendResetPasswordEmail = async (
  email: string,
  token: string
): Promise<void> => {
  const frontendUrl = process.env.CLIENT_URL;

  if (!frontendUrl) {
    throw new Error(
      "CLIENT_URL no está configurada en las variables de entorno."
    );
  }

  const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(
    token
  )}`;

  const { error } = await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Recuperación de contraseña",
    html: `
      <p>Hola,</p>

      <p>
        Hemos recibido una solicitud para restablecer tu contraseña.
      </p>

      <p>
        <a href="${resetUrl}">
          Restablecer contraseña
        </a>
      </p>

      <p>
        Este enlace expirará en 15 minutos.
      </p>

      <p>
        Si no solicitaste este cambio, puedes ignorar este correo.
      </p>
    `,
  });

  if (error) {
    console.error("Error de Resend:", error);

    throw new Error(
      "No fue posible enviar el correo de recuperación."
    );
  }
};

export const sendAppointmentConfirmationEmail = async (
  email: string,
  nombre: string,
  date: string,
  time: string,
  modality: "online" | "presencial"
): Promise<void> => {
  const modalityLabel =
    modality === "online" ? "En línea" : "Presencial";

  const { error } = await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Confirmación de cita",
    html: `
      <p>Hola ${nombre},</p>

      <p>
        Tu cita ha sido agendada correctamente.
      </p>

      <p><strong>Fecha:</strong> ${date}</p>
      <p><strong>Hora:</strong> ${time}</p>
      <p><strong>Modalidad:</strong> ${modalityLabel}</p>
      <p><strong>Duración:</strong> 45 minutos</p>

      <p>
        Gracias por agendar tu sesión.
      </p>
    `,
  });

  if (error) {
    console.error(
      "Error enviando confirmación de cita:",
      error
    );

    throw new Error(
      "No fue posible enviar el correo de confirmación."
    );
  }
};

export const sendAdminResetPasswordEmail = async (
  email: string,
  token: string
): Promise<void> => {
  const frontendUrl = process.env.CLIENT_URL;

  if (!frontendUrl) {
    throw new Error(
      "CLIENT_URL no está configurada en las variables de entorno."
    );
  }

  const resetUrl = `${frontendUrl}/admin/reset-password?token=${encodeURIComponent(
    token
  )}`;

  const { error } = await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Recuperación de contraseña - Panel administrativo",
    html: `
      <p>Hola,</p>

      <p>
        Hemos recibido una solicitud para restablecer
        la contraseña del panel administrativo.
      </p>

      <p>
        <a href="${resetUrl}">
          Restablecer contraseña
        </a>
      </p>

      <p>
        Este enlace expirará en 15 minutos.
      </p>

      <p>
        Si no solicitaste este cambio,
        puedes ignorar este correo.
      </p>
    `,
  });

  if (error) {
    console.error(
      "Error enviando recuperación de contraseña del admin:",
      error
    );

    throw new Error(
      "No fue posible enviar el correo de recuperación."
    );
  }
};
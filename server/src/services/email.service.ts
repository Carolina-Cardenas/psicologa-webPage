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

    throw new Error("No fue posible enviar el correo de recuperación.");
  }
};

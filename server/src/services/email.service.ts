import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  throw new Error(
    "RESEND_API_KEY no está configurada en las variables de entorno."
  );
}

const resend = new Resend(resendApiKey);

const FROM_EMAIL = "onboarding@resend.dev";

/**
 * Recuperación de contraseña del paciente.
 */
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
    from: FROM_EMAIL,
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
    console.error(
      "Error enviando recuperación de contraseña:",
      error
    );

    throw new Error(
      "No fue posible enviar el correo de recuperación."
    );
  }
};

/**
 * Avisar a la psicóloga cuando un paciente
 * solicita una nueva cita.
 *
 * También se utiliza cuando una cita es reagendada,
 * porque vuelve a quedar pendiente de confirmación.
 */
export const sendNewAppointmentNotificationToAdmin = async (
  adminEmail: string,
  patientName: string,
  date: string,
  time: string,
  modality: "online" | "presencial"
): Promise<void> => {
  const modalityLabel =
    modality === "online"
      ? "En línea"
      : "Presencial";

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: adminEmail,
    subject: "Nueva solicitud de cita pendiente",
    html: `
      <p>Hola,</p>

      <p>
        Se ha recibido una nueva solicitud de cita.
      </p>

      <p>
        <strong>Paciente:</strong> ${patientName}
      </p>

      <p>
        <strong>Fecha:</strong> ${date}
      </p>

      <p>
        <strong>Hora:</strong> ${time}
      </p>

      <p>
        <strong>Modalidad:</strong> ${modalityLabel}
      </p>

      <p>
        La cita está pendiente de confirmación.
      </p>

      <p>
        Ingresa al panel administrativo para revisarla y confirmarla.
      </p>
    `,
  });

  if (error) {
    console.error(
      "Error enviando notificación de nueva cita al administrador:",
      error
    );

    throw new Error(
      "No fue posible enviar la notificación de nueva cita."
    );
  }
};

/**
 * Avisar a la psicóloga cuando un paciente
 * cancela una cita.
 *
 * El correo es solamente informativo.
 * Si falla, la cancelación NO debe revertirse.
 */
export const sendAppointmentCancellationNotificationToAdmin = async (
  adminEmail: string,
  patientName: string,
  date: string,
  time: string,
  modality: "online" | "presencial"
): Promise<void> => {
  const modalityLabel =
    modality === "online"
      ? "En línea"
      : "Presencial";

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: adminEmail,
    subject: "Cita cancelada por paciente",
    html: `
      <p>Hola,</p>

      <p>
        Un paciente ha cancelado una cita.
      </p>

      <p>
        <strong>Paciente:</strong> ${patientName}
      </p>

      <p>
        <strong>Fecha:</strong> ${date}
      </p>

      <p>
        <strong>Hora:</strong> ${time}
      </p>

      <p>
        <strong>Modalidad:</strong> ${modalityLabel}
      </p>

      <p>
        El horario ha quedado nuevamente disponible
        para nuevas reservas.
      </p>
    `,
  });

  if (error) {
    console.error(
      "Error enviando notificación de cancelación al administrador:",
      error
    );

    throw new Error(
      "No fue posible enviar la notificación de cancelación."
    );
  }
};

/**
 * Enviar al paciente cuando la psicóloga
 * CONFIRMA la cita.
 */
export const sendAppointmentConfirmationEmail = async (
  email: string,
  nombre: string,
  date: string,
  time: string,
  modality: "online" | "presencial",
  videoPlatform?: string | null,
  videoLink?: string | null
): Promise<void> => {
  const modalityLabel =
    modality === "online"
      ? "En línea"
      : "Presencial";

  let onlineInformation = "";

  if (
    modality === "online" &&
    videoPlatform === "whatsapp"
  ) {
    onlineInformation = `
      <p>
        <strong>Plataforma:</strong> WhatsApp
      </p>

      <p>
        La psicóloga se comunicará contigo por WhatsApp
        al número de teléfono registrado en tu cuenta.
      </p>
    `;
  } else if (
    modality === "online" &&
    videoPlatform &&
    videoLink
  ) {
    const platformLabels: Record<string, string> = {
      zoom: "Zoom",
      teams: "Microsoft Teams",
      otro: "Otra plataforma",
    };

    const platformLabel =
      platformLabels[videoPlatform] ??
      videoPlatform;

    onlineInformation = `
      <p>
        <strong>Plataforma:</strong> ${platformLabel}
      </p>

      <p>
        <strong>Enlace de videollamada:</strong>
        <a href="${videoLink}">
          Ingresar a la sesión
        </a>
      </p>
    `;
  }

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Tu cita ha sido confirmada",
    html: `
      <p>Hola ${nombre},</p>

      <p>
        Tu cita ha sido confirmada.
      </p>

      <p>
        <strong>Fecha:</strong> ${date}
      </p>

      <p>
        <strong>Hora:</strong> ${time}
      </p>

      <p>
        <strong>Modalidad:</strong> ${modalityLabel}
      </p>

      <p>
        <strong>Duración:</strong> 45 minutos
      </p>

      ${onlineInformation}

      <p>
        Te esperamos en tu sesión.
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

/**
 * Recuperación de contraseña del administrador.
 */
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
    from: FROM_EMAIL,
    to: email,
    subject:
      "Recuperación de contraseña - Panel administrativo",
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
const SESSION_DURATION_MINUTES = 45;
const SLOT_INTERVAL_MINUTES = 50;

const timeToMinutes = (time: string): number => {
  const parts = time.split(":");

  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);

  if (
    parts.length !== 2 ||
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    throw new Error(`Formato de hora inválido: ${time}`);
  }

  return hours * 60 + minutes;
};

const minutesToTime = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}`;
};

const generateSlots = (
  startTime: string,
  endTime: string
): string[] => {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);

  const slots: string[] = [];

  for (
    let current = start;
    current + SESSION_DURATION_MINUTES <= end;
    current += SLOT_INTERVAL_MINUTES
  ) {
    slots.push(minutesToTime(current));
  }

  return slots;
};

/**
 * Martes a sábado:
 * 08:00 - 19:00
 *
 * 45 minutos de terapia
 * + 5 minutos entre pacientes.
 */
export const REGULAR_SLOTS = generateSlots(
  "08:00",
  "19:00"
);

/**
 * Lunes:
 * 12:00 - 19:00
 */
export const MONDAY_SLOTS = generateSlots(
  "12:00",
  "19:00"
);

/**
 * JavaScript:
 * 0 = domingo
 * 1 = lunes
 * 2 = martes
 * 3 = miércoles
 * 4 = jueves
 * 5 = viernes
 * 6 = sábado
 */
export const getSlotsForDay = (
  dayOfWeek: number
): string[] => {
  // Domingo cerrado
  if (dayOfWeek === 0) {
    return [];
  }

  // Lunes desde las 12:00
  if (dayOfWeek === 1) {
    return MONDAY_SLOTS;
  }

  // Martes a sábado desde las 08:00
  return REGULAR_SLOTS;
};

/**
 * Lista completa de horarios posibles.
 *
 * Se mantiene porque appointment.controller.ts
 * todavía importa ALL_SLOTS.
 */
export const ALL_SLOTS = Array.from(
  new Set([
    ...REGULAR_SLOTS,
    ...MONDAY_SLOTS,
  ])
);
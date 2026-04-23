import Appointment from "../models/Appointment";

export const getAvailableSlots = async (date: string) => {
  const appointments = await Appointment.find({ date: new Date(date) });

  const taken = appointments.map((a) => a.time);

  const allSlots = [
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "15:00",
    "16:00",
    "17:00",
  ];

  return allSlots.filter((slot) => !taken.includes(slot));
};

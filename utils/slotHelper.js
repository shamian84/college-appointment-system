import Availability from "../models/Availability.js";

/**
 * Reopens a professor's slot by marking it as unbooked.
 * @param {ObjectId} professorId - Professor's MongoDB _id
 * @param {String} date - Date of the appointment
 * @param {String} time - Time slot to free
 */
export async function reopenSlot(professorId, date, time) {
  const availability = await Availability.findOne({ professorId, date });
  if (!availability) return false;

  const slot = availability.timeSlots.find((s) => s.time === time);
  if (!slot) return false;

  slot.isBooked = false;
  await availability.save();
  return true;
}

import Availability from "../models/Availability.js";

/**
 * Reopens a professor's slot by marking it as unbooked.
 * @param {ObjectId} professorId - Professor's MongoDB _id
 * @param {String} date - Date of the appointment (YYYY-MM-DD)
 * @param {String} time - Time slot to free (e.g., "10:00-11:00")
 * @returns {Object} - { success: boolean, msg: string }
 */
export async function reopenSlot(professorId, date, time) {
  try {
    const availability = await Availability.findOne({ professorId, date });
    if (!availability) {
      return {
        success: false,
        msg: "No availability found for this professor on given date",
      };
    }

    const slot = availability.timeSlots.find(
      (s) => s.time.trim() === time.trim()
    );
    if (!slot) {
      return { success: false, msg: "No matching time slot found" };
    }

    if (!slot.isBooked) {
      return { success: false, msg: "Slot is already free" };
    }

    slot.isBooked = false;
    await availability.save();

    return { success: true, msg: "Slot reopened successfully" };
  } catch (err) {
    console.error(" Error in reopenSlot:", err.message);
    return { success: false, msg: "Server error while reopening slot" };
  }
}

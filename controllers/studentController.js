import mongoose from "mongoose";
import Appointment from "../models/Appointment.js";
import Availability from "../models/Availability.js";
import { reopenSlot } from "../utils/slotHelper.js";

// Student books a slot

export async function bookAppointment(req, res) {
  try {
    const { professorId } = req.params;
    const { date, time } = req.body;
    const studentId = req.user._id;

    if (!date || !time) {
      return res.status(400).json({ msg: "Date and time are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(professorId)) {
      return res.status(400).json({ msg: "Invalid professorId" });
    }

    const existing = await Appointment.findOne({
      studentId,
      professorId,
      date,
      time,
      status: "Booked",
    });
    if (existing) {
      return res
        .status(400)
        .json({ msg: "You already booked this slot with this professor" });
    }

    const availability = await Availability.findOne({
      professorId: new mongoose.Types.ObjectId(professorId),
      date,
    });

    if (!availability) {
      return res
        .status(404)
        .json({ msg: "No availability found for this professor on this date" });
    }

    const slot = availability.timeSlots.find(
      (s) => s.time === time && !s.isBooked
    );
    if (!slot) {
      return res
        .status(400)
        .json({ msg: "Slot not available or already booked" });
    }

    const appointment = await Appointment.create({
      studentId,
      professorId,
      date,
      time,
      status: "Booked",
    });

    slot.isBooked = true;
    await availability.save();

    const populated = await Appointment.findById(appointment._id)
      .populate("professorId", "name email role")
      .populate("studentId", "name email role");

    return res.status(201).json({
      msg: "Appointment booked successfully",
      appointment: populated,
    });
  } catch (err) {
    console.error(" Error in bookAppointment:", err.message);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
}

//  Student views all their bookings

export async function getStudentBookings(req, res) {
  try {
    const bookings = await Appointment.find({ studentId: req.user._id })
      .populate("professorId", "name email role")
      .sort({ date: 1, time: 1 })
      .lean();

    if (!bookings.length) {
      return res.status(404).json({ msg: "No bookings found" });
    }

    return res.json({ count: bookings.length, bookings });
  } catch (err) {
    console.error("Error in getStudentBookings:", err.message);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
}

// Student cancels their own booking

export async function cancelOwnBooking(req, res) {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findOne({
      _id: id,
      studentId: req.user._id,
    });

    if (!appointment) {
      return res.status(404).json({ msg: "Booking not found" });
    }

    if (appointment.status !== "Booked") {
      return res.status(400).json({
        msg: `Booking cannot be cancelled, current status: ${appointment.status}`,
      });
    }

    // Cancel and reopen slot
    appointment.status = "Cancelled";
    appointment.cancellationNote = "Cancelled by student";
    await appointment.save();

    await reopenSlot(
      appointment.professorId,
      appointment.date,
      appointment.time
    );

    return res.json({
      msg: "Booking cancelled successfully, slot reopened",
      appointment,
    });
  } catch (err) {
    console.error("Error in cancelOwnBooking:", err.message);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
}

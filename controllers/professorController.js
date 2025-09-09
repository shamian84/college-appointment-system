import User from "../models/User.js";
import Availability from "../models/Availability.js";
import Appointment from "../models/Appointment.js";
import { validationResult } from "express-validator";
import { reopenSlot } from "../utils/slotHelper.js";

//  Public - Get all professors (with pagination)
export async function getAllProfessors(req, res) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const professors = await User.find({ role: "professor" })
      .select("name email role")
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments({ role: "professor" });

    if (!professors.length) {
      return res
        .status(404)
        .json({ success: false, msg: "No professors found" });
    }

    return res.json({
      success: true,
      count: professors.length,
      total,
      page,
      data: professors,
    });
  } catch (err) {
    console.error(" Error in getAllProfessors:", err.message);
    return res.status(500).json({
      success: false,
      msg: "Server error while fetching professors",
      error: err.message,
    });
  }
}

//  Professors add availability
export async function addAvailability(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { date, timeSlots } = req.body;

    const existing = await Availability.findOne({
      professorId: req.user._id,
      date,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        msg: "Availability already exists for this date",
      });
    }

    const availability = await Availability.create({
      professorId: req.user._id,
      date,
      timeSlots: timeSlots.map((slot) => ({ time: slot, isBooked: false })),
    });

    return res.status(201).json({
      success: true,
      msg: "Availability saved successfully",
      data: availability,
    });
  } catch (err) {
    console.error(" Error in addAvailability:", err.message);
    return res.status(500).json({
      success: false,
      msg: "Server error while adding availability",
      error: err.message,
    });
  }
}

//  Public - View professor slots
export async function getAvailability(req, res) {
  try {
    const { id: professorId } = req.params;
    const { date } = req.query;

    const query = { professorId };
    if (date) query.date = date;

    const slots = await Availability.find(query).sort({ date: 1 });

    if (!slots.length) {
      return res
        .status(404)
        .json({ success: false, msg: "No availability found" });
    }

    return res.json({
      success: true,
      count: slots.length,
      data: slots,
    });
  } catch (err) {
    console.error(" Error in getAvailability:", err.message);
    return res.status(500).json({
      success: false,
      msg: "Server error while fetching availability",
      error: err.message,
    });
  }
}

//  Public - Get availability of all professors
export async function getAllAvailability(req, res) {
  try {
    const { date } = req.query; // optional filter
    const query = {};
    if (date) query.date = date;

    const slots = await Availability.find(query)
      .populate("professorId", "name email role") // show professor info
      .sort({ date: 1 });

    if (!slots.length) {
      return res
        .status(404)
        .json({ success: false, msg: "No availability found" });
    }

    return res.json({
      success: true,
      count: slots.length,
      data: slots,
    });
  } catch (err) {
    console.error(" Error in getAllAvailability:", err.message);
    return res.status(500).json({
      success: false,
      msg: "Server error while fetching availability",
      error: err.message,
    });
  }
}

//  Professors view their appointments
export async function getProfessorAppointments(req, res) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { professorId: req.user._id };
    if (req.query.date) query.date = req.query.date;
    if (req.query.status) query.status = req.query.status;

    const appointments = await Appointment.find(query)
      .populate("studentId", "name email")
      .sort({ date: 1, time: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Appointment.countDocuments(query);

    if (!appointments.length) {
      return res
        .status(404)
        .json({ success: false, msg: "No appointments found" });
    }

    return res.json({
      success: true,
      count: appointments.length,
      total,
      page,
      data: appointments,
    });
  } catch (err) {
    console.error(" Error in getProfessorAppointments:", err.message);
    return res.status(500).json({
      success: false,
      msg: "Server error while fetching appointments",
      error: err.message,
    });
  }
}

//  Professor cancels a booking
export async function cancelBookingByProfessor(req, res) {
  try {
    const { id } = req.params; // appointmentId
    const { reason } = req.body;

    const appointment = await Appointment.findOne({
      _id: id,
      professorId: req.user._id,
    }).populate("studentId", "name email");

    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, msg: "Appointment not found" });
    }

    if (appointment.status !== "Booked") {
      return res.status(400).json({
        success: false,
        msg: `Appointment cannot be cancelled, current status: ${appointment.status}`,
      });
    }

    appointment.status = "Cancelled";
    appointment.cancellationNote = reason || "Cancelled by professor";
    await appointment.save();

    await reopenSlot(
      appointment.professorId,
      appointment.date,
      appointment.time
    );

    //  Notification placeholder
    console.log(
      ` Notify ${appointment.studentId.email} (${appointment.studentId.name}): Appointment on ${appointment.date} at ${appointment.time} cancelled. Reason: ${appointment.cancellationNote}`
    );

    return res.json({
      success: true,
      msg: "Appointment cancelled, student notified (console), slot reopened",
      data: appointment,
    });
  } catch (err) {
    console.error(" Error in cancelBookingByProfessor:", err.message);
    return res.status(500).json({
      success: false,
      msg: "Server error while cancelling booking",
      error: err.message,
    });
  }
}

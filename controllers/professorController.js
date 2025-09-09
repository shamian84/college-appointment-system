import User from "../models/User.js";
import Availability from "../models/Availability.js";
import Appointment from "../models/Appointment.js";
import { validationResult } from "express-validator";

// Public - Get all professors (with optional pagination)
export async function getAllProfessors(req, res) {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const professors = await User.find({ role: "professor" })
      .select("name email role")
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments({ role: "professor" });

    if (!professors.length) {
      return res
        .status(404)
        .json({ success: false, msg: "No professors found" });
    }

    res.json({
      success: true,
      count: professors.length,
      total,
      page: Number(page),
      data: professors,
    });
  } catch (err) {
    console.error("Error in getAllProfessors:", err.message);
    res
      .status(500)
      .json({ success: false, msg: "Server error while fetching professors" });
  }
}

// Professors add availability
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

    res.status(201).json({
      success: true,
      msg: "Availability saved successfully",
      data: availability,
    });
  } catch (err) {
    console.error("Error in addAvailability:", err.message);
    res
      .status(500)
      .json({ success: false, msg: "Server error while adding availability" });
  }
}

// Public - View professor slots 
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

    res.json({ success: true, count: slots.length, data: slots });
  } catch (err) {
    console.error("Error in getAvailability:", err.message);
    res.status(500).json({
      success: false,
      msg: "Server error while fetching availability",
    });
  }
}

// Professors view their appointments
export async function getProfessorAppointments(req, res) {
  try {
    const { date, status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const query = { professorId: req.user._id };
    if (date) query.date = date;
    if (status) query.status = status;

    const appointments = await Appointment.find(query)
      .populate("studentId", "name email")
      .sort({ date: 1, time: 1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Appointment.countDocuments(query);

    if (!appointments.length) {
      return res
        .status(404)
        .json({ success: false, msg: "No appointments found" });
    }

    res.json({
      success: true,
      count: appointments.length,
      total,
      page: Number(page),
      data: appointments,
    });
  } catch (err) {
    console.error("Error in getProfessorAppointments:", err.message);
    res.status(500).json({
      success: false,
      msg: "Server error while fetching appointments",
    });
  }
}
import { reopenSlot } from "../utils/slotHelper.js";

// Student sees all their bookings
export async function getStudentBookings(req, res) {
  try {
    const bookings = await Appointment.find({ studentId: req.user._id })
      .populate("professorId", "name email")
      .sort({ date: 1, time: 1 })
      .lean();

    if (!bookings.length) {
      return res.status(404).json({ msg: "No bookings found" });
    }

    return res.json({ count: bookings.length, bookings });
  } catch (err) {
    console.error("Error in getStudentBookings:", err.message);
    return res
      .status(500)
      .json({ msg: "Server error while fetching bookings" });
  }
}

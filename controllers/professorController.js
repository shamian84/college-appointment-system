import Availability from "../models/Availability.js";
import User from "../models/User.js";

// Professor adds availability slots
export async function addAvailability(req, res) {
  try {
    const { date, timeSlots } = req.body;

    if (!date || !Array.isArray(timeSlots) || timeSlots.length === 0) {
      return res.status(400).json({ msg: "Date and timeSlots[] are required" });
    }

    const existing = await Availability.findOne({
      professorId: req.user._id,
      date,
    });
    if (existing) {
      return res
        .status(400)
        .json({ msg: "Availability already exists for this date" });
    }

    const newAvailability = await Availability.create({
      professorId: req.user._id,
      date,
      timeSlots: timeSlots.map((slot) => ({
        time: slot,
        isBooked: false,
      })),
    });

    return res.status(201).json({
      msg: "Availability saved successfully",
      availability: newAvailability,
    });
  } catch (err) {
    console.error("Error in addAvailability:", err.message);
    return res
      .status(500)
      .json({ msg: "Server error while adding availability" });
  }
}

// Anyone can view professor slots
export async function getAvailability(req, res) {
  try {
    const { id: professorId } = req.params;
    const { date } = req.query; // optional filter by date

    const query = { professorId };
    if (date) query.date = date;

    const slots = await Availability.find(query).sort({ date: 1 });

    if (!slots || slots.length === 0) {
      return res.status(404).json({ msg: "No availability found" });
    }

    return res.json(slots);
  } catch (err) {
    console.error("Error in getAvailability:", err.message);
    return res
      .status(500)
      .json({ msg: "Server error while fetching availability" });
  }
}

// Public route: Get all professors
export async function getAllProfessors(req, res) {
  try {
    const professors = await User.find({ role: "professor" }).select(
      "name email role"
    );

    if (!professors || professors.length === 0) {
      return res.status(404).json({ msg: "No professors found" });
    }

    res.json(professors);
  } catch (err) {
    console.error("Error in getAllProfessors:", err.message);
    res.status(500).json({ msg: "Server error while fetching professors" });
  }
}
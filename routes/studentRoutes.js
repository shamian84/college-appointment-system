import { Router } from "express";
import {
  bookAppointment,
  getStudentBookings,
  cancelOwnBooking,
} from "../controllers/studentController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

/**
 * @route   POST /student/book/:professorId
 * @desc    Student books an appointment with a professor
 * @access  Private (student only)
 */
router.post("/book/:professorId", protect, bookAppointment);

/**
 * @route   GET /student/bookings
 * @desc    Student views their bookings
 * @access  Private (student only)
 */
router.get("/bookings", protect, getStudentBookings);

/**
 * @route   PATCH /student/bookings/:id/cancel
 * @desc    Student cancels their own booking
 * @access  Private (student only)
 */
router.patch("/bookings/:id/cancel", protect, cancelOwnBooking);

export default router; // ✅ this fixes the "does not provide an export named 'default'" error

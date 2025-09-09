// routes/professorRoutes.js
import { Router } from "express";
import {
  addAvailability,
  getAvailability,
  getAllProfessors,
  getAllAvailability,
  getProfessorAppointments,
  cancelBookingByProfessor,
} from "../controllers/professorController.js";
import { protect, isProfessor } from "../middlewares/authMiddleware.js";
import { body } from "express-validator";

const router = Router();

/**
 * @route   GET /professor
 * @desc    Public - List all professors
 */
router.get("/", getAllProfessors);

/**
 * @route   POST /professor/availability
 * @desc    Professors add availability slots
 * @access  Private (professors only)
 */
router.post(
  "/availability",
  protect,
  isProfessor,
  [
    body("date").notEmpty().withMessage("Date is required"),
    body("timeSlots")
      .isArray({ min: 1 })
      .withMessage("At least one time slot is required"),
  ],
  addAvailability
);

/**
 * @route   GET /professor/:id/availability
 * @desc    Public - View availability of a professor (filter by ?date optional)
 */
router.get("/:id/availability", getAvailability);
router.get("/availability/all", getAllAvailability);

/**
 * @route   GET /professor/appointments
 * @desc    Professors view their own appointments (filters: ?date & ?status, pagination)
 * @access  Private (professors only)
 */
router.get("/appointments", protect, isProfessor, getProfessorAppointments);

/**
 * @route   PATCH /professor/appointments/:id/cancel
 * @desc    Professors cancel an appointment with a student
 * @access  Private (professors only)
 */
router.patch(
  "/appointments/:id/cancel",
  protect,
  isProfessor,
  cancelBookingByProfessor
);

export default router;

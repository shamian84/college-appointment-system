import { Router } from "express";
import {
  addAvailability,
  getAvailability,
  getAllProfessors,
  getProfessorAppointments,
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
 * @desc    Public - Get slots for a professor (?date=optional filter)
 */
router.get("/:id/availability", getAvailability);

/**
 * @route   GET /professor/appointments
 * @desc    Professors view their appointments (?date & ?status filters, pagination)
 */
router.get("/appointments", protect, isProfessor, getProfessorAppointments);

export default router;

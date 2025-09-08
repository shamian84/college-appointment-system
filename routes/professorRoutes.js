import { Router } from "express";
import {
  addAvailability,
  getAvailability,
  getAllProfessors,
} from "../controllers/professorController.js";
import { protect, isProfessor } from "../middlewares/authMiddleware.js";

const router = Router();

// Public route: Get all professors
router.get("/", getAllProfessors);

// Professor adds slots (protected, only professors)
router.post("/availability", protect, isProfessor, addAvailability);

// Public route: Anyone (students/professors) can view slots
router.get("/:id/availability", getAvailability);

export default router;

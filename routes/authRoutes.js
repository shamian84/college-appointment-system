import { Router } from "express";
import { registerUser, loginUser, refreshAccessToken } from "../controllers/authController.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshAccessToken);

export default router;

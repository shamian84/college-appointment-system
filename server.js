import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import connectMongoDB from "./config/db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import professorRoutes from "./routes/professorRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json()); // parse JSON bodies
app.use(morgan("dev")); // logging
app.use(errorHandler);

// Connect Database
connectMongoDB();

// Health check route
app.get("/", (req, res) => {
  res.send("API is running ");
});

// API Routes
app.use("/auth", authRoutes);
app.use("/professor", professorRoutes);
app.use("/student", studentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ msg: "Route not found" });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
// For testing purposes
server.close();
export default app;

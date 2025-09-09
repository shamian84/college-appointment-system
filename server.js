import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import connectMongoDB from "./config/db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import professorRoutes from "./routes/professorRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json()); // parse JSON bodies
app.use(morgan("dev")); // logging

// Connect Database
connectMongoDB()
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1); // stop server if DB fails
  });

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

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(500).json({ msg: "Something went wrong", error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;

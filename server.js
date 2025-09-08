import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import connectMongoDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import professorRoutes from "./routes/professorRoutes.js";

dotenv.config();

const app = express();

// middleware
app.use(express.json());
app.use(morgan("dev"));

// connect DB
connectMongoDB();

// routes
app.get("/", (req, res) => {
  res.send("API is running");
});

app.use("/auth", authRoutes);
app.use("/professor", professorRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;

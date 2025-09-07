import dotenv from "dotenv";
import express from "express";
import connectMongoDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import morgan from "morgan";

dotenv.config();

const app = express();

// middleware
app.use(express.json());
app.use(morgan("dev"));

// connect DB
connectMongoDB();

// routes
app.get("/", (req, res) => {
  res.send("API is running ");
});

app.use("/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
export default app;

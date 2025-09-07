import express from "express";
import connectMongoDB from "./config/db.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// connect DB
connectMongoDB();

// routes
app.get("/", (req, res) => {
  res.send("API is running ");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
export default app;

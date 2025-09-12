import { connect } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectMongoDB = async () => {
  try {
    await connect(process.env.MONGO_URL);
    console.log("Connected to Database Successfully");
  } catch (err) {
    console.error("Error connecting to Database:", err.message);
    process.exit(1);
  }
};

export default connectMongoDB;

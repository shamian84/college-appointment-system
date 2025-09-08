import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema(
  {
    professorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    timeSlots: [
      {
        time: { type: String, required: true }, 
        isBooked: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

const Availability = mongoose.model("Availability", availabilitySchema);

export default Availability;

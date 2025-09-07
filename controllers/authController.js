import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generationToken.js";

//Register User
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    console.log(`New register attempt: ${email} (${role})`);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`User already exists: ${email}`);
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    console.log(`User registered: ${user.email} (id: ${user._id})`);

    res.status(201).json({
      message: "User registered",
      user: { id: user._id, name: user.name, role: user.role },
    });
  } catch (error) {
    console.error("Error in register:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(`Login attempt: ${email}`);
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`Login failed - no user found for: ${email}`);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`Login failed - wrong password for: ${email}`);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id, user.role);

    console.log(`Login successful: ${email} (id: ${user._id})`);

    res.json({
      token,
      user: { id: user._id, name: user.name, role: user.role },
    });
  } catch (error) {
    console.error("Error in login:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

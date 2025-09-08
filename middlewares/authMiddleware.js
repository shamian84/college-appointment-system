import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Protect middleware to verify JWT and attach user to request
export async function protect(req, res, next) {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select("password");
      if (!user) {
        return res.status(401).json({ msg: "User not found, invalid token" });
      }

      req.user = user; // attach user to request
      return next();
    } catch (err) {
      console.error("Auth error:", err.message);
      return res
        .status(401)
        .json({ msg: "Not authorized, token failed or expired" });
    }
  }

  return res.status(401).json({ msg: "No token, not authorized" });
}

// Professor-only middleware
export function isProfessor(req, res, next) {
  if (req.user && req.user.role === "professor") {
    return next();
  }
  return res.status(403).json({ msg: "Access denied, professors only" });
}

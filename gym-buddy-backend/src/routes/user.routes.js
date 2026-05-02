import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// ── middleware ──────────────────────────────────────────────────────────────

const auth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "No token" });
  const token = header.split(" ")[1];
  try {
    req.userId = jwt.verify(token, process.env.JWT_SECRET).id;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

// ── routes ──────────────────────────────────────────────────────────────────

// GET /api/user/profile
router.get("/profile", auth, async (req, res) => {
  const user = await User.findById(req.userId).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

// PUT /api/user/profile
router.put("/profile", auth, async (req, res) => {
  const allowed = ["name", "age", "gender", "height", "weight", "fitnessGoal", "dietPreference", "gymLocation", "workoutTime"];
  const update = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) update[key] = req.body[key];
  }

  const user = await User.findByIdAndUpdate(
    req.userId,
    { $set: update },
    { new: true }
  ).select("-password");

  res.json({ message: "Profile updated", user });
});

// PATCH /api/user/activity  — log workout or diet checkin
router.patch("/activity", auth, async (req, res) => {
  const { type } = req.body; // 'workout' | 'diet'
  const bonus = type === "workout" ? 10 : 5;
  const streakInc = type === "workout" ? 1 : 0;

  const user = await User.findByIdAndUpdate(
    req.userId,
    { $inc: { points: bonus, streak: streakInc } },
    { new: true }
  ).select("-password");

  res.json({ message: "Activity logged", user });
});

export default router;
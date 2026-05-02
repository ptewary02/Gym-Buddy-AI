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

const todayStr = () => new Date().toISOString().split("T")[0];

// GET /api/user/profile
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
 
// PUT /api/user/profile
router.put("/profile", auth, async (req, res) => {
  try {
    const allowed = ["name", "age", "gender", "height", "weight", "fitnessGoal", "dietPreference", "gymLocation", "workoutTime"];
    const update = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }
    const user = await User.findByIdAndUpdate(req.userId, { $set: update }, { new: true }).select("-password");
    res.json({ message: "Profile updated", user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
 
// PATCH /api/user/activity
router.patch("/activity", auth, async (req, res) => {
  try {
    const { type } = req.body;
    if (!["workout", "diet"].includes(type)) {
      return res.status(400).json({ message: "Invalid activity type" });
    }
 
    const today = todayStr();
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
 
    const dateField = type === "workout" ? "lastWorkoutDate" : "lastDietDate";
    if (user[dateField] === today) {
      return res.status(409).json({
        message: `Already logged ${type} today. Resets at midnight.`,
        alreadyDone: true,
        user: { ...user.toObject(), password: undefined },
      });
    }
 
    const bonus = type === "workout" ? 10 : 5;
    const streakInc = type === "workout" ? 1 : 0;
 
    const updated = await User.findByIdAndUpdate(
      req.userId,
      { $inc: { points: bonus, streak: streakInc }, $set: { [dateField]: today } },
      { new: true }
    ).select("-password");
 
    res.json({ message: "Activity logged", user: updated });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
 
// GET /api/user/leaderboard
router.get("/leaderboard", auth, async (req, res) => {
  try {
    const users = await User.find({ name: { $ne: "" } })
      .select("name points streak gymLocation badges")
      .sort({ points: -1 })
      .limit(50);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
 
export default router;
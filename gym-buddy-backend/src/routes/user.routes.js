import express from "express";
import protect from "../middleware/auth.middleware.js";
import User from "../models/User.js";

const router = express.Router();

// GET current user profile
router.get("/me", protect, async (req, res) => {
  res.json(req.user);
});

// UPDATE points and streak
router.patch("/log-activity", protect, async (req, res) => {
  try {
    const { type } = req.body; // "workout" or "diet"
    const bonus = type === "workout" ? 10 : 5;
    const streakIncrease = type === "workout" ? 1 : 0;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $inc: {
          points: bonus,
          streak: streakIncrease
        }
      },
      { new: true }
    ).select("-password");

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error logging activity" });
  }
});

// GET leaderboard (top users by points)
router.get("/leaderboard", protect, async (req, res) => {
  try {
    const users = await User.find()
      .sort({ points: -1 })
      .limit(20)
      .select("name points streak");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching leaderboard" });
  }
});

export default router;
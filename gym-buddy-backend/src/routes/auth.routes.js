import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  const hashed = await bcrypt.hash(req.body.password, 10);
  const user = await User.create({
    ...req.body,
    password: hashed
  });

  res.json({ message: "Signup success", user });
});

router.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) return res.status(404).json({ message: "User not found" });

  const match = await bcrypt.compare(req.body.password, user.password);
  if (!match) return res.status(401).json({ message: "Wrong password" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({ token });
});

export default router;

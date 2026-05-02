import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true, lowercase: true, trim: true },
    password: { type: String, required: true },

    // Fitness profile (filled after signup)
    name: { type: String, default: "" },
    age: { type: Number },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    height: { type: Number },   // cm
    weight: { type: Number },   // kg
    fitnessGoal: { type: String },
    dietPreference: { type: String, enum: ["Veg", "Non-Veg"] },
    gymLocation: { type: String, default: "" },
    workoutTime: { type: String, default: "" },

    // Gamification
    streak: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    badges: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
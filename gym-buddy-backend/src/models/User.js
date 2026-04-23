import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true }, // ← fix this
  password: { type: String, required: true },

  age: Number,
  height: Number,
  weight: Number,
  fitnessGoal: String,
  gender: String,
  gymLocation: String,
  workoutTime: String,
  dietPreference: String,

  streak: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  badges: { type: [String], default: [] }
});

export default mongoose.model("User", userSchema);
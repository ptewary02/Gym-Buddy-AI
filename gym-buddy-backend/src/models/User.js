import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,

  age: Number,
  height: Number,
  weight: Number,
  fitnessGoal: String,

  streak: { type: Number, default: 0 },
  points: { type: Number, default: 0 }
});

export default mongoose.model("User", userSchema);

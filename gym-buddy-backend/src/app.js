import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173"],
  credentials: true
}));

app.use(express.json());

// Debug: log every request
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`); // ← shows every incoming request
  next();
});

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Gym Buddy Backend is running 💪");
});

export default app;
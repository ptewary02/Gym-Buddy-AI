import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import dietRoutes from "./routes/diet.routes.js";

const app = express();

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173", "https://ptewary02.github.io"],
  credentials: true
}));

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/diet", dietRoutes);

app.get("/", (_req, res) => {
  res.send("Gym Buddy Backend is running 💪");
});

export default app;

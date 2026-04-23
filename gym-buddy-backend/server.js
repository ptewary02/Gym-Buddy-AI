import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

console.log("ENV FILE LOADED:", process.env.MONGO_URI);

import app from "./src/app.js";

import connectDB from "./src/config/db.js";

connectDB();

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
  console.log(`Test URL: http://localhost:${PORT}/api/auth/signup`);
});

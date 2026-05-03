import express from "express";
import jwt from "jsonwebtoken";
import { GoogleGenAI, Type } from "@google/genai";

const router = express.Router();

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

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.post("/diet-plan", auth, async (req, res) => {
  try {
    const user = req.body;
    const prompt = `Generate a 7-day personalized Indian diet plan for:
    - Age: ${user.age}, Gender: ${user.gender}
    - Goal: ${user.goal}, Diet: ${user.dietPreference}
    - Weight: ${user.weight}kg, Height: ${user.height}cm
    Include breakfast, lunch, dinner, snacks with calories. Focus on Indian cuisine.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sevenDayPlan: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING },
                  breakfast: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, calories: { type: Type.NUMBER }, description: { type: Type.STRING } }, required: ["name","calories","description"] },
                  lunch: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, calories: { type: Type.NUMBER }, description: { type: Type.STRING } }, required: ["name","calories","description"] },
                  dinner: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, calories: { type: Type.NUMBER }, description: { type: Type.STRING } }, required: ["name","calories","description"] },
                  snacks: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, calories: { type: Type.NUMBER }, description: { type: Type.STRING } }, required: ["name","calories","description"] },
                },
                required: ["day","breakfast","lunch","dinner","snacks"]
              }
            },
            explanation: { type: Type.STRING }
          },
          required: ["sevenDayPlan","explanation"]
        }
      }
    });

    res.json(JSON.parse(response.text));
  } catch (err) {
    res.status(500).json({ message: "Failed to generate diet plan", error: err.message });
  }
});

router.post("/match-reason", auth, async (req, res) => {
  try {
    const { user1, user2 } = req.body;
    const ai2 = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai2.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Explain in 2 sentences why ${user1.name} (Goal: ${user1.goal}, Gym: ${user1.gymLocation}, Time: ${user1.workoutTime}) and ${user2.name} (Goal: ${user2.goal}, Gym: ${user2.gymLocation}, Time: ${user2.workoutTime}) are a good fitness match. Be motivating.`
    });
    res.json({ reason: response.text });
  } catch (err) {
    res.status(500).json({ reason: "Great potential gym partners!" });
  }
});

export default router;
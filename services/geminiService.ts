
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, DietPlan, FitnessGoal, DietPreference } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateDietPlan = async (user: UserProfile): Promise<DietPlan> => {
  const prompt = `
    Generate a 7-day personalized Indian diet plan for a user with the following profile:
    - Age: ${user.age}
    - Gender: ${user.gender}
    - Goal: ${user.goal}
    - Diet Preference: ${user.dietPreference}
    - Current Weight: ${user.weight}kg, Height: ${user.height}cm

    Include:
    1. A daily breakdown (Monday to Sunday).
    2. Breakfast, Lunch, Dinner, and Snacks.
    3. Approximate calories per meal.
    4. Focus on Indian cuisine (e.g., Poha, Paneer, Dals, Rotis, Chicken Curry).
    5. A brief explanation of the macro choices.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
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
                breakfast: { 
                  type: Type.OBJECT, 
                  properties: { name: { type: Type.STRING }, calories: { type: Type.NUMBER }, description: { type: Type.STRING } },
                  required: ["name", "calories", "description"]
                },
                lunch: { 
                  type: Type.OBJECT, 
                  properties: { name: { type: Type.STRING }, calories: { type: Type.NUMBER }, description: { type: Type.STRING } },
                  required: ["name", "calories", "description"]
                },
                dinner: { 
                  type: Type.OBJECT, 
                  properties: { name: { type: Type.STRING }, calories: { type: Type.NUMBER }, description: { type: Type.STRING } },
                  required: ["name", "calories", "description"]
                },
                snacks: { 
                  type: Type.OBJECT, 
                  properties: { name: { type: Type.STRING }, calories: { type: Type.NUMBER }, description: { type: Type.STRING } },
                  required: ["name", "calories", "description"]
                },
              },
              required: ["day", "breakfast", "lunch", "dinner", "snacks"]
            }
          },
          explanation: { type: Type.STRING }
        },
        required: ["sevenDayPlan", "explanation"]
      }
    }
  });

  return JSON.parse(response.text) as DietPlan;
};

export const getMatchingExplanation = async (user1: UserProfile, user2: UserProfile): Promise<string> => {
  const prompt = `
    Explain why these two people are a good fitness match.
    Person 1: ${user1.name}, Goal: ${user1.goal}, Gym: ${user1.gymLocation}, Time: ${user1.workoutTime}.
    Person 2: ${user2.name}, Goal: ${user2.goal}, Gym: ${user2.gymLocation}, Time: ${user2.workoutTime}.
    Keep it concise and motivating (2 sentences).
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt
  });

  return response.text || "You both share similar goals and schedules!";
};

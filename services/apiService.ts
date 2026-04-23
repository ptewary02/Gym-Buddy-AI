const BASE_URL = "https://gym-buddy-ai-4wtv.onrender.com";

// Helper to get stored token
const getToken = () => localStorage.getItem("gymbuddy_token");

export const signupUser = async (data: object) => {
  const res = await fetch(`${BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

export const loginUser = async (data: object) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

export const logActivity = async (type: "workout" | "diet") => {
  const res = await fetch(`${BASE_URL}/users/log-activity`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ type }),
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

export const getLeaderboard = async () => {
  const res = await fetch(`${BASE_URL}/users/leaderboard`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw await res.json();
  return res.json();
};
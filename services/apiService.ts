const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// ── helpers ────────────────────────────────────────────────────────────────
 
const authHeader = () => {
  const token = localStorage.getItem('gymbuddy_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};
 
const json = async (res: Response) => {
  const data = await res.json();
  if (!res.ok) return Promise.reject(data);
  return data;
};
 
// ── auth ───────────────────────────────────────────────────────────────────
 
export const signup = async (email: string, password: string) => {
  return fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }).then(json);
};
 
export const login = async (email: string, password: string) => {
  const data = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }).then(json);
 
  if (data.token) localStorage.setItem('gymbuddy_token', data.token);
  return data;
};
 
export const logout = () => {
  localStorage.removeItem('gymbuddy_token');
  localStorage.removeItem('gymbuddy_user');
  localStorage.removeItem('gymbuddy_diet');
};
 
// ── profile ────────────────────────────────────────────────────────────────
 
export const saveProfile = async (profile: Record<string, unknown>) => {
  return fetch(`${BASE_URL}/user/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
    },
    body: JSON.stringify(profile),
  }).then(json);
};
 
export const getProfile = async () => {
  return fetch(`${BASE_URL}/user/profile`, {
    headers: { ...authHeader() },
  }).then(json);
};
 
export const logActivity = async (type: 'workout' | 'diet') => {
  const res = await fetch(`${BASE_URL}/user/activity`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify({ type }),
  });
  const data = await res.json();
  // 409 means already done today — not a hard error, return it
  if (res.status === 409) return { ...data, alreadyDone: true };
  if (!res.ok) return Promise.reject(data);
  return data;
};
 
export const getLeaderboard = async () => {
  return fetch(`${BASE_URL}/user/leaderboard`, {
    headers: { ...authHeader() },
  }).then(json);
};

 
export const isLoggedIn = () => !!localStorage.getItem('gymbuddy_token');
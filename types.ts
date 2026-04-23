
export enum FitnessGoal {
  FAT_LOSS = 'Fat Loss',
  MUSCLE_GAIN = 'Muscle Gain',
  MAINTENANCE = 'Maintenance'
}

export enum DietPreference {
  VEG = 'Veg',
  NON_VEG = 'Non-Veg'
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;    // ← Backend
  password?: string; // ← Backend
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  height: number;
  weight: number;
  goal: FitnessGoal;
  dietPreference: DietPreference;
  gymLocation: string;
  workoutTime: string;
  points: number;
  streak: number;
  badges: string[];
}

export interface Meal {
  name: string;
  calories: number;
  description: string;
}

export interface DailyDiet {
  day: string;
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  snacks: Meal;
}

export interface DietPlan {
  userId: string;
  sevenDayPlan: DailyDiet[];
  explanation: string;
}

export interface Match {
  user: UserProfile;
  score: number;
  reason: string;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  points: number;
  rank: number;
}

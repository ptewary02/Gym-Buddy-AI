import React, { useState, useEffect } from 'react';
import { UserProfile, FitnessGoal, DietPreference, DietPlan } from './types';
import { generateDietPlan } from './services/geminiService';
import { signupUser, logActivity } from './services/apiService';
import Dashboard from './components/Dashboard';
import Onboarding from './components/Onboarding';
import Header from './components/Header';
import Leaderboard from './components/Leaderboard';
import DietPlanView from './components/DietPlanView';
import PartnerMatching from './components/PartnerMatching';

// Mock other users for matching/leaderboard (replace with real API later)
const MOCK_USERS: UserProfile[] = [
  {
    id: 'user-2',
    name: 'Amit Singh',
    age: 24,
    gender: 'Male',
    height: 180,
    weight: 82,
    goal: FitnessGoal.MUSCLE_GAIN,
    dietPreference: DietPreference.VEG,
    gymLocation: 'Cult Fit, Indiranagar',
    workoutTime: '07:15 AM',
    points: 200,
    streak: 12,
    badges: [],
  },
  {
    id: 'user-3',
    name: 'Priya Patel',
    age: 22,
    gender: 'Female',
    height: 165,
    weight: 58,
    goal: FitnessGoal.FAT_LOSS,
    dietPreference: DietPreference.VEG,
    gymLocation: 'Gold Gym, Whitefield',
    workoutTime: '06:30 PM',
    points: 80,
    streak: 3,
    badges: [],
  },
  {
    id: 'user-4',
    name: 'Vikram Das',
    age: 30,
    gender: 'Male',
    height: 170,
    weight: 70,
    goal: FitnessGoal.MAINTENANCE,
    dietPreference: DietPreference.NON_VEG,
    gymLocation: 'Cult Fit, Indiranagar',
    workoutTime: '07:30 AM',
    points: 120,
    streak: 8,
    badges: [],
  },
];

const App: React.FC = () => {
  // ─── State ────────────────────────────────────────────────────────────────
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('gymbuddy_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [dietPlan, setDietPlan] = useState<DietPlan | null>(() => {
    const saved = localStorage.getItem('gymbuddy_diet');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'diet' | 'partners' | 'leaderboard'
  >('dashboard');

  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // ─── Persist user & diet to localStorage ─────────────────────────────────
  useEffect(() => {
    if (user) {
      localStorage.setItem('gymbuddy_user', JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    if (dietPlan) {
      localStorage.setItem('gymbuddy_diet', JSON.stringify(dietPlan));
    }
  }, [dietPlan]);

  // ─── Onboarding / Signup ─────────────────────────────────────────────────
  const handleOnboardingComplete = async (
    profile: UserProfile & { email: string; password: string }
  ) => {
    setLoading(true);
    setAuthError(null);

    try {
      // 1. Register user in MongoDB via backend
      const result = await signupUser({
        name: profile.name,
        email: profile.email,
        password: profile.password,
        age: profile.age,
        height: profile.height,
        weight: profile.weight,
        fitnessGoal: profile.goal,
        gender: profile.gender,
        gymLocation: profile.gymLocation,
        workoutTime: profile.workoutTime,
        dietPreference: profile.dietPreference,
      });

      // 2. Persist JWT token
      localStorage.setItem('gymbuddy_token', result.token);
      localStorage.setItem('gymbuddy_onboarded', 'true');

      // 3. Merge DB response with local profile shape
      const fullProfile: UserProfile = {
        ...profile,
        id: result.user.id,
        points: result.user.points ?? 0,
        streak: result.user.streak ?? 0,
        badges: result.user.badges ?? [],
      };
      setUser(fullProfile);

      // 4. Generate Gemini diet plan
      const plan = await generateDietPlan(fullProfile);
      setDietPlan(plan);
    } catch (err: any) {
      // err is the JSON body thrown from apiService
      const message = err?.message ?? 'Signup failed. Please try again.';
      setAuthError(message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Log Activity (workout / diet) ───────────────────────────────────────
  const handleLogActivity = async (type: 'workout' | 'diet') => {
    if (!user) return;

    try {
      // Try real backend first
      const updatedUser = await logActivity(type);
      setUser((prev) =>
        prev
          ? { ...prev, points: updatedUser.points, streak: updatedUser.streak }
          : prev
      );
    } catch {
      // Fallback: update locally if backend is unavailable
      const bonus = type === 'workout' ? 10 : 5;
      const streakBonus = type === 'workout' ? 1 : 0;
      setUser((prev) =>
        prev
          ? {
              ...prev,
              points: prev.points + bonus,
              streak: prev.streak + streakBonus,
            }
          : prev
      );
    }
  };

  // ─── Logout ───────────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem('gymbuddy_user');
    localStorage.removeItem('gymbuddy_diet');
    localStorage.removeItem('gymbuddy_token');
    localStorage.removeItem('gymbuddy_onboarded');
    setUser(null);
    setDietPlan(null);
    setActiveTab('dashboard');
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <>
        {authError && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-100 border border-red-300 text-red-700 px-6 py-3 rounded-xl shadow-lg text-sm font-medium">
            ⚠️ {authError}
          </div>
        )}
        <Onboarding onComplete={handleOnboardingComplete} loading={loading} />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      <main className="flex-grow container mx-auto px-4 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            user={user}
            dietPlan={dietPlan}
            onLogActivity={handleLogActivity}
          />
        )}

        {activeTab === 'diet' && (
          <DietPlanView
            dietPlan={dietPlan}
            loading={loading}
            onRegenerate={async () => {
              setLoading(true);
              try {
                const plan = await generateDietPlan(user);
                setDietPlan(plan);
              } finally {
                setLoading(false);
              }
            }}
          />
        )}

        {activeTab === 'partners' && (
          <PartnerMatching currentUser={user} otherUsers={MOCK_USERS} />
        )}

        {activeTab === 'leaderboard' && (
          <Leaderboard currentUser={user} otherUsers={MOCK_USERS} />
        )}
      </main>

      <footer className="bg-white border-t py-6 text-center text-slate-500 text-sm">
        &copy; 2026 Gym Buddy AI. Personalized for {user.name}.
      </footer>
    </div>
  );
};

export default App;
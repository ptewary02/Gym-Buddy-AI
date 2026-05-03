import React, { useState, useEffect } from 'react';
import { UserProfile, FitnessGoal, DietPreference, DietPlan } from './types';
import { generateDietPlanAPI } from './services/geminiService';
import { saveProfile, getProfile, logout as apiLogout, isLoggedIn, logActivity } from './services/apiService';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import Onboarding from './components/Onboarding';
import Header from './components/Header';
import Leaderboard from './components/Leaderboard';
import DietPlanView from './components/DietPlanView';
import PartnerMatching from './components/PartnerMatching';

// ── App state type ──────────────────────────────────────────────────────────

type AppScreen = 'auth' | 'onboarding' | 'app';

// ── Mock users for partner matching / leaderboard ───────────────────────────

// const MOCK_USERS: UserProfile[] = [
//   { id: 'user-2', name: 'Amit Singh', age: 24, gender: 'Male', height: 180, weight: 82, goal: FitnessGoal.MUSCLE_GAIN, dietPreference: DietPreference.VEG, gymLocation: 'Cult Fit, Indiranagar', workoutTime: '07:15 AM', points: 200, streak: 12, badges: [] },
//   { id: 'user-3', name: 'Priya Patel', age: 22, gender: 'Female', height: 165, weight: 58, goal: FitnessGoal.FAT_LOSS, dietPreference: DietPreference.VEG, gymLocation: 'Gold Gym, Whitefield', workoutTime: '06:30 PM', points: 80, streak: 3, badges: [] },
//   { id: 'user-4', name: 'Vikram Das', age: 30, gender: 'Male', height: 170, weight: 70, goal: FitnessGoal.MAINTENANCE, dietPreference: DietPreference.NON_VEG, gymLocation: 'Cult Fit, Indiranagar', workoutTime: '07:30 AM', points: 120, streak: 8, badges: [] },
// ];

// ── helpers ─────────────────────────────────────────────────────────────────

/** Map DB user object → UserProfile shape used across the frontend */
const dbUserToProfile = (db: any): UserProfile => ({
  id: db._id || db.id || '',
  name: db.name || '',
  age: db.age || 0,
  gender: db.gender || 'Male',
  height: db.height || 0,
  weight: db.weight || 0,
  goal: (db.fitnessGoal || db.goal) as FitnessGoal || FitnessGoal.MUSCLE_GAIN,
  dietPreference: db.dietPreference as DietPreference || DietPreference.VEG,
  gymLocation: db.gymLocation || '',
  workoutTime: db.workoutTime || '',
  points: db.points || 0,
  streak: db.streak || 0,
  badges: db.badges || [],
  lastWorkoutDate: db.lastWorkoutDate || '',
  lastDietDate: db.lastDietDate || '',
});

/** Check if a profile is complete enough to skip onboarding */
const isProfileComplete = (u: UserProfile) =>
  !!u.name && !!u.gymLocation && u.age > 0;

const todayStr = () => new Date().toISOString().split('T')[0];
// ── component ───────────────────────────────────────────────────────────────

const App: React.FC = () => {
  const [screen, setScreen] = useState<AppScreen>('auth');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(() => {
    const saved = localStorage.getItem('gymbuddy_diet');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'diet' | 'partners' | 'leaderboard'>('dashboard');
  const [loading, setLoading] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);

  // ── on mount: restore session if token exists ────────────────────────────
  useEffect(() => {
    const restore = async () => {
      if (!isLoggedIn()) {
        setBootstrapping(false);
        return;
      }
      try {
        const dbUser = await getProfile();
        const profile = dbUserToProfile(dbUser);
        setUser(profile);
        setUserEmail(dbUser.email || '');
        setScreen(isProfileComplete(profile) ? 'app' : 'onboarding');
      } catch {
        // token expired / invalid — go back to auth
        apiLogout();
      } finally {
        setBootstrapping(false);
      }
    };
    restore();
  }, []);

  useEffect(() => {
    if (dietPlan) localStorage.setItem('gymbuddy_diet', JSON.stringify(dietPlan));
  }, [dietPlan]);

  // ── handlers ─────────────────────────────────────────────────────────────

  const handleAuthSuccess = async (_token: string, isNewUser: boolean) => {
    try {
      const dbUser = await getProfile();
      setUserEmail(dbUser.email || '');
      const profile = dbUserToProfile(dbUser);
      setUser(profile);

      if (isNewUser || !isProfileComplete(profile)) {
        setScreen('onboarding');
      } else {
        setScreen('app');
      }
    } catch {
      // profile fetch failed — send to onboarding anyway
      setScreen('onboarding');
    }
  };

  const handleOnboardingComplete = async (profile: UserProfile) => {
    setLoading(true);
    try {
      // Persist to backend
      await saveProfile({
        name: profile.name,
        age: profile.age,
        gender: profile.gender,
        height: profile.height,
        weight: profile.weight,
        fitnessGoal: profile.goal,
        dietPreference: profile.dietPreference,
        gymLocation: profile.gymLocation,
        workoutTime: profile.workoutTime,
      });

      // Merge new profile with existing points/streak from current user
      const mergedProfile: UserProfile = {
        ...profile,
        id: user?.id || profile.id,
        points: user?.points ?? profile.points,      // ← keep existing
        streak: user?.streak ?? profile.streak,      // ← keep existing
        badges: user?.badges ?? profile.badges,      // ← keep existing
        lastWorkoutDate: user?.lastWorkoutDate || '',
        lastDietDate: user?.lastDietDate || '',
      };

      setUser(mergedProfile);
      const plan = await generateDietPlanAPI(user);
      setDietPlan(plan);
      setScreen('app');
    } catch (err) {
      console.error('Onboarding save failed:', err);
      setUser(profile);
      setScreen('app');
    } finally {
      setLoading(false);
    }
  };

  const handleLogActivity = async (type: 'workout' | 'diet') => {
    if (!user) return;
 
    // Check already done today (client-side fast check)
    const today = todayStr();
    if (type === 'workout' && user.lastWorkoutDate === today) {
      alert('You already logged your workout today! Come back tomorrow 💪');
      return;
    }
    if (type === 'diet' && user.lastDietDate === today) {
      alert('You already logged your diet today! Come back tomorrow 🥗');
      return;
    }
 
    try {
      const result = await logActivity(type);
      if (result.alreadyDone) {
        alert(`You already logged ${type} today! Resets at midnight.`);
        return;
      }
      // Update from DB response so points are always accurate
      setUser(prev => prev ? {
        ...prev,
        points: result.user.points,
        streak: result.user.streak,
        lastWorkoutDate: result.user.lastWorkoutDate || prev.lastWorkoutDate,
        lastDietDate: result.user.lastDietDate || prev.lastDietDate,
      } : prev);
    } catch (err) {
      console.error('Failed to log activity:', err);
    }
  };

  const handleUpdateProfile = () => {
    setScreen('onboarding');
  };

  const handleLogout = () => {
    apiLogout();
    setUser(null);
    setDietPlan(null);
    setUserEmail('');
    setScreen('auth');
    setActiveTab('dashboard');
    localStorage.removeItem('gymbuddy_diet');
  };

  // ── render ────────────────────────────────────────────────────────────────

  if (bootstrapping) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-medium">Loading GymBuddy...</p>
        </div>
      </div>
    );
  }

  if (screen === 'auth') {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  if (screen === 'onboarding' || !user) {
    return (
      <Onboarding
        onComplete={handleOnboardingComplete}
        loading={loading}
        userEmail={userEmail}
        existingUser={user}
      />
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
            onUpdateProfile={handleUpdateProfile}
          />
        )}
        {activeTab === 'diet' && (
          <DietPlanView
            dietPlan={dietPlan}
            loading={loading}
            onRegenerate={async () => {
              setLoading(true);
              const plan = await generateDietPlanAPI(user);
              setDietPlan(plan);
              setLoading(false);
            }}
          />
        )}
        {activeTab === 'partners' && (
          <PartnerMatching currentUser={user} otherUsers={[]} />
        )}
        {activeTab === 'leaderboard' && (
          <Leaderboard currentUser={user} />
        )}
      </main>

      <footer className="bg-white border-t py-6 text-center text-slate-500 text-sm">
        &copy; 2026 Gym Buddy AI. Personalized for {user.name}.
      </footer>
    </div>
  );
};

export default App;

import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, FitnessGoal, DietPreference, DietPlan, Match, LeaderboardEntry } from './types';
import { generateDietPlan, getMatchingExplanation } from './services/geminiService';
import Dashboard from './components/Dashboard';
import Onboarding from './components/Onboarding';
import Header from './components/Header';
import Leaderboard from './components/Leaderboard';
import DietPlanView from './components/DietPlanView';
import PartnerMatching from './components/PartnerMatching';

const INITIAL_USER_STATE: UserProfile = {
  id: 'user-1',
  name: 'Virat Kohli',
  age: 25,
  gender: 'Male',
  height: 175,
  weight: 78,
  goal: FitnessGoal.MUSCLE_GAIN,
  dietPreference: DietPreference.VEG,
  gymLocation: 'Vault, Gorakhpur',
  workoutTime: '07:00 AM',
  points: 150,
  streak: 5,
  badges: ['Early Bird', 'Consistency King'],
};

// Mock other users for matching
const MOCK_USERS: UserProfile[] = [
  { id: 'user-2', name: 'Amit Singh', age: 24, gender: 'Male', height: 180, weight: 82, goal: FitnessGoal.MUSCLE_GAIN, dietPreference: DietPreference.VEG, gymLocation: 'Cult Fit, Indiranagar', workoutTime: '07:15 AM', points: 200, streak: 12, badges: [] },
  { id: 'user-3', name: 'Priya Patel', age: 22, gender: 'Female', height: 165, weight: 58, goal: FitnessGoal.FAT_LOSS, dietPreference: DietPreference.VEG, gymLocation: 'Gold Gym, Whitefield', workoutTime: '06:30 PM', points: 80, streak: 3, badges: [] },
  { id: 'user-4', name: 'Vikram Das', age: 30, gender: 'Male', height: 170, weight: 70, goal: FitnessGoal.MAINTENANCE, dietPreference: DietPreference.NON_VEG, gymLocation: 'Cult Fit, Indiranagar', workoutTime: '07:30 AM', points: 120, streak: 8, badges: [] },
];

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('gymbuddy_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(() => {
    const saved = localStorage.getItem('gymbuddy_diet');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'diet' | 'partners' | 'leaderboard'>('dashboard');
  const [loading, setLoading] = useState(false);

  const [isOnboarded, setIsOnboarded] = useState(() => {
    return localStorage.getItem("gymbuddy_onboarded") === "true";
  });


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

  const handleOnboardingComplete = async (profile: UserProfile) => {
    setLoading(true);
    setUser(profile);
    setIsOnboarded(true);
    localStorage.setItem("gymbuddy_onboarded", "true");

    try {
      const plan = await generateDietPlan(profile);
      setDietPlan(plan);
    } finally {
      setLoading(false);
    }
  };


  const handleLogActivity = (type: 'workout' | 'diet') => {
    if (!user) return;
    const bonus = type === 'workout' ? 10 : 5;
    setUser({
      ...user,
      points: user.points + bonus,
      streak: type === 'workout' ? user.streak + 1 : user.streak
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('gymbuddy_user');
    localStorage.removeItem('gymbuddy_diet');
    setUser(null);
    setDietPlan(null);
    setActiveTab('dashboard');
  };

  const today = new Date().toISOString().split('T')[0];
  const alreadyCheckedIn =
  localStorage.getItem('gymbuddy_last_checkin') === today;





  if (!user) {
    return <Onboarding onComplete={handleOnboardingComplete} loading={loading} />;
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
              const plan = await generateDietPlan(user);
              setDietPlan(plan);
              setLoading(false);
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

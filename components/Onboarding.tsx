
import React, { useState } from 'react';
import { UserProfile, FitnessGoal, DietPreference } from '../types';


interface OnboardingProps {
  onComplete: (user: UserProfile) => void;
  loading: boolean;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, loading }) => {
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: '',
    age: 25,
    gender: 'Male',
    height: 170,
    weight: 70,
    goal: FitnessGoal.MUSCLE_GAIN,
    dietPreference: DietPreference.VEG,
    gymLocation: '',
    workoutTime: '07:00 AM'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({
      ...formData as UserProfile,
      id: Math.random().toString(36).substr(2, 9),
      points: 0,
      streak: 0,
      badges: []
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: (name === 'age' || name === 'height' || name === 'weight') ? Number(value) : value 
    }));
  };

  


  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        
        <div
      className="relative md:w-2/3 p-10 flex flex-col justify-center text-white bg-cover bg-center"
      style={{ backgroundImage: `url(https://img.freepik.com/free-photo/low-angle-view-unrecognizable-muscular-build-man-preparing-lifting-barbell-health-club_637285-2497.jpg?semt=ais_user_personalization&w=740&q=80)` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-700/90 to-black/60"></div>

      <div className="relative z-10">
        <h2 className="text-3xl font-bold mb-4">
          Welcome to GymBuddy
        </h2>
        <p className="text-emerald-100 text-sm">
          Set up your profile to generate your AI diet plan and find your perfect workout partner.
        </p>
      </div>
    </div>
        
        <form onSubmit={handleSubmit} className="md:w-2/3 p-8 sm:p-10 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
              <input 
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                placeholder="Virat Kohli"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Age</label>
              <input 
                required
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-100 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Gender</label>
              <select 
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-100 rounded-xl outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Weight (kg)</label>
              <input 
                required
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-100 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Height (cm)</label>
              <input 
                required
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-100 rounded-xl outline-none"
              />
            </div>

            <div className="col-span-1 sm:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fitness Goal</label>
              <select 
                name="goal"
                value={formData.goal}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-100 rounded-xl outline-none"
              >
                {Object.values(FitnessGoal).map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Diet</label>
              <select 
                name="dietPreference"
                value={formData.dietPreference}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-100 rounded-xl outline-none"
              >
                {Object.values(DietPreference).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Workout Time</label>
              <input 
                type="text"
                name="workoutTime"
                value={formData.workoutTime}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-100 rounded-xl outline-none"
                placeholder="07:00 AM"
              />
            </div>

            <div className="col-span-1 sm:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Gym Location</label>
              <input 
                required
                name="gymLocation"
                value={formData.gymLocation}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-100 rounded-xl outline-none"
                placeholder="e.g. Vault, Gorakhpur"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all ${loading ? 'bg-slate-300 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98]'}`}
          >
            {loading ? 'Generating Your Profile...' : 'Get Started'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;

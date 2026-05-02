import React, { useState } from 'react';
import { UserProfile, FitnessGoal, DietPreference } from '../types';

interface OnboardingProps {
  onComplete: (user: UserProfile) => void;
  loading: boolean;
  userEmail?: string;
}

const STEPS = ['Personal', 'Fitness', 'Gym'];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, loading, userEmail }) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: '',
    age: 25,
    gender: 'Male',
    height: 170,
    weight: 70,
    goal: FitnessGoal.MUSCLE_GAIN,
    dietPreference: DietPreference.VEG,
    gymLocation: '',
    workoutTime: '07:00 AM',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['age', 'height', 'weight'].includes(name) ? Number(value) : value,
    }));
  };

  const nextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else handleSubmit();
  };

  const handleSubmit = () => {
    onComplete({
      ...(formData as UserProfile),
      id: Math.random().toString(36).substr(2, 9),
      points: 0,
      streak: 0,
      badges: [],
    });
  };

  const inputClass =
    'w-full px-4 py-3 bg-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm';
  const labelClass = 'block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden">

        {/* Header */}
        <div
          className="relative p-8 text-white bg-cover bg-center"
          style={{
            backgroundImage: `url(https://img.freepik.com/free-photo/low-angle-view-unrecognizable-muscular-build-man-preparing-lifting-barbell-health-club_637285-2497.jpg?semt=ais_user_personalization&w=740&q=80)`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-700/90 to-teal-900/80" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-bold">GymBuddy<span className="text-emerald-300">AI</span></span>
            </div>
            <h2 className="text-2xl font-bold">Complete Your Profile</h2>
            {userEmail && (
              <p className="text-emerald-200 text-sm mt-1">Logged in as {userEmail}</p>
            )}
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex border-b">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider transition-colors ${
                i === step
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : i < step
                  ? 'text-emerald-400'
                  : 'text-slate-300'
              }`}
            >
              <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full mr-1.5 text-[10px] ${
                i < step ? 'bg-emerald-100 text-emerald-600' : i === step ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'
              }`}>
                {i < step ? '✓' : i + 1}
              </span>
              {s}
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={nextStep} className="p-8">
          {/* Step 0 — Personal */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Full Name</label>
                <input
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Virat Kohli"
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Age</label>
                  <input
                    required
                    type="number"
                    name="age"
                    min={10}
                    max={100}
                    value={formData.age}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className={inputClass}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Weight (kg)</label>
                  <input
                    required
                    type="number"
                    name="weight"
                    min={20}
                    max={300}
                    value={formData.weight}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Height (cm)</label>
                  <input
                    required
                    type="number"
                    name="height"
                    min={100}
                    max={250}
                    value={formData.height}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 1 — Fitness */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Fitness Goal</label>
                <div className="grid grid-cols-1 gap-3">
                  {Object.values(FitnessGoal).map(g => (
                    <label
                      key={g}
                      className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        formData.goal === g
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="goal"
                        value={g}
                        checked={formData.goal === g}
                        onChange={handleChange}
                        className="accent-emerald-600"
                      />
                      <span className="font-semibold text-sm text-slate-700">{g}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelClass}>Diet Preference</label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.values(DietPreference).map(d => (
                    <label
                      key={d}
                      className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        formData.dietPreference === d
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="dietPreference"
                        value={d}
                        checked={formData.dietPreference === d}
                        onChange={handleChange}
                        className="accent-emerald-600"
                      />
                      <span className="font-semibold text-sm text-slate-700">
                        {d === 'Veg' ? '🥦 Vegetarian' : '🍗 Non-Vegetarian'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — Gym */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Gym Location</label>
                <input
                  required
                  name="gymLocation"
                  value={formData.gymLocation}
                  onChange={handleChange}
                  placeholder="e.g. Vault, Gorakhpur"
                  className={inputClass}
                />
                <p className="text-xs text-slate-400 mt-1.5">Used to match you with nearby gym partners.</p>
              </div>
              <div>
                <label className={labelClass}>Preferred Workout Time</label>
                <input
                  name="workoutTime"
                  value={formData.workoutTime}
                  onChange={handleChange}
                  placeholder="e.g. 07:00 AM"
                  className={inputClass}
                />
                <p className="text-xs text-slate-400 mt-1.5">Helps match you with people on the same schedule.</p>
              </div>

              {/* Summary preview */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 space-y-2">
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Profile Summary</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <span className="text-slate-500">Name</span>
                  <span className="font-medium text-slate-800">{formData.name}</span>
                  <span className="text-slate-500">Age / Gender</span>
                  <span className="font-medium text-slate-800">{formData.age} / {formData.gender}</span>
                  <span className="text-slate-500">Weight / Height</span>
                  <span className="font-medium text-slate-800">{formData.weight}kg / {formData.height}cm</span>
                  <span className="text-slate-500">Goal</span>
                  <span className="font-medium text-slate-800">{formData.goal}</span>
                  <span className="text-slate-500">Diet</span>
                  <span className="font-medium text-slate-800">{formData.dietPreference}</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                className="flex-1 py-3 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all text-sm"
              >
                ← Back
              </button>
            )}
            <button
              type="submit"
              disabled={loading && step === STEPS.length - 1}
              className={`flex-1 py-3 rounded-xl text-white font-bold text-sm shadow-lg transition-all ${
                loading && step === STEPS.length - 1
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] shadow-emerald-200'
              }`}
            >
              {step < STEPS.length - 1
                ? `Next: ${STEPS[step + 1]} →`
                : loading
                ? 'Setting up your plan...'
                : '🚀 Generate My Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
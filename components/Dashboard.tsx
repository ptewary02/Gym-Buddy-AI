
import React from 'react';
import { UserProfile, DietPlan } from '../types';



interface DashboardProps {
  user: UserProfile;
  dietPlan: DietPlan | null;
  onLogActivity: (type: 'workout' | 'diet') => void;
  
  
}

const Dashboard: React.FC<DashboardProps> = ({ user, dietPlan, onLogActivity}) => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentDayName = days[new Date().getDay()];
  const todayDiet = dietPlan?.sevenDayPlan.find(d => d.day === currentDayName) || dietPlan?.sevenDayPlan[0];
  


  return (
    <div className="space-y-8 animate-fade-in">
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col items-center">
          <span className="text-slate-400 text-sm font-medium mb-1">Streak</span>
          <span className="text-4xl font-bold text-orange-500">{user.streak}</span>
          <span className="text-xs text-slate-500 mt-1">Days in a row</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col items-center">
          <span className="text-slate-400 text-sm font-medium mb-1">Points</span>
          <span className="text-4xl font-bold text-emerald-600">{user.points}</span>
          <span className="text-xs text-slate-500 mt-1">Total earned</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col items-center">
          <span className="text-slate-400 text-sm font-medium mb-1">Goal</span>
          <span className="text-lg font-bold text-slate-800 text-center">{user.goal}</span>
          <span className="text-xs text-slate-500 mt-1">Target</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col items-center">
          <span className="text-slate-400 text-sm font-medium mb-1">Badges</span>
          <div className="flex gap-1 mt-2">
            {user.badges.length > 0 ? user.badges.map(b => (
              <div key={b} className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-600" title={b}>
                🏆
              </div>
            )) : <span className="text-slate-300 text-xs">No badges yet</span>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Log */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-emerald-800 mb-4">Daily Check-in</h3>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => onLogActivity('workout')} className="flex-1 bg-white border-2 border-emerald-500 hover:bg-emerald-500 hover:text-white transition-all py-4 px-6 rounded-xl flex items-center justify-center gap-3" > 
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> 
                <span className="font-bold">Logged Workout (+10 pts)</span>
              </button>

              <button 
                onClick={() => onLogActivity('diet')}
                className="flex-1 bg-white border-2 border-emerald-500 hover:bg-emerald-500 hover:text-white transition-all py-4 px-6 rounded-xl flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 3h18v18H3z" /></svg>
                <span className="font-bold">Followed Diet (+5 pts)</span>
              </button>
            </div>
          </div>

          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Today's Diet Plan</h3>
              <span className="text-emerald-600 font-semibold">{currentDayName}</span>
            </div>
            
            {todayDiet ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Breakfast', data: todayDiet.breakfast, color: 'bg-blue-50 text-blue-700' },
                  { label: 'Lunch', data: todayDiet.lunch, color: 'bg-green-50 text-green-700' },
                  { label: 'Snacks', data: todayDiet.snacks, color: 'bg-orange-50 text-orange-700' },
                  { label: 'Dinner', data: todayDiet.dinner, color: 'bg-purple-50 text-purple-700' },
                ].map((meal) => (
                  <div key={meal.label} className="p-4 border rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${meal.color}`}>
                        {meal.label}
                      </span>
                      <span className="text-xs font-medium text-slate-500">{meal.data.calories} kcal</span>
                    </div>
                    <p className="font-bold text-slate-800 leading-tight">{meal.data.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{meal.data.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                <p>No diet plan generated yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Your Profile</h3>
            <ul className="space-y-3">
              <li className="flex justify-between text-sm">
                <span className="text-slate-500">Age / Gender</span>
                <span className="font-medium">{user.age} / {user.gender}</span>
              </li>
              <li className="flex justify-between text-sm">
                <span className="text-slate-500">Weight</span>
                <span className="font-medium">{user.weight} kg</span>
              </li>
              <li className="flex justify-between text-sm">
                <span className="text-slate-500">Gym</span>
                <span className="font-medium text-right max-w-[150px] truncate">{user.gymLocation}</span>
              </li>
              <li className="flex justify-between text-sm">
                <span className="text-slate-500">Workout Time</span>
                <span className="font-medium">{user.workoutTime}</span>
              </li>
            </ul>
            <button  className="w-full mt-6 py-2 text-sm text-emerald-600 font-semibold border border-emerald-100 rounded-lg hover:bg-emerald-50 transition-colors">
              
              Update Profile
            </button>
          </div>

          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-white">
            <h3 className="text-lg font-bold mb-2">Pro Tip</h3>
            <p className="text-emerald-50 text-sm leading-relaxed">
              People with the same workout time are 85% more likely to stick to their fitness routines. Check out your matches!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

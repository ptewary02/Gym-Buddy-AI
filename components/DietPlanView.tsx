
import React, { useState } from 'react';
import { DietPlan } from '../types';

interface DietPlanViewProps {
  dietPlan: DietPlan | null;
  loading: boolean;
  onRegenerate: () => void;
}

const DietPlanView: React.FC<DietPlanViewProps> = ({ dietPlan, loading, onRegenerate }) => {
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium">Gemini is curating your perfect diet plan...</p>
      </div>
    );
  }

  if (!dietPlan) return null;

  const currentDay = dietPlan.sevenDayPlan[selectedDayIdx];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Your AI Diet Plan</h2>
          <p className="text-slate-500 text-sm">Personalized Indian nutrition based on your goals.</p>
        </div>
        <button 
          onClick={onRegenerate}
          className="px-4 py-2 bg-emerald-50 text-emerald-600 font-bold rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-colors"
        >
          Regenerate Plan
        </button>
      </div>

      <div className="bg-slate-100 p-2 rounded-xl flex overflow-x-auto gap-2 no-scrollbar">
        {dietPlan.sevenDayPlan.map((d, idx) => (
          <button
            key={d.day}
            onClick={() => setSelectedDayIdx(idx)}
            className={`flex-1 min-w-[100px] py-3 rounded-lg font-bold text-sm transition-all ${selectedDayIdx === idx ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            {d.day}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { type: 'Breakfast', data: currentDay.breakfast, icon: '🍳', color: 'border-blue-200 bg-blue-50/30' },
          { type: 'Lunch', data: currentDay.lunch, icon: '🍱', color: 'border-emerald-200 bg-emerald-50/30' },
          { type: 'Snacks', data: currentDay.snacks, icon: '🥜', color: 'border-orange-200 bg-orange-50/30' },
          { type: 'Dinner', data: currentDay.dinner, icon: '🍲', color: 'border-purple-200 bg-purple-50/30' },
        ].map(meal => (
          <div key={meal.type} className={`p-6 border rounded-2xl ${meal.color}`}>
            <div className="flex justify-between items-center mb-4">
              <span className="text-2xl">{meal.icon}</span>
              <span className="font-bold text-slate-800 uppercase tracking-widest text-xs">{meal.type}</span>
            </div>
            <h4 className="text-xl font-bold text-slate-900 mb-2">{meal.data.name}</h4>
            <p className="text-slate-600 text-sm mb-4 leading-relaxed">{meal.data.description}</p>
            <div className="pt-4 border-t border-slate-200/50 flex items-center justify-between text-xs font-bold text-slate-500">
              <span>APPROX. CALORIES</span>
              <span className="text-slate-900">{meal.data.calories} kcal</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border p-6 rounded-2xl shadow-sm">
        <h3 className="font-bold text-slate-800 mb-2">Nutritionist's Note</h3>
        <p className="text-slate-600 text-sm italic leading-relaxed">
          {dietPlan.explanation}
        </p>
      </div>
    </div>
  );
};

export default DietPlanView;

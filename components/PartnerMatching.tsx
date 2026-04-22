
import React, { useState, useEffect } from 'react';
import { UserProfile, Match } from '../types';
import { getMatchingExplanation } from '../services/geminiService';

interface PartnerMatchingProps {
  currentUser: UserProfile;
  otherUsers: UserProfile[];
}

const PartnerMatching: React.FC<PartnerMatchingProps> = ({ currentUser, otherUsers }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculateMatches = async () => {
      setLoading(true);
      const calculated: Match[] = [];

      for (const u of otherUsers) {
        let score = 0;
        if (u.gymLocation === currentUser.gymLocation) score += 50;
        
        const uTime = u.workoutTime.split(':')[0];
        const cTime = currentUser.workoutTime.split(':')[0];
        if (uTime === cTime) score += 30;
        
        if (u.goal === currentUser.goal) score += 20;

        // Only show matches with a decent score
        if (score > 30) {
          const reason = await getMatchingExplanation(currentUser, u);
          calculated.push({ user: u, score, reason });
        }
      }

      setMatches(calculated.sort((a, b) => b.score - a.score));
      setLoading(false);
    };

    calculateMatches();
  }, [currentUser, otherUsers]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border shadow-sm">
        <h2 className="text-2xl font-bold text-slate-800">Gym Partner Matches</h2>
        <p className="text-slate-500 text-sm">Matching you with people in <span className="text-emerald-600 font-semibold">{currentUser.gymLocation}</span>.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="bg-white p-6 rounded-2xl border shadow-sm animate-pulse space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                </div>
              </div>
              <div className="h-10 bg-slate-200 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : matches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {matches.map(match => (
            <div key={match.user.id} className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-slate-100 overflow-hidden border-2 border-emerald-100">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${match.user.name}`} alt="avatar" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">{match.user.name}</h3>
                    <p className="text-xs text-slate-500">{match.user.age} yrs • {match.user.goal}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-600 font-black text-2xl">{match.score}%</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Match Score</div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl flex-grow mb-6">
                <p className="text-sm text-slate-600 italic">"{match.reason}"</p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                   <div className="bg-white p-2 rounded-lg border text-center">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Time</p>
                      <p className="text-xs font-semibold text-slate-700">{match.user.workoutTime}</p>
                   </div>
                   <div className="bg-white p-2 rounded-lg border text-center">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Streak</p>
                      <p className="text-xs font-semibold text-slate-700">{match.user.streak} days</p>
                   </div>
                </div>
              </div>

              <button className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 active:scale-[0.98]">
                Send Buddy Request
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center bg-white rounded-3xl border border-dashed">
          <p className="text-slate-400 font-medium">No matches found for your location yet.</p>
          <button className="mt-4 text-emerald-600 font-bold">Try different locations</button>
        </div>
      )}
    </div>
  );
};

export default PartnerMatching;

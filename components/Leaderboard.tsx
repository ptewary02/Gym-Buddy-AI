
import React from 'react';
import { UserProfile } from '../types';

interface LeaderboardProps {
  currentUser: UserProfile;
  otherUsers: UserProfile[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ currentUser, otherUsers }) => {
  const allUsers = [...otherUsers, currentUser].sort((a, b) => b.points - a.points);
  const topThree = allUsers.slice(0, 3);
  const rest = allUsers.slice(3);

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-800">Weekly Leaderboard</h2>
        <p className="text-slate-500">Compete with buddies at {currentUser.gymLocation}</p>
      </div>

      {/* Podium */}
      <div className="flex items-end justify-center gap-4 sm:gap-8 pb-4">
        {/* 2nd Place */}
        {topThree[1] && (
          <div className="flex flex-col items-center">
             <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-slate-300 relative mb-2">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${topThree[1].name}`} className="rounded-full" alt="2nd" />
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-400 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs">2</span>
             </div>
             <p className="font-bold text-sm text-slate-700">{topThree[1].name}</p>
             <p className="text-xs font-black text-slate-400">{topThree[1].points} pts</p>
             <div className="h-24 w-16 sm:w-24 bg-slate-200 rounded-t-xl mt-2"></div>
          </div>
        )}

        {/* 1st Place */}
        {topThree[0] && (
          <div className="flex flex-col items-center">
             <div className="mb-2 text-2xl">👑</div>
             <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 border-amber-400 relative mb-2 shadow-xl shadow-amber-100">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${topThree[0].name}`} className="rounded-full" alt="1st" />
                <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 border-white">1</span>
             </div>
             <p className="font-bold text-slate-800">{topThree[0].name}</p>
             <p className="text-xs font-black text-amber-600">{topThree[0].points} pts</p>
             <div className="h-32 w-20 sm:w-28 bg-emerald-600 rounded-t-xl mt-2"></div>
          </div>
        )}

        {/* 3rd Place */}
        {topThree[2] && (
          <div className="flex flex-col items-center">
             <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-orange-300 relative mb-2">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${topThree[2].name}`} className="rounded-full" alt="3rd" />
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-400 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs">3</span>
             </div>
             <p className="font-bold text-sm text-slate-700">{topThree[2].name}</p>
             <p className="text-xs font-black text-slate-400">{topThree[2].points} pts</p>
             <div className="h-16 w-16 sm:w-24 bg-orange-100 rounded-t-xl mt-2"></div>
          </div>
        )}
      </div>

      {/* List */}
      <div className="bg-white border rounded-3xl shadow-sm overflow-hidden">
        {rest.map((entry, idx) => (
          <div 
            key={entry.id} 
            className={`flex items-center justify-between p-4 border-b last:border-0 ${entry.id === currentUser.id ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}
          >
            <div className="flex items-center gap-4">
              <span className="w-6 text-center font-bold text-slate-400">{idx + 4}</span>
              <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.name}`} alt="avatar" />
              </div>
              <div>
                <p className={`font-bold text-sm ${entry.id === currentUser.id ? 'text-emerald-700' : 'text-slate-800'}`}>
                  {entry.name} {entry.id === currentUser.id && '(You)'}
                </p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">{entry.streak} day streak</p>
              </div>
            </div>
            <div className="font-black text-slate-700">{entry.points} pts</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;

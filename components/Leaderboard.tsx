import React, { useEffect, useState } from 'react';
import { UserProfile } from '../types';
import { getLeaderboard } from '../services/apiService';

interface LeaderboardProps {
  currentUser: UserProfile;
}

interface LeaderboardEntry {
  _id: string;
  name: string;
  points: number;
  streak: number;
  gymLocation?: string;
  badges?: string[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ currentUser }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getLeaderboard();
        setEntries(data);
      } catch {
        setError('Failed to load leaderboard.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
    // Refresh every 30 seconds for near real-time updates
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm">Loading leaderboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-24 text-center text-red-400">{error}</div>
    );
  }

  const topThree = entries.slice(0, 3);
  const rest = entries.slice(3);

  const podiumColors = [
    'border-amber-400 shadow-amber-100',
    'border-slate-300',
    'border-orange-300',
  ];
  const podiumBgColors = ['bg-emerald-600', 'bg-slate-200', 'bg-orange-100'];
  const podiumHeights = ['h-32', 'h-24', 'h-16'];
  const podiumSizes = ['w-20 h-20 sm:w-28 sm:h-28', 'w-16 h-16 sm:w-20 sm:h-20', 'w-16 h-16 sm:w-20 sm:h-20'];
  const podiumOrder = [1, 0, 2]; // render 2nd, 1st, 3rd

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-800">Weekly Leaderboard</h2>
        <p className="text-slate-500">Rankings update every 30 seconds</p>
      </div>

      {entries.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-3xl border border-dashed">
          <p className="text-slate-400 font-medium">No users on the leaderboard yet.</p>
          <p className="text-slate-400 text-sm mt-1">Log a workout to appear here!</p>
        </div>
      ) : (
        <>
          {/* Podium */}
          <div className="flex items-end justify-center gap-4 sm:gap-8 pb-4">
            {podiumOrder.map((pos) => {
              const entry = topThree[pos];
              if (!entry) return <div key={pos} className="flex-1" />;
              const isCurrentUser = entry._id === currentUser.id;
              return (
                <div key={entry._id} className="flex flex-col items-center">
                  {pos === 0 && <div className="mb-2 text-2xl">👑</div>}
                  <div className={`${podiumSizes[pos]} rounded-full border-4 ${podiumColors[pos]} relative mb-2 ${pos === 0 ? 'shadow-xl' : ''}`}>
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.name}`}
                      className="rounded-full"
                      alt={entry.name}
                    />
                    <span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 text-white rounded-full flex items-center justify-center font-bold border-2 border-white ${pos === 0 ? 'w-8 h-8 text-sm bg-amber-500' : 'w-6 h-6 text-xs bg-slate-400'}`}>
                      {pos + 1}
                    </span>
                  </div>
                  <p className={`font-bold text-sm ${isCurrentUser ? 'text-emerald-700' : 'text-slate-700'}`}>
                    {entry.name}{isCurrentUser ? ' (You)' : ''}
                  </p>
                  <p className={`text-xs font-black ${pos === 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                    {entry.points} pts
                  </p>
                  <div className={`${podiumHeights[pos]} w-16 sm:w-24 ${podiumBgColors[pos]} rounded-t-xl mt-2`} />
                </div>
              );
            })}
          </div>

          {/* Rest of the list */}
          {rest.length > 0 && (
            <div className="bg-white border rounded-3xl shadow-sm overflow-hidden">
              {rest.map((entry, idx) => {
                const isCurrentUser = entry._id === currentUser.id;
                return (
                  <div
                    key={entry._id}
                    className={`flex items-center justify-between p-4 border-b last:border-0 ${isCurrentUser ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="w-6 text-center font-bold text-slate-400">{idx + 4}</span>
                      <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.name}`} alt="avatar" />
                      </div>
                      <div>
                        <p className={`font-bold text-sm ${isCurrentUser ? 'text-emerald-700' : 'text-slate-800'}`}>
                          {entry.name} {isCurrentUser && '(You)'}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{entry.streak} day streak</p>
                      </div>
                    </div>
                    <div className="font-black text-slate-700">{entry.points} pts</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Current user not in top visible list — pin them at bottom */}
          {!entries.find(e => e._id === currentUser.id) && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-emerald-400">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`} alt="you" />
                </div>
                <div>
                  <p className="font-bold text-emerald-700 text-sm">{currentUser.name} (You)</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{currentUser.streak} day streak</p>
                </div>
              </div>
              <div className="font-black text-emerald-700">{currentUser.points} pts</div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Leaderboard;
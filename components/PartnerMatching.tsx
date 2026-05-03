import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { getAllUsers, getMatchReasonAPI } from '../services/apiService';

interface RawUser {
  _id: string;
  name: string;
  age?: number;
  gender?: string;
  fitnessGoal?: string;
  dietPreference?: string;
  gymLocation?: string;
  workoutTime?: string;
  points?: number;
  streak?: number;
  badges?: string[];
}

interface Match {
  user: RawUser;
  score: number;
  breakdown: { label: string; points: number; max: number }[];
  reason: string;
}

interface PartnerMatchingProps {
  currentUser: UserProfile;
}

const parseHour = (timeStr: string): number | null => {
  if (!timeStr) return null;
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!match) return null;
  let hour = parseInt(match[1]);
  const period = match[3]?.toUpperCase();
  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;
  return hour;
};

const calcScore = (
  current: UserProfile,
  other: RawUser
): { score: number; breakdown: { label: string; points: number; max: number }[] } => {
  const breakdown: { label: string; points: number; max: number }[] = [];

  let gymPts = 0;
  const a = (current.gymLocation || '').toLowerCase().trim();
  const b = (other.gymLocation || '').toLowerCase().trim();
  if (a && b) {
    if (a === b) gymPts = 40;
    else {
      const cityA = a.split(',').pop()?.trim() || '';
      const cityB = b.split(',').pop()?.trim() || '';
      if (cityA && cityB && cityA === cityB) gymPts = 20;
    }
  }
  breakdown.push({ label: 'Gym Location', points: gymPts, max: 40 });

  let timePts = 0;
  const hourA = parseHour(current.workoutTime);
  const hourB = parseHour(other.workoutTime || '');
  if (hourA !== null && hourB !== null) {
    const diff = Math.abs(hourA - hourB);
    if (diff === 0) timePts = 25;
    else if (diff === 1) timePts = 20;
    else if (diff === 2) timePts = 10;
  }
  breakdown.push({ label: 'Workout Time', points: timePts, max: 25 });

  let goalPts = 0;
  if (current.goal && other.fitnessGoal) {
    if (current.goal === other.fitnessGoal) goalPts = 20;
    const complementary = [
      ['Muscle Gain', 'Maintenance'],
      ['Fat Loss', 'Maintenance'],
    ];
    for (const pair of complementary) {
      if (pair.includes(current.goal) && pair.includes(other.fitnessGoal) && current.goal !== other.fitnessGoal)
        goalPts = 10;
    }
  }
  breakdown.push({ label: 'Fitness Goal', points: goalPts, max: 20 });

  let dietPts = 0;
  if (current.dietPreference && other.dietPreference) {
    if (current.dietPreference === other.dietPreference) dietPts = 10;
  }
  breakdown.push({ label: 'Diet Preference', points: dietPts, max: 10 });

  let activityPts = 0;
  const streakDiff = Math.abs((current.streak || 0) - (other.streak || 0));
  if (streakDiff <= 2) activityPts = 5;
  else if (streakDiff <= 5) activityPts = 3;
  breakdown.push({ label: 'Activity Level', points: activityPts, max: 5 });

  const score = breakdown.reduce((sum, b) => sum + b.points, 0);
  return { score, breakdown };
};

// ── ScoreBar defined OUTSIDE the main component ───────────────────────────
const ScoreBar = ({ points, max, label }: { points: number; max: number; label: string }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-xs">
      <span className="text-slate-500">{label}</span>
      <span className="font-bold text-slate-700">{points}/{max}</span>
    </div>
    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div
        className="h-full bg-emerald-500 rounded-full transition-all"
        style={{ width: `${max > 0 ? (points / max) * 100 : 0}%` }}
      />
    </div>
  </div>
);

const PartnerMatching: React.FC<PartnerMatchingProps> = ({ currentUser }) => {
  const [allUsers, setAllUsers] = useState<RawUser[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingReasons, setLoadingReasons] = useState(false);
  const [error, setError] = useState('');
  const [filterGoal, setFilterGoal] = useState('All');
  const [filterLocation, setFilterLocation] = useState('');
  const [minScore, setMinScore] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await getAllUsers();
        setAllUsers(users);
      } catch {
        setError('Failed to load users. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (allUsers.length === 0) return;

    let filtered = allUsers;
    if (filterGoal !== 'All') {
      filtered = filtered.filter(u => u.fitnessGoal === filterGoal);
    }
    if (filterLocation.trim()) {
      filtered = filtered.filter(u =>
        u.gymLocation?.toLowerCase().includes(filterLocation.toLowerCase())
      );
    }

    const scored: Match[] = filtered
      .map(u => {
        const { score, breakdown } = calcScore(currentUser, u);
        return { user: u, score, breakdown, reason: '' };
      })
      .filter(m => m.score >= minScore)
      .sort((a, b) => b.score - a.score);

    setMatches(scored);

    const fetchReasons = async () => {
      setLoadingReasons(true);
      const top = scored.slice(0, 3);
      const withReasons = await Promise.all(
        top.map(async m => {
          try {
            const reason = await getMatchReasonAPI(
              {
                name: currentUser.name,
                goal: currentUser.goal,
                gymLocation: currentUser.gymLocation,
                workoutTime: currentUser.workoutTime,
              },
              {
                name: m.user.name,
                goal: m.user.fitnessGoal,
                gymLocation: m.user.gymLocation,
                workoutTime: m.user.workoutTime,
              }
            );
            return { ...m, reason };
          } catch {
            return { ...m, reason: 'Great potential gym partner!' };
          }
        })
      );
      setMatches(prev => {
        const updated = [...prev];
        withReasons.forEach((m, i) => { updated[i] = m; });
        return updated;
      });
      setLoadingReasons(false);
    };

    if (scored.length > 0) fetchReasons();
  }, [allUsers, filterGoal, filterLocation, minScore, currentUser]);

  const uniqueGoals = ['All', ...Array.from(new Set(allUsers.map(u => u.fitnessGoal).filter(Boolean))) as string[]];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm">Finding your gym partners...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-24 text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border shadow-sm">
        <h2 className="text-2xl font-bold text-slate-800">Gym Partner Matching</h2>
        <p className="text-slate-500 text-sm mt-1">
          Scores based on gym location, workout time, fitness goal, diet, and activity level.
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl border shadow-sm flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Location</label>
          <input
            type="text"
            value={filterLocation}
            onChange={e => setFilterLocation(e.target.value)}
            placeholder="e.g. Gorakhpur"
            className="w-full px-3 py-2 bg-slate-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fitness Goal</label>
          <select
            value={filterGoal}
            onChange={e => setFilterGoal(e.target.value)}
            className="w-full px-3 py-2 bg-slate-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {uniqueGoals.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
            Min Score: {minScore}%
          </label>
          <input
            type="range"
            min={0}
            max={80}
            step={10}
            value={minScore}
            onChange={e => setMinScore(Number(e.target.value))}
            className="w-full accent-emerald-600"
          />
        </div>
        <button
          onClick={() => { setFilterGoal('All'); setFilterLocation(''); setMinScore(0); }}
          className="px-4 py-2 text-sm text-slate-500 border rounded-lg hover:bg-slate-50"
        >
          Reset
        </button>
      </div>

      {matches.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-3xl border border-dashed">
          <p className="text-4xl mb-4">🔍</p>
          <p className="text-slate-600 font-medium">No matches found with current filters.</p>
          <p className="text-slate-400 text-sm mt-1">Try a different location or lower the minimum score.</p>
          <button
            onClick={() => { setFilterGoal('All'); setFilterLocation(''); setMinScore(0); }}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-500 font-medium">
            Found <span className="text-emerald-600 font-bold">{matches.length}</span> potential partner{matches.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matches.map((match, idx) => (
              <div key={match.user._id} className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-slate-100 overflow-hidden border-2 border-emerald-100 relative">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${match.user.name}`} alt="avatar" />
                      {idx === 0 && <span className="absolute -top-1 -right-1 text-sm">⭐</span>}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{match.user.name}</h3>
                      <p className="text-xs text-slate-500">
                        {match.user.age && `${match.user.age} yrs • `}{match.user.fitnessGoal}
                      </p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-black ${match.score >= 60 ? 'text-emerald-600' : match.score >= 30 ? 'text-amber-500' : 'text-slate-400'}`}>
                      {match.score}%
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Match</div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 space-y-2 mb-4">
                  {match.breakdown.map((b, i) => (
                    <ScoreBar key={i} label={b.label} points={b.points} max={b.max} />
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-white border rounded-lg p-2 text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Time</p>
                    <p className="text-xs font-semibold text-slate-700">{match.user.workoutTime || '—'}</p>
                  </div>
                  <div className="bg-white border rounded-lg p-2 text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Streak</p>
                    <p className="text-xs font-semibold text-slate-700">{match.user.streak || 0} days</p>
                  </div>
                  <div className="bg-white border rounded-lg col-span-2 p-2 text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Gym</p>
                    <p className="text-xs font-semibold text-slate-700 truncate">{match.user.gymLocation || '—'}</p>
                  </div>
                </div>

                {idx < 3 && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 mb-4 flex-grow">
                    {loadingReasons && !match.reason ? (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                        <p className="text-xs text-slate-400">AI analyzing compatibility...</p>
                      </div>
                    ) : (
                      <p className="text-xs text-emerald-800 italic">"{match.reason || 'Great potential gym partner!'}"</p>
                    )}
                  </div>
                )}

                <button className="w-full py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors text-sm shadow-lg shadow-emerald-100 active:scale-[0.98]">
                  Send Buddy Request
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PartnerMatching;
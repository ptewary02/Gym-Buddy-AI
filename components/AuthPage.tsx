import React, { useState } from 'react';
import { login, signup } from '../services/apiService';

interface AuthPageProps {
  onAuthSuccess: (token: string, isNewUser: boolean) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        await signup(email, password);
        try {
            const loginData = await login(email, password);
            onAuthSuccess(loginData.token, true);
        } catch {
            // signup worked, just switch to login tab so user can log in manually
            setMode('login');
            setError('Account created! Please log in.');
            setPassword('');
        }
        } else {
        const data = await login(email, password);
        // if user has a complete profile (name exists), they're existing
        const isNewUser = !data.user?.name;
        onAuthSuccess(data.token, isNewUser);
      }
    } catch (err: any) {
      setError(err?.message || err?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">

        {/* Left panel */}
        <div
          className="relative md:w-1/2 p-10 flex flex-col justify-center text-white bg-cover bg-center min-h-[280px]"
          style={{
            backgroundImage: `url(https://img.freepik.com/free-photo/low-angle-view-unrecognizable-muscular-build-man-preparing-lifting-barbell-health-club_637285-2497.jpg?semt=ais_user_personalization&w=740&q=80)`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-700/90 to-black/60" />
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold">GymBuddy<span className="text-emerald-300">AI</span></span>
            </div>
            <h2 className="text-3xl font-bold leading-tight">
              Your AI-Powered<br />Fitness Companion
            </h2>
            <p className="text-emerald-100 text-sm leading-relaxed">
              Personalized diet plans, gym partner matching, and gamified progress tracking — all powered by Gemini AI.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {['🥗 AI Diet Plans', '🤝 Partner Matching', '🏆 Leaderboards'].map(f => (
                <span key={f} className="bg-white/15 backdrop-blur text-xs px-3 py-1.5 rounded-full font-medium">
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="md:w-1/2 p-8 sm:p-10 flex flex-col justify-center">
          {/* Tab switcher */}
          <div className="flex bg-slate-100 rounded-xl p-1 mb-8">
            {(['login', 'signup'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all capitalize ${
                  mode === m
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {m === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                required
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full px-4 py-3 bg-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
              />
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <input
                  required
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full px-4 py-3 bg-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                />
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl text-white font-bold text-sm shadow-lg transition-all mt-2 ${
                loading
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] shadow-emerald-200'
              }`}
            >
              {loading
                ? mode === 'login' ? 'Logging in...' : 'Creating account...'
                : mode === 'login' ? 'Log In →' : 'Create Account →'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
              className="text-emerald-600 font-bold hover:underline"
            >
              {mode === 'login' ? 'Sign up free' : 'Log in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
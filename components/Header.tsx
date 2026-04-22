
import React from 'react';
import { UserProfile } from '../types';
import { useState } from "react";

interface HeaderProps {
  user: UserProfile;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, activeTab, setActiveTab, onLogout }) => {
  const [showMenu, setShowMenu] = useState(false);
  

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setActiveTab('dashboard')}
        >
          <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">GymBuddy<span className="text-emerald-600">AI</span></h1>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-2 rounded-md transition-colors ${activeTab === 'dashboard' ? 'text-emerald-600 font-semibold' : 'text-slate-600 hover:text-emerald-500'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('diet')}
            className={`px-3 py-2 rounded-md transition-colors ${activeTab === 'diet' ? 'text-emerald-600 font-semibold' : 'text-slate-600 hover:text-emerald-500'}`}
          >
            Diet Plan
          </button>
          <button 
            onClick={() => setActiveTab('partners')}
            className={`px-3 py-2 rounded-md transition-colors ${activeTab === 'partners' ? 'text-emerald-600 font-semibold' : 'text-slate-600 hover:text-emerald-500'}`}
          >
            Matching
          </button>
          <button 
            onClick={() => setActiveTab('leaderboard')}
            className={`px-3 py-2 rounded-md transition-colors ${activeTab === 'leaderboard' ? 'text-emerald-600 font-semibold' : 'text-slate-600 hover:text-emerald-500'}`}
          >
            Leaderboard
          </button>
          {/* <button
            onClick={onLogout}
            className="text-red-500 hover:text-red-600 font-medium"
          >
            Logout
          </button> */}

        </nav>
        
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold">{user.name}</p>
            <p className="text-xs text-slate-500">{user.points} pts • {user.streak} day streak</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-emerald-500 overflow-hidden">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="avatar" onClick={() => setShowMenu(prev => !prev)} className="w-10 h-10 rounded-full cursor-pointer border-2 border-emerald-500" />
          </div>
          
          {showMenu && (
            
            <div className="absolute right-30 top-12 w-40 bg-white border rounded-xl shadow-lg overflow-hidden z-50">
              <div className="px-4 py-2 text-xs text-slate-400">
                Signed in as <br />
                <span className="font-semibold text-slate-700">{user.name}</span>
              </div>
              <hr />
              <button
                onClick={onLogout}
                className="w-full px-4 py-3 text-sm text-red-500 hover:bg-red-50 text-left"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

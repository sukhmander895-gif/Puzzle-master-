import React from 'react';
import { Play, Grid, Calendar, HelpCircle, Settings, Trophy, Star, Flame, Sparkles } from 'lucide-react';
import { PlayerProgress, Screen } from '../types/game';
import { sound } from '../utils/audio';

interface HomeScreenProps {
  progress: PlayerProgress;
  onNavigate: (screen: Screen) => void;
  onStartLevel: (levelId: number) => void;
  onStartDaily: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  progress,
  onNavigate,
  onStartLevel,
  onStartDaily,
}) => {
  // Calculate total stars
  const totalStars = Object.values(progress.completedLevels).reduce(
    (acc, curr) => acc + curr.stars,
    0
  );
  const totalCompleted = Object.keys(progress.completedLevels).length;
  const nextLevel = Math.min(progress.currentLevel, 100);

  // Check if daily completed today
  const todayStr = new Date().toISOString().split('T')[0];
  const isDailyDoneToday = progress.dailyProgress.lastCompletedDate === todayStr;

  return (
    <div className="w-full max-w-md mx-auto px-4 py-4 flex flex-col justify-between min-h-[calc(100vh-3.5rem)] animate-fadeIn">
      {/* Hero / Game Emblem */}
      <div className="text-center my-3">
        <div className="relative inline-block mx-auto mb-2">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 flex items-center justify-center text-4xl shadow-xl shadow-teal-500/20 transform hover:scale-105 transition-transform duration-300">
            🧩
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-slate-900 border-2 border-emerald-400 flex items-center justify-center text-xs">
            {progress.avatar}
          </div>
        </div>

        <h1 className="text-3xl font-black tracking-tight text-white mb-1">
          Puzzle Master
        </h1>
        <p className="text-xs text-slate-400">
          The 100-Level Logic & Number Challenge
        </p>
      </div>

      {/* Quick Player Summary Strip */}
      <div className="grid grid-cols-3 gap-2.5 my-2 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-sm">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 text-amber-400 text-xs font-semibold mb-0.5">
            <Star size={13} className="fill-amber-400" />
            <span>Stars</span>
          </div>
          <span className="text-base font-bold text-white tabular-nums">
            {totalStars} <span className="text-xs text-slate-500 font-normal">/ 300</span>
          </span>
        </div>

        <div className="flex flex-col items-center border-x border-slate-700/60">
          <div className="flex items-center gap-1 text-teal-400 text-xs font-semibold mb-0.5">
            <Grid size={13} />
            <span>Levels</span>
          </div>
          <span className="text-base font-bold text-white tabular-nums">
            {totalCompleted} <span className="text-xs text-slate-500 font-normal">/ 100</span>
          </span>
        </div>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 text-orange-400 text-xs font-semibold mb-0.5">
            <Flame size={13} className="fill-orange-400" />
            <span>Streak</span>
          </div>
          <span className="text-base font-bold text-white tabular-nums">
            {progress.dailyProgress.streak} <span className="text-xs text-slate-500 font-normal">days</span>
          </span>
        </div>
      </div>

      {/* Main Menu Actions */}
      <div className="flex flex-col gap-2.5 my-3">
        {/* 1. Play Game - Dominant CTA */}
        <button
          onClick={() => {
            sound.playButton();
            onStartLevel(nextLevel);
          }}
          className="w-full h-16 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-extrabold text-lg flex items-center justify-between px-5 shadow-lg shadow-emerald-950/50 active:scale-[0.98] transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <Play size={22} className="fill-white translate-x-0.5" />
            </div>
            <div className="text-left">
              <div className="text-base leading-tight font-black">
                {totalCompleted === 0 ? 'Start Game' : 'Continue Playing'}
              </div>
              <div className="text-xs text-emerald-100 font-medium">
                Stage {nextLevel} of 100
              </div>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-black/20 backdrop-blur-sm">
            Level {nextLevel}
          </span>
        </button>

        {/* 2. Levels Selector */}
        <button
          onClick={() => {
            sound.playButton();
            onNavigate('levels');
          }}
          className="w-full h-14 rounded-2xl bg-slate-800/90 hover:bg-slate-750 border border-slate-700/80 text-white flex items-center justify-between px-4 active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Grid size={19} />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold">Levels & Chapters</div>
              <div className="text-[11px] text-slate-400">100 progressive logic challenges</div>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-medium">Browse →</span>
        </button>

        {/* 3. Daily Challenge */}
        <button
          onClick={() => {
            sound.playButton();
            onStartDaily();
          }}
          className="w-full h-14 rounded-2xl bg-slate-800/90 hover:bg-slate-750 border border-slate-700/80 text-white flex items-center justify-between px-4 active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Calendar size={19} />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold flex items-center gap-1.5">
                <span>Daily Challenge</span>
                {isDailyDoneToday && (
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                    Done
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400">Unique daily puzzle · Bonus coins</div>
            </div>
          </div>
          <span className="text-xs text-amber-400 font-medium">+100 🪙</span>
        </button>

        {/* 4. Payment Withdrawal & Cashout */}
        <button
          onClick={() => {
            sound.playButton();
            onNavigate('withdraw');
          }}
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-850 hover:bg-slate-750 border border-emerald-500/50 text-white flex items-center justify-between px-4 active:scale-[0.98] transition-all shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <span className="text-lg">💳</span>
            </div>
            <div className="text-left">
              <div className="text-sm font-bold flex items-center gap-1.5">
                <span>Payment Withdrawal</span>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.2 rounded border border-emerald-500/30">
                  Cashout
                </span>
              </div>
              <div className="text-[11px] text-slate-400">Redeem coins for UPI, PayPal & Gift Cards</div>
            </div>
          </div>
          <span className="text-xs text-emerald-400 font-bold">
            {progress.coins >= 200 ? 'Ready! →' : `${progress.coins}/200 🪙`}
          </span>
        </button>

        {/* 5. How to Play & Leaderboard row */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => {
              sound.playButton();
              onNavigate('how-to-play');
            }}
            className="h-13 rounded-2xl bg-slate-800/70 hover:bg-slate-750 border border-slate-700/60 text-white flex items-center gap-2.5 px-3 active:scale-[0.98] transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
              <HelpCircle size={17} />
            </div>
            <div className="text-left truncate">
              <div className="text-xs font-bold truncate">How to Play</div>
              <div className="text-[10px] text-slate-400 truncate">Rules & Tips</div>
            </div>
          </button>

          <button
            onClick={() => {
              sound.playButton();
              onNavigate('leaderboard');
            }}
            className="h-13 rounded-2xl bg-slate-800/70 hover:bg-slate-750 border border-slate-700/60 text-white flex items-center gap-2.5 px-3 active:scale-[0.98] transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              <Trophy size={17} />
            </div>
            <div className="text-left truncate">
              <div className="text-xs font-bold truncate">Leaderboard</div>
              <div className="text-[10px] text-slate-400 truncate">Hall of Fame</div>
            </div>
          </button>
        </div>

        {/* 5. Settings */}
        <button
          onClick={() => {
            sound.playButton();
            onNavigate('settings');
          }}
          className="w-full h-12 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center gap-2 text-xs font-semibold active:scale-[0.98] transition-all"
        >
          <Settings size={15} />
          <span>Game Settings & Free Run Guide</span>
        </button>
      </div>

      {/* Subtle footer */}
      <footer className="text-center pt-2 pb-1 text-[11px] text-slate-500">
        Free to Play · No Login Required · Offline Ready
      </footer>
    </div>
  );
};

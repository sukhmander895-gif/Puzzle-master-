import React from 'react';
import { ArrowLeft, Calendar, Flame, Coins, Trophy, CheckCircle2, Play, Star } from 'lucide-react';
import { PlayerProgress } from '../types/game';
import { sound } from '../utils/audio';

interface DailyChallengeScreenProps {
  progress: PlayerProgress;
  onStartDaily: () => void;
  onBack: () => void;
}

export const DailyChallengeScreen: React.FC<DailyChallengeScreenProps> = ({
  progress,
  onStartDaily,
  onBack,
}) => {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const dateFormatted = today.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const isCompletedToday = progress.dailyProgress.lastCompletedDate === todayStr;
  const todayRecord = progress.dailyProgress.history[todayStr];

  // Last 7 days streak preview
  const pastDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dStr = d.toISOString().split('T')[0];
    const dayLetter = d.toLocaleDateString(undefined, { weekday: 'narrow' });
    const isDone = Boolean(progress.dailyProgress.history[dStr]);
    const isToday = dStr === todayStr;
    return { dStr, dayLetter, isDone, isToday };
  });

  return (
    <div className="w-full max-w-md mx-auto px-4 py-3 flex flex-col justify-between min-h-[calc(100vh-3.5rem)] select-none animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              sound.playButton();
              onBack();
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-2.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Home</span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 font-bold text-xs">
            <Flame size={15} className="fill-orange-400" />
            <span>{progress.dailyProgress.streak} Day Streak</span>
          </div>
        </div>

        {/* Hero Card */}
        <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border border-indigo-800/50 rounded-3xl p-5 text-center relative overflow-hidden shadow-xl mb-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-3xl mx-auto mb-3 shadow-inner">
            📅
          </div>

          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
            Official Daily Puzzle
          </span>
          <h2 className="text-xl font-black text-white mt-0.5 mb-1">
            {dateFormatted}
          </h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto mb-4">
            A handcrafted daily master puzzle. Solve today's board to maintain your streak and earn +100 bonus coins!
          </p>

          {/* Reward badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 text-xs font-bold text-amber-400 mb-2">
            <Coins size={14} />
            <span>Reward: 100 Coins</span>
          </div>

          {/* Action button */}
          <div className="mt-2">
            {isCompletedToday ? (
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-400" />
                <span>Today's Challenge Completed!</span>
              </div>
            ) : (
              <button
                onClick={() => {
                  sound.playButton();
                  onStartDaily();
                }}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:to-orange-400 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-900/40 active:scale-[0.98] transition-transform"
              >
                <Play size={18} className="fill-white" />
                <span>Play Daily Challenge</span>
              </button>
            )}
          </div>
        </div>

        {/* 7-Day Streak Timeline */}
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-3">
            <span>Weekly Activity</span>
            <span className="text-slate-400 text-[11px]">Keep your streak alive!</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {pastDays.map((day, idx) => (
              <div
                key={idx}
                className={`flex flex-col items-center justify-center py-2 rounded-xl border text-xs font-bold transition-all ${
                  day.isDone
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                    : day.isToday
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 animate-pulse'
                    : 'bg-slate-800/40 border-slate-700/40 text-slate-500'
                }`}
              >
                <span className="text-[10px] text-slate-400 font-medium mb-1">{day.dayLetter}</span>
                <span className="text-xs">{day.isDone ? '✓' : '•'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Record if done */}
        {todayRecord && (
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3 flex items-center justify-between text-xs">
            <span className="text-slate-400">Today's Score:</span>
            <div className="flex items-center gap-3 font-bold text-white">
              <span>{todayRecord.score} pts</span>
              <span className="text-amber-400 flex items-center gap-0.5">
                {todayRecord.stars} <Star size={12} className="fill-amber-400" />
              </span>
            </div>
          </div>
        )}
      </div>

      <p className="text-center text-[11px] text-slate-500 py-2">
        A new challenge unlocks every midnight local time.
      </p>
    </div>
  );
};

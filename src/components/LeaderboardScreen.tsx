import React, { useState } from 'react';
import { ArrowLeft, Trophy, Medal, Star, Grid, User, Edit3, Check } from 'lucide-react';
import { PlayerProgress, LeaderboardEntry } from '../types/game';
import { sound } from '../utils/audio';

interface LeaderboardScreenProps {
  progress: PlayerProgress;
  leaderboard: LeaderboardEntry[];
  onUpdateProfile: (name: string, avatar: string) => void;
  onBack: () => void;
}

const AVATARS = ['🧠', '⚡', '👑', '🎯', '🧙', '🦊', '🚀', '💎'];

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({
  progress,
  leaderboard,
  onUpdateProfile,
  onBack,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(progress.name);
  const [selectedAvatar, setSelectedAvatar] = useState(progress.avatar);

  // Calculate player's live metrics
  const totalStars = Object.values(progress.completedLevels).reduce((acc, l) => acc + l.stars, 0);
  const levelsCleared = Object.keys(progress.completedLevels).length;
  const totalScore = Object.values(progress.completedLevels).reduce((acc, l) => acc + l.highScore, 0);

  // Create combined list including the player
  const playerEntry: LeaderboardEntry = {
    id: 'local-player',
    name: progress.name,
    avatar: progress.avatar,
    totalStars,
    levelsCleared,
    score: totalScore,
    date: 'You',
  };

  const allEntries = [...leaderboard.filter(e => e.id !== 'local-player'), playerEntry].sort(
    (a, b) => b.score - a.score || b.totalStars - a.totalStars
  );

  const playerRank = allEntries.findIndex(e => e.id === 'local-player') + 1;

  const handleSaveProfile = () => {
    sound.playButton();
    const cleanName = nameInput.trim() || 'Player';
    onUpdateProfile(cleanName, selectedAvatar);
    setIsEditing(false);
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-3 flex flex-col justify-between min-h-[calc(100vh-3.5rem)] select-none animate-fadeIn">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
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

          <h2 className="text-sm font-black text-white">Leaderboard & Stats</h2>
        </div>

        {/* Player Profile Card */}
        <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border border-indigo-800/50 rounded-2xl p-4 mb-4 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-2xl shadow-inner">
                {progress.avatar}
              </div>
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                  <span>{progress.name}</span>
                  <span className="text-[10px] font-semibold text-teal-400 px-1.5 py-0.2 bg-teal-500/15 rounded border border-teal-500/30">
                    Rank #{playerRank}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">Local Champion Profile</p>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playButton();
                setIsEditing(!isEditing);
              }}
              className="text-xs text-indigo-300 hover:text-white px-2.5 py-1 rounded-lg bg-indigo-950/60 border border-indigo-700/50 flex items-center gap-1"
            >
              <Edit3 size={13} />
              <span>{isEditing ? 'Close' : 'Edit'}</span>
            </button>
          </div>

          {/* Edit Profile Form */}
          {isEditing && (
            <div className="pt-3 border-t border-indigo-900/60 mb-3 space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Display Name</label>
                <input
                  type="text"
                  maxLength={16}
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Choose Avatar</label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {AVATARS.map(av => (
                    <button
                      key={av}
                      onClick={() => setSelectedAvatar(av)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg border transition-all ${
                        selectedAvatar === av
                          ? 'bg-indigo-600/30 border-indigo-400 scale-105'
                          : 'bg-slate-800/80 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSaveProfile}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <Check size={14} />
                <span>Save Profile</span>
              </button>
            </div>
          )}

          {/* Metric Row */}
          <div className="grid grid-cols-3 gap-2 p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-center">
            <div>
              <span className="text-[10px] text-slate-400 block">Total Score</span>
              <span className="text-sm font-extrabold text-white tabular-nums">{totalScore}</span>
            </div>
            <div className="border-x border-slate-700/60">
              <span className="text-[10px] text-slate-400 block">Stars</span>
              <span className="text-sm font-extrabold text-amber-400 tabular-nums">{totalStars} ⭐</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Cleared</span>
              <span className="text-sm font-extrabold text-teal-400 tabular-nums">{levelsCleared}/100</span>
            </div>
          </div>
        </div>

        {/* Global Hall of Fame List */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-2 mb-1">
            <span>Hall of Fame</span>
            <span>Score · Stars</span>
          </div>

          {allEntries.map((entry, index) => {
            const isUser = entry.id === 'local-player';
            const rank = index + 1;

            return (
              <div
                key={entry.id}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  isUser
                    ? 'bg-gradient-to-r from-teal-950/40 via-slate-850 to-emerald-950/40 border-teal-500/50 shadow-md ring-1 ring-teal-500/30'
                    : 'bg-slate-800/60 border-slate-700/50 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Rank Badge */}
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                      rank === 1
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : rank === 2
                        ? 'bg-slate-300 text-slate-950'
                        : rank === 3
                        ? 'bg-amber-700 text-white'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                  </div>

                  <div className="text-xl">{entry.avatar}</div>

                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{entry.name}</span>
                      {isUser && (
                        <span className="text-[9px] font-semibold text-teal-300 bg-teal-500/20 px-1 py-0.2 rounded">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {entry.levelsCleared} levels cleared
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-extrabold text-white tabular-nums">
                    {entry.score} pts
                  </div>
                  <div className="text-[10px] text-amber-400 font-semibold tabular-nums">
                    {entry.totalStars} ⭐
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-center text-[11px] text-slate-500 py-2">
        Leaderboard is stored locally on this device.
      </p>
    </div>
  );
};

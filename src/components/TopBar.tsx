import React from 'react';
import { Volume2, VolumeX, Sparkles, Coins, Home, Trophy, Settings } from 'lucide-react';
import { sound } from '../utils/audio';

interface TopBarProps {
  coins: number;
  hints: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onGoHome: () => void;
  onGoSettings: () => void;
  onGoLeaderboard: () => void;
  onGoWithdraw: () => void;
  currentScreen: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  coins,
  hints,
  soundEnabled,
  onToggleSound,
  onGoHome,
  onGoSettings,
  onGoLeaderboard,
  onGoWithdraw,
  currentScreen,
}) => {
  return (
    <header className="w-full max-w-md mx-auto h-14 px-3 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 select-none">
      {/* Zone 1: Single text element wordmark */}
      <button
        onClick={() => {
          sound.playButton();
          onGoHome();
        }}
        className="text-base font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent truncate flex items-center gap-1.5 focus:outline-none"
      >
        <span className="text-lg">🧩</span>
        <span>Puzzle Master</span>
      </button>

      {/* Zone 2: Clean unboxed stats with withdrawal button on coins */}
      <div className="flex items-center gap-2 text-xs font-semibold tabular-nums">
        <button
          onClick={() => {
            sound.playButton();
            onGoWithdraw();
          }}
          title="Withdraw Coins"
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-amber-300 hover:bg-emerald-900/50 transition-colors shadow-sm"
        >
          <Coins size={14} className="text-amber-400" />
          <span>{coins}</span>
          <span className="text-[10px] text-emerald-400 font-bold ml-0.5">Cashout</span>
        </button>

        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-cyan-300">
          <Sparkles size={14} className="text-cyan-400" />
          <span>{hints}</span>
        </div>
      </div>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => {
            onToggleSound();
          }}
          aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
          className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-colors ${
            soundEnabled
              ? 'bg-slate-800 border-slate-700 text-emerald-400 hover:text-emerald-300'
              : 'bg-slate-800/50 border-slate-800 text-slate-500 hover:text-slate-400'
          }`}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>

        {currentScreen !== 'leaderboard' && (
          <button
            onClick={() => {
              sound.playButton();
              onGoLeaderboard();
            }}
            aria-label="Leaderboard"
            className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 text-amber-400 hover:text-amber-300 flex items-center justify-center transition-colors"
          >
            <Trophy size={16} />
          </button>
        )}

        {currentScreen !== 'settings' && (
          <button
            onClick={() => {
              sound.playButton();
              onGoSettings();
            }}
            aria-label="Settings"
            className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <Settings size={16} />
          </button>
        )}

        {currentScreen !== 'home' && (
          <button
            onClick={() => {
              sound.playButton();
              onGoHome();
            }}
            aria-label="Home"
            className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <Home size={16} />
          </button>
        )}
      </div>
    </header>
  );
};

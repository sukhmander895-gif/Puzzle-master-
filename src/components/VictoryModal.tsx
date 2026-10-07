import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Star, Clock, Trophy, Coins, RotateCcw, ArrowRight, Grid, Share2 } from 'lucide-react';
import { sound } from '../utils/audio';

interface VictoryModalProps {
  levelId: number;
  isDaily: boolean;
  timeElapsed: number;
  score: number;
  stars: number;
  coinsEarned: number;
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onReplay: () => void;
  onLevelsSelect: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  levelId,
  isDaily,
  timeElapsed,
  score,
  stars,
  coinsEarned,
  hasNextLevel,
  onNextLevel,
  onReplay,
  onLevelsSelect,
}) => {
  useEffect(() => {
    // Fire festive victory confetti
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10B981', '#F59E0B', '#3B82F6', '#8B5CF6'],
      });
    } catch {
      // Confetti fallback
    }
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleShare = async () => {
    sound.playButton();
    const text = isDaily
      ? `🧩 I completed today's Puzzle Master Daily Challenge in ${formatTime(timeElapsed)} with ${score} pts! Can you beat my score?`
      : `🧩 I completed Puzzle Master Level ${levelId} with ${stars} ⭐ in ${formatTime(timeElapsed)}!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Puzzle Master Result',
          text,
          url: window.location.href,
        });
      } catch {
        // Fallback or cancel
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        alert('Result copied to clipboard!');
      } catch {
        // Ignore clipboard error
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl text-center relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <p className="text-xs uppercase tracking-widest text-emerald-400 font-semibold mb-1">
            {isDaily ? 'Daily Challenge Complete!' : 'Level Cleared!'}
          </p>
          <h2 className="text-2xl font-black text-white mb-4">
            {isDaily ? 'Master Mind' : `Stage ${levelId} Solved`}
          </h2>

          {/* Star Rating Display */}
          <div className="flex items-center justify-center gap-3 mb-6">
            {[1, 2, 3].map((starIdx) => {
              const active = starIdx <= stars;
              return (
                <div
                  key={starIdx}
                  className={`relative transform transition-all duration-300 ${
                    active ? 'scale-110 text-amber-400' : 'text-slate-700 scale-95'
                  }`}
                >
                  <Star
                    size={38}
                    className={active ? 'fill-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]' : 'fill-slate-800'}
                  />
                </div>
              );
            })}
          </div>

          {/* Stats Breakdown */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 mb-5">
            <div className="flex flex-col items-center">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 mb-0.5">
                <Clock size={12} /> Time
              </span>
              <span className="text-sm font-bold text-white tabular-nums">
                {formatTime(timeElapsed)}
              </span>
            </div>

            <div className="flex flex-col items-center border-x border-slate-700/60">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 mb-0.5">
                <Trophy size={12} /> Score
              </span>
              <span className="text-sm font-bold text-white tabular-nums">
                {score}
              </span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 mb-0.5">
                <Coins size={12} /> Coins
              </span>
              <span className="text-sm font-bold text-amber-400 tabular-nums">
                +{coinsEarned}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5">
            {hasNextLevel ? (
              <button
                onClick={() => {
                  sound.playButton();
                  onNextLevel();
                }}
                className="w-full h-13 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 active:scale-[0.98] transition-transform"
              >
                <span>Next Level</span>
                <ArrowRight size={18} />
              </button>
            ) : (
              <button
                onClick={() => {
                  sound.playButton();
                  onLevelsSelect();
                }}
                className="w-full h-13 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/30 active:scale-[0.98] transition-transform"
              >
                <span>All 100 Levels Conquered!</span>
              </button>
            )}

            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                onClick={() => {
                  sound.playButton();
                  onReplay();
                }}
                className="h-11 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-medium text-xs flex flex-col items-center justify-center gap-0.5 transition-colors"
                title="Replay Level"
              >
                <RotateCcw size={15} />
                <span>Replay</span>
              </button>

              <button
                onClick={() => {
                  sound.playButton();
                  onLevelsSelect();
                }}
                className="h-11 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-medium text-xs flex flex-col items-center justify-center gap-0.5 transition-colors"
                title="Levels Menu"
              >
                <Grid size={15} />
                <span>Levels</span>
              </button>

              <button
                onClick={handleShare}
                className="h-11 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-medium text-xs flex flex-col items-center justify-center gap-0.5 transition-colors"
                title="Share Score"
              >
                <Share2 size={15} />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

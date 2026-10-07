import React, { useState, useEffect } from 'react';
import { Play, Sparkles, X, CheckCircle2 } from 'lucide-react';
import { sound } from '../utils/audio';

interface AdModalProps {
  rewardType: 'coins' | 'hints';
  onRewardGranted: () => void;
  onClose: () => void;
}

export const AdModal: React.FC<AdModalProps> = ({ rewardType, onRewardGranted, onClose }) => {
  const [countdown, setCountdown] = useState(5);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCompleted(true);
      sound.playVictory();
      onRewardGranted();
    }
  }, [countdown, onRewardGranted]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-2xl p-5 shadow-2xl relative text-center">
        {completed && (
          <button
            onClick={() => {
              sound.playButton();
              onClose();
            }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700 transition-colors"
          >
            <X size={18} />
          </button>
        )}

        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
            Sponsored Ad Preview
          </span>
        </div>

        <div className="relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border border-indigo-800/40 flex flex-col items-center justify-center p-4 mb-4 shadow-inner">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-3xl mb-2 animate-bounce">
            🎯
          </div>
          <h4 className="text-base font-bold text-white mb-1">Puzzle Master Pro</h4>
          <p className="text-xs text-indigo-200/80">Play 100+ logic levels with zero interruptions!</p>
          
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 text-[10px] text-slate-300 backdrop-blur-sm">
            {countdown > 0 ? `Reward in ${countdown}s` : 'Reward Claimed!'}
          </div>
        </div>

        {countdown > 0 ? (
          <div>
            <div className="w-full bg-slate-800 rounded-full h-2 mb-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full transition-all duration-1000 ease-linear"
                style={{ width: `${((5 - countdown) / 5) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-400">
              Watching short message to earn{' '}
              <span className="text-amber-300 font-semibold">
                {rewardType === 'coins' ? '+50 Coins' : '+2 Free Hints'}
              </span>
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-emerald-400 font-semibold text-sm">
              <CheckCircle2 size={20} />
              <span>Reward Claimed Successfully!</span>
            </div>
            <p className="text-xs text-slate-300">
              {rewardType === 'coins' ? '+50 Coins added to your bank' : '+2 Free Hints added to your inventory'}
            </p>
            <button
              onClick={() => {
                sound.playButton();
                onClose();
              }}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-xl transition-colors shadow-lg shadow-emerald-900/40"
            >
              Continue Playing
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

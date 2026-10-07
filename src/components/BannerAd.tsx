import React from 'react';

interface BannerAdProps {
  onAdClick?: () => void;
}

export const BannerAd: React.FC<BannerAdProps> = ({ onAdClick }) => {
  return (
    <div className="w-full max-w-md mx-auto my-2 px-2">
      <div 
        onClick={onAdClick}
        className="w-full h-14 bg-gradient-to-r from-slate-800 to-indigo-950/70 border border-slate-700/60 rounded-xl flex items-center justify-between px-3 cursor-pointer hover:border-indigo-500/50 transition-colors shadow-sm"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-lg shadow-inner">
            🧩
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                Ad
              </span>
              <p className="text-xs font-semibold text-slate-200">Brain Training Daily</p>
            </div>
            <p className="text-[10px] text-slate-400">Boost IQ with logic games · Tap to discover</p>
          </div>
        </div>

        <button 
          type="button"
          className="text-xs font-medium text-indigo-400 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/50 px-2.5 py-1 rounded-md transition-colors whitespace-nowrap"
        >
          Install
        </button>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Sparkles, Lightbulb, HelpCircle, Check, RotateCcw } from 'lucide-react';
import { sound } from '../utils/audio';

interface HowToPlayScreenProps {
  onBack: () => void;
  onPlayNow: () => void;
}

export const HowToPlayScreen: React.FC<HowToPlayScreenProps> = ({ onBack, onPlayNow }) => {
  // Mini interactive demo 2x2 board
  // Grid:
  // [3, 2] -> target row 0: 3 (only cell 3)
  // [1, 4] -> target row 1: 5 (both cells 1 + 4 = 5)
  // Col 0: 3 + 1 = 4
  // Col 1: 0 + 4 = 4
  const [demoSelected, setDemoSelected] = useState<boolean[][]>([
    [false, false],
    [false, false],
  ]);

  const demoGrid = [
    [3, 2],
    [1, 4],
  ];
  const demoRowTargets = [3, 5];
  const demoColTargets = [4, 4];

  const handleToggleDemo = (r: number, c: number) => {
    sound.playTap();
    setDemoSelected(prev => {
      const clone = prev.map(row => [...row]);
      clone[r][c] = !clone[r][c];
      return clone;
    });
  };

  const demoRowSums = demoGrid.map((row, r) =>
    row.reduce((sum, val, c) => (demoSelected[r][c] ? sum + val : sum), 0)
  );

  const demoColSums = [0, 1].map(c =>
    demoGrid.reduce((sum, row, r) => (demoSelected[r][c] ? sum + row[c] : sum), 0)
  );

  const isDemoSolved =
    demoRowSums[0] === demoRowTargets[0] &&
    demoRowSums[1] === demoRowTargets[1] &&
    demoColSums[0] === demoColTargets[0] &&
    demoColSums[1] === demoColTargets[1];

  return (
    <div className="w-full max-w-md mx-auto px-4 py-3 flex flex-col justify-between min-h-[calc(100vh-3.5rem)] select-none animate-fadeIn">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              sound.playButton();
              onBack();
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-2.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>

          <h2 className="text-sm font-black text-white">How to Play</h2>
        </div>

        {/* 1. Core Goal */}
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-4 mb-3">
          <div className="flex items-center gap-2 mb-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <CheckCircle2 size={16} />
            <span>The Objective</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Select numbers in each row and column so their sum equals the <strong>Target Number</strong> shown at the top and right edges!
          </p>
        </div>

        {/* 2. Mini Interactive Practice Board */}
        <div className="bg-gradient-to-br from-indigo-950/60 via-slate-900 to-teal-950/50 border border-teal-500/30 rounded-2xl p-4 mb-4 text-center">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-teal-300 flex items-center gap-1">
              <Lightbulb size={14} /> Try It Yourself (2×2 Practice)
            </span>
            <button
              onClick={() => {
                sound.playButton();
                setDemoSelected([[false, false], [false, false]]);
              }}
              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
            >
              <RotateCcw size={12} /> Reset
            </button>
          </div>

          <p className="text-[11px] text-slate-400 mb-3">
            Tap the numbers below until both rows and columns turn green!
          </p>

          <div className="inline-block bg-slate-900/80 p-3 rounded-2xl border border-slate-700">
            {/* Top Column Targets */}
            <div className="grid grid-cols-3 gap-2 mb-2">
              {demoColTargets.map((target, c) => {
                const cur = demoColSums[c];
                const match = cur === target;
                return (
                  <div
                    key={c}
                    className={`h-9 rounded-lg flex flex-col items-center justify-center border font-bold text-xs ${
                      match
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <span>{target}</span>
                    <span className="text-[9px]">{match ? '✓' : cur}</span>
                  </div>
                );
              })}
              <div className="text-slate-600 text-xs flex items-center justify-center">∑</div>
            </div>

            {/* Grid rows */}
            {demoGrid.map((row, r) => {
              const rowTarget = demoRowTargets[r];
              const curRowSum = demoRowSums[r];
              const rowMatch = curRowSum === rowTarget;

              return (
                <div key={r} className="grid grid-cols-3 gap-2 mb-2 last:mb-0">
                  {row.map((val, c) => {
                    const isSel = demoSelected[r][c];
                    return (
                      <button
                        key={c}
                        onClick={() => handleToggleDemo(r, c)}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-base border transition-all ${
                          isSel
                            ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white border-emerald-300 shadow-md scale-105'
                            : 'bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        {val}
                      </button>
                    );
                  })}

                  {/* Row Target badge */}
                  <div
                    className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center border font-bold text-xs ${
                      rowMatch
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <span>{rowTarget}</span>
                    <span className="text-[9px]">{rowMatch ? '✓' : curRowSum}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {isDemoSolved && (
            <div className="mt-3 p-2 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold animate-bounce">
              🎉 Perfect! You matched all target sums!
            </div>
          )}
        </div>

        {/* 3. Pro Tips */}
        <div className="space-y-2 mb-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Strategies & Tips
          </h3>

          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex gap-2.5">
            <span className="text-amber-400 font-bold text-sm">01.</span>
            <p className="text-xs text-slate-300">
              <strong>Eliminate oversized numbers:</strong> If a row target is 4 and a cell is 7, that cell cannot possibly be included! Use <em>Cross Out Mode</em> to eliminate it.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex gap-2.5">
            <span className="text-teal-400 font-bold text-sm">02.</span>
            <p className="text-xs text-slate-300">
              <strong>Check corner intersections:</strong> When both a row and column share a single number required for both sums, lock it in first.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex gap-2.5">
            <span className="text-cyan-400 font-bold text-sm">03.</span>
            <p className="text-xs text-slate-300">
              <strong>Use Free Hints:</strong> Tap the Sparkles icon when stuck. It will immediately reveal and lock a valid cell!
            </p>
          </div>
        </div>
      </div>

      {/* Play Now CTA */}
      <button
        onClick={() => {
          sound.playButton();
          onPlayNow();
        }}
        className="w-full h-13 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 active:scale-[0.98] transition-transform"
      >
        <span>Start Playing Now</span>
      </button>
    </div>
  );
};

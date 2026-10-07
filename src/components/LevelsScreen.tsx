import React, { useState } from 'react';
import { ArrowLeft, Lock, Star, CheckCircle, Clock } from 'lucide-react';
import { PlayerProgress } from '../types/game';
import { ALL_LEVELS_METADATA } from '../utils/levelGenerator';
import { sound } from '../utils/audio';

interface LevelsScreenProps {
  progress: PlayerProgress;
  onSelectLevel: (levelId: number) => void;
  onBack: () => void;
}

const CHAPTERS = [
  { id: 1, name: 'Ch. 1: Apprentice', range: '1-20', min: 1, max: 20 },
  { id: 2, name: 'Ch. 2: Strategist', range: '21-40', min: 21, max: 40 },
  { id: 3, name: 'Ch. 3: Architect', range: '41-60', min: 41, max: 60 },
  { id: 4, name: 'Ch. 4: Enigma', range: '61-80', min: 61, max: 80 },
  { id: 5, name: 'Ch. 5: Grandmaster', range: '81-100', min: 81, max: 100 },
];

export const LevelsScreen: React.FC<LevelsScreenProps> = ({ progress, onSelectLevel, onBack }) => {
  // Find current chapter
  const currentChapterId = Math.min(Math.ceil(progress.currentLevel / 20), 5);
  const [selectedChapter, setSelectedChapter] = useState(currentChapterId || 1);

  const activeChapterConfig = CHAPTERS.find(c => c.id === selectedChapter) || CHAPTERS[0];
  const chapterLevels = ALL_LEVELS_METADATA.slice(activeChapterConfig.min - 1, activeChapterConfig.max);

  // Compute stars in this chapter
  const chapterStars = chapterLevels.reduce((acc, lvl) => {
    return acc + (progress.completedLevels[lvl.id]?.stars || 0);
  }, 0);

  const totalCleared = Object.keys(progress.completedLevels).length;
  const totalStars = Object.values(progress.completedLevels).reduce((acc, l) => acc + l.stars, 0);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full max-w-md mx-auto px-3 py-3 flex flex-col min-h-[calc(100vh-3.5rem)] select-none animate-fadeIn">
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

        <div className="text-right">
          <h2 className="text-sm font-black text-white">Select Level</h2>
          <p className="text-[11px] text-slate-400">
            {totalCleared}/100 Cleared · {totalStars} ⭐
          </p>
        </div>
      </div>

      {/* Chapter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-3">
        {CHAPTERS.map(ch => {
          const isActive = selectedChapter === ch.id;
          return (
            <button
              key={ch.id}
              onClick={() => {
                sound.playButton();
                setSelectedChapter(ch.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                isActive
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-sm'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{ch.name}</span>
            </button>
          );
        })}
      </div>

      {/* Chapter Title & Star Progress banner */}
      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50 mb-3 text-xs">
        <span className="text-slate-300 font-semibold">{activeChapterConfig.name}</span>
        <span className="text-amber-400 font-bold flex items-center gap-1">
          <Star size={13} className="fill-amber-400" />
          <span>{chapterStars} / 60 Stars</span>
        </span>
      </div>

      {/* 20 Levels Grid for this Chapter */}
      <div className="grid grid-cols-4 gap-2.5 overflow-y-auto pb-6">
        {chapterLevels.map(lvl => {
          const isUnlocked = lvl.id <= progress.currentLevel;
          const completedData = progress.completedLevels[lvl.id];
          const isCurrentTarget = lvl.id === progress.currentLevel;
          const starsEarned = completedData ? completedData.stars : 0;

          return (
            <button
              key={lvl.id}
              disabled={!isUnlocked}
              onClick={() => {
                if (isUnlocked) {
                  sound.playButton();
                  onSelectLevel(lvl.id);
                } else {
                  sound.playWarning();
                }
              }}
              className={`relative h-20 rounded-2xl flex flex-col items-center justify-between p-2 border transition-all duration-200 transform ${
                isCurrentTarget
                  ? 'bg-gradient-to-br from-indigo-950 via-slate-850 to-teal-950 border-teal-400 shadow-lg shadow-teal-500/10 scale-[1.02] ring-2 ring-teal-400/40'
                  : isUnlocked
                  ? completedData
                    ? 'bg-slate-800/90 border-slate-700 text-white hover:border-slate-500'
                    : 'bg-slate-800/70 border-slate-700/80 text-white hover:border-teal-500/50'
                  : 'bg-slate-900/40 border-slate-800 text-slate-600 opacity-60 cursor-not-allowed'
              } active:scale-95`}
            >
              {/* Level Number */}
              <div className="flex items-center justify-between w-full">
                <span className={`text-xs font-black ${isCurrentTarget ? 'text-teal-300' : ''}`}>
                  {lvl.id}
                </span>

                {isUnlocked ? (
                  completedData ? (
                    <span className="text-[10px] text-slate-400 flex items-center gap-0.5 tabular-nums">
                      <Clock size={9} />
                      {formatTime(completedData.bestTime)}
                    </span>
                  ) : null
                ) : (
                  <Lock size={12} className="text-slate-600" />
                )}
              </div>

              {/* Center icon / Grid Size Indicator */}
              <div className="text-[11px] font-medium text-slate-400">
                {lvl.size}×{lvl.size}
              </div>

              {/* Stars Footer */}
              <div className="flex items-center gap-0.5">
                {[1, 2, 3].map(s => (
                  <Star
                    key={s}
                    size={11}
                    className={
                      s <= starsEarned
                        ? 'text-amber-400 fill-amber-400'
                        : isUnlocked
                        ? 'text-slate-700 fill-slate-800'
                        : 'text-slate-800'
                    }
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

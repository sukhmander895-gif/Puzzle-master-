import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Clock, Star, Undo2, RotateCcw, Sparkles, Check, CheckCircle2, AlertCircle, ArrowLeft, Coins } from 'lucide-react';
import { LevelData, CellState, PlayerProgress } from '../types/game';
import { sound } from '../utils/audio';

interface GameBoardProps {
  level: LevelData;
  isDaily: boolean;
  progress: PlayerProgress;
  onVictory: (stars: number, timeElapsed: number, score: number, coinsEarned: number) => void;
  onExit: () => void;
  onUseHint: () => boolean; // returns true if hint consumed
  onRequestAdReward: (type: 'hints' | 'coins') => void;
}

interface MoveHistory {
  r: number;
  c: number;
  prevState: CellState;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  level,
  isDaily,
  progress,
  onVictory,
  onExit,
  onUseHint,
  onRequestAdReward,
}) => {
  const size = level.size;

  // Board state: grid of cell states
  const [board, setBoard] = useState<CellState[][]>(() =>
    Array.from({ length: size }, () => Array(size).fill('empty'))
  );

  // Locked/hinted cells that cannot be accidentally changed
  const [lockedCells, setLockedCells] = useState<boolean[][]>(() =>
    Array.from({ length: size }, () => Array(size).fill(false))
  );

  // Active interaction mode: 'select' (include in sum) or 'mark' (cross out as eliminated)
  const [inputMode, setInputMode] = useState<'select' | 'mark'>('select');

  // Move history for Undo
  const [history, setHistory] = useState<MoveHistory[]>([]);

  // Timer & Moves
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [moveCount, setMoveCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showHintPrompt, setShowHintPrompt] = useState(false);

  // Highlighted hint cell
  const [hintedCell, setHintedCell] = useState<{ r: number; c: number } | null>(null);

  // Refs for tracking changes
  const prevRowMatches = useRef<boolean[]>(Array(size).fill(false));
  const prevColMatches = useRef<boolean[]>(Array(size).fill(false));

  // Reset board when level changes
  useEffect(() => {
    setBoard(Array.from({ length: size }, () => Array(size).fill('empty')));
    setLockedCells(Array.from({ length: size }, () => Array(size).fill(false)));
    setHistory([]);
    setTimeElapsed(0);
    setMoveCount(0);
    setIsCompleted(false);
    setHintedCell(null);
    prevRowMatches.current = Array(size).fill(false);
    prevColMatches.current = Array(size).fill(false);
  }, [level.id, size]);

  // Timer ticker
  useEffect(() => {
    if (isCompleted) return;
    const interval = setInterval(() => {
      setTimeElapsed(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isCompleted]);

  // Calculate current row sums
  const currentRowSums = board.map((row, r) =>
    row.reduce((sum, state, c) => (state === 'selected' ? sum + level.grid[r][c] : sum), 0)
  );

  // Calculate current column sums
  const currentColSums = Array.from({ length: size }, (_, c) =>
    board.reduce((sum, row, r) => (row[c] === 'selected' ? sum + level.grid[r][c] : sum), 0)
  );

  // Calculate current stars based on time vs parTime
  const currentStars = timeElapsed <= level.parTime ? 3 : timeElapsed <= level.parTime * 1.5 ? 2 : 1;

  // Sound feedback on row/col match changes
  useEffect(() => {
    let newlyMatched = false;
    currentRowSums.forEach((sum, r) => {
      const isMatch = sum === level.rowTargets[r];
      if (isMatch && !prevRowMatches.current[r]) {
        newlyMatched = true;
      }
      prevRowMatches.current[r] = isMatch;
    });

    currentColSums.forEach((sum, c) => {
      const isMatch = sum === level.colTargets[c];
      if (isMatch && !prevColMatches.current[c]) {
        newlyMatched = true;
      }
      prevColMatches.current[c] = isMatch;
    });

    if (newlyMatched && !isCompleted) {
      sound.playMatch();
    }
  }, [currentRowSums, currentColSums, isCompleted, level.rowTargets, level.colTargets]);

  // Check victory condition
  useEffect(() => {
    if (isCompleted) return;

    const allRowsMatched = currentRowSums.every((sum, r) => sum === level.rowTargets[r]);
    const allColsMatched = currentColSums.every((sum, c) => sum === level.colTargets[c]);

    // Also ensure at least one cell is selected to avoid empty start match if targets were 0
    const hasAnySelected = board.some(row => row.some(cell => cell === 'selected'));

    if (allRowsMatched && allColsMatched && hasAnySelected) {
      setIsCompleted(true);
      sound.playVictory();

      // Calculate score & coins
      const baseScore = level.size * 100;
      const timeBonus = Math.max(0, (level.parTime * 2 - timeElapsed) * 10);
      const starBonus = currentStars * 150;
      const finalScore = baseScore + timeBonus + starBonus;

      const baseCoins = isDaily ? 100 : 25;
      const bonusCoins = currentStars === 3 ? 15 : currentStars === 2 ? 10 : 5;
      const totalCoins = baseCoins + bonusCoins;

      setTimeout(() => {
        onVictory(currentStars, timeElapsed, finalScore, totalCoins);
      }, 500);
    }
  }, [board, currentRowSums, currentColSums, isCompleted, currentStars, timeElapsed, level, isDaily, onVictory]);

  // Handle cell click
  const handleCellClick = (r: number, c: number) => {
    if (isCompleted) return;
    if (lockedCells[r][c]) {
      // Locked by hint
      sound.playWarning();
      return;
    }

    const current = board[r][c];
    let next: CellState;

    if (inputMode === 'select') {
      next = current === 'selected' ? 'empty' : 'selected';
    } else {
      next = current === 'marked' ? 'empty' : 'marked';
    }

    if (next === 'selected') {
      sound.playTap();
    } else if (next === 'marked') {
      sound.playMark();
    } else {
      sound.playButton();
    }

    // Save to history for undo
    setHistory(prev => [...prev, { r, c, prevState: current }]);

    // Update board
    setBoard(prev => {
      const clone = prev.map(row => [...row]);
      clone[r][c] = next;
      return clone;
    });

    setMoveCount(m => m + 1);

    // Clear hint glow if touching hinted cell
    if (hintedCell && hintedCell.r === r && hintedCell.c === c) {
      setHintedCell(null);
    }
  };

  // Undo last move
  const handleUndo = () => {
    if (isCompleted || history.length === 0) return;
    sound.playButton();

    const lastMove = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));

    setBoard(prev => {
      const clone = prev.map(row => [...row]);
      clone[lastMove.r][lastMove.c] = lastMove.prevState;
      return clone;
    });
  };

  // Restart level
  const handleRestart = () => {
    if (isCompleted) return;
    sound.playButton();
    setBoard(Array.from({ length: size }, () => Array(size).fill('empty')));
    setLockedCells(Array.from({ length: size }, () => Array(size).fill(false)));
    setHistory([]);
    setMoveCount(0);
    setHintedCell(null);
  };

  // Hint activation
  const handleHintClick = () => {
    if (isCompleted) return;

    if (progress.hints <= 0) {
      setShowHintPrompt(true);
      return;
    }

    // Find a cell where current state does not match solution
    // Solution specifies whether cell should be selected (true) or empty/marked (false)
    const discrepancyCells: { r: number; c: number; shouldBeSelected: boolean }[] = [];

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (lockedCells[r][c]) continue;
        const isCurrentSelected = board[r][c] === 'selected';
        const targetSelected = level.solution[r][c];

        if (isCurrentSelected !== targetSelected) {
          discrepancyCells.push({ r, c, shouldBeSelected: targetSelected });
        }
      }
    }

    if (discrepancyCells.length === 0) {
      // Puzzle is already matching or finished
      sound.playMatch();
      return;
    }

    // Consume 1 hint
    const consumed = onUseHint();
    if (!consumed) return;

    // Pick a discrepancy cell to solve
    const chosen = discrepancyCells[Math.floor(Math.random() * discrepancyCells.length)];
    sound.playHint();

    setHintedCell({ r: chosen.r, c: chosen.c });

    setBoard(prev => {
      const clone = prev.map(row => [...row]);
      clone[chosen.r][chosen.c] = chosen.shouldBeSelected ? 'selected' : 'marked';
      return clone;
    });

    setLockedCells(prev => {
      const clone = prev.map(row => [...row]);
      clone[chosen.r][chosen.c] = true;
      return clone;
    });
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full max-w-md mx-auto px-3 py-2 flex flex-col justify-between min-h-[calc(100vh-3.5rem)] select-none">
      {/* Level Header Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => {
              sound.playButton();
              onExit();
            }}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white py-1 px-2 rounded-lg bg-slate-800/60 border border-slate-700/60 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Levels</span>
          </button>

          <div className="text-center">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              {level.chapterTitle}
            </span>
            <h2 className="text-sm font-black text-white leading-tight">
              {level.name}
            </h2>
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-300 font-semibold px-2 py-1 rounded-lg bg-slate-800/60 border border-slate-700/60 tabular-nums">
            <Clock size={13} className="text-teal-400" />
            <span>{formatTime(timeElapsed)}</span>
          </div>
        </div>

        {/* Stars and Target Meter */}
        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-800/40 border border-slate-700/40 text-xs mb-3">
          <div className="flex items-center gap-1">
            {[1, 2, 3].map(s => (
              <Star
                key={s}
                size={16}
                className={
                  s <= currentStars
                    ? 'text-amber-400 fill-amber-400 transition-all'
                    : 'text-slate-700 fill-slate-800 transition-all'
                }
              />
            ))}
            <span className="text-[11px] text-slate-400 ml-1">
              Par: {level.parTime}s
            </span>
          </div>

          <div className="text-[11px] text-slate-400">
            Moves: <span className="text-white font-bold tabular-nums">{moveCount}</span>
          </div>
        </div>
      </div>

      {/* Main Puzzle Grid Container */}
      <div className="flex flex-col items-center justify-center my-auto py-2">
        <div className="relative inline-block bg-slate-800/40 p-3 rounded-3xl border border-slate-700/60 shadow-xl backdrop-blur-sm">
          {/* Top Column Target Badges Row */}
          <div
            className="grid gap-2 mb-2"
            style={{
              gridTemplateColumns: `repeat(${size}, minmax(0, 1fr)) 44px`,
            }}
          >
            {level.colTargets.map((target, c) => {
              const current = currentColSums[c];
              const isMatch = current === target;
              const isOver = current > target;

              return (
                <div
                  key={c}
                  className={`h-11 rounded-xl flex flex-col items-center justify-center border font-bold text-xs transition-all duration-300 ${
                    isMatch
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-sm shadow-emerald-500/20'
                      : isOver
                      ? 'bg-rose-500/15 border-rose-500/60 text-rose-300'
                      : 'bg-slate-800/90 border-slate-700 text-slate-300'
                  }`}
                >
                  <span className="text-xs leading-none font-black tabular-nums">
                    {target}
                  </span>
                  <span
                    className={`text-[9px] leading-tight font-medium tabular-nums ${
                      isMatch
                        ? 'text-emerald-400 font-bold'
                        : isOver
                        ? 'text-rose-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {isMatch ? '✓' : `${current}`}
                  </span>
                </div>
              );
            })}

            {/* Corner spacer for row target alignment */}
            <div className="w-11 h-11 flex items-center justify-center text-slate-600 text-xs">
              ∑
            </div>
          </div>

          {/* Matrix Rows: Number Cells + Row Target Badge */}
          <div className="space-y-2">
            {board.map((row, r) => {
              const rowTarget = level.rowTargets[r];
              const currentSum = currentRowSums[r];
              const isRowMatch = currentSum === rowTarget;
              const isRowOver = currentSum > rowTarget;

              return (
                <div
                  key={r}
                  className="grid gap-2"
                  style={{
                    gridTemplateColumns: `repeat(${size}, minmax(0, 1fr)) 44px`,
                  }}
                >
                  {/* Grid cells in this row */}
                  {row.map((cellState, c) => {
                    const val = level.grid[r][c];
                    const isSelected = cellState === 'selected';
                    const isMarked = cellState === 'marked';
                    const isLocked = lockedCells[r][c];
                    const isHintGlow = hintedCell && hintedCell.r === r && hintedCell.c === c;

                    // Compute adaptive cell size based on grid dimension
                    const cellSizeClasses =
                      size === 3
                        ? 'w-16 h-16 text-2xl'
                        : size === 4
                        ? 'w-14 h-14 text-xl'
                        : size === 5
                        ? 'w-11 h-11 text-base'
                        : 'w-10 h-10 text-sm';

                    return (
                      <button
                        key={c}
                        onClick={() => handleCellClick(r, c)}
                        className={`relative ${cellSizeClasses} rounded-2xl flex items-center justify-center font-black transition-all duration-150 transform active:scale-95 shadow-md ${
                          isSelected
                            ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white border-2 border-emerald-300 shadow-emerald-950/50 scale-[1.03]'
                            : isMarked
                            ? 'bg-slate-900/60 border border-slate-800 text-slate-600'
                            : 'bg-slate-800 hover:bg-slate-750 text-slate-100 border border-slate-700/80 hover:border-slate-600'
                        } ${isHintGlow ? 'ring-4 ring-cyan-400 animate-pulse' : ''}`}
                      >
                        {/* Cell Number */}
                        <span className={isMarked ? 'line-through opacity-50' : ''}>
                          {val}
                        </span>

                        {/* Selected Indicator dot */}
                        {isSelected && (
                          <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-white/90" />
                        )}

                        {/* Marked X indicator */}
                        {isMarked && (
                          <span className="absolute text-[10px] text-rose-400/80 font-bold top-0.5 right-1">
                            ✕
                          </span>
                        )}

                        {/* Hint lock badge */}
                        {isLocked && (
                          <span className="absolute top-0.5 left-1 text-[9px] text-cyan-300">
                            ★
                          </span>
                        )}
                      </button>
                    );
                  })}

                  {/* Row Target Badge */}
                  <div
                    className={`w-11 h-full rounded-xl flex flex-col items-center justify-center border font-bold transition-all duration-300 ${
                      isRowMatch
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-sm shadow-emerald-500/20'
                        : isRowOver
                        ? 'bg-rose-500/15 border-rose-500/60 text-rose-300'
                        : 'bg-slate-800/90 border-slate-700 text-slate-300'
                    }`}
                  >
                    <span className="text-xs leading-none font-black tabular-nums">
                      {rowTarget}
                    </span>
                    <span
                      className={`text-[9px] leading-tight font-medium tabular-nums ${
                        isRowMatch
                          ? 'text-emerald-400 font-bold'
                          : isRowOver
                          ? 'text-rose-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {isRowMatch ? '✓' : `${currentSum}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Control Deck */}
      <div className="space-y-2 mt-auto pt-2">
        {/* Input Mode Selector (Select vs Mark) */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-800/80 border border-slate-700/60 rounded-xl">
          <button
            onClick={() => {
              sound.playButton();
              setInputMode('select');
            }}
            className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              inputMode === 'select'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Check size={14} />
            <span>Include Mode</span>
          </button>

          <button
            onClick={() => {
              sound.playButton();
              setInputMode('mark');
            }}
            className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              inputMode === 'mark'
                ? 'bg-slate-700 text-white shadow-md border border-slate-600'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>✕</span>
            <span>Cross Out Mode</span>
          </button>
        </div>

        {/* Action Toolbar: Undo, Restart, Hint */}
        <div className="grid grid-cols-3 gap-2">
          {/* Undo */}
          <button
            onClick={handleUndo}
            disabled={history.length === 0}
            className={`h-12 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-semibold transition-all ${
              history.length > 0
                ? 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200 active:scale-95'
                : 'bg-slate-900/50 border-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            <Undo2 size={16} />
            <span>Undo</span>
          </button>

          {/* Restart */}
          <button
            onClick={handleRestart}
            className="h-12 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 active:scale-95 flex items-center justify-center gap-1.5 text-xs font-semibold transition-all"
          >
            <RotateCcw size={16} />
            <span>Restart</span>
          </button>

          {/* Hint */}
          <button
            onClick={handleHintClick}
            className="h-12 rounded-xl bg-gradient-to-r from-cyan-600/30 to-blue-600/30 hover:from-cyan-600/40 hover:to-blue-600/40 border border-cyan-500/50 text-cyan-300 active:scale-95 flex items-center justify-center gap-1.5 text-xs font-bold transition-all relative"
          >
            <Sparkles size={16} className="text-cyan-400" />
            <span>Hint</span>
            <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-[10px] font-bold border border-cyan-500/30">
              {progress.hints}
            </span>
          </button>
        </div>
      </div>

      {/* Out of Hints Modal */}
      {showHintPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xs bg-slate-900 border border-slate-700 rounded-2xl p-5 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 mx-auto flex items-center justify-center mb-3">
              <Sparkles size={24} />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Out of Free Hints</h3>
            <p className="text-xs text-slate-400 mb-4">
              Get more hints using earned coins or watch a short sponsored message for free!
            </p>

            <div className="space-y-2">
              <button
                onClick={() => {
                  sound.playButton();
                  setShowHintPrompt(false);
                  onRequestAdReward('hints');
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md"
              >
                <span>Watch Ad (+2 Free Hints)</span>
              </button>

              <button
                onClick={() => {
                  if (progress.coins >= 50) {
                    sound.playButton();
                    // Buy 1 hint with 50 coins handled via direct buy callback
                    onUseHint(); // or custom buy
                    setShowHintPrompt(false);
                  } else {
                    sound.playWarning();
                    alert('Not enough coins! You can watch a sponsored message for free hints.');
                  }
                }}
                className={`w-full py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 ${
                  progress.coins >= 50
                    ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-amber-300'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                <Coins size={14} className="text-amber-400" />
                <span>Buy 1 Hint (50 🪙)</span>
              </button>

              <button
                onClick={() => setShowHintPrompt(false)}
                className="w-full py-2 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

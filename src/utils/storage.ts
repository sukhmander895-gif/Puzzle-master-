import { PlayerProgress, LeaderboardEntry } from '../types/game';

const STORAGE_KEY = 'puzzle_master_save_v1';
const LEADERBOARD_KEY = 'puzzle_master_leaderboard_v1';

export const DEFAULT_PROGRESS: PlayerProgress = {
  name: 'Player',
  avatar: '🧠',
  coins: 100,
  hints: 3,
  currentLevel: 1,
  completedLevels: {},
  dailyProgress: {
    lastCompletedDate: null,
    streak: 0,
    history: {},
  },
  withdrawals: [],
  settings: {
    soundEnabled: true,
    hapticsEnabled: true,
    theme: 'dark',
    showBannerAds: true,
  },
};

export const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  { id: 'lb-1', name: 'LogicKing', avatar: '👑', totalStars: 285, levelsCleared: 95, score: 28500, date: 'Today' },
  { id: 'lb-2', name: 'NovaMind', avatar: '⚡', totalStars: 240, levelsCleared: 80, score: 24150, date: 'Yesterday' },
  { id: 'lb-3', name: 'ZenPuzzler', avatar: '🧘', totalStars: 210, levelsCleared: 70, score: 20900, date: '2 days ago' },
  { id: 'lb-4', name: 'GridMaster', avatar: '🎯', totalStars: 175, levelsCleared: 60, score: 17400, date: '3 days ago' },
  { id: 'lb-5', name: 'MathWizard', avatar: '🧙', totalStars: 130, levelsCleared: 45, score: 13200, date: '4 days ago' },
  { id: 'lb-6', name: 'Sparky', avatar: '🦊', totalStars: 90, levelsCleared: 30, score: 9100, date: '5 days ago' },
];

export function loadProgress(): PlayerProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
      settings: {
        ...DEFAULT_PROGRESS.settings,
        ...(parsed.settings || {}),
      },
      dailyProgress: {
        ...DEFAULT_PROGRESS.dailyProgress,
        ...(parsed.dailyProgress || {}),
      },
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function saveProgress(progress: PlayerProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Storage quota or safari private browsing fallback
  }
}

export function loadLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    if (!raw) return INITIAL_LEADERBOARD;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_LEADERBOARD;
  } catch {
    return INITIAL_LEADERBOARD;
  }
}

export function saveLeaderboard(entries: LeaderboardEntry[]): void {
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries));
  } catch {
    // Storage fallback
  }
}

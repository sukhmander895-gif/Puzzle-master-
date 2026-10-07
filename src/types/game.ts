export type Screen = 'home' | 'game' | 'levels' | 'daily' | 'how-to-play' | 'leaderboard' | 'settings' | 'withdraw';

export type CellState = 'empty' | 'selected' | 'marked';

export interface LevelData {
  id: number;
  chapter: number;
  chapterTitle: string;
  name: string;
  size: number; // 3 = 3x3, 4 = 4x4, 5 = 5x5, 6 = 6x6
  grid: number[][]; // the numbers in the grid
  solution: boolean[][]; // whether cell is included in target sums
  rowTargets: number[];
  colTargets: number[];
  parTime: number; // seconds for 3 stars
}

export interface WithdrawalRequest {
  id: string;
  method: 'upi' | 'paypal' | 'google_play' | 'amazon' | 'bank';
  accountDetails: string;
  coinsSpent: number;
  cashAmount: number; // in USD or INR
  currency: 'USD' | 'INR';
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  requestedAt: string;
  transactionRef: string;
}

export interface PlayerProgress {
  name: string;
  avatar: string;
  coins: number;
  hints: number;
  currentLevel: number;
  completedLevels: Record<number, {
    stars: number;
    bestTime: number; // seconds
    highScore: number;
    completedAt: string;
  }>;
  dailyProgress: {
    lastCompletedDate: string | null;
    streak: number;
    history: Record<string, { stars: number; time: number; score: number }>;
  };
  withdrawals: WithdrawalRequest[];
  settings: {
    soundEnabled: boolean;
    hapticsEnabled: boolean;
    theme: 'dark' | 'light';
    showBannerAds: boolean;
  };
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  totalStars: number;
  levelsCleared: number;
  score: number;
  date: string;
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Screen, LevelData, PlayerProgress, LeaderboardEntry, WithdrawalRequest } from './types/game';
import { generateLevel, generateDailyLevel } from './utils/levelGenerator';
import {
  loadProgress,
  saveProgress,
  loadLeaderboard,
  saveLeaderboard,
  DEFAULT_PROGRESS,
} from './utils/storage';
import { sound } from './utils/audio';
import { TopBar } from './components/TopBar';
import { HomeScreen } from './components/HomeScreen';
import { GameBoard } from './components/GameBoard';
import { LevelsScreen } from './components/LevelsScreen';
import { DailyChallengeScreen } from './components/DailyChallengeScreen';
import { HowToPlayScreen } from './components/HowToPlayScreen';
import { LeaderboardScreen } from './components/LeaderboardScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { WithdrawalScreen } from './components/WithdrawalScreen';
import { VictoryModal } from './components/VictoryModal';
import { AdModal } from './components/AdModal';
import { BannerAd } from './components/BannerAd';

export default function App() {
  const [progress, setProgress] = useState<PlayerProgress>(() => loadProgress());
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => loadLeaderboard());
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');

  // Active level state
  const [activeLevel, setActiveLevel] = useState<LevelData | null>(null);
  const [isDailyActive, setIsDailyActive] = useState<boolean>(false);

  // Victory modal state
  const [victoryData, setVictoryData] = useState<{
    levelId: number;
    isDaily: boolean;
    stars: number;
    timeElapsed: number;
    score: number;
    coinsEarned: number;
  } | null>(null);

  // Rewarded ad modal state
  const [adRewardModal, setAdRewardModal] = useState<{
    isOpen: boolean;
    type: 'coins' | 'hints';
  }>({ isOpen: false, type: 'coins' });

  // Sync sound manager enabled state with saved settings
  useEffect(() => {
    sound.enabled = progress.settings.soundEnabled;
  }, [progress.settings.soundEnabled]);

  // Persist progress changes
  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  // Persist leaderboard changes
  useEffect(() => {
    saveLeaderboard(leaderboard);
  }, [leaderboard]);

  // Start a specific level (1..100)
  const handleStartLevel = useCallback((levelId: number) => {
    const levelData = generateLevel(levelId);
    setActiveLevel(levelData);
    setIsDailyActive(false);
    setVictoryData(null);
    setCurrentScreen('game');
  }, []);

  // Start today's daily challenge
  const handleStartDaily = useCallback(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const dailyData = generateDailyLevel(todayStr);
    setActiveLevel(dailyData);
    setIsDailyActive(true);
    setVictoryData(null);
    setCurrentScreen('game');
  }, []);

  // Use a hint (returns true if successful)
  const handleUseHint = useCallback((): boolean => {
    if (progress.hints > 0) {
      setProgress(prev => ({
        ...prev,
        hints: prev.hints - 1,
      }));
      return true;
    } else if (progress.coins >= 50) {
      // Auto-buy 1 hint with 50 coins
      setProgress(prev => ({
        ...prev,
        coins: prev.coins - 50,
      }));
      return true;
    }
    return false;
  }, [progress.hints, progress.coins]);

  // Handle victory event from GameBoard
  const handleLevelVictory = useCallback(
    (stars: number, timeElapsed: number, score: number, coinsEarned: number) => {
      if (!activeLevel) return;

      const levelId = activeLevel.id;
      const todayStr = new Date().toISOString().split('T')[0];

      setProgress(prev => {
        const newCoins = prev.coins + coinsEarned;
        let newCurrentLevel = prev.currentLevel;

        const newCompleted = { ...prev.completedLevels };
        const newDaily = { ...prev.dailyProgress };

        if (isDailyActive) {
          // Update daily progress & streak
          const prevStreak = prev.dailyProgress.streak;
          const wasCompletedToday = prev.dailyProgress.lastCompletedDate === todayStr;
          const newStreak = wasCompletedToday ? prevStreak : prevStreak + 1;

          newDaily.lastCompletedDate = todayStr;
          newDaily.streak = newStreak;
          newDaily.history = {
            ...newDaily.history,
            [todayStr]: { stars, time: timeElapsed, score },
          };
        } else {
          // Normal 100 level
          const existing = newCompleted[levelId];
          const bestStars = existing ? Math.max(existing.stars, stars) : stars;
          const bestTime = existing ? Math.min(existing.bestTime, timeElapsed) : timeElapsed;
          const highScore = existing ? Math.max(existing.highScore, score) : score;

          newCompleted[levelId] = {
            stars: bestStars,
            bestTime,
            highScore,
            completedAt: new Date().toISOString(),
          };

          // Unlock next level if this was the latest level
          if (levelId === prev.currentLevel && prev.currentLevel < 100) {
            newCurrentLevel = prev.currentLevel + 1;
          }
        }

        return {
          ...prev,
          coins: newCoins,
          currentLevel: newCurrentLevel,
          completedLevels: newCompleted,
          dailyProgress: newDaily,
        };
      });

      // Show victory celebration modal
      setVictoryData({
        levelId,
        isDaily: isDailyActive,
        stars,
        timeElapsed,
        score,
        coinsEarned,
      });
    },
    [activeLevel, isDailyActive]
  );

  // Next level navigation from victory modal
  const handleNextLevel = () => {
    if (!victoryData) return;
    setVictoryData(null);
    if (victoryData.isDaily) {
      setCurrentScreen('daily');
    } else if (victoryData.levelId < 100) {
      handleStartLevel(victoryData.levelId + 1);
    } else {
      setCurrentScreen('levels');
    }
  };

  // Replay current level
  const handleReplayLevel = () => {
    if (!activeLevel) return;
    setVictoryData(null);
    if (isDailyActive) {
      handleStartDaily();
    } else {
      handleStartLevel(activeLevel.id);
    }
  };

  // Rewarded Ad completion handler
  const handleRewardGranted = () => {
    setProgress(prev => {
      if (adRewardModal.type === 'coins') {
        return { ...prev, coins: prev.coins + 50 };
      } else {
        return { ...prev, hints: prev.hints + 2 };
      }
    });
  };

  // Profile update
  const handleUpdateProfile = (name: string, avatar: string) => {
    setProgress(prev => ({
      ...prev,
      name,
      avatar,
    }));
  };

  // Withdrawal request handler
  const handleWithdraw = (request: WithdrawalRequest) => {
    setProgress(prev => ({
      ...prev,
      coins: prev.coins - request.coinsSpent,
      withdrawals: [request, ...prev.withdrawals],
    }));
  };

  // Simulate instant payout approval for testing
  const handleSimulateApprove = (requestId: string) => {
    setProgress(prev => ({
      ...prev,
      withdrawals: prev.withdrawals.map(w =>
        w.id === requestId ? { ...w, status: 'approved' } : w
      ),
    }));
  };

  // Cancel pending withdrawal request and refund coins
  const handleCancelWithdrawal = (requestId: string, refundCoins: number) => {
    setProgress(prev => ({
      ...prev,
      coins: prev.coins + refundCoins,
      withdrawals: prev.withdrawals.filter(w => w.id !== requestId),
    }));
  };

  // Reset data handler
  const handleResetData = () => {
    setProgress({
      ...DEFAULT_PROGRESS,
      settings: progress.settings,
    });
    setCurrentScreen('home');
    alert('Game progress has been reset.');
  };

  // Dark or light mode class
  const themeClass =
    progress.settings.theme === 'light'
      ? 'bg-slate-100 text-slate-900'
      : 'bg-slate-950 text-slate-100';

  return (
    <div className={`min-h-screen ${themeClass} flex flex-col font-sans transition-colors duration-200`}>
      {/* Top Bar adhering to Top Bar Contract */}
      <TopBar
        coins={progress.coins}
        hints={progress.hints}
        soundEnabled={progress.settings.soundEnabled}
        onToggleSound={() => {
          const next = !progress.settings.soundEnabled;
          sound.enabled = next;
          if (next) sound.playButton();
          setProgress(prev => ({
            ...prev,
            settings: { ...prev.settings, soundEnabled: next },
          }));
        }}
        onGoHome={() => setCurrentScreen('home')}
        onGoSettings={() => setCurrentScreen('settings')}
        onGoLeaderboard={() => setCurrentScreen('leaderboard')}
        onGoWithdraw={() => setCurrentScreen('withdraw')}
        currentScreen={currentScreen}
      />

      {/* Screen Routing */}
      <main className="flex-1 flex flex-col justify-between">
        {currentScreen === 'home' && (
          <HomeScreen
            progress={progress}
            onNavigate={setCurrentScreen}
            onStartLevel={handleStartLevel}
            onStartDaily={handleStartDaily}
          />
        )}

        {currentScreen === 'game' && activeLevel && (
          <GameBoard
            level={activeLevel}
            isDaily={isDailyActive}
            progress={progress}
            onVictory={handleLevelVictory}
            onExit={() => setCurrentScreen('levels')}
            onUseHint={handleUseHint}
            onRequestAdReward={type => setAdRewardModal({ isOpen: true, type })}
          />
        )}

        {currentScreen === 'levels' && (
          <LevelsScreen
            progress={progress}
            onSelectLevel={handleStartLevel}
            onBack={() => setCurrentScreen('home')}
          />
        )}

        {currentScreen === 'daily' && (
          <DailyChallengeScreen
            progress={progress}
            onStartDaily={handleStartDaily}
            onBack={() => setCurrentScreen('home')}
          />
        )}

        {currentScreen === 'how-to-play' && (
          <HowToPlayScreen
            onBack={() => setCurrentScreen('home')}
            onPlayNow={() => handleStartLevel(progress.currentLevel)}
          />
        )}

        {currentScreen === 'leaderboard' && (
          <LeaderboardScreen
            progress={progress}
            leaderboard={leaderboard}
            onUpdateProfile={handleUpdateProfile}
            onBack={() => setCurrentScreen('home')}
          />
        )}

        {currentScreen === 'settings' && (
          <SettingsScreen
            progress={progress}
            onUpdateSettings={newSettings =>
              setProgress(prev => ({ ...prev, settings: newSettings }))
            }
            onResetData={handleResetData}
            onTestAd={type => setAdRewardModal({ isOpen: true, type })}
            onBack={() => setCurrentScreen('home')}
          />
        )}

        {currentScreen === 'withdraw' && (
          <WithdrawalScreen
            progress={progress}
            onWithdraw={handleWithdraw}
            onSimulateApprove={handleSimulateApprove}
            onCancelRequest={handleCancelWithdrawal}
            onStartLevel={() => handleStartLevel(progress.currentLevel)}
            onStartDaily={handleStartDaily}
            onWatchAd={() => setAdRewardModal({ isOpen: true, type: 'coins' })}
            onBack={() => setCurrentScreen('home')}
          />
        )}
      </main>

      {/* Banner Ad Placement (Monetization readiness) */}
      {progress.settings.showBannerAds && currentScreen !== 'game' && (
        <BannerAd
          onAdClick={() => {
            sound.playButton();
            setAdRewardModal({ isOpen: true, type: 'coins' });
          }}
        />
      )}

      {/* Level Cleared Victory Celebration Modal */}
      {victoryData && (
        <VictoryModal
          levelId={victoryData.levelId}
          isDaily={victoryData.isDaily}
          timeElapsed={victoryData.timeElapsed}
          score={victoryData.score}
          stars={victoryData.stars}
          coinsEarned={victoryData.coinsEarned}
          hasNextLevel={!victoryData.isDaily && victoryData.levelId < 100}
          onNextLevel={handleNextLevel}
          onReplay={handleReplayLevel}
          onLevelsSelect={() => {
            setVictoryData(null);
            setCurrentScreen('levels');
          }}
        />
      )}

      {/* Rewarded Video Ad Modal Simulator */}
      {adRewardModal.isOpen && (
        <AdModal
          rewardType={adRewardModal.type}
          onRewardGranted={handleRewardGranted}
          onClose={() => setAdRewardModal({ isOpen: false, type: 'coins' })}
        />
      )}
    </div>
  );
}

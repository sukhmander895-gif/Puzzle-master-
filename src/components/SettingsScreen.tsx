import React, { useState } from 'react';
import { ArrowLeft, Volume2, VolumeX, Moon, Sun, Smartphone, Sparkles, Trash2, HelpCircle, ExternalLink, ShieldCheck, DollarSign } from 'lucide-react';
import { PlayerProgress } from '../types/game';
import { sound } from '../utils/audio';

interface SettingsScreenProps {
  progress: PlayerProgress;
  onUpdateSettings: (settings: PlayerProgress['settings']) => void;
  onResetData: () => void;
  onTestAd: (type: 'coins' | 'hints') => void;
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  progress,
  onUpdateSettings,
  onResetData,
  onTestAd,
  onBack,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showPublishGuide, setShowPublishGuide] = useState(false);

  const settings = progress.settings;

  const toggleSound = () => {
    const next = !settings.soundEnabled;
    sound.enabled = next;
    if (next) sound.playButton();
    onUpdateSettings({ ...settings, soundEnabled: next });
  };

  const toggleTheme = () => {
    sound.playButton();
    const next = settings.theme === 'dark' ? 'light' : 'dark';
    onUpdateSettings({ ...settings, theme: next });
  };

  const toggleBannerAds = () => {
    sound.playButton();
    onUpdateSettings({ ...settings, showBannerAds: !settings.showBannerAds });
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-3 flex flex-col justify-between min-h-[calc(100vh-3.5rem)] select-none animate-fadeIn">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
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

          <h2 className="text-sm font-black text-white">Settings</h2>
        </div>

        {/* 1. Audio & Visuals */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-3.5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Audio & Appearance
          </h3>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${settings.soundEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                {settings.soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </div>
              <div>
                <p className="text-xs font-bold text-white">Sound Effects</p>
                <p className="text-[10px] text-slate-400">Tactile moves & victory fanfare</p>
              </div>
            </div>

            <button
              onClick={toggleSound}
              className={`w-12 h-6.5 rounded-full p-1 transition-colors ${settings.soundEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}
            >
              <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${settings.soundEnabled ? 'translate-x-5.5' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${settings.theme === 'dark' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-amber-500/20 text-amber-400'}`}>
                {settings.theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
              </div>
              <div>
                <p className="text-xs font-bold text-white">App Theme</p>
                <p className="text-[10px] text-slate-400">
                  {settings.theme === 'dark' ? 'OLED Dark Mode' : 'Clean Light Mode'}
                </p>
              </div>
            </div>

            <button
              onClick={toggleTheme}
              className="px-3 py-1 text-xs font-bold rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:text-white"
            >
              {settings.theme === 'dark' ? 'Dark' : 'Light'}
            </button>
          </div>
        </div>

        {/* 2. Monetization & Ad Integration Readiness */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <DollarSign size={14} />
              <span>Monetization Setup</span>
            </div>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
              Code Ready
            </span>
          </div>

          <p className="text-xs text-slate-300">
            Fully prepared for Google AdSense, AdMob, and Unity Ads integration. Zero gambling or real-money gaming.
          </p>

          {/* Banner Ad Display Toggle */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="text-xs font-bold text-white">Banner Ad Placeholder</p>
              <p className="text-[10px] text-slate-400">Simulate bottom advertising slot</p>
            </div>

            <button
              onClick={toggleBannerAds}
              className={`w-12 h-6.5 rounded-full p-1 transition-colors ${settings.showBannerAds ? 'bg-amber-500' : 'bg-slate-700'}`}
            >
              <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${settings.showBannerAds ? 'translate-x-5.5' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Test Rewarded Video Ad */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
            <div>
              <p className="text-xs font-bold text-white">Test Rewarded Ad</p>
              <p className="text-[10px] text-slate-400">Earn +50 Coins or +2 Hints</p>
            </div>

            <button
              onClick={() => onTestAd('coins')}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30"
            >
              Test Ad
            </button>
          </div>
        </div>

        {/* 3. Free Running & Free Publishing Guide Modal Button */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle size={14} className="text-teal-400" />
              <span>Free Run & Publish Guide</span>
            </h3>
            <button
              onClick={() => {
                sound.playButton();
                setShowPublishGuide(!showPublishGuide);
              }}
              className="text-xs text-teal-400 font-bold hover:underline"
            >
              {showPublishGuide ? 'Hide' : 'Read Guide'}
            </button>
          </div>
          <p className="text-xs text-slate-300">
            Step-by-step instructions on running the app locally and publishing online completely free.
          </p>

          {showPublishGuide && (
            <div className="mt-3 pt-3 border-t border-slate-700/60 text-xs text-slate-300 space-y-3">
              <div>
                <h4 className="font-bold text-teal-300 mb-1">1. How to Run for Free Locally:</h4>
                <div className="p-2.5 rounded-lg bg-slate-900 font-mono text-[11px] text-slate-300 space-y-1">
                  <p># Clone or download files into a folder</p>
                  <p>npm install</p>
                  <p>npm run dev</p>
                  <p className="text-emerald-400"># Open http://localhost:3000</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-teal-300 mb-1">2. How to Publish Online for 100% Free:</h4>
                <ul className="list-disc pl-4 space-y-1 text-slate-300">
                  <li><strong>Vercel (Recommended):</strong> Push your code to GitHub, sign in to vercel.com for free, click "Import Repository" and deploy. You get a free HTTPS domain instantly!</li>
                  <li><strong>Netlify:</strong> Connect your repository or drag-and-drop the `dist` folder after running `npm run build`.</li>
                  <li><strong>GitHub Pages:</strong> In package.json set base: "./", run `npm run build` and deploy the `dist` folder to GitHub Pages for free static hosting.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-teal-300 mb-1">3. Future AdMob/AdSense Ads:</h4>
                <p className="text-slate-400">
                  To monetize, register a free Google AdSense or AdMob account, insert your Publisher ID in `index.html`, and replace the BannerAd/AdModal components with your live ad units.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 4. Danger Zone: Reset Data */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-rose-400">Reset All Progress</p>
              <p className="text-[10px] text-slate-400">Clears stars, coins, and level records</p>
            </div>

            <button
              onClick={() => {
                sound.playButton();
                setShowResetConfirm(true);
              }}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-300 hover:bg-rose-500/25 flex items-center gap-1"
            >
              <Trash2 size={13} />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xs bg-slate-900 border border-slate-700 rounded-2xl p-5 text-center shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Reset Progress?</h3>
            <p className="text-xs text-slate-400 mb-4">
              Are you sure? This will permanently delete your unlocked levels, earned stars, and coins on this device.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  sound.playButton();
                  onResetData();
                  setShowResetConfirm(false);
                }}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Yes, Reset
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="text-center text-[11px] text-slate-500 py-2">
        Puzzle Master v1.0.0 · Local & Offline Engine
      </footer>
    </div>
  );
};

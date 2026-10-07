import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Coins,
  Wallet,
  Clock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Gift,
  Send,
  HelpCircle,
  ExternalLink,
  Sparkles,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { PlayerProgress, WithdrawalRequest } from '../types/game';
import { sound } from '../utils/audio';

interface WithdrawalScreenProps {
  progress: PlayerProgress;
  onWithdraw: (request: WithdrawalRequest) => void;
  onSimulateApprove: (requestId: string) => void;
  onCancelRequest: (requestId: string, refundCoins: number) => void;
  onStartLevel: () => void;
  onStartDaily: () => void;
  onWatchAd: () => void;
  onBack: () => void;
}

type Currency = 'USD' | 'INR';

interface PayoutTier {
  coins: number;
  usdAmount: number;
  inrAmount: number;
}

const PAYOUT_TIERS: PayoutTier[] = [
  { coins: 200, usdAmount: 2.0, inrAmount: 160 },
  { coins: 500, usdAmount: 5.0, inrAmount: 400 },
  { coins: 1000, usdAmount: 10.0, inrAmount: 800 },
  { coins: 2500, usdAmount: 25.0, inrAmount: 2000 },
];

export const WithdrawalScreen: React.FC<WithdrawalScreenProps> = ({
  progress,
  onWithdraw,
  onSimulateApprove,
  onCancelRequest,
  onStartLevel,
  onStartDaily,
  onWatchAd,
  onBack,
}) => {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [selectedTier, setSelectedTier] = useState<PayoutTier>(PAYOUT_TIERS[0]);
  const [method, setMethod] = useState<'upi' | 'paypal' | 'google_play' | 'amazon' | 'bank'>('upi');
  const [accountInput, setAccountInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'request' | 'history'>('request');

  const minCoinsNeeded = PAYOUT_TIERS[0].coins;
  const hasEnoughCoins = progress.coins >= selectedTier.coins;
  const progressPercent = Math.min(100, Math.floor((progress.coins / minCoinsNeeded) * 100));

  // Placeholder text depending on payment method
  const getAccountPlaceholder = () => {
    switch (method) {
      case 'upi':
        return 'e.g. yourname@oksbi or 9876543210@paytm';
      case 'paypal':
        return 'e.g. paypal.email@example.com';
      case 'google_play':
        return 'e.g. your-email@gmail.com for code delivery';
      case 'amazon':
        return 'e.g. your-email@amazon.com for gift voucher';
      case 'bank':
        return 'e.g. Account Number & IFSC / Routing code';
    }
  };

  const getMethodTitle = () => {
    switch (method) {
      case 'upi':
        return 'UPI / GPay / PhonePe / Paytm';
      case 'paypal':
        return 'PayPal Transfer';
      case 'google_play':
        return 'Google Play Gift Card Code';
      case 'amazon':
        return 'Amazon Pay Gift Voucher';
      case 'bank':
        return 'Direct Bank Transfer (IMPS)';
    }
  };

  const handleSubmitWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (progress.coins < selectedTier.coins) {
      sound.playWarning();
      setErrorMsg(
        `Insufficient coins! You need ${selectedTier.coins} coins for this payout, but you currently have ${progress.coins} coins.`
      );
      return;
    }

    if (!accountInput.trim() || accountInput.trim().length < 4) {
      sound.playWarning();
      setErrorMsg('Please enter a valid payout account or email address.');
      return;
    }

    // Generate unique transaction reference
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const txnRef = `TXN-PM-${randomSuffix}`;

    const newRequest: WithdrawalRequest = {
      id: `wth-${Date.now()}`,
      method,
      accountDetails: accountInput.trim(),
      coinsSpent: selectedTier.coins,
      cashAmount: currency === 'USD' ? selectedTier.usdAmount : selectedTier.inrAmount,
      currency,
      status: 'pending',
      requestedAt: new Date().toLocaleString(),
      transactionRef: txnRef,
    };

    onWithdraw(newRequest);
    sound.playVictory();

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      // Confetti fallback
    }

    setSuccessMsg(`Withdrawal requested successfully! Ref: ${txnRef}`);
    setAccountInput('');
    setActiveTab('history');
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-3 flex flex-col justify-between min-h-[calc(100vh-3.5rem)] select-none animate-fadeIn">
      <div>
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
            <h2 className="text-sm font-black text-white">Payment Withdrawal</h2>
            <p className="text-[10px] text-slate-400">Cash Out Your Puzzle Coins</p>
          </div>
        </div>

        {/* Balance Card & Currency Toggle */}
        <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 border border-emerald-600/40 rounded-3xl p-4 mb-3 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-xl shadow-inner">
                🪙
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                  Redeemable Balance
                </span>
                <div className="text-xl font-black text-white flex items-center gap-1.5 leading-tight">
                  <span className="tabular-nums text-amber-300">{progress.coins}</span>
                  <span className="text-xs text-slate-400 font-normal">Coins</span>
                </div>
              </div>
            </div>

            {/* Currency Selector */}
            <div className="flex items-center gap-1 p-1 bg-slate-800/80 rounded-xl border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => {
                  sound.playButton();
                  setCurrency('USD');
                }}
                className={`px-2 py-0.5 rounded-lg font-bold transition-colors ${
                  currency === 'USD'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                USD ($)
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playButton();
                  setCurrency('INR');
                }}
                className={`px-2 py-0.5 rounded-lg font-bold transition-colors ${
                  currency === 'INR'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                INR (₹)
              </button>
            </div>
          </div>

          {/* Value Equivalent */}
          <div className="flex items-center justify-between pt-2 border-t border-emerald-900/40 text-xs">
            <span className="text-slate-400">Estimated Cash Value:</span>
            <span className="font-bold text-emerald-400 tabular-nums">
              {currency === 'USD'
                ? `$${(progress.coins * 0.01).toFixed(2)} USD`
                : `₹${(progress.coins * 0.8).toFixed(0)} INR`}
            </span>
          </div>

          {/* Minimum Threshold Progress Meter */}
          <div className="mt-2.5">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-slate-400">Minimum Payout Goal (200 Coins):</span>
              <span className="font-bold text-white tabular-nums">
                {progress.coins >= minCoinsNeeded ? 'Unlocked! ✓' : `${progress.coins} / ${minCoinsNeeded}`}
              </span>
            </div>
            <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden border border-slate-700/60">
              <div
                className={`h-full transition-all duration-500 ${
                  progress.coins >= minCoinsNeeded
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    : 'bg-gradient-to-r from-amber-500 to-emerald-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tab Switcher: Request Payout vs History */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-800/80 rounded-2xl border border-slate-700/60 mb-3 text-xs font-bold">
          <button
            onClick={() => {
              sound.playButton();
              setActiveTab('request');
            }}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'request'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            New Withdrawal
          </button>
          <button
            onClick={() => {
              sound.playButton();
              setActiveTab('history');
            }}
            className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'history'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>History</span>
            {progress.withdrawals.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px]">
                {progress.withdrawals.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: Withdrawal Request Form */}
        {activeTab === 'request' && (
          <form onSubmit={handleSubmitWithdrawal} className="space-y-3">
            {/* Step 1: Select Amount Tier */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                1. Select Payout Tier
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PAYOUT_TIERS.map(tier => {
                  const isSelected = selectedTier.coins === tier.coins;
                  const canAfford = progress.coins >= tier.coins;

                  return (
                    <button
                      key={tier.coins}
                      type="button"
                      onClick={() => {
                        sound.playButton();
                        setSelectedTier(tier);
                      }}
                      className={`p-2.5 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'bg-emerald-500/20 border-emerald-400 ring-2 ring-emerald-500/30'
                          : 'bg-slate-800/60 border-slate-700/70 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-extrabold text-white">
                          {currency === 'USD' ? `$${tier.usdAmount}.00` : `₹${tier.inrAmount}`}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            canAfford
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-slate-700 text-slate-400'
                          }`}
                        >
                          {tier.coins} 🪙
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        {canAfford ? 'Eligible for payout' : `Need ${tier.coins - progress.coins} more 🪙`}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Select Payment Method */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                2. Choose Payout Method
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    sound.playButton();
                    setMethod('upi');
                  }}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    method === 'upi'
                      ? 'bg-indigo-600/30 border-indigo-400 text-white font-bold'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
                  }`}
                >
                  <div className="text-base mb-0.5">⚡</div>
                  <span className="text-[11px] block leading-tight">UPI / GPay</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playButton();
                    setMethod('paypal');
                  }}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    method === 'paypal'
                      ? 'bg-blue-600/30 border-blue-400 text-white font-bold'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
                  }`}
                >
                  <div className="text-base mb-0.5">🅿️</div>
                  <span className="text-[11px] block leading-tight">PayPal</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playButton();
                    setMethod('google_play');
                  }}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    method === 'google_play'
                      ? 'bg-teal-600/30 border-teal-400 text-white font-bold'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
                  }`}
                >
                  <div className="text-base mb-0.5">🎮</div>
                  <span className="text-[11px] block leading-tight">Google Play</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playButton();
                    setMethod('amazon');
                  }}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    method === 'amazon'
                      ? 'bg-amber-600/30 border-amber-400 text-white font-bold'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
                  }`}
                >
                  <div className="text-base mb-0.5">🎁</div>
                  <span className="text-[11px] block leading-tight">Amazon Pay</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playButton();
                    setMethod('bank');
                  }}
                  className={`p-2 rounded-xl border text-center transition-all col-span-2 ${
                    method === 'bank'
                      ? 'bg-emerald-600/30 border-emerald-400 text-white font-bold'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
                  }`}
                >
                  <div className="text-base mb-0.5">🏦</div>
                  <span className="text-[11px] block leading-tight">Bank Transfer (IMPS)</span>
                </button>
              </div>
            </div>

            {/* Step 3: Payout Details Input */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                3. Enter {getMethodTitle()}
              </label>
              <input
                type="text"
                value={accountInput}
                onChange={e => setAccountInput(e.target.value)}
                placeholder={getAccountPlaceholder()}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Alerts */}
            {errorMsg && (
              <div className="p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-start gap-2">
                <AlertCircle size={15} className="text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={!hasEnoughCoins}
              className={`w-full h-13 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                hasEnoughCoins
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-emerald-950/40 active:scale-[0.98]'
                  : 'bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Send size={16} />
              <span>
                {hasEnoughCoins
                  ? `Withdraw ${currency === 'USD' ? `$${selectedTier.usdAmount}.00` : `₹${selectedTier.inrAmount}`} (${selectedTier.coins} Coins)`
                  : `Need ${selectedTier.coins - progress.coins} More Coins`}
              </span>
            </button>
          </form>
        )}

        {/* Tab 2: Withdrawal History & Tracking */}
        {activeTab === 'history' && (
          <div className="space-y-2.5">
            {successMsg && (
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {progress.withdrawals.length === 0 ? (
              <div className="text-center py-8 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50">
                <Wallet size={36} className="mx-auto text-slate-600 mb-2" />
                <h4 className="text-xs font-bold text-slate-300">No Withdrawals Yet</h4>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                  Play puzzle levels to earn coins and make your first withdrawal request!
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                {progress.withdrawals.map(item => {
                  const isPending = item.status === 'pending';
                  const isApproved = item.status === 'approved' || item.status === 'completed';

                  return (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white uppercase">
                              {item.method.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] text-slate-400">· {item.transactionRef}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 truncate max-w-[180px]">
                            {item.accountDetails}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-black text-emerald-400 tabular-nums">
                            {item.currency === 'USD' ? `$${item.cashAmount}.00` : `₹${item.cashAmount}`}
                          </span>
                          <span className="text-[10px] text-slate-400 block tabular-nums">
                            -{item.coinsSpent} 🪙
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-700/60 text-[11px]">
                        <span className="text-slate-400">{item.requestedAt}</span>

                        <div className="flex items-center gap-1.5">
                          {isPending ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1">
                              <Clock size={10} />
                              <span>Processing (est. 24h)</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                              <CheckCircle2 size={10} />
                              <span>Approved / Sent</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Simulator controls for instant developer/user test */}
                      {isPending && (
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              sound.playButton();
                              onCancelRequest(item.id, item.coinsSpent);
                            }}
                            className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20"
                          >
                            <XCircle size={10} />
                            <span>Cancel & Refund</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              sound.playVictory();
                              onSimulateApprove(item.id);
                            }}
                            className="text-[10px] text-teal-300 hover:text-teal-200 flex items-center gap-1 px-2 py-0.5 rounded bg-teal-500/15 border border-teal-500/30 font-bold"
                          >
                            <Sparkles size={10} />
                            <span>Fast-Approve (Demo)</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Boosters: How to earn coins fast */}
        <div className="mt-4 p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span>Need More Coins for Withdrawal?</span>
            <span className="text-amber-400 font-normal text-[11px]">Free & Unlimited</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-center">
            <button
              onClick={() => {
                sound.playButton();
                onStartLevel();
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs text-white"
            >
              <div className="text-sm mb-0.5">🧩</div>
              <span className="font-bold text-[10px] block">Play Levels</span>
              <span className="text-[9px] text-emerald-400">+25-40 🪙</span>
            </button>

            <button
              onClick={() => {
                sound.playButton();
                onStartDaily();
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs text-white"
            >
              <div className="text-sm mb-0.5">📅</div>
              <span className="font-bold text-[10px] block">Daily Challenge</span>
              <span className="text-[9px] text-amber-400">+100 🪙</span>
            </button>

            <button
              onClick={() => {
                sound.playButton();
                onWatchAd();
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs text-white"
            >
              <div className="text-sm mb-0.5">📺</div>
              <span className="font-bold text-[10px] block">Watch Sponsor</span>
              <span className="text-[9px] text-cyan-400">+50 🪙</span>
            </button>
          </div>
        </div>
      </div>

      {/* Fair Play Policy footer */}
      <footer className="text-center text-[10px] text-slate-500 pt-3 pb-1">
        Fair Play Reward System · Free to play · No purchase or gambling required
      </footer>
    </div>
  );
};

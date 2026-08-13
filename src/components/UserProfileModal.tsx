import React, { useState, useEffect } from 'react';
import {
  User,
  X,
  Shield,
  Sparkles,
  Check,
  Edit2,
  Flame,
  Target,
  BarChart2,
  RefreshCw,
  Award,
  Zap,
} from 'lucide-react';
import { UserProfile, AudioType } from '../types';
import { getLevelForXP, getNextLevelInfo } from '../lib/careerLevels';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  totalFocusBitsLogged: number;
  onOpenAnalytics: () => void;
  onManualSync: () => Promise<void>;
  onResetLevelXP?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  totalFocusBitsLogged,
  onOpenAnalytics,
  onManualSync,
  onResetLevelXP,
}) => {
  const currentProfile = profile || {
    name: 'Calm Focus Worker',
    roleTitle: 'Zero-Adrenaline Specialist',
    dailyGoalBits: 5,
    preferredNoise: 'brown',
    avatarEmoji: '🌸',
    totalBitsLogged: 12,
    streakDays: 4,
    panicGroundingPhrase: 'I am completely safe. 1 Focus Bit is enough for today.',
  };

  const [formData, setFormData] = useState<UserProfile>(currentProfile);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [showConfirmResetLevel, setShowConfirmResetLevel] = useState<boolean>(false);

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  if (!isOpen) return null;

  const xp = formData.xp || 0;
  const levelInfo = getLevelForXP(xp);
  const nextInfo = getNextLevelInfo(xp);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSyncClick = async () => {
    setIsSyncing(true);
    setSyncStatus('Syncing with Cloud...');
    try {
      await onManualSync();
      setSyncStatus('Synced successfully!');
    } catch {
      setSyncStatus('Sync complete!');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatus(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-pink-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl shadow-pink-500/10 space-y-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile Header */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-pink-100 border border-pink-300 flex items-center justify-center text-3xl shadow-sm shrink-0">
            {formData.avatarEmoji || '🌸'}
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">{formData.name || 'Calm Explorer'}</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${levelInfo.badgeColor}`}>
                <span>{levelInfo.emoji}</span>
                <span>Level {levelInfo.level}: {levelInfo.title}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Level XP Progress Bar Card */}
        <div className="p-4 bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 border border-pink-200 dark:border-slate-700 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
            <span className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-pink-500" />
              <span>Career Rank XP</span>
            </span>
            <span className="font-mono text-pink-600 dark:text-pink-400">{xp} XP</span>
          </div>

          {nextInfo.nextLevel ? (
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                <span>Next Rank: {nextInfo.nextLevel.title} {nextInfo.nextLevel.emoji}</span>
                <span>{nextInfo.xpNeeded} XP to go</span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-pink-500 rounded-full transition-all duration-500"
                  style={{ width: `${nextInfo.progressPercent}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-pink-600 dark:text-pink-400 font-bold">
              🌟 Max Rank Achieved! You have completely ascended!
            </p>
          )}

          {/* Reset Account Level Button & Dialogue */}
          <div className="pt-2 border-t border-pink-200/60 dark:border-slate-700/60 flex items-center justify-between">
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Reset Level & XP progression?</span>
            <button
              type="button"
              onClick={() => setShowConfirmResetLevel(true)}
              className="text-[10px] font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 underline cursor-pointer"
            >
              Reset Level
            </button>
          </div>
        </div>

        {/* Confirmation Modal Dialog for Resetting Level */}
        {showConfirmResetLevel && (
          <div className="p-4 bg-rose-50 dark:bg-slate-800 border border-rose-200 dark:border-rose-900/60 rounded-2xl space-y-3 animate-fadeIn">
            <div className="flex items-start gap-2.5">
              <div className="p-2 rounded-xl bg-rose-100 text-rose-600 font-bold shrink-0">⚠️</div>
              <div>
                <h4 className="text-xs font-black text-rose-800 dark:text-rose-200">Reset Account Level, Bits & Streaks?</h4>
                <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5 leading-relaxed">
                  Are you sure you want to reset your career rank to <strong>Level 1 (NEET)</strong>? This will reset your XP, total accumulated bits logged, and zero-dread streaks.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowConfirmResetLevel(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onResetLevelXP) {
                    onResetLevelXP();
                  } else {
                    onUpdateProfile({ ...formData, xp: 0, totalBitsLogged: 0, streakDays: 0 });
                  }
                  setShowConfirmResetLevel(false);
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                Yes, Reset Everything
              </button>
            </div>
          </div>
        )}

        {/* Analytics & Manual Cloud Sync Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onOpenAnalytics}
            className="p-3 bg-pink-50 hover:bg-pink-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-pink-200 dark:border-slate-700 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-pink-700 dark:text-pink-300 cursor-pointer transition-all shadow-xs"
          >
            <BarChart2 className="w-4 h-4 text-pink-500" />
            <span>Open Analytics & Graphs</span>
          </button>

          <button
            onClick={handleSyncClick}
            disabled={isSyncing}
            className="p-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-indigo-200 dark:border-slate-700 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 cursor-pointer transition-all shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 text-indigo-500 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
          </button>
        </div>

        {syncStatus && (
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 text-indigo-700 dark:text-indigo-300 text-xs font-semibold text-center animate-fadeIn">
            {syncStatus}
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3 bg-slate-50/80 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-300">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Total Focus Bits</p>
              <p className="text-sm font-black text-slate-800 dark:text-slate-100 font-mono">{totalFocusBitsLogged}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-300">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Zero-Dread Streak</p>
              <p className="text-sm font-black text-slate-800 dark:text-slate-100 font-mono">{formData.streakDays || 1} Days</p>
            </div>
          </div>
        </div>

        {/* Form or Read View */}
        {!isEditing ? (
          <div className="space-y-4">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Daily Target:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{formData.dailyGoalBits} Focus Bits/day</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Preferred Sound:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">{formData.preferredNoise}</span>
              </div>
              <div className="py-1.5 border-b border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-slate-500 block">Personal Grounding Anchor:</span>
                <p className="font-medium text-slate-700 dark:text-slate-300 italic bg-pink-50/60 dark:bg-slate-800 p-2.5 rounded-xl border border-pink-100 dark:border-slate-700">
                  "{formData.panicGroundingPhrase || 'I am safe in my body. Lowering the bar.'}"
                </p>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="w-full py-2.5 bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-pink-500/20"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit Profile & Preferences</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">Display Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-pink-500 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">Role Title</label>
                <input
                  type="text"
                  value={formData.roleTitle}
                  onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-pink-500 font-medium"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">Avatar Emoji</label>
                <input
                  type="text"
                  value={formData.avatarEmoji}
                  onChange={(e) => setFormData({ ...formData, avatarEmoji: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-pink-500 font-medium text-center"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Daily Focus Bits Target (1 = Crisis Survival, 12 = Excellent Day)
              </label>
              <div className="flex gap-2 mb-2">
                {[
                  { count: 1, label: '1 (Crisis 🆘)' },
                  { count: 3, label: '3 (Flow 🌿)' },
                  { count: 5, label: '5 (Steady ⚖️)' },
                  { count: 8, label: '8 (Velocity 🚀)' },
                  { count: 12, label: '12 (Peak 🌟)' },
                ].map((preset) => (
                  <button
                    key={preset.count}
                    type="button"
                    onClick={() => setFormData({ ...formData, dailyGoalBits: preset.count })}
                    className={`flex-1 py-1 px-1.5 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                      formData.dailyGoalBits === preset.count
                        ? 'bg-pink-500 text-white border-pink-500 shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-pink-300'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="1"
                max="50"
                value={formData.dailyGoalBits}
                onChange={(e) => setFormData({ ...formData, dailyGoalBits: parseInt(e.target.value) || 1 })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-pink-500 font-medium font-mono"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                1 bit is a total victory during executive freeze or meltdown. 12 bits is an outstanding, top-tier day.
              </p>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">Grounding Phrase</label>
              <textarea
                rows={2}
                value={formData.panicGroundingPhrase}
                onChange={(e) => setFormData({ ...formData, panicGroundingPhrase: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-pink-500 font-medium resize-none"
              />
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="w-1/2 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-1/2 py-2 bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-pink-500/20"
              >
                <Check className="w-4 h-4" />
                <span>Save Profile</span>
              </button>
            </div>
          </form>
        )}

        {savedSuccess && (
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold text-center animate-fadeIn">
            ✨ Profile updated successfully!
          </div>
        )}
      </div>
    </div>
  );
};

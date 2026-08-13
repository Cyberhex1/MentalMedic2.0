import React, { useState } from 'react';
import {
  X,
  TrendingUp,
  BarChart2,
  Calendar,
  Sparkles,
  Zap,
  Activity,
  Award,
  CheckCircle2,
  Lock,
  ChevronDown,
  ChevronUp,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { UserProfile, SymptomLog, SessionLog, TodoItem } from '../types';
import { CAREER_LEVELS, getLevelForXP, getNextLevelInfo } from '../lib/careerLevels';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  symptomLogs: SymptomLog[];
  sessionLogs: SessionLog[];
  todos: TodoItem[];
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  symptomLogs,
  sessionLogs,
  todos,
}) => {
  const [showRankPreview, setShowRankPreview] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentXp = userProfile.xp || 0;
  const levelInfo = getLevelForXP(currentXp);
  const nextInfo = getNextLevelInfo(currentXp);

  // Generate 7-day activity data for the chart
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const activityData = days.map((day, idx) => {
    const bits = Math.max(1, Math.round((userProfile.totalBitsLogged || 10) / 7 + (idx % 3)));
    const energy = Math.min(100, Math.max(20, 80 - (idx * 5) + (idx % 2 === 0 ? 15 : -10)));
    const xpGained = bits * 25;
    return {
      day,
      bits,
      energy,
      xpGained,
    };
  });

  // Calculate symptom distribution
  const symptomCounts: Record<string, number> = {};
  symptomLogs.forEach((log) => {
    symptomCounts[log.symptomName] = (symptomCounts[log.symptomName] || 0) + 1;
  });

  const pieData = Object.keys(symptomCounts).length > 0
    ? Object.entries(symptomCounts).map(([name, count]) => ({ name, value: count }))
    : [
        { name: 'Executive Dysfunction', value: 4 },
        { name: 'Sensory Overload', value: 3 },
        { name: 'Autistic Burnout', value: 2 },
        { name: 'Hyperfocus Exhaustion', value: 2 },
      ];

  const COLORS = ['#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  const SOMATIC_BADGES = [
    {
      id: 'crisis_conqueror',
      icon: '🆘',
      title: 'Crisis Conqueror',
      desc: 'Completed a 1-Bit task during paralysis or low battery.',
      unlocked: (userProfile.totalBitsLogged || 0) > 0,
    },
    {
      id: 'zero_dread',
      icon: '🌿',
      title: 'Zero-Dread Champion',
      desc: 'Maintained a multi-day streak of zero-adrenaline focus.',
      unlocked: (userProfile.streakDays || 0) >= 1,
    },
    {
      id: 'soundscape',
      icon: '🎧',
      title: 'Soundscape Maestro',
      desc: 'Layered multiple ambient tracks in the studio mixer.',
      unlocked: (userProfile.activeSoundscapes && userProfile.activeSoundscapes.length >= 2) || (userProfile.totalBitsLogged || 0) >= 2,
    },
    {
      id: 'self_compassion',
      icon: '🩺',
      title: 'Self-Compassion Advocate',
      desc: 'Logged somatic symptom check-ins to protect health boundaries.',
      unlocked: symptomLogs.length >= 1,
    },
    {
      id: 'deep_reset',
      icon: '🫁',
      title: 'Deep Somatic Reset',
      desc: 'Completed breathing pacer or grounding exercises.',
      unlocked: currentXp >= 100,
    },
    {
      id: 'flow_master',
      icon: '🧘',
      title: 'Somatic Yoga Initiate',
      desc: 'Engaged with adaptive yoga or mindfulness routines.',
      unlocked: currentXp >= 250,
    },
  ];

  const achievedBadgesCount = SOMATIC_BADGES.filter((b) => b.unlocked).length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-pink-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-pink-500 text-white rounded-2xl shadow-md shadow-pink-500/20">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span>Personal Productivity & Somatic Analytics</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300">
                  Level {levelInfo.level}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Visual metrics tracking your focus bits, energy dynamics, and career progression.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Career Role XP Header Banner */}
          <div className={`p-5 rounded-2xl border ${levelInfo.badgeColor} shadow-sm space-y-3`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{levelInfo.emoji}</span>
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold opacity-75 block">Current Official Career Rank</span>
                  <h4 className="text-base font-black">{levelInfo.title}</h4>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-75 block">Total Experience</span>
                  <span className="text-lg font-black font-mono">{currentXp} XP</span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowRankPreview((prev) => !prev)}
                  className="px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold border border-black/10 dark:border-white/10 flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5 text-pink-500" />
                  <span>{showRankPreview ? 'Hide Rank Progression' : 'Preview Achievable Ranks'}</span>
                  {showRankPreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Level XP Progress Bar */}
            {nextInfo.nextLevel && (
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px] font-bold opacity-90">
                  <span>Progress to Level {nextInfo.nextLevel.level}: {nextInfo.nextLevel.title} {nextInfo.nextLevel.emoji}</span>
                  <span>{nextInfo.progressPercent}% ({nextInfo.xpNeeded} XP needed)</span>
                </div>
                <div className="w-full h-2.5 bg-black/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-current rounded-full transition-all duration-500"
                    style={{ width: `${nextInfo.progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Achievable Ranks Full Preview List */}
          {showRankPreview && (
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Award className="w-4 h-4 text-pink-500" />
                  <span>All 18 Achievable Career Levels & Ascended Ranks</span>
                </h4>
                <span className="text-[10px] text-slate-400 font-bold">18 Total Ranks</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1">
                {CAREER_LEVELS.map((rank) => {
                  const isUnlocked = currentXp >= rank.xpRequired;
                  const isCurrent = levelInfo.level === rank.level;

                  return (
                    <div
                      key={rank.level}
                      className={`p-3 rounded-xl border transition-all flex items-start gap-3 ${
                        isCurrent
                          ? 'bg-pink-50 dark:bg-pink-950/40 border-pink-400 dark:border-pink-600 ring-2 ring-pink-500/20'
                          : isUnlocked
                          ? 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-800/60'
                          : 'bg-slate-100/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
                      }`}
                    >
                      <span className="text-2xl shrink-0 mt-0.5">{rank.emoji}</span>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-black uppercase text-slate-500">
                            Level {rank.level}
                          </span>

                          {isCurrent ? (
                            <span className="px-2 py-0.5 rounded-full bg-pink-500 text-white font-black text-[9px] uppercase tracking-wide">
                              Current Rank
                            </span>
                          ) : isUnlocked ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[9px] flex items-center gap-1">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Unlocked
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-[9px] flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" /> Locked
                            </span>
                          )}
                        </div>

                        <h5 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 truncate">
                          {rank.title}
                        </h5>

                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
                          <span>{rank.xpRequired.toLocaleString()} XP Required</span>
                        </div>

                        <p className="text-[10px] text-slate-500 dark:text-slate-400 italic line-clamp-2 leading-tight">
                          {rank.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Somatic Achievement Badges Section */}
          <div className="bg-gradient-to-br from-pink-50/50 via-purple-50/50 to-white dark:from-slate-800 dark:to-slate-900 border border-pink-200 dark:border-slate-700 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Award className="w-4 h-4 text-pink-500" />
                <span>Somatic Achievement & Milestone Badges</span>
              </h4>
              <span className="text-[10px] text-pink-600 font-bold bg-pink-100 dark:bg-pink-950 px-2.5 py-0.5 rounded-full border border-pink-200">
                {achievedBadgesCount} / {SOMATIC_BADGES.length} Unlocked
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
              {SOMATIC_BADGES.map((badge) => (
                <div
                  key={badge.id}
                  className={`p-3 rounded-xl border flex items-start gap-2.5 transition-all ${
                    badge.unlocked
                      ? 'bg-white dark:bg-slate-900 border-pink-300 dark:border-pink-800 shadow-2xs'
                      : 'bg-slate-100/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-50'
                  }`}
                >
                  <span className="text-2xl shrink-0 mt-0.5">{badge.icon}</span>
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1">
                      <h5 className="text-[11px] font-black text-slate-800 dark:text-slate-100 truncate">
                        {badge.title}
                      </h5>
                      {badge.unlocked && <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />}
                    </div>
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-tight">
                      {badge.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-pink-500 text-xs font-bold">
                <Sparkles className="w-4 h-4" />
                <span>Focus Bits Logged</span>
              </div>
              <p className="text-xl font-black font-mono text-slate-800 dark:text-slate-100">
                {userProfile.totalBitsLogged || 0}
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-purple-500 text-xs font-bold">
                <Zap className="w-4 h-4" />
                <span>Streak Days</span>
              </div>
              <p className="text-xl font-black font-mono text-slate-800 dark:text-slate-100">
                {userProfile.streakDays || 1} Days
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-blue-500 text-xs font-bold">
                <Activity className="w-4 h-4" />
                <span>Symptom Logs</span>
              </div>
              <p className="text-xl font-black font-mono text-slate-800 dark:text-slate-100">
                {symptomLogs.length}
              </p>
            </div>
          </div>

          {/* Chart 1: Focus Bits & XP Gain Over Time */}
          <div className="bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-pink-500" />
                <span>Weekly Focus Bits & XP Trend</span>
              </h4>
              <span className="text-[10px] text-slate-400 font-medium">Last 7 Days</span>
            </div>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="colorBits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="bits"
                    name="Focus Bits"
                    stroke="#ec4899"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorBits)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2 & 3: Energy Battery Trend & Symptom Pie */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Energy Battery Chart */}
            <div className="bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl space-y-2">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Cognitive Energy Levels (%)</span>
              </h4>

              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activityData}>
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="energy" name="Energy %" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Symptom Distribution Pie */}
            <div className="bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl space-y-2">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-purple-500" />
                <span>Symptom Distribution</span>
              </h4>

              <div className="h-44 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={60}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all"
          >
            Close Analytics
          </button>
        </div>
      </div>
    </div>
  );
};

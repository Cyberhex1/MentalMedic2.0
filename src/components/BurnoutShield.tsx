import React, { useState } from 'react';
import { ShieldCheck, Calendar, AlertTriangle, BatteryCharging, CheckCircle, Save, Flame } from 'lucide-react';
import { BurnoutPhase, BurnoutPhaseInfo, SessionLog } from '../types';

interface BurnoutShieldProps {
  logs: SessionLog[];
  onAddLog: (log: Omit<SessionLog, 'id' | 'timestamp' | 'date'>) => void;
  battery: number;
  totalTasksToday: number;
}

const BURNOUT_PHASES: BurnoutPhaseInfo[] = [
  {
    phase: 1,
    title: 'Month 1: Under-Perform On Purpose',
    daysRange: 'Days 1 - 30',
    color: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10',
    tagline: 'Cap daily output at 60% of maximum capacity.',
    description: 'You are rebuilding stamina after severe burnout. Resisting the urge to "impress" or work at 100% preserves your nervous system battery for long-term endurance.',
    rules: [
      'Cap daily work hours or task quotas strictly at 60%.',
      'Leave your desk while you still have energy remaining.',
      'Refuse to "make up for lost time" if you started late.',
    ],
  },
  {
    phase: 2,
    title: 'Month 2: Stabilization & Zero-Work Day',
    daysRange: 'Days 31 - 60',
    color: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
    tagline: 'Maintain exact steady pace. Enforce 1 mandatory zero-productivity day.',
    description: 'Avoid efficiency creep. As tasks become familiar, do not increase quota. Protect weekends or designated days off from all planning and productivity guilt.',
    rules: [
      'Keep output identical to Month 1.',
      'Schedule 1 mandatory 24-hour block with zero work or chores.',
      'Notice minor dread signals early before they escalate.',
    ],
  },
  {
    phase: 3,
    title: 'Month 3: The Critical Zone (Acute Dread)',
    daysRange: 'Days 61 - 90',
    color: 'text-rose-400 border-rose-500/40 bg-rose-500/10',
    tagline: 'Emergency Intervention: Halve your daily quota immediately.',
    description: 'This is where your past quit cycle occurs. When acute dread triggers, DO NOT QUIT. Halve your daily quota and rely 100% on Tab 2 (Micro-Bar). Outputting 30% beats quitting at 0%.',
    rules: [
      'Halve daily annotation quota immediately upon dread spike.',
      'Shift 100% to Tab 2 (3-Task Cap).',
      'Survival & keeping the job > maximum throughput.',
    ],
  },
];

export const BurnoutShield: React.FC<BurnoutShieldProps> = ({
  logs,
  onAddLog,
  battery,
  totalTasksToday,
}) => {
  const [activePhase, setActivePhase] = useState<BurnoutPhase>(1);
  const [effortRating, setEffortRating] = useState<'low' | 'standard' | 'high'>('low');
  const [logNotes, setLogNotes] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const phaseInfo = BURNOUT_PHASES.find((p) => p.phase === activePhase) || BURNOUT_PHASES[0];

  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    onAddLog({
      tasksCompleted: totalTasksToday,
      sprintsCount: Math.ceil(totalTasksToday / 5),
      energyEnd: battery,
      notes: logNotes || 'Session completed under low-arousal protocol.',
      effortRating,
    });
    setLogNotes('');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-bold text-slate-100">3-Month Burnout Defense System</h2>
        </div>
        <p className="text-sm text-slate-400">
          Deconstruct the 90-day resignation cycle by matching your daily output quota to your employment phase.
        </p>
      </div>

      {/* Employment Phase Selector */}
      <div>
        <label className="text-xs font-semibold text-slate-300 block mb-2">
          Select Your Current Employment Phase:
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {BURNOUT_PHASES.map((p) => (
            <button
              key={p.phase}
              onClick={() => setActivePhase(p.phase)}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                activePhase === p.phase
                  ? p.color + ' shadow-lg'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider block mb-1">
                {p.daysRange}
              </span>
              <h3 className="text-sm font-bold text-slate-100">{p.title}</h3>
              <p className="text-xs mt-1 opacity-80">{p.tagline}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Phase Operational Guidance */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Flame className="w-4 h-4 text-purple-400" />
            <span>{phaseInfo.title} Directives</span>
          </h3>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
            {phaseInfo.daysRange}
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">{phaseInfo.description}</p>

        <div className="space-y-2 pt-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Non-Negotiable Rules:
          </span>
          <div className="space-y-1.5">
            {phaseInfo.rules.map((rule, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span>{rule}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Save Current Shift Log Form */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-slate-200 mb-1 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-cyan-400" />
          <span>Save Today's Low-Arousal Shift Log</span>
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Recording your low-stakes progress builds a psychological record that work can be safe and bounded.
        </p>

        <form onSubmit={handleSaveLog} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block font-medium">Tasks Logged Today:</span>
              <span className="text-xl font-bold text-cyan-400">{totalTasksToday}</span>
            </div>

            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block font-medium">Energy Remaining:</span>
              <span className="text-xl font-bold text-emerald-400">{battery}%</span>
            </div>

            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block font-medium">Effort Rating:</span>
              <select
                value={effortRating}
                onChange={(e) => setEffortRating(e.target.value as 'low' | 'standard' | 'high')}
                className="bg-transparent text-slate-200 text-xs font-semibold outline-none mt-1 cursor-pointer w-full"
              >
                <option value="low" className="bg-slate-900">Low Arousal (Gentle)</option>
                <option value="standard" className="bg-slate-900">Standard Pace</option>
                <option value="high" className="bg-slate-900">Heavy Load</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Shift Notes / Somatic Observations:</label>
            <input
              type="text"
              placeholder="e.g. Felt dread at 2 PM, used Brown noise and 3-task cap to finish..."
              value={logNotes}
              onChange={(e) => setLogNotes(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-cyan-500/50 transition-colors"
            />
          </div>

          <div className="flex items-center justify-between">
            {savedSuccess ? (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Shift Log Saved to Local Storage!
              </span>
            ) : (
              <span />
            )}

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(192,132,252,0.3)] transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Shift Log</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

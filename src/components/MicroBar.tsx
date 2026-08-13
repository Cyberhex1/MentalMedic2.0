import React, { useState } from 'react';
import { Target, Check, RefreshCw, Award, ArrowRight, AlertCircle, ShieldAlert } from 'lucide-react';

interface MicroBarProps {
  onLogTask: () => void;
  onDrainBattery: (amt: number) => void;
  onAdvanceToSprint: () => void;
}

export const MicroBar: React.FC<MicroBarProps> = ({ onLogTask, onDrainBattery, onAdvanceToSprint }) => {
  const [targetCap, setTargetCap] = useState<number>(3);
  const [completedList, setCompletedList] = useState<boolean[]>([false, false, false]);
  const [effortLevel, setEffortLevel] = useState<'60' | '80' | '100'>('60');

  const handleCapChange = (cap: number) => {
    setTargetCap(cap);
    setCompletedList(new Array(cap).fill(false));
  };

  const toggleTaskCard = (index: number) => {
    const next = [...completedList];
    const isNowCompleted = !next[index];
    next[index] = isNowCompleted;
    setCompletedList(next);

    if (isNowCompleted) {
      onLogTask();
      onDrainBattery(4);
    }
  };

  const resetBatch = () => {
    setCompletedList(new Array(targetCap).fill(false));
  };

  const completedCount = completedList.filter(Boolean).length;
  const isTargetMet = completedCount >= targetCap;

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Target className="w-5 h-5 text-emerald-400" />
          <h2 className="text-xl font-bold text-slate-100">The Absurdly Low Safety Bar</h2>
        </div>
        <p className="text-sm text-slate-400">
          Lower task activation friction to near-zero. You are only committing to doing <strong>{targetCap} annotations</strong>. Once done, you have 100% permission to quit.
        </p>
      </div>

      {/* Target Cap Selector & Quality Permission Slider */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cap Selector */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <label className="text-xs font-semibold text-slate-300 block mb-2">
            1. Select Micro-Target Cap:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[3, 5, 10].map((num) => (
              <button
                key={num}
                onClick={() => handleCapChange(num)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  targetCap === num
                    ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(52,211,153,0.3)]'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {num} Tasks {num === 3 ? '(Emergency)' : num === 5 ? '(Light)' : '(Standard)'}
              </button>
            ))}
          </div>
        </div>

        {/* Perfectionism Permission */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <label className="text-xs font-semibold text-slate-300 block mb-2 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            2. Perfectionism Defense (Effort Cap):
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['60', '80', '100'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setEffortLevel(lvl)}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                  effortLevel === lvl
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {lvl}% Effort {lvl === '60' ? '(Crappy OK)' : lvl === '80' ? '(Good Enough)' : '(Full)'}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {effortLevel === '60'
              ? '60% Effort: "I give myself permission to complete these tasks with B- minus quality. Done is better than perfect."'
              : effortLevel === '80'
              ? '80% Effort: Good enough quality without agonizing over edge cases.'
              : '100% Effort: Standard detail.'}
          </p>
        </div>
      </div>

      {/* Interactive Task Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Current Micro-Batch Progress
          </span>
          <span className="text-sm font-bold text-emerald-400">
            {completedCount} / {targetCap} Completed
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {completedList.map((isDone, idx) => (
            <div
              key={idx}
              onClick={() => toggleTaskCard(idx)}
              className={`p-4 rounded-xl border text-center cursor-pointer transition-all ${
                isDone
                  ? 'bg-emerald-950/30 border-emerald-500/60 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.15)]'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-200'
              }`}
            >
              <div className="flex justify-center mb-1">
                {isDone ? (
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-400">
                    <Check className="w-5 h-5 text-emerald-400" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-400 text-sm">
                    #{idx + 1}
                  </div>
                )}
              </div>
              <span className="text-xs font-semibold block mt-2">
                {isDone ? 'Finished' : `Annotation ${idx + 1}`}
              </span>
              <span className="text-[10px] text-slate-500 block">
                {isDone ? 'Logged' : 'Click when done'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Permission to Quit Banner */}
      {isTargetMet && (
        <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-2xl p-6 text-center space-y-4 shadow-[0_0_30px_rgba(52,211,153,0.15)] animate-fadeIn">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center mx-auto text-emerald-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-emerald-300">Target Reached! Permission to Quit Granted 🎉</h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto mt-1">
              You fulfilled your commitment of {targetCap} items. You have complete, unassailable permission to close your laptop and stop now with zero guilt.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              onClick={resetBatch}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset & Do {targetCap} More</span>
            </button>

            <button
              onClick={onAdvanceToSprint}
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(56,189,248,0.3)]"
            >
              <span>Feeling Okay? Switch to 10/3 Micro-Sprint</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Low-Arousal Rules Reminder */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-start gap-3 text-xs text-slate-400">
        <AlertCircle className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
        <div>
          <strong className="text-slate-300 block font-semibold mb-0.5">The Low-Arousal Rule:</strong>
          If you feel resistance mid-task, reduce the scope further. You can stop after 1 item if your nervous system signals overload. Safety always precedes output.
        </div>
      </div>
    </div>
  );
};

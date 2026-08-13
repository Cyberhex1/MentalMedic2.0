import React, { useState } from 'react';
import { Heart, ShieldCheck, Sparkles, Check, Play, RefreshCw, Volume2, ShieldAlert, Activity, UserCheck } from 'lucide-react';
import { GroundingStep, SessionLog, BurnoutPhaseInfo } from '../types';
import { audioSynth } from '../lib/audioSynth';

interface SomaticMindsetTabProps {
  onCompleteUnfreeze?: () => void;
  logs?: SessionLog[];
}

const INITIAL_GROUNDING_STEPS: GroundingStep[] = [
  {
    id: '5-see',
    title: '5-See (Visual Orientation)',
    instruction: 'Look around your room without moving your head rapidly.',
    detail: 'Name 5 physical objects with high detail (e.g. "blue coffee cup", "textured wood grain").',
    completed: false,
  },
  {
    id: '4-feel',
    title: '4-Touch (Tactile Anchor)',
    instruction: 'Notice 4 physical touch points right now.',
    detail: 'Feel your feet flat on the floor, your back pressed against the chair, air on skin.',
    completed: false,
  },
  {
    id: '3-hear',
    title: '3-Hear (Auditory Grounding)',
    instruction: 'Close your eyes and listen closely for 3 distinct sounds.',
    detail: 'Listen to the ambient noise synth, computer fan, or distant wind.',
    completed: false,
  },
  {
    id: '2-smell',
    title: '2-Smell/Taste (Somatic Sense)',
    instruction: 'Notice 2 subtle scents or tastes.',
    detail: 'Take a slow breath in. Notice coffee, tea, or clean air.',
    completed: false,
  },
  {
    id: '1-breath',
    title: '1-Exhale (Vagus Nerve Reset)',
    instruction: 'Perform one deep, slow physiological sigh.',
    detail: 'Inhale twice quickly through the nose, then exhale slowly through the mouth.',
    completed: false,
  },
];

const BODY_SCAN_ITEMS = [
  { id: 'forehead', label: 'Unclench Forehead & Eyebrows', detail: 'Smooth out frowning muscles, relax eyelids.' },
  { id: 'jaw', label: 'Drop Jaw & Separate Teeth', detail: 'Let tongue rest gently behind top front teeth.' },
  { id: 'shoulders', label: 'Drop Shoulders Away from Ears', detail: 'Inhale up, roll back, exhale completely down.' },
  { id: 'belly', label: 'Soften Stomach & Belly Muscles', detail: 'Allow abdomen to expand naturally on in-breath.' },
  { id: 'hands', label: 'Unclench Fists & Palms', detail: 'Let fingers rest softly on desk or lap.' },
  { id: 'feet', label: 'Press Both Soles Flat to Ground', detail: 'Feel solid support beneath you.' },
];

const BURNOUT_PHASES: BurnoutPhaseInfo[] = [
  {
    phase: 1,
    title: 'Acute Crisis Stabilization',
    daysRange: 'Days 1 - 14',
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    tagline: 'Absolute Zero Adrenaline Guarantee',
    description: 'Your nervous system is currently hyper-aroused. Output is capped to micro-sprints.',
    rules: [
      'Maximum 3 Focus Bits total per shift.',
      'Mandatory 3-minute physiological rest between every 10-min sprint.',
      'Zero strict deadlines allowed.',
    ],
  },
  {
    phase: 2,
    title: 'Gentle Pacing Reconstruction',
    daysRange: 'Days 15 - 45',
    color: 'bg-pink-50 text-pink-700 border-pink-200',
    tagline: 'Controlled Capacity Expansion',
    description: 'Rebuilding cognitive stamina slowly without triggering freeze states.',
    rules: [
      'Target 5 - 8 Focus Bits per day.',
      'Practice 1-3-5 Rule (1 Big, 3 Medium, 5 Focus Bits).',
      'Hydrate & perform somatic stretch after each block.',
    ],
  },
  {
    phase: 3,
    title: 'Sustainable Engine Flow',
    daysRange: 'Days 46 - 90',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    tagline: 'Autonomous Calm Productivity',
    description: 'Operating in smooth, sustainable flow with built-in burnout shields.',
    rules: [
      'Flexible sprint durations with automatic break prompts.',
      'Log weekly health & symptom trends.',
      'Maintain zero-adrenaline baseline.',
    ],
  },
];

export const SomaticMindsetTab: React.FC<SomaticMindsetTabProps> = ({ onCompleteUnfreeze }) => {
  const [subView, setSubView] = useState<'unfreeze' | 'bodyscan' | 'defense'>('unfreeze');
  const [steps, setSteps] = useState<GroundingStep[]>(INITIAL_GROUNDING_STEPS);
  const [bodyChecklist, setBodyChecklist] = useState<Record<string, boolean>>({});
  const [breathCount, setBreathCount] = useState<number>(0);
  const [isBreathing, setIsBreathing] = useState<boolean>(false);

  const toggleStep = (id: string) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  };

  const toggleBodyItem = (id: string) => {
    setBodyChecklist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = steps.filter((s) => s.completed).length;

  const triggerBreathCycle = () => {
    setIsBreathing(true);
    audioSynth.playChime();
    setTimeout(() => {
      setBreathCount((c) => c + 1);
      setIsBreathing(false);
    }, 4000);
  };

  return (
    <div className="space-y-6 min-w-0 max-w-full overflow-hidden animate-fadeIn">
      {/* Sub Header Navigation */}
      <div className="flex flex-wrap items-center justify-between border-b border-pink-100/60 dark:border-slate-800 pb-3 gap-2">
        <div className="flex flex-wrap gap-2 min-w-0 max-w-full">
          <button
            onClick={() => setSubView('unfreeze')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subView === 'unfreeze'
                ? 'bg-gradient-to-r from-pink-400 to-rose-400 text-white shadow-sm'
                : 'bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Heart className="w-4 h-4 text-pink-100" />
            <span>5-4-3-2-1 Somatic Unfreeze</span>
          </button>

          <button
            onClick={() => setSubView('bodyscan')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subView === 'bodyscan'
                ? 'bg-gradient-to-r from-pink-400 to-rose-400 text-white shadow-sm'
                : 'bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4 text-pink-100" />
            <span>Somatic Body Scan</span>
          </button>

          <button
            onClick={() => setSubView('defense')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subView === 'defense'
                ? 'bg-gradient-to-r from-pink-400 to-rose-400 text-white shadow-sm'
                : 'bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-pink-100" />
            <span>90-Day Burnout Shield</span>
          </button>
        </div>

        <span className="text-[11px] font-medium text-slate-400 hidden lg:inline">
          Nervous System Safety First
        </span>
      </div>

      {subView === 'unfreeze' && (
        <div className="space-y-5 min-w-0 max-w-full">
          {/* Gentle Unfreeze Overview Banner */}
          <div className="bg-gradient-to-r from-pink-50/60 via-purple-50/40 to-slate-50 dark:from-slate-800 dark:to-slate-900 border border-pink-100/80 dark:border-slate-800 rounded-3xl p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xs">
            <div className="space-y-1.5 text-center md:text-left min-w-0">
              <span className="text-[10px] font-bold tracking-wider text-pink-600 dark:text-pink-300 bg-pink-100/80 dark:bg-pink-950/60 px-3 py-1 rounded-full border border-pink-200/60">
                🌱 Somatic Grounding Practice
              </span>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                5-4-3-2-1 Executive Unfreeze
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed">
                If you feel frozen or overwhelmed, pause and follow these 5 sensory touchpoints. They softly remind your nervous system that you are safe in this present moment.
              </p>
            </div>

            <div className="bg-white/90 dark:bg-slate-800/90 px-5 py-3 rounded-2xl border border-pink-200/60 dark:border-slate-700 text-center shadow-2xs shrink-0">
              <span className="text-[10px] font-medium text-slate-400 block">Grounding Progress</span>
              <span className="text-lg font-black text-pink-500 font-mono">
                {completedCount} / {steps.length}
              </span>
            </div>
          </div>

          {/* Soothing Vagus Nerve Breath Pacer */}
          <div className="bg-white/80 dark:bg-slate-800/60 border border-pink-100 dark:border-slate-800 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-3 rounded-2xl bg-pink-50 dark:bg-pink-950/40 text-pink-500 shrink-0">
                <Volume2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  Vagus Nerve Reset Pacer
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  Take a 4-second slow physiological sigh with solfeggio chime tones.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                {breathCount} Sighs
              </span>
              <button
                onClick={triggerBreathCycle}
                disabled={isBreathing}
                className="px-4 py-2 bg-pink-400 hover:bg-pink-500 disabled:opacity-50 text-white font-bold text-xs rounded-2xl flex items-center gap-2 transition-all cursor-pointer shadow-sm shadow-pink-400/20"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isBreathing ? 'animate-spin' : ''}`} />
                <span>{isBreathing ? 'Inhale... Exhale...' : 'Take Physiological Sigh'}</span>
              </button>
            </div>
          </div>

          {/* Grounding Steps List */}
          <div className="space-y-2.5">
            {steps.map((step) => (
              <div
                key={step.id}
                onClick={() => toggleStep(step.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  step.completed
                    ? 'bg-pink-50/50 dark:bg-pink-950/20 border-pink-200/80 dark:border-pink-900/40'
                    : 'bg-white dark:bg-slate-800/60 border-slate-100 dark:border-slate-800 hover:border-pink-200/60'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    step.completed
                      ? 'bg-pink-400 border-pink-400 text-white'
                      : 'border-slate-300 dark:border-slate-600 text-transparent'
                  }`}
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>

                <div className="space-y-0.5 min-w-0">
                  <h4
                    className={`text-xs font-bold ${
                      step.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-100'
                    }`}
                  >
                    {step.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{step.instruction}</p>
                  <p className="text-[11px] text-pink-500 dark:text-pink-400 italic font-medium">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>

          {completedCount === steps.length && (
            <div className="p-5 rounded-3xl bg-gradient-to-r from-pink-400 to-purple-400 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md shadow-pink-400/20 animate-fadeIn">
              <div>
                <h4 className="text-sm font-bold">✨ Nervous System Grounded</h4>
                <p className="text-xs text-pink-100 mt-0.5">
                  Your body acknowledges physical safety. Ready to complete 1 small Focus Bit?
                </p>
              </div>
              {onCompleteUnfreeze && (
                <button
                  onClick={onCompleteUnfreeze}
                  className="px-4 py-2 bg-white text-pink-600 font-bold text-xs rounded-2xl hover:bg-pink-50 transition-all shrink-0 cursor-pointer shadow-2xs"
                >
                  Go to Focus Bits To-Do →
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {subView === 'bodyscan' && (
        <div className="space-y-5 min-w-0 max-w-full">
          <div className="bg-white/80 dark:bg-slate-800/60 border border-pink-100 dark:border-slate-800 rounded-3xl p-5 space-y-1">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-pink-500" />
              <span>Somatic Tension Release Scan</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Task dread often manifests physically in muscle bracing. Softly unclench these 6 tension points to signal safety.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {BODY_SCAN_ITEMS.map((item) => {
              const isChecked = !!bodyChecklist[item.id];
              return (
                <div
                  key={item.id}
                  onClick={() => toggleBodyItem(item.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                    isChecked
                      ? 'bg-pink-50/50 dark:bg-pink-950/20 border-pink-200/80'
                      : 'bg-white dark:bg-slate-800/60 border-slate-100 dark:border-slate-800 hover:border-pink-200/60'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                      isChecked ? 'bg-pink-400 border-pink-400 text-white' : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>

                  <div className="min-w-0">
                    <h4 className={`text-xs font-bold ${isChecked ? 'text-pink-600 dark:text-pink-400' : 'text-slate-800 dark:text-slate-100'}`}>
                      {item.label}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {subView === 'defense' && (
        <div className="space-y-5 min-w-0 max-w-full">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">90-Day Burnout Shield</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              A structured, long-term protocol designed to rebuild executive stamina without triggering panic cycles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {BURNOUT_PHASES.map((phase) => (
              <div
                key={phase.phase}
                className={`p-5 rounded-3xl border space-y-3 bg-white dark:bg-slate-800/60 shadow-2xs hover:shadow-sm transition-all ${phase.color}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/80 dark:bg-slate-700">
                    Phase {phase.phase}
                  </span>
                  <span className="text-[11px] font-bold">{phase.daysRange}</span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{phase.title}</h4>
                  <p className="text-[11px] font-semibold text-pink-600 dark:text-pink-400 mt-0.5">{phase.tagline}</p>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{phase.description}</p>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 space-y-1.5 text-xs text-slate-700 dark:text-slate-200">
                  <p className="font-bold text-[11px] text-slate-800 dark:text-slate-100">Phase Guidelines:</p>
                  {phase.rules.map((rule, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-[11px]">
                      <span className="text-pink-400 font-bold">•</span>
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

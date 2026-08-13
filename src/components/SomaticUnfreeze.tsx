import React, { useState, useEffect } from 'react';
import { Heart, Wind, ShieldCheck, ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import { GroundingStep } from '../types';

interface SomaticUnfreezeProps {
  onCompleteUnfreeze: () => void;
}

const INITIAL_GROUNDING_STEPS: GroundingStep[] = [
  {
    id: 'feet',
    title: 'Physical Grounding (60s)',
    instruction: 'Press both feet hard into the floor.',
    detail: 'Feel the solid pressure pushing back. Let your body recognize you are grounded and safe.',
    completed: false,
  },
  {
    id: 'jaw',
    title: 'Unclench Jaw & Drop Shoulders',
    instruction: 'Release muscle tension completely.',
    detail: 'Slump forward slightly, unhinge your teeth, and let your head feel heavy for 3 long exhales.',
    completed: false,
  },
  {
    id: 'sensory',
    title: 'De-escalate Visual & Audio Load',
    instruction: 'Dim screen brightness & turn on Brown Noise.',
    detail: 'High brightness triggers sympathetic nervous arousal. Lower brightness by 30%.',
    completed: false,
  },
  {
    id: 'anchor',
    title: 'Threat Decoupling Anchor',
    instruction: 'Repeat: "I am only opening the tab."',
    detail: 'Tell your nervous system: "I am not committing to 8 hours of work. I am only completing 1 single click."',
    completed: false,
  },
];

export const SomaticUnfreeze: React.FC<SomaticUnfreezeProps> = ({ onCompleteUnfreeze }) => {
  const [steps, setSteps] = useState<GroundingStep[]>(INITIAL_GROUNDING_STEPS);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold (Full)' | 'Exhale' | 'Hold (Empty)'>('Inhale');
  const [breathCountdown, setBreathCountdown] = useState<number>(4);
  const [isBreathingActive, setIsBreathingActive] = useState<boolean>(true);

  // 4-4-4-4 Box Breathing loop
  useEffect(() => {
    if (!isBreathingActive) return;

    const timer = setInterval(() => {
      setBreathCountdown((prev) => {
        if (prev > 1) return prev - 1;

        // Advance phase when countdown reaches 1 -> 0
        setBreathPhase((currentPhase) => {
          if (currentPhase === 'Inhale') return 'Hold (Full)';
          if (currentPhase === 'Hold (Full)') return 'Exhale';
          if (currentPhase === 'Exhale') return 'Hold (Empty)';
          return 'Inhale';
        });
        return 4; // Reset countdown to 4
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isBreathingActive]);

  const toggleStep = (id: string) => {
    setSteps((prev) =>
      prev.map((step) => (step.id === id ? { ...step, completed: !step.completed } : step))
    );
  };

  const completedCount = steps.filter((s) => s.completed).length;

  const getBreathCircleScale = () => {
    if (breathPhase === 'Inhale') return 'scale-125 border-cyan-400/80 bg-cyan-500/10 shadow-[0_0_40px_rgba(56,189,248,0.25)]';
    if (breathPhase === 'Hold (Full)') return 'scale-125 border-purple-400/80 bg-purple-500/10 shadow-[0_0_40px_rgba(192,132,252,0.25)]';
    if (breathPhase === 'Exhale') return 'scale-90 border-emerald-400/80 bg-emerald-500/10 shadow-[0_0_20px_rgba(52,211,153,0.15)]';
    return 'scale-90 border-slate-600 bg-slate-800/20';
  };

  return (
    <div className="space-y-6">
      {/* View Title & Description */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Heart className="w-5 h-5 text-rose-400" />
          <h2 className="text-xl font-bold text-slate-100">Somatic Reset & De-Escalation</h2>
        </div>
        <p className="text-sm text-slate-400">
          Down-regulate heart rate and vagal freeze response before touching work tools. Do not try to feel excited — aim for "boring neutrality."
        </p>
      </div>

      {/* Visual Box-Breathing Guide */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 flex flex-col items-center justify-center text-center backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setIsBreathingActive(!isBreathingActive)}
            className="text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
          >
            {isBreathingActive ? 'Pause Guide' : 'Resume Guide'}
          </button>
        </div>

        <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-4 flex items-center gap-1.5">
          <Wind className="w-3.5 h-3.5 text-cyan-400" />
          4-4-4-4 Box Breathing
        </span>

        {/* Breathing Circle */}
        <div className="my-6 relative flex items-center justify-center w-40 h-40">
          <div
            className={`w-36 h-36 rounded-full border-2 transition-all duration-1000 flex flex-col items-center justify-center ${getBreathCircleScale()}`}
          >
            <span className="text-2xl font-bold text-slate-100">{breathCountdown}s</span>
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide mt-1">
              {breathPhase}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-400 max-w-md">
          Synchronize your breathing with the ring. Prolonged exhales trigger the parasympathetic brake, signaling safety to your racing heart.
        </p>
      </div>

      {/* Somatic Checkpoints */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Somatic Safety Checkpoints</span>
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            {completedCount} of {steps.length} completed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {steps.map((step) => (
            <div
              key={step.id}
              onClick={() => toggleStep(step.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                step.completed
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-300'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-200'
              }`}
            >
              <div className="mt-0.5">
                {step.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-500" />
                )}
              </div>
              <div className="flex-1">
                <h4 className={`text-sm font-semibold ${step.completed ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                  {step.title}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">{step.instruction}</p>
                <p className="text-[11px] text-slate-500 mt-1">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-2 flex justify-end">
        <button
          onClick={onCompleteUnfreeze}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-all cursor-pointer"
        >
          <span>Somatic Reset Complete → Open Micro-Bar Tasks</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

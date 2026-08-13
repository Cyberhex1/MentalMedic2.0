import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, Zap, AlertOctagon, Timer, Sparkles, Heart, Award, X } from 'lucide-react';
import { SprintPhase, SprintConfig } from '../types';
import { audioSynth } from '../lib/audioSynth';

interface MicroSprintTimerProps {
  onLogTask: () => void;
  onDrainBattery: (amt: number) => void;
  activeTaskTitle?: string;
}

const SPRINT_PRESETS: SprintConfig[] = [
  { name: '5 Mins Micro-Burst', workDuration: 300, restDuration: 120 },
  { name: '10 Mins Sprint', workDuration: 600, restDuration: 180 },
  { name: '30 Mins Sprint', workDuration: 1800, restDuration: 300 },
  { name: '60 Mins Sprint', workDuration: 3600, restDuration: 600 },
];

const ENCOURAGEMENTS: Record<string, string[]> = {
  '5 Mins Micro-Burst': [
    "Victory! 5 full minutes of micro-focus completed without paralysis.",
    "A 5-minute micro-burst is huge when facing executive friction. Honor this victory!",
    "5 minutes of gentle progress! Notice how starting was the hardest part.",
  ],
  '10 Mins Sprint': [
    "Outstanding! 10 full minutes of calm, steady focus. You honored your boundary and showed up without panic.",
    "A perfect 10-minute Focus Bit! Your mind is building momentum through gentle, low-load execution.",
    "10 minutes done with a quiet heart. Every micro-sprint is a complete victory for your nervous system.",
  ],
  '30 Mins Sprint': [
    "Fantastic work! 30 minutes of zero-adrenaline productivity. Your brain appreciates this sustainable pace.",
    "30 minutes of uninterrupted calm focus! You executed cleanly without letting dread take over.",
    "A full half-hour in gentle flow! Step away and stretch—you have earned every second of this break.",
  ],
  '60 Mins Sprint': [
    "Incredible achievement! 60 minutes of deep focus. Take a well-deserved extended break now—your mind earned it!",
    "An entire hour of steady, panic-free output. You proved that calm discipline completely outperforms frantic rush.",
    "60 minutes of deep work completed! Hydrate, rest your eyes, and celebrate this zero-adrenaline milestone.",
  ],
};

export const MicroSprintTimer: React.FC<MicroSprintTimerProps> = ({ onLogTask, onDrainBattery, activeTaskTitle }) => {
  const [selectedPreset, setSelectedPreset] = useState<SprintConfig>(SPRINT_PRESETS[0]); // Default 10 Mins
  const [phase, setPhase] = useState<SprintPhase>('work');
  const [timeLeft, setTimeLeft] = useState<number>(selectedPreset.workDuration);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [sprintTaskCount, setSprintTaskCount] = useState<number>(0);
  const [sprintTotalCompleted, setSprintTotalCompleted] = useState<number>(0);

  // Encouragement modal state
  const [encouragementModal, setEncouragementModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    minutesSpent: number;
  }>({
    isOpen: false,
    title: '',
    message: '',
    minutesSpent: 10,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSelectPreset = (preset: SprintConfig) => {
    setSelectedPreset(preset);
    setIsRunning(false);
    setPhase('work');
    setTimeLeft(preset.workDuration);
  };

  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev > 1) return prev - 1;

        audioSynth.playChime();

        if (phase === 'work') {
          setPhase('rest');
          setSprintTotalCompleted((c) => c + 1);

          // Show encouragement modal
          const messages = ENCOURAGEMENTS[selectedPreset.name] || ENCOURAGEMENTS['10 Mins Sprint'];
          const randomMsg = messages[Math.floor(Math.random() * messages.length)];
          const minutesSpent = Math.round(selectedPreset.workDuration / 60);

          setEncouragementModal({
            isOpen: true,
            title: `✨ ${minutesSpent}-Minute Sprint Completed!`,
            message: randomMsg,
            minutesSpent,
          });

          return selectedPreset.restDuration;
        } else {
          setPhase('work');
          return selectedPreset.workDuration;
        }
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, phase, selectedPreset]);

  const toggleTimer = () => {
    setIsRunning((prev) => !prev);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setPhase('work');
    setTimeLeft(selectedPreset.workDuration);
  };

  const handleLogTaskClick = () => {
    setSprintTaskCount((prev) => prev + 1);
    onLogTask();
    onDrainBattery(3);
  };

  const currentDuration = phase === 'work' ? selectedPreset.workDuration : selectedPreset.restDuration;
  const progressRatio = timeLeft / currentDuration;
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference * (1 - progressRatio);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Timer className="w-5 h-5 text-pink-500" />
          <h2 className="text-base font-bold text-slate-800">10 / 30 / 60 Min Sprint Engine</h2>
        </div>
        <p className="text-xs text-slate-500">
          Contained, zero-adrenaline time windows. Choose 10, 30, or 60 minutes. When time expires, step away and rest.
        </p>
      </div>

      {activeTaskTitle && (
        <div className="p-3.5 rounded-2xl bg-pink-50 border border-pink-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-500 shrink-0" />
            <span className="text-xs font-bold text-pink-700">Active Sprint Focus:</span>
            <span className="text-xs font-semibold text-slate-800 italic">"{activeTaskTitle}"</span>
          </div>
        </div>
      )}

      {/* Preset Selectors */}
      <div className="flex flex-wrap gap-2 justify-center">
        {SPRINT_PRESETS.map((preset) => (
          <button
            key={preset.name}
            onClick={() => handleSelectPreset(preset)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedPreset.name === preset.name
                ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* SVG Ring Timer */}
      <div className="bg-white border border-pink-100 rounded-3xl p-8 flex flex-col items-center justify-center shadow-lg shadow-pink-500/5 relative">
        <div className="relative w-56 h-56 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="112"
              cy="112"
              r="90"
              className="stroke-slate-100 fill-none"
              strokeWidth="8"
            />
            <circle
              cx="112"
              cy="112"
              r="90"
              className={`fill-none transition-all duration-1000 ${
                phase === 'work' ? 'stroke-pink-500' : 'stroke-amber-400'
              }`}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>

          {/* Center Info */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span
              className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full border mb-1 ${
                phase === 'work'
                  ? 'bg-pink-50 text-pink-600 border-pink-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {phase === 'work' ? 'Focus Window' : 'Somatic Rest'}
            </span>
            <div className="text-4xl font-black text-slate-800 tracking-tight font-mono my-1">
              {formatTime(timeLeft)}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              {phase === 'work' ? `${selectedPreset.name}` : 'Step Away & Rest'}
            </span>
          </div>
        </div>

        {/* Timer Control Buttons */}
        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={toggleTimer}
            className={`px-6 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 cursor-pointer transition-all shadow-md ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                : 'bg-pink-500 hover:bg-pink-600 text-white shadow-pink-500/20'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause Sprint</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Start Sprint</span>
              </>
            )}
          </button>

          <button
            onClick={resetTimer}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
            title="Reset Timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Focus Bits Logger */}
      <div className="bg-pink-50/50 border border-pink-100 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs text-slate-500 block font-semibold">Sprint Focus Bits Logged:</span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-2xl font-black text-pink-600 font-mono">{sprintTaskCount}</span>
            <span className="text-xs text-slate-600 font-medium">bits finished</span>
            {sprintTotalCompleted > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 border border-emerald-200">
                {sprintTotalCompleted} Sprints Finished
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleLogTaskClick}
          className="px-5 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-pink-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>+ Log 1 Focus Bit</span>
        </button>
      </div>

      {/* Hard Stop Callout */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
        <AlertOctagon className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
        <div>
          <strong className="text-amber-800 block font-bold mb-0.5">The Hard-Stop Guarantee:</strong>
          When the timer finishes, stand up from your chair immediately. Never "push through." Rebuilding trust in boundaries is how you cure task dread.
        </div>
      </div>

      {/* Encouragement Words Modal */}
      {encouragementModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-pink-200 rounded-3xl max-w-md w-full p-6 text-center space-y-5 shadow-2xl relative">
            <button
              onClick={() => setEncouragementModal((prev) => ({ ...prev, isOpen: false }))}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mx-auto text-2xl border border-pink-200 shadow-inner">
              <Award className="w-7 h-7 text-pink-500" />
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-800">{encouragementModal.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium bg-pink-50/60 p-4 rounded-2xl border border-pink-100 italic">
                "{encouragementModal.message}"
              </p>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => setEncouragementModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-6 py-2.5 bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs rounded-xl shadow-md shadow-pink-500/20 cursor-pointer"
              >
                Thank You, Ready for Rest 🌸
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

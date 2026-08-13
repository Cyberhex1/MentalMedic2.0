import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Heart, Sparkles, Volume2, VolumeX, Shield, Circle, Sun, Moon, Wind } from 'lucide-react';
import { audioSynth } from '../lib/audioSynth';

interface MeditationTabProps {
  onCompleteSession?: () => void;
}

type BreathingTechnique = 'box' | '478' | 'coherence' | 'sigh';

interface TechniqueInfo {
  id: BreathingTechnique;
  name: string;
  tagline: string;
  description: string;
  inhale: number; // in seconds
  hold1: number;
  exhale: number;
  hold2: number;
}

const TECHNIQUES: TechniqueInfo[] = [
  {
    id: 'box',
    name: 'Box Breathing (4-4-4-4)',
    tagline: 'Navy SEAL grounding technique',
    description: 'Equal duration inhale, hold, exhale, and hold to restore autonomic balance.',
    inhale: 4,
    hold1: 4,
    exhale: 4,
    hold2: 4,
  },
  {
    id: '478',
    name: '4-7-8 Deep Calm',
    tagline: 'Dr. Andrew Weil anxiety reset',
    description: 'Extended exhale activates the parasympathetic vagus nerve response.',
    inhale: 4,
    hold1: 7,
    exhale: 8,
    hold2: 0,
  },
  {
    id: 'coherence',
    name: 'Somatic Coherence (5-5)',
    tagline: 'Heart rate variability sync',
    description: 'Smooth 5s inhale and 5s exhale for heart-brain resonance.',
    inhale: 5,
    hold1: 0,
    exhale: 5,
    hold2: 0,
  },
  {
    id: 'sigh',
    name: 'Physiological Sigh',
    tagline: 'Instant stress relief sigh',
    description: 'Double quick inhale followed by a slow, relaxing vocal sigh.',
    inhale: 3,
    hold1: 1,
    exhale: 6,
    hold2: 0,
  },
];

const MEDITATION_TIMERS = [3, 5, 10, 15, 20];

const AFFIRMATIONS = [
  "My body is allowed to rest before all work is finished.",
  "I release the urge to rush through tasks to prove my worth.",
  "1 micro-step is a complete victory for my nervous system today.",
  "I do not need to over-explain myself or apologize for my pace.",
  "My nervous system is safe in this present moment.",
  "I honor my boundaries without guilt or shame.",
];

export const MeditationTab: React.FC<MeditationTabProps> = ({ onCompleteSession }) => {
  // Mode selection: 'breathing' | 'timed' | 'bodyscan'
  const [activeMode, setActiveMode] = useState<'breathing' | 'timed' | 'bodyscan'>('breathing');

  // Breathing pacer state
  const [selectedTech, setSelectedTech] = useState<TechniqueInfo>(TECHNIQUES[0]);
  const [isBreathingRunning, setIsBreathingRunning] = useState<boolean>(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale' | 'rest'>('inhale');
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState<number>(selectedTech.inhale);
  const [completedCycles, setCompletedCycles] = useState<number>(0);

  // Timed meditation state
  const [timerMinutes, setTimerMinutes] = useState<number>(5);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(5 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Body scan step
  const [bodyScanIndex, setBodyScanIndex] = useState<number>(0);

  // Affirmation deck
  const [affIndex, setAffIndex] = useState<number>(0);

  // Soundscape toggles
  const [isPlayingDrone, setIsPlayingDrone] = useState<boolean>(false);
  const [isPlayingRain, setIsPlayingRain] = useState<boolean>(false);

  const breathTimerRef = useRef<NodeJS.Timeout | null>(null);
  const meditationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle Breathing Pacer Logic
  useEffect(() => {
    if (!isBreathingRunning) {
      if (breathTimerRef.current) clearInterval(breathTimerRef.current);
      return;
    }

    breathTimerRef.current = setInterval(() => {
      setPhaseSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;

        // Transition breath phase
        if (breathPhase === 'inhale') {
          if (selectedTech.hold1 > 0) {
            setBreathPhase('hold');
            return selectedTech.hold1;
          } else {
            setBreathPhase('exhale');
            return selectedTech.exhale;
          }
        } else if (breathPhase === 'hold') {
          setBreathPhase('exhale');
          return selectedTech.exhale;
        } else if (breathPhase === 'exhale') {
          if (selectedTech.hold2 > 0) {
            setBreathPhase('rest');
            return selectedTech.hold2;
          } else {
            setBreathPhase('inhale');
            setCompletedCycles((c) => c + 1);
            audioSynth.playChime();
            return selectedTech.inhale;
          }
        } else {
          setBreathPhase('inhale');
          setCompletedCycles((c) => c + 1);
          audioSynth.playChime();
          return selectedTech.inhale;
        }
      });
    }, 1000);

    return () => {
      if (breathTimerRef.current) clearInterval(breathTimerRef.current);
    };
  }, [isBreathingRunning, breathPhase, selectedTech]);

  // Handle Timed Meditation Timer Logic
  useEffect(() => {
    if (!isTimerRunning) {
      if (meditationTimerRef.current) clearInterval(meditationTimerRef.current);
      return;
    }

    meditationTimerRef.current = setInterval(() => {
      setTimerSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;

        audioSynth.playChime();
        setIsTimerRunning(false);
        if (onCompleteSession) onCompleteSession();
        return 0;
      });
    }, 1000);

    return () => {
      if (meditationTimerRef.current) clearInterval(meditationTimerRef.current);
    };
  }, [isTimerRunning, onCompleteSession]);

  const handleSelectTechnique = (tech: TechniqueInfo) => {
    setSelectedTech(tech);
    setIsBreathingRunning(false);
    setBreathPhase('inhale');
    setPhaseSecondsLeft(tech.inhale);
    setCompletedCycles(0);
  };

  const handleSelectTimerMinutes = (mins: number) => {
    setTimerMinutes(mins);
    setTimerSecondsLeft(mins * 60);
    setIsTimerRunning(false);
  };

  const formatTimerTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const toggleDrone = () => {
    if (isPlayingDrone) {
      audioSynth.stopSoundscape('drone');
      setIsPlayingDrone(false);
    } else {
      audioSynth.playSoundscape('drone', 0.4);
      setIsPlayingDrone(true);
    }
  };

  const toggleRain = () => {
    if (isPlayingRain) {
      audioSynth.stopSoundscape('rain');
      setIsPlayingRain(false);
    } else {
      audioSynth.playSoundscape('rain', 0.4);
      setIsPlayingRain(true);
    }
  };

  const BODY_SCAN_STEPS = [
    {
      title: '1. Crown & Brow Line',
      guide: 'Softly relax the muscles around your eyes and un-clench your brow. Release any furrowed tension.',
    },
    {
      title: '2. Jaw, Tongue & Throat',
      guide: 'Let your lower jaw drop slightly away from your upper teeth. Relax your tongue to the bottom of your mouth.',
    },
    {
      title: '3. Shoulders & Chest',
      guide: 'Roll your shoulders back and drop them away from your ears. Feel your chest expand freely.',
    },
    {
      title: '4. Solar Plexus & Stomach',
      guide: 'Allow your belly to soften and expand outwards on inhale. Stop holding your stomach tight.',
    },
    {
      title: '5. Hands, Legs & Feet Grounding',
      guide: 'Feel the heavy, warm weight of your feet firmly touching the floor or bed. You are safe and anchored.',
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-pink-100 dark:border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Wind className="w-5 h-5 text-pink-500" />
            <span>Somatic Meditation & Nervous System Reset</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Guided breathing visualizers, timed silent meditation, and somatic body scans.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setActiveMode('breathing')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeMode === 'breathing'
                ? 'bg-pink-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Breathing Pacer
          </button>
          <button
            onClick={() => setActiveMode('timed')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeMode === 'timed'
                ? 'bg-pink-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Timed Silent
          </button>
          <button
            onClick={() => setActiveMode('bodyscan')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeMode === 'bodyscan'
                ? 'bg-pink-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Body Scan Guide
          </button>
        </div>
      </div>

      {/* Quick Soundscape Companion Strip */}
      <div className="bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 p-3.5 rounded-2xl border border-pink-200/80 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs font-medium">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold">
          <Sparkles className="w-4 h-4 text-pink-500 animate-pulse" />
          <span>Ambient Meditation Companions:</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleDrone}
            className={`px-3 py-1 rounded-full border text-xs font-bold transition-all cursor-pointer ${
              isPlayingDrone
                ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-purple-200 hover:border-purple-400'
            }`}
          >
            432Hz Calm Drone {isPlayingDrone ? '🔊' : '🔇'}
          </button>

          <button
            onClick={toggleRain}
            className={`px-3 py-1 rounded-full border text-xs font-bold transition-all cursor-pointer ${
              isPlayingRain
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-blue-200 hover:border-blue-400'
            }`}
          >
            Rain on Glass {isPlayingRain ? '🌧️' : '🔇'}
          </button>
        </div>
      </div>

      {/* MODE 1: BREATHING PACER */}
      {activeMode === 'breathing' && (
        <div className="space-y-6">
          {/* Technique Selection Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {TECHNIQUES.map((tech) => (
              <button
                key={tech.id}
                onClick={() => handleSelectTechnique(tech)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedTech.id === tech.id
                    ? 'bg-pink-500 text-white border-pink-500 shadow-md shadow-pink-500/20 ring-2 ring-pink-500/30'
                    : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-pink-300'
                }`}
              >
                <h4 className="text-xs font-bold truncate">{tech.name}</h4>
                <p
                  className={`text-[10px] mt-0.5 line-clamp-1 ${
                    selectedTech.id === tech.id ? 'text-pink-100' : 'text-slate-400'
                  }`}
                >
                  {tech.tagline}
                </p>
              </button>
            ))}
          </div>

          {/* Visual Breathing Circle Canvas */}
          <div className="bg-white dark:bg-slate-800/60 border border-pink-100 dark:border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center space-y-6 relative overflow-hidden shadow-sm">
            <div className="text-center space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-pink-500 block">
                {selectedTech.name}
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                {selectedTech.description}
              </p>
            </div>

            {/* Pulsing Breathing Ring */}
            <div className="relative w-48 h-48 flex items-center justify-center my-4">
              <div
                className={`absolute inset-0 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 opacity-20 blur-xl transition-all duration-1000 ${
                  breathPhase === 'inhale'
                    ? 'scale-125'
                    : breathPhase === 'hold'
                    ? 'scale-110'
                    : 'scale-75'
                }`}
              />

              <div
                className={`w-36 h-36 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-1000 shadow-xl ${
                  breathPhase === 'inhale'
                    ? 'scale-110 border-pink-500 bg-pink-50/80 dark:bg-pink-950/40 text-pink-600'
                    : breathPhase === 'hold'
                    ? 'scale-105 border-purple-500 bg-purple-50/80 dark:bg-purple-950/40 text-purple-600'
                    : breathPhase === 'exhale'
                    ? 'scale-90 border-blue-400 bg-blue-50/80 dark:bg-blue-950/40 text-blue-600'
                    : 'scale-95 border-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-600'
                }`}
              >
                <span className="text-xs font-black uppercase tracking-wider block mb-1">
                  {breathPhase}
                </span>
                <span className="text-3xl font-black font-mono">{phaseSecondsLeft}s</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsBreathingRunning((prev) => !prev)}
                className={`px-6 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                  isBreathingRunning
                    ? 'bg-amber-500 text-white shadow-amber-500/20'
                    : 'bg-pink-500 text-white shadow-pink-500/20 hover:bg-pink-600'
                }`}
              >
                {isBreathingRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isBreathingRunning ? 'Pause Pacer' : 'Start Breathing Pacer'}</span>
              </button>

              <button
                onClick={() => {
                  setIsBreathingRunning(false);
                  setBreathPhase('inhale');
                  setPhaseSecondsLeft(selectedTech.inhale);
                  setCompletedCycles(0);
                }}
                className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer transition-all"
                title="Reset Pacer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <span className="text-xs font-bold text-slate-400 font-mono">
              Completed Cycles: {completedCycles}
            </span>
          </div>
        </div>
      )}

      {/* MODE 2: TIMED SILENT MEDITATION */}
      {activeMode === 'timed' && (
        <div className="bg-white dark:bg-slate-800/60 border border-pink-100 dark:border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center space-y-6 text-center">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Silent Meditation Session
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select duration and rest in quiet, low-adrenaline mindfulness. Soft chime plays upon completion.
            </p>
          </div>

          {/* Minutes Preset Selector */}
          <div className="flex items-center gap-2">
            {MEDITATION_TIMERS.map((mins) => (
              <button
                key={mins}
                onClick={() => handleSelectTimerMinutes(mins)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  timerMinutes === mins
                    ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {mins} Mins
              </button>
            ))}
          </div>

          {/* Large Countdown Display */}
          <div className="py-6 font-mono text-6xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
            {formatTimerTime(timerSecondsLeft)}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsTimerRunning((prev) => !prev)}
              className={`px-8 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                isTimerRunning
                  ? 'bg-amber-500 text-white shadow-amber-500/20'
                  : 'bg-pink-500 text-white shadow-pink-500/20 hover:bg-pink-600'
              }`}
            >
              {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isTimerRunning ? 'Pause Session' : 'Start Silent Session'}</span>
            </button>

            <button
              onClick={() => {
                setIsTimerRunning(false);
                setTimerSecondsLeft(timerMinutes * 60);
              }}
              className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* MODE 3: BODY SCAN GUIDE */}
      {activeMode === 'bodyscan' && (
        <div className="bg-white dark:bg-slate-800/60 border border-pink-100 dark:border-slate-800 rounded-3xl p-6 space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Somatic Body Scan & Physical Tension Release
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Move step-by-step through physical body zones to release subconscious dread and physical tension.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-pink-50/60 dark:bg-slate-900/60 border border-pink-200 dark:border-slate-700 space-y-3">
            <span className="text-[10px] font-black uppercase text-pink-600 block">
              Zone {bodyScanIndex + 1} of {BODY_SCAN_STEPS.length}
            </span>
            <h5 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
              {BODY_SCAN_STEPS[bodyScanIndex].title}
            </h5>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              {BODY_SCAN_STEPS[bodyScanIndex].guide}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <button
              disabled={bodyScanIndex === 0}
              onClick={() => setBodyScanIndex((i) => Math.max(0, i - 1))}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer"
            >
              Previous Zone
            </button>

            <button
              onClick={() => {
                audioSynth.playChime();
                if (bodyScanIndex < BODY_SCAN_STEPS.length - 1) {
                  setBodyScanIndex((i) => i + 1);
                } else {
                  setBodyScanIndex(0);
                }
              }}
              className="px-5 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold shadow-md shadow-pink-500/20 cursor-pointer transition-all"
            >
              {bodyScanIndex < BODY_SCAN_STEPS.length - 1 ? 'Next Body Zone →' : 'Complete Scan ✨'}
            </button>
          </div>
        </div>
      )}

      {/* Gentle Affirmation Card Deck */}
      <div className="bg-slate-50 dark:bg-slate-800/40 border border-pink-100 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-pink-500 uppercase tracking-wider block">
            Gentle Grounding Affirmation
          </span>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-200 italic">
            "{AFFIRMATIONS[affIndex]}"
          </p>
        </div>

        <button
          onClick={() => {
            audioSynth.playChime();
            setAffIndex((i) => (i + 1) % AFFIRMATIONS.length);
          }}
          className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-pink-200 dark:border-slate-600 text-pink-600 dark:text-pink-300 text-xs font-bold cursor-pointer hover:border-pink-400 shrink-0 shadow-2xs"
        >
          Next Affirmation ✨
        </button>
      </div>
    </div>
  );
};

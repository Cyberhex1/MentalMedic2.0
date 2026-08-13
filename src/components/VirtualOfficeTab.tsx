import React, { useState, useEffect } from 'react';
import {
  Building2,
  Volume2,
  Users,
  Coffee,
  ShieldCheck,
  EyeOff,
  CheckCircle,
  Clock,
  Sparkles,
  MessageSquare,
  FileSpreadsheet,
  Activity,
  Maximize2,
  RefreshCw,
  Send,
  Bot,
  Copy,
  Check,
  Bell,
  Mail,
  Footprints,
  Sliders,
  Play,
  Square,
  Printer,
  FileText,
  Keyboard,
} from 'lucide-react';
import { VirtualCoworker, OfficeAudioType } from '../types';
import { audioSynth } from '../lib/audioSynth';

const INITIAL_COWORKERS: VirtualCoworker[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'Senior Product Specialist',
    avatar: '👩‍💻',
    status: 'In Deep Focus Bit',
    currentFocus: 'Drafting Q3 roadmap proposal',
    timeAgo: '2m ago',
  },
  {
    id: '2',
    name: 'Liam Vance',
    role: 'Data Architect',
    avatar: '👨‍💼',
    status: 'Tea Break ☕',
    currentFocus: 'Grabbing chamomile tea',
    timeAgo: '5m ago',
  },
  {
    id: '3',
    name: 'Elena Rostova',
    role: 'UX Researcher',
    avatar: '👩‍🎨',
    status: 'Focus Bits Sprinting',
    currentFocus: 'Synthesizing usability feedback',
    timeAgo: '12m ago',
  },
  {
    id: '4',
    name: 'Marcus Brody',
    role: 'Operations Lead',
    avatar: '👨‍💻',
    status: 'Out of Office',
    currentFocus: 'Zero-Adrenaline Rest',
    timeAgo: '20m ago',
  },
];

const BOSS_PROMPTS = [
  "Hey, do you have a quick status update on the current deliverables?",
  "Hi! Just checking in on the Q3 milestones before our afternoon sync.",
  "Hello! Is everything on track for the sprint wrap-up today?",
  "Hey there, could you confirm when the revised analysis will be ready?",
];

const CORPORATE_REPLIES = [
  "Hi! All Q3 milestones are currently progressing right on schedule. I'm finalizing the metrics now and will share the report shortly!",
  "Hello! Yes, everything is proceeding smoothly. Initial phases are complete, and the final review is underway. Thanks for checking in!",
  "Hi! Deliverables are well in hand. I'm doing a quick quality pass on the data and will post the summary in our shared channel.",
  "Hey! Everything is on track. I've broken down the remaining tasks into quick micro-steps and expect to wrap up smoothly today.",
];

interface OfficeSoundControl {
  id: OfficeAudioType;
  name: string;
  icon: React.ReactNode;
  type: 'continuous' | 'trigger';
}

const OFFICE_SOUNDS: OfficeSoundControl[] = [
  { id: 'hvac', name: 'HVAC Air Hum', icon: <Volume2 className="w-4 h-4 text-slate-500" />, type: 'continuous' },
  { id: 'keyboard', name: 'Key Clicks', icon: <Keyboard className="w-4 h-4 text-indigo-500" />, type: 'continuous' },
  { id: 'chatter', name: 'Low Distant Chatter', icon: <Users className="w-4 h-4 text-purple-500" />, type: 'continuous' },
  { id: 'walking', name: 'Hallway Footsteps', icon: <Footprints className="w-4 h-4 text-amber-600" />, type: 'continuous' },
  { id: 'pages', name: 'Page Flipping', icon: <FileText className="w-4 h-4 text-emerald-500" />, type: 'continuous' },
  { id: 'printer', name: 'Printer Printing', icon: <Printer className="w-4 h-4 text-blue-500" />, type: 'continuous' },
  { id: 'chair', name: 'Desk Chair Creak', icon: <Building2 className="w-4 h-4 text-orange-500" />, type: 'continuous' },

  // Ping triggers
  { id: 'teams_ping', name: 'Teams Ping', icon: <Bell className="w-4 h-4 text-blue-600" />, type: 'trigger' },
  { id: 'email_ping', name: 'New Email Ping', icon: <Mail className="w-4 h-4 text-amber-500" />, type: 'trigger' },
];

export const VirtualOfficeTab: React.FC = () => {
  const [coworkers, setCoworkers] = useState<VirtualCoworker[]>(INITIAL_COWORKERS);
  const [myStatus, setMyStatus] = useState<string>('Deep Focus Bit Mode 🌸');
  const [showDecoyDoc, setShowDecoyDoc] = useState<boolean>(false);

  // Multi-track office audio state
  const [activeOfficeSounds, setActiveOfficeSounds] = useState<OfficeAudioType[]>(['hvac', 'keyboard']);
  const [officeVolumes, setOfficeVolumes] = useState<Record<string, number>>({
    hvac: 0.4,
    keyboard: 0.3,
    chatter: 0.2,
    walking: 0.3,
    pages: 0.3,
    printer: 0.3,
    chair: 0.3,
  });

  // Boss simulator state
  const [bossMsgIndex, setBossMsgIndex] = useState<number>(0);
  const [generatedReply, setGeneratedReply] = useState<string>('');
  const [copiedReport, setCopiedReport] = useState<boolean>(false);

  // Coffee break timer state
  const [coffeeTimer, setCoffeeTimer] = useState<number>(0);
  const [isCoffeeTimerRunning, setIsCoffeeTimerRunning] = useState<boolean>(false);

  // Simulated live ticker
  useEffect(() => {
    const interval = setInterval(() => {
      const names = ['Sarah', 'Liam', 'Elena', 'Marcus', 'Jordan', 'Maya'];
      const actions = [
        'logged a Focus Bit',
        'took a 3-minute somatic sigh break',
        'updated sprint tracker',
        'completed a micro task',
        'refilled water bottle',
      ];
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];

      setCoworkers((prev) => [
        {
          id: Date.now().toString(),
          name: `${randomName} (Virtual)`,
          role: 'Team Member',
          avatar: '🧑‍💻',
          status: 'Active',
          currentFocus: randomAction,
          timeAgo: 'Just now',
        },
        ...prev.slice(0, 4),
      ]);
    }, 18000);

    return () => clearInterval(interval);
  }, []);

  // Coffee break timer
  useEffect(() => {
    if (!isCoffeeTimerRunning) return;
    const timer = setInterval(() => {
      setCoffeeTimer((prev) => {
        if (prev <= 1) {
          setIsCoffeeTimerRunning(false);
          audioSynth.playChime();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isCoffeeTimerRunning]);

  const handleToggleSound = (id: OfficeAudioType, type: 'continuous' | 'trigger') => {
    if (type === 'trigger') {
      audioSynth.triggerOfficePing(id);
      return;
    }

    const isActive = activeOfficeSounds.includes(id);
    if (isActive) {
      audioSynth.stopOfficeAudio(id);
      setActiveOfficeSounds((prev) => prev.filter((s) => s !== id));
    } else {
      const vol = officeVolumes[id] ?? 0.3;
      audioSynth.playOfficeAudio(id, vol);
      setActiveOfficeSounds((prev) => [...prev, id]);
    }
  };

  const handleVolumeChange = (id: OfficeAudioType, vol: number) => {
    setOfficeVolumes((prev) => ({ ...prev, [id]: vol }));
    audioSynth.setOfficeAudioVolume(id, vol);
  };

  const handleGenerateReply = () => {
    const reply = CORPORATE_REPLIES[bossMsgIndex % CORPORATE_REPLIES.length];
    setGeneratedReply(reply);
  };

  const handleShuffleBossMsg = () => {
    setBossMsgIndex((prev) => (prev + 1) % BOSS_PROMPTS.length);
    setGeneratedReply('');
  };

  const handleCopyReply = () => {
    if (!generatedReply) return;
    navigator.clipboard.writeText(generatedReply);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  const startCoffeeBreak = () => {
    setCoffeeTimer(180);
    setIsCoffeeTimerRunning(true);
    audioSynth.playChime();
  };

  const formatCoffeeTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-pink-500" />
            <span>Virtual Office Simulator ("Pretend Office")</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            A psychological co-working shelter with multi-track office soundscapes, team ticker, boss simulator, and decoy corporate shield.
          </p>
        </div>

        <button
          onClick={() => setShowDecoyDoc(!showDecoyDoc)}
          className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
            showDecoyDoc
              ? 'bg-emerald-500 text-white'
              : 'bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white'
          }`}
        >
          <EyeOff className="w-3.5 h-3.5" />
          <span>{showDecoyDoc ? 'Exit Decoy Corporate Shield' : 'Open Corporate Decoy Shield'}</span>
        </button>
      </div>

      {/* Decoy Document Simulator */}
      {showDecoyDoc ? (
        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 text-slate-100 space-y-4 shadow-2xl animate-fadeIn font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-slate-200">INTERNAL_Q3_STRATEGY_DECOY_SPREADSHEET_V4.XLSX</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-extrabold uppercase">
              CONFIDENTIAL / HIGH-LEVEL PRODUCTIVITY
            </span>
          </div>

          <p className="text-slate-400 font-sans text-xs">
            (If anyone looks at your screen right now, this looks like high-level corporate analysis and spreadsheet work!)
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-slate-800">
              <thead>
                <tr className="bg-slate-800 text-slate-300">
                  <th className="p-2 border border-slate-700">Sprint ID</th>
                  <th className="p-2 border border-slate-700">Module Target</th>
                  <th className="p-2 border border-slate-700">Status</th>
                  <th className="p-2 border border-slate-700">Completion %</th>
                  <th className="p-2 border border-slate-700">Quarter Impact</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border border-slate-800">
                  <td className="p-2 border border-slate-800">#FOCUS-801</td>
                  <td className="p-2 border border-slate-800">Data Pipeline Refinement</td>
                  <td className="p-2 border border-slate-800 text-emerald-400">IN_PROGRESS</td>
                  <td className="p-2 border border-slate-800">88.5%</td>
                  <td className="p-2 border border-slate-800">HIGH</td>
                </tr>
                <tr className="border border-slate-800">
                  <td className="p-2 border border-slate-800">#FOCUS-802</td>
                  <td className="p-2 border border-slate-800">Executive Summary Generation</td>
                  <td className="p-2 border border-slate-800 text-cyan-400">PASSED</td>
                  <td className="p-2 border border-slate-800">100.0%</td>
                  <td className="p-2 border border-slate-800">CRITICAL</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Status & Shield */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-pink-50/60 dark:bg-slate-800/60 border border-pink-100 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-300">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Manager & Deadline Shield</h4>
                  <p className="text-[11px] text-pink-700 dark:text-pink-300 font-medium">
                    Status: <span className="font-bold">Out of Office / Deadlines Met</span>
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                100% SECURE
              </span>
            </div>

            <div className="bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Your Office Status</label>
                  <input
                    type="text"
                    value={myStatus}
                    onChange={(e) => setMyStatus(e.target.value)}
                    className="text-xs font-bold text-slate-800 dark:text-slate-100 bg-transparent focus:outline-none focus:border-b focus:border-pink-500 w-48"
                  />
                </div>
              </div>
              <span className="text-[11px] text-slate-400 italic hidden sm:inline">Visible to virtual team</span>
            </div>
          </div>

          {/* Multi-Track Pretend Office Sound Mixer */}
          <div className="bg-white dark:bg-slate-800/60 border border-pink-100 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-300">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Multi-Track Office Sound Generator & Pings</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Customize individual sound levels (keyboard, HVAC, chatter, chair, footsteps, printer, pages) or trigger Teams & Email pings!
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-pink-50 dark:bg-pink-950/50 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800">
                {activeOfficeSounds.length} Sounds Active
              </span>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              {OFFICE_SOUNDS.map((snd) => {
                const isActive = activeOfficeSounds.includes(snd.id);
                const vol = officeVolumes[snd.id] ?? 0.3;

                return (
                  <div
                    key={snd.id}
                    className={`p-3 rounded-2xl border transition-all ${
                      isActive
                        ? 'bg-pink-50/80 dark:bg-pink-950/30 border-pink-300 dark:border-pink-800'
                        : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-white dark:bg-slate-700 shadow-xs">{snd.icon}</div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{snd.name}</span>
                      </div>

                      <button
                        onClick={() => handleToggleSound(snd.id, snd.type)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                          snd.type === 'trigger'
                            ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                            : isActive
                            ? 'bg-pink-500 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {snd.type === 'trigger' ? (
                          'Ping!'
                        ) : isActive ? (
                          <Square className="w-3 h-3" />
                        ) : (
                          <Play className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    {snd.type === 'continuous' && isActive && (
                      <div className="flex items-center gap-2 pt-1">
                        <Volume2 className="w-3 h-3 text-pink-500 shrink-0" />
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={vol}
                          onChange={(e) => handleVolumeChange(snd.id, parseFloat(e.target.value))}
                          className="w-full accent-pink-500 h-1.5 bg-pink-200 dark:bg-pink-900 rounded-lg cursor-pointer"
                        />
                        <span className="text-[10px] font-mono font-bold text-pink-600 dark:text-pink-400 w-7 text-right">
                          {Math.round(vol * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Boss Simulator */}
          <div className="bg-white dark:bg-slate-800/60 border border-pink-100 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Bot className="w-4 h-4 text-pink-500" />
                <span>Manager Check-In & Corporate Reply Generator</span>
              </h4>
              <button
                onClick={handleShuffleBossMsg}
                className="p-1 rounded text-slate-400 hover:text-pink-600 hover:bg-pink-50 transition-colors"
                title="Shuffle Prompt"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs shrink-0">
                👨‍💼
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-100">Alex (Manager)</span>
                  <span className="text-[10px] text-slate-400">10:14 AM</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 italic">"{BOSS_PROMPTS[bossMsgIndex]}"</p>
              </div>
            </div>

            {generatedReply ? (
              <div className="p-3.5 rounded-2xl bg-pink-50 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-900 space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-pink-700 dark:text-pink-300 uppercase">Suggested Professional Reply:</span>
                  <button
                    onClick={handleCopyReply}
                    className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedReport ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-pink-500" />}
                    <span>{copiedReport ? 'Copied!' : 'Copy Reply'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">"{generatedReply}"</p>
              </div>
            ) : (
              <button
                onClick={handleGenerateReply}
                className="w-full py-2 bg-pink-50 hover:bg-pink-100 dark:bg-pink-950/40 dark:hover:bg-pink-900/40 text-pink-700 dark:text-pink-300 font-bold border border-pink-200 dark:border-pink-900 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                <span>Generate Confident Corporate Response</span>
              </button>
            )}
          </div>

          {/* Virtual Coworker Presence Feed */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-pink-500" />
                <span>Virtual Coworker Presence Feed</span>
              </h4>
              <span className="text-[11px] text-slate-400 font-medium">Gentle background co-working presence</span>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              {coworkers.map((cw) => (
                <div
                  key={cw.id}
                  className="bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:border-pink-100 rounded-2xl p-4 shadow-sm flex items-start gap-3 transition-all"
                >
                  <div className="w-10 h-10 rounded-2xl bg-pink-50 dark:bg-pink-950/50 border border-pink-100 dark:border-pink-900 flex items-center justify-center text-xl shrink-0">
                    {cw.avatar}
                  </div>

                  <div className="space-y-0.5 overflow-hidden flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{cw.name}</h5>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">{cw.timeAgo}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">{cw.role}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium pt-1">
                      <span className="text-pink-600 dark:text-pink-400 font-bold">Focus:</span> {cw.currentFocus}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Virtual Watercooler */}
          <div className="p-4 rounded-2xl bg-pink-50 dark:bg-slate-800/80 border border-pink-100 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Coffee className="w-5 h-5 text-pink-500 shrink-0" />
              <div>
                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100">Virtual Watercooler & Coffee Break</h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Step away to grab water, tea, or stretch for 3 minutes. Your desk is completely safe.
                </p>
              </div>
            </div>

            {isCoffeeTimerRunning ? (
              <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-pink-200 dark:border-pink-900 font-mono font-black text-pink-600 dark:text-pink-400 text-sm">
                <Clock className="w-4 h-4 text-pink-500 animate-spin" />
                <span>{formatCoffeeTime(coffeeTimer)}</span>
              </div>
            ) : (
              <button
                onClick={startCoffeeBreak}
                className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs rounded-xl shadow-md shadow-pink-500/20 cursor-pointer transition-all shrink-0"
              >
                Take 3-Min Tea Break
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

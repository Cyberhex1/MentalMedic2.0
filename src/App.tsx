import React, { useState, useEffect } from 'react';
import { Maximize, Minimize, ListTodo, Timer, Activity, Sparkles, Wind } from 'lucide-react';
import { Header } from './components/Header';
import { TodoFocusBitsTab } from './components/TodoFocusBitsTab';
import { MicroSprintTimer } from './components/MicroSprintTimer';
import { MedicalSymptomsTab } from './components/MedicalSymptomsTab';
import { MeditationTab } from './components/MeditationTab';
import { YogaTab } from './components/YogaTab';
import { PanicOverlay } from './components/PanicOverlay';
import { SessionLogsModal } from './components/SessionLogsModal';
import { UserProfileModal } from './components/UserProfileModal';
import { NotesDrawer } from './components/NotesDrawer';
import { SettingsModal } from './components/SettingsModal';
import { SoundscapeMixerModal } from './components/SoundscapeMixerModal';
import { AnalyticsModal } from './components/AnalyticsModal';
import { TypingSoundEngine } from './components/TypingSoundEngine';
import { CuteUiDecorator } from './components/CuteUiDecorator';
import { GlobalMusicPlayerBar } from './components/GlobalMusicPlayerBar';
import { SessionLog, TodoItem, SymptomLog, UserProfile, NoteItem, ActiveTab, TrackItem, MusicPlaylist, AudioType } from './types';
import { audioSynth } from './lib/audioSynth';
import { DEFAULT_PLAYLISTS } from './lib/musicData';
import { User } from 'firebase/auth';
import {
  auth,
  saveAppSnapshot,
  subscribeAppSnapshot,
} from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const DEFAULT_PROFILE: UserProfile = {
  name: 'Calm Focus Worker',
  roleTitle: 'Zero-Adrenaline Specialist',
  dailyGoalBits: 5,
  preferredNoise: 'brown',
  avatarEmoji: '🌸',
  totalBitsLogged: 12,
  streakDays: 4,
  panicGroundingPhrase: 'I am completely safe. 1 Focus Bit is enough for today.',
  theme: 'light',
  xp: 150,
  cuteSoundEffects: true,
  cuteUiEffects: true,
  tabOrder: ['todo', 'sprint', 'meditation', 'yoga', 'medical'],
  activeSoundscapes: ['brown'],
  mixerVolumes: { brown: 0.5 },
};

const DEFAULT_TODOS: TodoItem[] = [
  {
    id: 't1',
    title: 'Finalize Q3 Performance Summary',
    completed: false,
    priority: 'high',
    eisenhower: 'urgent_important',
    rule135: 'big',
    isFrog: true,
    focusBits: [
      { id: 'b1', title: 'Open document & write heading', completed: true, createdAt: Date.now() - 10000 },
      { id: 'b2', title: 'List 3 core achievements', completed: false, createdAt: Date.now() - 5000 },
      { id: 'b3', title: 'Hit save and send draft', completed: false, createdAt: Date.now() },
    ],
    createdAt: Date.now() - 100000,
  },
  {
    id: 't2',
    title: 'Review weekly team updates',
    completed: false,
    priority: 'medium',
    eisenhower: 'not_urgent_important',
    rule135: 'medium',
    focusBits: [],
    createdAt: Date.now() - 50000,
  },
  {
    id: 't3',
    title: 'Clear 3 unread emails',
    completed: true,
    priority: 'low',
    eisenhower: 'urgent_not_important',
    rule135: 'small',
    focusBits: [],
    createdAt: Date.now() - 20000,
  },
];

const DEFAULT_SYMPTOMS: SymptomLog[] = [
  {
    id: 's1',
    date: 'Today, 9:15 AM',
    timestamp: Date.now() - 3600000,
    symptomName: 'Executive Freeze State',
    severity: 6,
    triggers: 'Incoming urgent email alert',
    copingMethod: '5-4-3-2-1 Grounding',
    notes: 'Grounding helped reduce heart rate within 3 minutes.',
  },
];

const DEFAULT_NOTES: NoteItem[] = [
  {
    id: 'n1',
    title: 'Somatic Micro-Goal',
    content: 'Outputting 30% with a calm heart is infinitely better than 100% with adrenaline dread.',
    category: 'somatic',
    pinned: true,
    date: 'Today',
    timestamp: Date.now(),
  },
  {
    id: 'n2',
    title: 'Unclench & Drop Shoulders 🌸',
    content: 'Take a sip of water, drop your shoulders away from your ears, and release your lower jaw.',
    category: 'gentle_reminders',
    pinned: true,
    date: 'Today',
    timestamp: Date.now() - 1000,
  },
  {
    id: 'n3',
    title: '1 Bit is a Total Victory 🌿',
    content: 'You do not need to finish everything today. Completing even 1 micro bit breaks executive paralysis.',
    category: 'gentle_reminders',
    pinned: false,
    date: 'Today',
    timestamp: Date.now() - 2000,
  },
];

const get2amCycleKey = (d: Date = new Date()): string => {
  const dateCopy = new Date(d);
  if (dateCopy.getHours() < 2) {
    dateCopy.setDate(dateCopy.getDate() - 1);
  }
  const year = dateCopy.getFullYear();
  const month = String(dateCopy.getMonth() + 1).padStart(2, '0');
  const day = String(dateCopy.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}-02:00`;
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('todo');

  const [battery, setBattery] = useState<number>(() => {
    const saved = localStorage.getItem('zawe_battery');
    return saved ? parseInt(saved, 10) : 100;
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('zawe_profile');
    return saved ? { ...DEFAULT_PROFILE, ...JSON.parse(saved) } : DEFAULT_PROFILE;
  });

  const [todos, setTodos] = useState<TodoItem[]>(() => {
    const saved = localStorage.getItem('zawe_todos');
    return saved ? JSON.parse(saved) : DEFAULT_TODOS;
  });

  const [symptomLogs, setSymptomLogs] = useState<SymptomLog[]>(() => {
    const saved = localStorage.getItem('zawe_symptoms');
    return saved ? JSON.parse(saved) : DEFAULT_SYMPTOMS;
  });

  const [notes, setNotes] = useState<NoteItem[]>(() => {
    const saved = localStorage.getItem('zawe_notes');
    return saved ? JSON.parse(saved) : DEFAULT_NOTES;
  });

  const [sessionLogs, setSessionLogs] = useState<SessionLog[]>(() => {
    const saved = localStorage.getItem('zawe_session_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isSnapshotLoaded, setIsSnapshotLoaded] = useState(false);

  const [activeSprintTaskTitle, setActiveSprintTaskTitle] = useState<string>('');
  const [isPanicOpen, setIsPanicOpen] = useState<boolean>(false);
  const [isLogsOpen, setIsLogsOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isNotesOpen, setIsNotesOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isZenMode, setIsZenMode] = useState<boolean>(false);
  const [isMixerOpen, setIsMixerOpen] = useState<boolean>(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Global Audio Context Unlocker on User Interaction
  useEffect(() => {
    const unlockAudio = () => {
      audioSynth.initCtx();
    };
    window.addEventListener('click', unlockAudio, { passive: true });
    window.addEventListener('pointerdown', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio, { passive: true });
    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  // Load initial snapshot
  useEffect(() => {
    if (!authUser) {
      setIsSnapshotLoaded(false);
      return;
    }
    const unsub = subscribeAppSnapshot(authUser.uid, (snapshot) => {
      if (snapshot) {
        if (snapshot.userProfile) setUserProfile({ ...DEFAULT_PROFILE, ...snapshot.userProfile });
        if (snapshot.todos) setTodos(snapshot.todos);
        if (snapshot.symptomLogs) setSymptomLogs(snapshot.symptomLogs);
        if (snapshot.notes) setNotes(snapshot.notes);
        if (snapshot.sessionLogs) setSessionLogs(snapshot.sessionLogs);
        if (typeof snapshot.battery === 'number') setBattery(snapshot.battery);
      }
      setIsSnapshotLoaded(true);
    });
    return () => unsub();
  }, [authUser]);

  // Save snapshot continuously when state changes, debounced
  useEffect(() => {
    if (!authUser || !isSnapshotLoaded) return;
    const timeout = setTimeout(() => {
      saveAppSnapshot(authUser.uid, {
        userProfile,
        todos,
        symptomLogs,
        notes,
        sessionLogs,
        battery
      });
    }, 1000); // 1 second debounce
    return () => clearTimeout(timeout);
  }, [authUser, isSnapshotLoaded, userProfile, todos, symptomLogs, notes, sessionLogs, battery]);

  useEffect(() => {
    localStorage.setItem('zawe_battery', battery.toString());
  }, [battery]);

  useEffect(() => {
    localStorage.setItem('zawe_profile', JSON.stringify(userProfile));
    if (userProfile.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('zawe_todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem('zawe_symptoms', JSON.stringify(symptomLogs));
  }, [symptomLogs]);

  useEffect(() => {
    localStorage.setItem('zawe_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('zawe_session_logs', JSON.stringify(sessionLogs));
  }, [sessionLogs]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const addXp = (amount: number = 25) => {
    setUserProfile((prev) => {
      const nextXp = (prev.xp || 0) + amount;
      return { ...prev, xp: nextXp };
    });
    if (userProfile.cuteSoundEffects !== false) {
      audioSynth.playChime();
    }
  };

  const handleUpdateProfile = (updated: UserProfile) => {
    setUserProfile(updated);
  };

  const handleManualSync = async () => {
    if (!authUser) {
      triggerToast('Please sign in inside Settings to sync to cloud!');
      return;
    }
    try {
      await saveAppSnapshot(authUser.uid, {
        userProfile,
        todos,
        symptomLogs,
        notes,
        sessionLogs,
        battery
      });
      triggerToast('Cloud Snapshot saved successfully! ☁️');
    } catch (err: any) {
      console.warn('Manual sync failed:', err);
      triggerToast('Sync failed: ' + (err.message || 'Error'));
    }
  };

  const handleRechargeBattery = () => {
    setBattery((prev) => Math.min(100, prev + 25));
    triggerToast('Recharged +25% Energy!');
  };

  const handleDrainBattery = (amount: number) => {
    setBattery((prev) => Math.max(0, prev - amount));
  };

  const handleAddTodo = (todo: Omit<TodoItem, 'id' | 'createdAt'>) => {
    const newTodo: TodoItem = {
      ...todo,
      id: 't_' + Date.now(),
      createdAt: Date.now(),
    };
    setTodos((prev) => [newTodo, ...prev]);
    triggerToast('New task registered!');
  };

  const handleToggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextCompleted = !t.completed;
          if (nextCompleted) {
            addXp(30);
            setUserProfile((p) => ({
              ...p,
              totalBitsLogged: (p.totalBitsLogged || 0) + 1,
            }));
            triggerToast('+30 XP! Task Completed 🌸');
          }
          return { ...t, completed: nextCompleted };
        }
        return t;
      })
    );
  };

  const handleDeleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    triggerToast('Task removed.');
  };

  const handleUpdateTodo = (id: string, updatedFields: Partial<TodoItem>) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updatedFields } : t))
    );
    triggerToast('Task details updated ✨');
  };

  const handleShatterIntoFocusBits = (todoId: string, bits: string[]) => {
    setTodos((prev) =>
      prev.map((t) => {
        if (t.id === todoId) {
          const newBits = bits.map((title, i) => ({
            id: `b_${Date.now()}_${i}`,
            title,
            completed: false,
            createdAt: Date.now() + i,
          }));
          return {
            ...t,
            focusBits: [...t.focusBits, ...newBits],
          };
        }
        return t;
      })
    );
    triggerToast(`Shattered into ${bits.length} Micro Focus Bits! 🔨`);
  };

  const handleToggleFocusBit = (todoId: string, bitId: string) => {
    setTodos((prev) =>
      prev.map((t) => {
        if (t.id === todoId) {
          const updatedBits = t.focusBits.map((b) => {
            if (b.id === bitId) {
              const next = !b.completed;
              if (next) {
                addXp(15);
                setUserProfile((p) => ({
                  ...p,
                  totalBitsLogged: (p.totalBitsLogged || 0) + 1,
                }));
                triggerToast('+15 XP! 1 Focus Bit Completed 🌱');
              }
              return { ...b, completed: next };
            }
            return b;
          });
          return { ...t, focusBits: updatedBits };
        }
        return t;
      })
    );
  };

  const handleSendToSprint = (taskTitle: string) => {
    setActiveSprintTaskTitle(taskTitle);
    setActiveTab('sprint');
    triggerToast(`Sent "${taskTitle}" to Sprint Timer ⏱️`);
  };

  const handleLogTask = (title: string, durationSec: number = 300) => {
    const newLog: SessionLog = {
      id: 'log_' + Date.now(),
      taskTitle: title,
      date: new Date().toLocaleDateString(),
      durationMinutes: Math.round(durationSec / 60),
      timestamp: Date.now(),
      tasksCompleted: 1,
      completedBits: 1,
      energyEnd: battery,
      effortRating: 'Calm Focus',
      notes: `Completed sprint session: ${title}`,
    };
    setSessionLogs((prev) => [newLog, ...prev]);
    addXp(40);
    setUserProfile((p) => ({
      ...p,
      totalBitsLogged: (p.totalBitsLogged || 0) + 1,
    }));
    triggerToast(`Logged sprint session for "${title}" (+40 XP) 🎉`);
  };

  const handleAddSymptomLog = (log: Omit<SymptomLog, 'id' | 'timestamp'>) => {
    const newLog: SymptomLog = {
      ...log,
      id: 'sym_' + Date.now(),
      timestamp: Date.now(),
    };
    setSymptomLogs((prev) => [newLog, ...prev]);
    addXp(10);
    triggerToast('Health & symptom log saved gently 🩺');
  };

  const handleDeleteSymptomLog = (id: string) => {
    setSymptomLogs((prev) => prev.filter((s) => s.id !== id));
    triggerToast('Log entry removed.');
  };

  const handleAddNote = (note: Omit<NoteItem, 'id' | 'timestamp'>) => {
    const newNote: NoteItem = {
      ...note,
      id: 'note_' + Date.now(),
      timestamp: Date.now(),
    };
    setNotes((prev) => [newNote, ...prev]);
    triggerToast('Note saved! 📝');
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    triggerToast('Note deleted.');
  };

  const handleTogglePinNote = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n))
    );
  };

  const handleDailyReset = () => {
    setBattery(100);
    setTodos((prev) => prev.filter((t) => !t.completed));
    triggerToast('Daily Reset complete! Energy restored to 100% 🌿');
  };

  const handleClearAllData = () => {
    localStorage.removeItem('zawe_battery');
    localStorage.removeItem('zawe_profile');
    localStorage.removeItem('zawe_todos');
    localStorage.removeItem('zawe_symptoms');
    localStorage.removeItem('zawe_notes');
    localStorage.removeItem('zawe_session_logs');
    setBattery(100);
    setUserProfile(DEFAULT_PROFILE);
    setTodos(DEFAULT_TODOS);
    setSymptomLogs(DEFAULT_SYMPTOMS);
    setNotes(DEFAULT_NOTES);
    setSessionLogs([]);
    triggerToast('All data cleared to fresh defaults.');
  };

  const handleResetLevelXP = () => {
    handleUpdateProfile({
      ...userProfile,
      xp: 0,
      totalBitsLogged: 0,
      streakDays: 0,
    });
    triggerToast('Account Level, Focus Bits & Streaks reset to Level 1!');
  };

  // Single Audio Engine Handlers (Spotify & YT Music Style)
  const handlePlayTrack = (track: TrackItem, playlist?: MusicPlaylist) => {
    audioSynth.stopAllSoundscapes();
    setUserProfile((prev) => ({
      ...prev,
      activeSoundscape: null,
      currentTrack: track,
      isPlayingMusic: true,
    }));
    if (userProfile.cuteSoundEffects !== false) {
      audioSynth.playClickSound();
    }
    triggerToast(`Playing: ${track.title}`);
  };

  const handleTogglePlayPause = () => {
    if (userProfile.activeSoundscape) {
      const current = userProfile.activeSoundscape;
      audioSynth.stopAllSoundscapes();
      setUserProfile((prev) => ({ ...prev, activeSoundscape: null }));
      triggerToast('Audio paused');
    } else if (userProfile.currentTrack) {
      const nextPlaying = !userProfile.isPlayingMusic;
      setUserProfile((prev) => ({ ...prev, isPlayingMusic: nextPlaying }));
      triggerToast(nextPlaying ? `Playing: ${userProfile.currentTrack.title}` : 'Music paused');
    } else {
      const first = DEFAULT_PLAYLISTS[0].tracks[0];
      handlePlayTrack(first);
    }
  };

  const handlePlaySoundscape = (type: AudioType) => {
    if (userProfile.activeSoundscape === type) {
      audioSynth.stopSoundscape(type);
      setUserProfile((prev) => ({ ...prev, activeSoundscape: null }));
      triggerToast('Soundscape stopped');
    } else {
      audioSynth.stopAllSoundscapes();
      const vol = userProfile.musicVolume ?? 0.7;
      audioSynth.playSoundscape(type, vol);
      setUserProfile((prev) => ({
        ...prev,
        isPlayingMusic: false,
        activeSoundscape: type,
      }));
      triggerToast(`Playing: ${type === 'brown' ? 'Brown Noise' : 'Hi Popping Synth'}`);
    }
  };

  const handleNextTrack = () => {
    const allPlaylists = [...DEFAULT_PLAYLISTS, ...(userProfile.musicPlaylists || [])];
    const currentTrack = userProfile.currentTrack;
    if (!currentTrack) return;

    const playlist = allPlaylists.find((p) => p.tracks.some((t) => t.id === currentTrack.id)) || allPlaylists[0];
    const currentIndex = playlist.tracks.findIndex((t) => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % playlist.tracks.length;
    handlePlayTrack(playlist.tracks[nextIndex], playlist);
  };

  const handlePrevTrack = () => {
    const allPlaylists = [...DEFAULT_PLAYLISTS, ...(userProfile.musicPlaylists || [])];
    const currentTrack = userProfile.currentTrack;
    if (!currentTrack) return;

    const playlist = allPlaylists.find((p) => p.tracks.some((t) => t.id === currentTrack.id)) || allPlaylists[0];
    const currentIndex = playlist.tracks.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + playlist.tracks.length) % playlist.tracks.length;
    handlePlayTrack(playlist.tracks[prevIndex], playlist);
  };

  const handleStopAllAudio = () => {
    audioSynth.stopAllSoundscapes();
    setUserProfile((prev) => ({
      ...prev,
      isPlayingMusic: false,
      activeSoundscape: null,
    }));
    triggerToast('All audio stopped');
  };

  // Tab Order definitions
  const defaultTabList: ActiveTab[] = ['todo', 'sprint', 'meditation', 'yoga', 'medical'];
  const userSavedOrder = userProfile.tabOrder || defaultTabList;
  const missingTabs = defaultTabList.filter((tab) => !userSavedOrder.includes(tab));
  const customTabOrder = [...userSavedOrder, ...missingTabs];

  const handleSelectTab = (tabKey: ActiveTab) => {
    audioSynth.playTabSound(userProfile.cuteSoundEffects !== false);
    setActiveTab(tabKey);
  };

  const tabDefs: Record<ActiveTab, { label: string; icon: React.ReactNode }> = {
    todo: { label: 'To-Do & Focus Bits', icon: <ListTodo className="w-4 h-4" /> },
    sprint: { label: 'Sprint Engine', icon: <Timer className="w-4 h-4" /> },
    meditation: { label: 'Meditation & Pacer', icon: <Wind className="w-4 h-4" /> },
    yoga: { label: 'Adaptive Yoga', icon: <Sparkles className="w-4 h-4" /> },
    medical: { label: 'Medical Symptoms', icon: <Activity className="w-4 h-4" /> },
  };

  return (
    <div className="min-h-screen bg-pink-50/50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-3 sm:p-5 md:p-8 flex justify-center font-sans antialiased selection:bg-pink-500/20 max-w-full overflow-x-hidden">
      <TypingSoundEngine enabled={userProfile.typingSounds !== false} />
      <CuteUiDecorator enabled={userProfile.cuteUiEffects !== false} />
      <div className="max-w-4xl w-full min-w-0 space-y-5 sm:space-y-6">
        
        {!isZenMode && (
          <>
          {/* Header */}
          <Header
            battery={battery}
            onRechargeBattery={handleRechargeBattery}
            onDrainBattery={handleDrainBattery}
            onSetBattery={(level) => setBattery(level)}
            onTogglePanic={() => setIsPanicOpen(true)}
            onOpenLogs={() => setIsLogsOpen(true)}
            onOpenProfile={() => setIsProfileOpen(true)}
            onOpenNotes={() => setIsNotesOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenMixer={() => setIsMixerOpen(true)}
            onTogglePlayPause={handleTogglePlayPause}
            onDailyReset={handleDailyReset}
            userProfile={userProfile}
            onUpdateProfile={handleUpdateProfile}
          />

          {/* Primary Tab Navigation Bar with Thin Scrollbar */}
          <div className="relative group max-w-full min-w-0">
            <nav className="flex gap-2 overflow-x-auto pb-2.5 tab-scrollbar max-w-full min-w-0">
              {customTabOrder.map((tabKey) => {
                const def = tabDefs[tabKey];
                if (!def) return null;

                return (
                  <button
                    key={tabKey}
                    onClick={() => handleSelectTab(tabKey)}
                    className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer shrink-0 ${
                      activeTab === tabKey
                        ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20'
                        : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {def.icon}
                    <span>{def.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
          </>
        )}

        {/* View Panels */}
        <main className={
          isZenMode 
            ? "fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 p-4 sm:p-8 md:p-16 overflow-y-auto flex flex-col"
            : "bg-white/80 dark:bg-slate-900/90 border border-pink-100 dark:border-slate-800 backdrop-blur-xl rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl shadow-pink-500/5 min-w-0 max-w-full overflow-hidden relative"
        }>
          
          <button
            onClick={() => setIsZenMode(!isZenMode)}
            className={`absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${isZenMode ? 'fixed top-6 right-6 z-50 bg-white/50 backdrop-blur shadow-sm border border-slate-200' : ''}`}
            title={isZenMode ? "Exit Zen Mode" : "Enter Zen Mode (Focus)"}
          >
            {isZenMode ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5 text-slate-300 hover:text-slate-600" />}
          </button>
          
          <div className={isZenMode ? "max-w-4xl w-full mx-auto flex-1 mt-8" : ""}>
            {activeTab === 'todo' && (
              <TodoFocusBitsTab
                todos={todos}
                onAddTodo={handleAddTodo}
                onUpdateTodo={handleUpdateTodo}
                onToggleTodo={handleToggleTodo}
                onDeleteTodo={handleDeleteTodo}
                onShatterIntoFocusBits={handleShatterIntoFocusBits}
                onToggleFocusBit={handleToggleFocusBit}
                onSendToSprint={handleSendToSprint}
              />
            )}

            {activeTab === 'sprint' && (
              <MicroSprintTimer
                onLogTask={handleLogTask}
                onDrainBattery={handleDrainBattery}
                activeTaskTitle={activeSprintTaskTitle}
              />
            )}

            {activeTab === 'meditation' && <MeditationTab />}

            {activeTab === 'yoga' && <YogaTab />}

            {activeTab === 'medical' && (
              <MedicalSymptomsTab
                symptomLogs={symptomLogs}
                onAddLog={handleAddSymptomLog}
                onDeleteLog={handleDeleteSymptomLog}
              />
            )}
          </div>
        </main>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 bg-slate-900 border border-slate-700 text-slate-100 text-xs px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce z-40">
            <Sparkles className="w-4 h-4 text-pink-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Overlays & Modals */}
        <PanicOverlay
          isOpen={isPanicOpen}
          onClose={() => setIsPanicOpen(false)}
          onLogTask={handleLogTask}
          totalLogged={userProfile.totalBitsLogged}
        />

        <SessionLogsModal
          isOpen={isLogsOpen}
          onClose={() => setIsLogsOpen(false)}
          logs={sessionLogs}
          onClearLogs={() => setSessionLogs([])}
        />

        <UserProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          profile={userProfile}
          onUpdateProfile={(updated) => {
            handleUpdateProfile(updated);
            triggerToast('Updated profile preferences!');
          }}
          totalFocusBitsLogged={userProfile.totalBitsLogged}
          onOpenAnalytics={() => setIsAnalyticsOpen(true)}
          onManualSync={handleManualSync}
          onResetLevelXP={handleResetLevelXP}
        />

        <SoundscapeMixerModal
          isOpen={isMixerOpen}
          onClose={() => setIsMixerOpen(false)}
          userProfile={userProfile}
          onUpdateProfile={handleUpdateProfile}
          onPlayTrack={handlePlayTrack}
          onTogglePlayPause={handleTogglePlayPause}
          onPlaySoundscape={handlePlaySoundscape}
          onStopAll={handleStopAllAudio}
        />

        {/* Global Spotify & YouTube Music Style Mini Player Bar */}
        <GlobalMusicPlayerBar
          userProfile={userProfile}
          onUpdateProfile={handleUpdateProfile}
          onOpenMixer={() => setIsMixerOpen(true)}
          onPlayTrack={handlePlayTrack}
          onTogglePlayPause={handleTogglePlayPause}
          onNextTrack={handleNextTrack}
          onPrevTrack={handlePrevTrack}
          onStopAll={handleStopAllAudio}
        />

        {/* Persistent Background YouTube Audio Engine (Zero video window, audio continues even when modal closes) */}
        {userProfile.isPlayingMusic && userProfile.currentTrack && (
          <div
            className="fixed -top-[9999px] -left-[9999px] w-1 h-1 opacity-0 pointer-events-none overflow-hidden"
            aria-hidden="true"
          >
            <iframe
              key={userProfile.currentTrack.id + '_' + userProfile.currentTrack.youtubeId}
              width="100"
              height="100"
              src={`https://www.youtube.com/embed/${
                userProfile.currentTrack.youtubeId.includes('videoseries')
                  ? userProfile.currentTrack.youtubeId
                  : userProfile.currentTrack.youtubeId
              }?autoplay=1&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
              title="Background Audio Stream"
              allow="autoplay; encrypted-media"
            />
          </div>
        )}

        <AnalyticsModal
          isOpen={isAnalyticsOpen}
          onClose={() => setIsAnalyticsOpen(false)}
          userProfile={userProfile}
          symptomLogs={symptomLogs}
          sessionLogs={sessionLogs}
          todos={todos}
        />

        <NotesDrawer
          isOpen={isNotesOpen}
          onClose={() => setIsNotesOpen(false)}
          notes={notes}
          onAddNote={handleAddNote}
          onDeleteNote={handleDeleteNote}
          onTogglePin={handleTogglePinNote}
        />

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          userProfile={userProfile}
          profile={userProfile}
          onUpdateProfile={(updated) => {
            handleUpdateProfile(updated);
            triggerToast('Saved settings preferences!');
          }}
          onDailyReset={handleDailyReset}
          onClearAllData={handleClearAllData}
          onResetLevelXP={handleResetLevelXP}
          authUser={authUser}
          onGoogleLogout={async () => {
            await signOut(auth);
            handleClearAllData();
            triggerToast('Signed out & Local Data Cleared');
          }}
        />
      </div>
    </div>
  );
}

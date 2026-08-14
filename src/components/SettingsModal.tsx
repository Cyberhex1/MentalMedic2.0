import React, { useState } from 'react';
import {
  X,
  Settings,
  User,
  LogIn,
  LogOut,
  Sparkles,
  Database,
  FileJson,
  Download,
  Upload,
  Sun,
  Moon,
  AlertTriangle,
  Mail,
  Lock,
  KeyRound,
  UserPlus,
  Sliders,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Trash2,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { UserProfile, AudioType, ActiveTab } from '../types';
import { auth } from '../lib/firebase';
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';

const TAB_DETAILS: Record<ActiveTab, { label: string; desc: string; emoji: string }> = {
  todo: { label: 'To-Do & Focus Bits Matrix', desc: 'Breakdowns, Eisenhower, 1-3-5 & Frog tactics', emoji: '📝' },
  sprint: { label: 'Sprint Engine Timer', desc: 'Timed micro-bursts with encouraging feedback', emoji: '⏱️' },
  meditation: { label: 'Meditation & Pacer', desc: 'Visual breathing orb, audio & somatic grounding', emoji: '🧘' },
  yoga: { label: 'Somatic Adaptive Yoga', desc: 'Low-arousal stretches and vagal nerve resets', emoji: '🌸' },
  medical: { label: 'Medical & Symptom Log', desc: 'Health tracker, triggers, and symptom charts', emoji: '🩺' },
};

const TabOrderCustomizer: React.FC<{
  tabOrder: ActiveTab[];
  onUpdateTabOrder: (order: ActiveTab[]) => void;
}> = ({ tabOrder, onUpdateTabOrder }) => {
  const validTabKeys: ActiveTab[] = ['todo', 'sprint', 'meditation', 'yoga', 'medical'];
  // Ensure all valid keys exist in sanitized order
  const currentKeys = tabOrder.filter((t) => validTabKeys.includes(t));
  const missingKeys = validTabKeys.filter((k) => !currentKeys.includes(k));
  const sanitizedOrder = [...currentKeys, ...missingKeys];

  const moveTab = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...sanitizedOrder];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newOrder.length) return;
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIdx];
    newOrder[targetIdx] = temp;
    onUpdateTabOrder(newOrder);
  };

  const applyPreset = (preset: ActiveTab[]) => {
    onUpdateTabOrder(preset);
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {sanitizedOrder.map((tab, idx) => {
          const detail = TAB_DETAILS[tab] || { label: tab, desc: '', emoji: '📌' };
          return (
            <div
              key={tab}
              className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-2xs hover:border-pink-200 dark:hover:border-slate-600 transition-all"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className="text-base shrink-0">{detail.emoji}</span>
                <div className="overflow-hidden">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                    {detail.label}
                  </h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-400 truncate">
                    {detail.desc}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0 ml-2">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => moveTab(idx, 'up')}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-pink-50 hover:text-pink-600 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer"
                  title="Move Tab Up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={idx === sanitizedOrder.length - 1}
                  onClick={() => moveTab(idx, 'down')}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-pink-50 hover:text-pink-600 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer"
                  title="Move Tab Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preset Order Buttons */}
      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
          Quick Order Presets
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => applyPreset(['todo', 'sprint', 'meditation', 'yoga', 'medical'])}
            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-[11px] font-semibold text-left transition-colors cursor-pointer"
          >
            📝 To-Do First (Default)
          </button>
          <button
            type="button"
            onClick={() => applyPreset(['sprint', 'todo', 'meditation', 'yoga', 'medical'])}
            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-[11px] font-semibold text-left transition-colors cursor-pointer"
          >
            ⏱️ Sprint Timer First
          </button>
          <button
            type="button"
            onClick={() => applyPreset(['meditation', 'yoga', 'todo', 'sprint', 'medical'])}
            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-[11px] font-semibold text-left transition-colors cursor-pointer"
          >
            🧘 Mind & Somatic First
          </button>
          <button
            type="button"
            onClick={() => applyPreset(['medical', 'todo', 'sprint', 'meditation', 'yoga'])}
            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-[11px] font-semibold text-left transition-colors cursor-pointer"
          >
            🩺 Medical Symptoms First
          </button>
        </div>
      </div>
    </div>
  );
};

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: UserProfile;
  profile?: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  authUser: FirebaseUser | null;
  onDailyReset: () => void;
  onClearAllData: () => void;
  onResetLevelXP?: () => void;
  onGoogleLogout?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  userProfile: userProfileProp,
  profile: profileProp,
  onUpdateProfile,
  authUser,
  onDailyReset,
  onClearAllData,
  onResetLevelXP,
  onGoogleLogout,
}) => {
  const currentProfile = userProfileProp || profileProp || {
    name: 'Calm Focus Worker',
    roleTitle: 'Zero-Adrenaline Specialist',
    dailyGoalBits: 5,
    preferredNoise: 'brown',
    avatarEmoji: '🌸',
    totalBitsLogged: 12,
    streakDays: 4,
    panicGroundingPhrase: 'I am completely safe. 1 Focus Bit is enough for today.',
  };

  const [dailyGoal, setDailyGoal] = useState<number>(currentProfile.dailyGoalBits ?? 5);
  const [noiseType, setNoiseType] = useState<AudioType>(currentProfile.preferredNoise ?? 'brown');
  const [panicPhrase, setPanicPhrase] = useState<string>(
    currentProfile.panicGroundingPhrase ?? 'I am completely safe. 1 Focus Bit is enough for today.'
  );
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(currentProfile.theme || 'light');
  const [showConfirmReset, setShowConfirmReset] = useState<boolean>(false);
  const [showConfirmClearAll, setShowConfirmClearAll] = useState<boolean>(false);
  const [showConfirmResetLevel, setShowConfirmResetLevel] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Email/Password Auth state
  const [emailMode, setEmailMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [emailInput, setEmailInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [emailAuthMsg, setEmailAuthMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [isEmailLoading, setIsEmailLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setEmailAuthMsg({ type: 'error', text: 'Please enter your email address.' });
      return;
    }
    if (emailMode !== 'forgot' && !passwordInput.trim()) {
      setEmailAuthMsg({ type: 'error', text: 'Please enter your password.' });
      return;
    }

    setIsEmailLoading(true);
    setEmailAuthMsg(null);

    try {
      if (emailMode === 'signin') {
        const cred = await signInWithEmailAndPassword(auth, emailInput.trim(), passwordInput);
        setEmailAuthMsg({ type: 'success', text: `Signed in as ${cred.user.email}!` });
      } else if (emailMode === 'signup') {
        const cred = await createUserWithEmailAndPassword(auth, emailInput.trim(), passwordInput);
        setEmailAuthMsg({ type: 'success', text: `Account created and signed in as ${cred.user.email}!` });
      } else if (emailMode === 'forgot') {
        await sendPasswordResetEmail(auth, emailInput.trim());
        setEmailAuthMsg({ type: 'success', text: `Password reset link sent to ${emailInput.trim()}!` });
      }
    } catch (err: any) {
      console.warn('Auth Issue:', err);
      let message = err.message || 'Authentication failed.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        message = 'Invalid email or password. Please check your credentials.';
      } else if (err.code === 'auth/wrong-password') {
        message = 'Incorrect password. Please try again or click Forgot Password.';
      } else if (err.code === 'auth/email-already-in-use') {
        message = 'An account with this email already exists. Please switch to Sign In.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      }
      setEmailAuthMsg({ type: 'error', text: message });
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (onGoogleLogout) {
      onGoogleLogout();
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setThemeMode(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...currentProfile,
      dailyGoalBits: dailyGoal,
      preferredNoise: noiseType,
      panicGroundingPhrase: panicPhrase.trim(),
      theme: themeMode,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const downloadJSON = (data: object, filename: string) => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportProfile = () => {
    downloadJSON(currentProfile, `mental_medic_profile_${new Date().toISOString().slice(0, 10)}.json`);
  };

  const handleExportBackup = () => {
    const fullBackup = {
      version: '3.5',
      exportDate: new Date().toISOString(),
      userProfile: currentProfile,
      todos: JSON.parse(localStorage.getItem('zawe_todos') || '[]'),
      symptomLogs: JSON.parse(localStorage.getItem('zawe_symptoms') || '[]'),
      notes: JSON.parse(localStorage.getItem('zawe_notes') || '[]'),
      sessionLogs: JSON.parse(localStorage.getItem('zawe_session_logs') || '[]'),
      battery: parseInt(localStorage.getItem('zawe_battery') || '100', 10),
    };
    downloadJSON(fullBackup, `mental_medic_backup_${new Date().toISOString().slice(0, 10)}.json`);
  };

  const handleImportBackupFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.userProfile) {
          localStorage.setItem('zawe_profile', JSON.stringify(parsed.userProfile));
          onUpdateProfile(parsed.userProfile);
        }
        if (parsed.todos) localStorage.setItem('zawe_todos', JSON.stringify(parsed.todos));
        if (parsed.symptomLogs) localStorage.setItem('zawe_symptoms', JSON.stringify(parsed.symptomLogs));
        if (parsed.notes) localStorage.setItem('zawe_notes', JSON.stringify(parsed.notes));
        if (parsed.sessionLogs) localStorage.setItem('zawe_session_logs', JSON.stringify(parsed.sessionLogs));
        if (parsed.battery) localStorage.setItem('zawe_battery', parsed.battery.toString());

        alert('Backup successfully restored! Reloading application state.');
        window.location.reload();
      } catch (err) {
        alert('Could not parse backup file. Please ensure it is a valid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-pink-200 dark:border-slate-800 rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-pink-50/40 dark:bg-slate-850">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-pink-500" />
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Settings & Account</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-slate-700 dark:text-slate-300">
          
          {/* Account Control & Cloud Sync */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <User className="w-4 h-4 text-pink-500" />
                <span>Account & Cross-Device Cloud Sync</span>
              </h3>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 ${
                  authUser
                    ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {authUser ? <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : null}
                {authUser ? 'Synced Account' : 'Guest / Local Mode'}
              </span>
            </div>

            {authUser ? (
              <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-9 h-9 rounded-full bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-400 flex items-center justify-center font-bold text-sm shrink-0">
                    {authUser.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-slate-800 dark:text-slate-100 truncate">{authUser.email}</p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Cloud Snapshot Live Sync
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 text-xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                {/* Clean Segmented Tab Switcher */}
                <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl gap-1 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setEmailMode('signin');
                      setEmailAuthMsg(null);
                    }}
                    className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                      emailMode === 'signin'
                        ? 'bg-white dark:bg-slate-800 text-pink-600 dark:text-pink-400 shadow-2xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmailMode('signup');
                      setEmailAuthMsg(null);
                    }}
                    className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                      emailMode === 'signup'
                        ? 'bg-white dark:bg-slate-800 text-pink-600 dark:text-pink-400 shadow-2xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Create Account
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmailMode('forgot');
                      setEmailAuthMsg(null);
                    }}
                    className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                      emailMode === 'forgot'
                        ? 'bg-white dark:bg-slate-800 text-pink-600 dark:text-pink-400 shadow-2xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Reset
                  </button>
                </div>

                <form onSubmit={handleEmailAuth} className="space-y-3 pt-1">
                  <div className="space-y-2">
                    <div>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="email"
                          required
                          placeholder="Email address (e.g. name@work.com)"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:border-pink-500 transition-colors"
                        />
                      </div>
                    </div>

                    {emailMode !== 'forgot' && (
                      <div>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type="password"
                            required
                            placeholder="Password (minimum 6 characters)"
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:border-pink-500 transition-colors"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {emailAuthMsg && (
                    <div
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                        emailAuthMsg.type === 'error'
                          ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                          : 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                      }`}
                    >
                      {emailAuthMsg.type === 'error' ? (
                        <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                      ) : (
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      <span>{emailAuthMsg.text}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isEmailLoading}
                    className="w-full py-2 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-pink-500/20 text-xs"
                  >
                    {emailMode === 'signin' && <LogIn className="w-3.5 h-3.5" />}
                    {emailMode === 'signup' && <UserPlus className="w-3.5 h-3.5" />}
                    {emailMode === 'forgot' && <KeyRound className="w-3.5 h-3.5" />}
                    <span>
                      {isEmailLoading
                        ? 'Connecting...'
                        : emailMode === 'signin'
                        ? 'Sign In'
                        : emailMode === 'signup'
                        ? 'Create Account'
                        : 'Send Password Reset Email'}
                    </span>
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Appearance & Cute UI / Audio Toggles */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 space-y-3">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-500" />
              <span>UI & Sensory Effects</span>
            </h3>

            <div className="space-y-3">
              {/* Cute Sound Effects Toggle */}
              <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">Cute Sound Effects</span>
                  <span className="text-[10px] text-slate-400">Chimes, task sparkles, and gentle click sounds</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = currentProfile.cuteSoundEffects === false;
                    onUpdateProfile({ ...currentProfile, cuteSoundEffects: next });
                  }}
                  className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                    currentProfile.cuteSoundEffects !== false ? 'bg-pink-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      currentProfile.cuteSoundEffects !== false ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Mechanical Keyboard Typing Sounds Toggle */}
              <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">Mechanical Keyboard Typing Sounds</span>
                  <span className="text-[10px] text-slate-400">Subtle tactile clicks when typing in text fields</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = currentProfile.typingSounds === false;
                    onUpdateProfile({ ...currentProfile, typingSounds: next });
                  }}
                  className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                    currentProfile.typingSounds !== false ? 'bg-pink-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      currentProfile.typingSounds !== false ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Cute UI Effects Toggle */}
              <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">Cute UI Effects & Sparkles</span>
                  <span className="text-[10px] text-slate-400">Soft pastel glows, floaters, and sparkles</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = currentProfile.cuteUiEffects === false;
                    onUpdateProfile({ ...currentProfile, cuteUiEffects: next });
                  }}
                  className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                    currentProfile.cuteUiEffects !== false ? 'bg-pink-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      currentProfile.cuteUiEffects !== false ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Custom Tab Navigation Order Customizer */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-pink-500" />
                <span>Customize Main Tab Order</span>
              </h3>
              <span className="text-[10px] text-slate-400">Arrange tabs to your preference</span>
            </div>

            <TabOrderCustomizer
              tabOrder={currentProfile.tabOrder || ['todo', 'sprint', 'meditation', 'yoga', 'medical']}
              onUpdateTabOrder={(newOrder) => {
                onUpdateProfile({ ...currentProfile, tabOrder: newOrder });
              }}
            />
          </div>

          {/* Preferences Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">
                Daily Focus Bits Target Scale
              </label>
              <select
                value={dailyGoal}
                onChange={(e) => setDailyGoal(parseInt(e.target.value, 10))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:border-pink-500 cursor-pointer"
              >
                <option value={1}>1 Focus Bit (Crisis Survival Mode 🆘 - Executive Freeze Victory)</option>
                <option value={3}>3 Focus Bits (Low-Adrenaline Micro Flow 🌿)</option>
                <option value={5}>5 Focus Bits (Balanced Baseline Goal ⚖️)</option>
                <option value={8}>8 Focus Bits (High Velocity Focus 🚀)</option>
                <option value={12}>12 Focus Bits (Excellent Day / Peak Capacity 🌟)</option>
              </select>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                1 bit is crisis mode (completing 1 micro-bit defeats paralysis). 12 bits represents an excellent, high-yield day.
              </p>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">
                Preferred Ambient Sound Generator
              </label>
              <select
                value={noiseType}
                onChange={(e) => setNoiseType(e.target.value as AudioType)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:border-pink-500 cursor-pointer"
              >
                <option value="brown">Brown Noise (Deep Calm)</option>
                <option value="pink">Pink Noise (Focused Rest)</option>
                <option value="white">White Noise (Masking)</option>
                <option value="rain">Rain on Glass</option>
                <option value="binaural">40Hz Binaural Waves</option>
                <option value="drone">432Hz Solfeggio Drone</option>
                <option value="park">Sunny Park</option>
                <option value="island_breeze">Island Breeze</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">
                Appearance / Theme Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleThemeChange('light')}
                  className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    themeMode === 'light'
                      ? 'bg-pink-50 dark:bg-pink-950/50 border-pink-500 text-pink-700 dark:text-pink-300 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Light Mode</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleThemeChange('dark')}
                  className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    themeMode === 'dark'
                      ? 'bg-slate-900 border-pink-500 text-white shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span>Dark Mode</span>
                </button>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">
                Panic Mode Grounding Phrase
              </label>
              <input
                type="text"
                value={panicPhrase}
                onChange={(e) => setPanicPhrase(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-pink-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-pink-500/20"
            >
              {saveSuccess ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              <span>{saveSuccess ? 'Preferences Saved!' : 'Save Settings'}</span>
            </button>
          </form>

          {/* Local Offline Data & Backup */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Database className="w-4 h-4 text-pink-500" />
                <span>Local Data Backup & Export</span>
              </h3>
              <span className="px-2 py-0.5 bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 rounded-full text-[10px] font-bold">
                100% Private
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px]">
              Export your profile preferences or a complete snapshot backup of all local tasks, symptom logs, and focus notes.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleExportProfile}
                className="py-2 px-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm text-[11px]"
              >
                <FileJson className="w-3.5 h-3.5 text-pink-500" />
                <span>Export Profile</span>
              </button>

              <button
                type="button"
                onClick={handleExportBackup}
                className="py-2 px-3 bg-pink-500 hover:bg-pink-600 border border-pink-500 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm text-[11px]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Full Backup</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Restore from local JSON backup:</span>
              <label className="py-1 px-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-lg flex items-center gap-1 cursor-pointer text-[10px]">
                <Upload className="w-3 h-3 text-pink-500" />
                <span>Restore JSON</span>
                <input type="file" accept=".json" onChange={handleImportBackupFile} className="hidden" />
              </label>
            </div>
          </div>

          {/* Daily Reset System */}
          <div className="bg-pink-50/50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-900/50 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-pink-500" />
                <span>Daily Reset & Archive</span>
              </h3>
              <span className="text-[10px] text-pink-600 dark:text-pink-400 font-bold">Cleans daily tasks & archives logs</span>
            </div>

            <p className="text-slate-600 dark:text-slate-400 text-[11px]">
              Clicking Daily Reset saves a dated summary entry to your Shift Logs Archive and restores battery to 100% for a clean new day.
            </p>

            {showConfirmReset ? (
              <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-pink-200 dark:border-pink-800 space-y-2">
                <p className="font-bold text-pink-700 dark:text-pink-300">Confirm Daily Reset & Archive?</p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowConfirmReset(false)}
                    className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      onDailyReset();
                      setShowConfirmReset(false);
                      onClose();
                    }}
                    className="px-3 py-1 rounded-lg bg-pink-500 text-white font-bold cursor-pointer"
                  >
                    Yes, Perform Daily Reset
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmReset(true)}
                className="w-full py-2 bg-pink-50 hover:bg-pink-100 dark:bg-pink-950/40 dark:hover:bg-pink-900/50 text-pink-700 dark:text-pink-300 font-bold border border-pink-200 dark:border-pink-800 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-pink-500" />
                <span>Perform Daily Reset & Archive Log</span>
              </button>
            )}
          </div>

          {/* Reset Career Level & XP Progression */}
          <div className="bg-amber-50/50 dark:bg-slate-800/60 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-600" />
                <span>Reset Level, Focus Bits & Streaks</span>
              </h3>
              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold">Resets XP to 0</span>
            </div>

            <p className="text-amber-800 dark:text-amber-300 text-[11px]">
              Reset your career level progression back to Level 1, 0 XP, and streaks while preserving your tasks, symptom logs, and notes.
            </p>

            {showConfirmResetLevel ? (
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-amber-300 dark:border-amber-800 space-y-2">
                <p className="font-bold text-amber-800 dark:text-amber-300">Are you sure you want to reset your level and progress?</p>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowConfirmResetLevel(false)}
                    className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold cursor-pointer text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onResetLevelXP) {
                        onResetLevelXP();
                      } else {
                        onUpdateProfile({ ...currentProfile, xp: 0, totalBitsLogged: 0, streakDays: 0 });
                      }
                      setShowConfirmResetLevel(false);
                    }}
                    className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer text-xs shadow-sm"
                  >
                    Yes, Reset Everything
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmResetLevel(true)}
                className="w-full py-2 bg-amber-100/80 hover:bg-amber-200/80 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-bold border border-amber-300 dark:border-amber-800 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                <span>Reset Level & XP Progress</span>
              </button>
            )}
          </div>

          {/* Danger Zone: Clear All Data */}
          <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 rounded-2xl p-4 space-y-3">
            <h3 className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-500" />
              <span>Reset All App Data</span>
            </h3>

            {showConfirmClearAll ? (
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-rose-200 dark:border-rose-800 space-y-2">
                <p className="font-bold text-rose-700 dark:text-rose-300">Delete all tasks, logs, and stored preferences?</p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowConfirmClearAll(false)}
                    className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      onClearAllData();
                      setShowConfirmClearAll(false);
                      onClose();
                    }}
                    className="px-3 py-1 rounded-lg bg-rose-600 text-white font-bold cursor-pointer"
                  >
                    Wipe All Data
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmClearAll(true)}
                className="w-full py-2 bg-rose-100/60 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-800 rounded-xl transition-all cursor-pointer"
              >
                Wipe Local Storage Data
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

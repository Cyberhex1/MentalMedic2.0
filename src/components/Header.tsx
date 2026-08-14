import React from 'react';
import { Sliders, Volume2, VolumeX, ShieldAlert, FileText, Settings, FileEdit, Cross, Music, Play, Pause, Disc } from 'lucide-react';
import { EnergyBattery } from './EnergyBattery';
import { MindsetPulse } from './MindsetPulse';
import { audioSynth } from '../lib/audioSynth';
import { UserProfile } from '../types';

interface HeaderProps {
  battery: number;
  onRechargeBattery: () => void;
  onDrainBattery: (amount: number) => void;
  onSetBattery?: (level: number) => void;
  onTogglePanic: () => void;
  onOpenLogs: () => void;
  onOpenProfile: () => void;
  onOpenNotes: () => void;
  onOpenSettings: () => void;
  onOpenMixer?: () => void;
  onTogglePlayPause?: () => void;
  onDailyReset: () => void;
  userProfile: UserProfile;
  onUpdateProfile?: (updated: UserProfile) => void;
}

export const Header: React.FC<HeaderProps> = ({
  battery,
  onRechargeBattery,
  onDrainBattery,
  onSetBattery,
  onTogglePanic,
  onOpenLogs,
  onOpenProfile,
  onOpenNotes,
  onOpenSettings,
  onOpenMixer,
  onTogglePlayPause,
  onDailyReset,
  userProfile,
  onUpdateProfile,
}) => {
  const isPlaying = !!userProfile.isPlayingMusic || !!userProfile.activeSoundscape;
  
  const currentTitle = userProfile.currentTrack
    ? userProfile.currentTrack.title
    : userProfile.activeSoundscape === 'brown'
    ? 'Brown Noise'
    : userProfile.activeSoundscape === 'cute_hyper'
    ? 'Hi Popping Synth'
    : 'Focus Music';

  return (
    <div className="space-y-3">
      <header className="bg-white/90 dark:bg-slate-900/90 border border-pink-200/80 dark:border-slate-800 backdrop-blur-xl rounded-2xl p-4 md:px-6 md:py-4 shadow-xl shadow-pink-500/5 flex flex-wrap items-center justify-between gap-4">
        {/* Mental Medic Branding with Medic Sprite */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenProfile}
            className="relative flex items-center justify-center p-1 rounded-2xl bg-white dark:bg-slate-800 border border-pink-300/90 dark:border-slate-700 shadow-sm hover:border-pink-400 hover:shadow transition-all cursor-pointer group"
            title="Open Account Profile"
          >
            {/* Medic Sprite Icon - Clean White & Gentle */}
            <div className="w-9 h-9 rounded-xl bg-pink-50/80 dark:bg-pink-950/50 border border-pink-200 dark:border-pink-900 flex items-center justify-center text-pink-500 relative">
              <Cross className="w-5 h-5 text-pink-500 fill-white dark:fill-slate-900" />
              <span className="absolute -top-1 -right-1 text-xs">{userProfile.avatarEmoji || '🩺'}</span>
            </div>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base md:text-lg font-black tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <span className="text-pink-600 dark:text-pink-400">Mental Medic</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-300 border border-pink-300 dark:border-pink-800 uppercase tracking-wide">
                  v3.5
                </span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Zero-Adrenaline Mind & Task Relief</p>
          </div>
        </div>

        {/* Center Tools: Battery & Single Audio Focus Player */}
        <div className="flex flex-wrap items-center gap-3">
          <EnergyBattery battery={battery} onRecharge={onRechargeBattery} onDrain={onDrainBattery} onSetBattery={onSetBattery} />

          {/* Clean Single Audio Focus Player Control */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-slate-800 dark:to-slate-800 border border-pink-200 dark:border-slate-700 px-3 py-1.5 rounded-full text-xs font-medium text-slate-700 dark:text-slate-300 shadow-2xs">
            <div className="flex items-center gap-1.5">
              {isPlaying ? (
                <div className="flex items-end gap-0.5 h-3 px-0.5">
                  <span className="w-1 bg-pink-500 rounded-full animate-bounce h-2.5"></span>
                  <span className="w-1 bg-pink-500 rounded-full animate-bounce h-3.5 delay-75"></span>
                  <span className="w-1 bg-pink-500 rounded-full animate-bounce h-2 delay-150"></span>
                </div>
              ) : (
                <Music className="w-3.5 h-3.5 text-pink-500" />
              )}

              <span className="max-w-[130px] md:max-w-[180px] truncate text-xs font-bold text-slate-800 dark:text-slate-200" title={currentTitle}>
                {isPlaying ? currentTitle : 'Focus Audio'}
              </span>
            </div>

            {onTogglePlayPause && (
              <button
                type="button"
                onClick={onTogglePlayPause}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  isPlaying
                    ? 'bg-pink-500 text-white shadow-sm shadow-pink-500/30'
                    : 'bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-pink-50 dark:hover:bg-slate-600'
                }`}
                title={isPlaying ? 'Pause Audio' : 'Play Audio'}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3 h-3 fill-current" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-current ml-0.5" />
                    <span>Play</span>
                  </>
                )}
              </button>
            )}

            {onOpenMixer && (
              <button
                type="button"
                onClick={onOpenMixer}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white dark:bg-slate-700 hover:bg-pink-100 dark:hover:bg-pink-950 text-pink-700 dark:text-pink-300 border border-pink-300 dark:border-pink-800 transition-all cursor-pointer shadow-2xs"
                title="Open Focus Music Studio"
              >
                <Sliders className="w-3.5 h-3.5 text-pink-500" />
                <span>Music Studio</span>
              </button>
            )}
          </div>
        </div>

        {/* Action Triggers */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenNotes}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-pink-50 dark:bg-pink-950/40 hover:bg-pink-100 dark:hover:bg-pink-900/50 text-pink-700 dark:text-pink-300 border border-pink-300 dark:border-pink-800 transition-all cursor-pointer"
            title="Open Focus & Somatic Notes"
          >
            <FileEdit className="w-3.5 h-3.5 text-pink-500" />
            <span className="hidden sm:inline">Notes</span>
          </button>

          <button
            onClick={onOpenLogs}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition-all cursor-pointer"
            title="View Archive Logs"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Logs</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-slate-300 dark:border-slate-700"
            title="Open Settings & Account"
          >
            <Settings className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>

          <button
            onClick={onTogglePanic}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-800 shadow-sm transition-all cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
            <span className="hidden sm:inline">Panic Mode</span>
          </button>
        </div>
      </header>

      {/* Mindset Pulse Header Banner with Date Greeting & Anxiety Quotes */}
      <div className="flex justify-center">
        <MindsetPulse />
      </div>
    </div>
  );
};

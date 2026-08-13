import React, { useState } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Music,
  Sliders,
  Sparkles,
  Coffee,
  Keyboard,
  Wind,
  CloudRain,
  Feather,
  Sun,
  Trees,
  Radio,
  Headphones,
  Maximize2,
  Play,
  Square,
} from 'lucide-react';
import { AudioType, UserProfile } from '../types';
import { audioSynth } from '../lib/audioSynth';

interface SoundscapeMixerModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
}

interface SoundItem {
  id: AudioType;
  name: string;
  category: 'Focus & Noise' | 'Music & Vibe' | 'Cute & ASMR' | 'Nature & World';
  icon: React.ReactNode;
  description: string;
}

const SOUNDSCAPES: SoundItem[] = [
  // Focus & Noise
  { id: 'brown', name: 'Brown Noise', category: 'Focus & Noise', icon: <Volume2 className="w-4 h-4 text-amber-500" />, description: 'Deep, warm rumble for executive dysfunction relief' },
  { id: 'pink', name: 'Pink Noise', category: 'Focus & Noise', icon: <Volume2 className="w-4 h-4 text-pink-500" />, description: 'Balanced soft noise for steady sensory flow' },
  { id: 'white', name: 'White Noise', category: 'Focus & Noise', icon: <Volume2 className="w-4 h-4 text-slate-400" />, description: 'Crisp, masking noise for noisy environments' },
  { id: 'binaural', name: 'Binaural Focus', category: 'Focus & Noise', icon: <Headphones className="w-4 h-4 text-indigo-500" />, description: '40Hz Gamma wave entrainment for deep concentration' },
  { id: 'drone', name: '432Hz Zen Drone', category: 'Focus & Noise', icon: <Radio className="w-4 h-4 text-emerald-500" />, description: 'Harmonic 432Hz breathing frequencies' },

  // Music & Vibe
  { id: 'lofi', name: 'Lofi Chill Beats', category: 'Music & Vibe', icon: <Music className="w-4 h-4 text-purple-500" />, description: 'Warm vinyl crackle & mellow chord progression' },
  { id: 'medieval', name: 'Medieval Study', category: 'Music & Vibe', icon: <Feather className="w-4 h-4 text-amber-700" />, description: 'Lute & harp ambient acoustic chords' },
  { id: 'cute_hyper', name: 'Cute Hyper Chiptune', category: 'Music & Vibe', icon: <Sparkles className="w-4 h-4 text-fuchsia-500" />, description: 'Upbeat 8-bit playful synth rhythm' },
  { id: 'cute_chill', name: 'Cute Chill Dreams', category: 'Music & Vibe', icon: <Sparkles className="w-4 h-4 text-pink-400" />, description: 'Dreamy soft pastel pad synth' },

  // Cute & ASMR
  { id: 'asmr_tapping', name: 'ASMR Soft Tapping', category: 'Cute & ASMR', icon: <Sparkles className="w-4 h-4 text-teal-500" />, description: 'Gentle wood & glass fingernail tapping' },
  { id: 'asmr_rustle', name: 'ASMR Page Rustle', category: 'Cute & ASMR', icon: <Feather className="w-4 h-4 text-amber-500" />, description: 'Book page turns & soft whispered murmurs' },
  { id: 'asmr_scratch', name: 'ASMR Soft Brush', category: 'Cute & ASMR', icon: <Sparkles className="w-4 h-4 text-rose-400" />, description: 'Fabric brushing & mic scratch textures' },
  { id: 'keyboard', name: 'Mechanical Keyboard', category: 'Cute & ASMR', icon: <Keyboard className="w-4 h-4 text-indigo-400" />, description: 'Rhythmic mechanical switch clicks' },
  { id: 'coffee', name: 'Coffee Percolator', category: 'Cute & ASMR', icon: <Coffee className="w-4 h-4 text-amber-600" />, description: 'Steaming espresso & bubbling coffee brew' },

  // Nature & World
  { id: 'rain', name: 'Gentle Rain Patter', category: 'Nature & World', icon: <CloudRain className="w-4 h-4 text-blue-500" />, description: 'Soft raindrops on windowpane' },
  { id: 'park', name: 'Sunny Park & Birds', category: 'Nature & World', icon: <Trees className="w-4 h-4 text-emerald-600" />, description: 'Distantly singing birds & gentle breeze' },
  { id: 'island_breeze', name: 'Island Palms & Wind', category: 'Nature & World', icon: <Sun className="w-4 h-4 text-yellow-500" />, description: 'Warm ocean breeze & rustling palm fronds' },
];

export const SoundscapeMixerModal: React.FC<SoundscapeMixerModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onUpdateProfile,
}) => {
  if (!isOpen) return null;

  const activeSoundscapes = userProfile.activeSoundscapes || ['brown'];
  const mixerVolumes = userProfile.mixerVolumes || { brown: 0.5 };

  const handleToggle = (id: AudioType) => {
    const isActive = activeSoundscapes.includes(id);
    let nextActive: AudioType[];
    if (isActive) {
      audioSynth.stopSoundscape(id);
      nextActive = activeSoundscapes.filter((s) => s !== id);
    } else {
      const vol = mixerVolumes[id] ?? 0.5;
      audioSynth.playSoundscape(id, vol);
      nextActive = [...activeSoundscapes, id];
    }

    onUpdateProfile({
      ...userProfile,
      activeSoundscapes: nextActive,
      preferredNoise: nextActive[0] || 'brown',
    });

    if (userProfile.cuteSoundEffects !== false) {
      audioSynth.playClickSound();
    }
  };

  const handleVolumeChange = (id: AudioType, vol: number) => {
    audioSynth.setSoundscapeVolume(id, vol);
    const updatedVolumes = { ...mixerVolumes, [id]: vol };
    onUpdateProfile({
      ...userProfile,
      mixerVolumes: updatedVolumes,
    });
  };

  const handleStopAll = () => {
    audioSynth.stopAllSoundscapes();
    onUpdateProfile({
      ...userProfile,
      activeSoundscapes: [],
    });
  };

  const categories = ['Focus & Noise', 'Music & Vibe', 'Cute & ASMR', 'Nature & World'] as const;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-pink-100 dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-pink-50 to-purple-50 dark:from-slate-800 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-pink-500 text-white rounded-2xl shadow-md shadow-pink-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span>Multi-Track Soundscape Studio</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300">
                  {activeSoundscapes.length} Active
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Layer multiple soundscapes simultaneously and adjust independent volume controls!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeSoundscapes.length > 0 && (
              <button
                onClick={handleStopAll}
                className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
              >
                <Square className="w-3.5 h-3.5" />
                <span>Stop All</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Tracks List */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {categories.map((cat) => {
            const catSounds = SOUNDSCAPES.filter((s) => s.category === cat);
            return (
              <div key={cat} className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-1">
                  {cat}
                </h4>

                <div className="grid sm:grid-cols-2 gap-3">
                  {catSounds.map((s) => {
                    const isActive = activeSoundscapes.includes(s.id);
                    const vol = mixerVolumes[s.id] ?? 0.5;

                    return (
                      <div
                        key={s.id}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          isActive
                            ? 'bg-pink-50/80 dark:bg-pink-950/30 border-pink-300 dark:border-pink-800 shadow-sm'
                            : 'bg-white dark:bg-slate-800/60 border-slate-100 dark:border-slate-800 hover:border-pink-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-white dark:bg-slate-700 shadow-xs">{s.icon}</div>
                            <div>
                              <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">{s.name}</h5>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">{s.description}</p>
                            </div>
                          </div>

                          {s.id === 'lofi' || s.id === 'medieval' ? (
                            <a
                              href={s.id === 'lofi' ? 'https://www.youtube.com/watch?v=jfKfPfyJRdk' : 'https://www.youtube.com/watch?v=yvGCOZlshF4'}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => handleToggle(s.id)}
                              className={`p-2 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                                isActive
                                  ? 'bg-pink-500 text-white shadow-sm shadow-pink-500/30'
                                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                              }`}
                              title={s.id === 'lofi' ? 'Open live Lofi Girl stream on YouTube' : 'Open cozy Medieval Tavern ambient lute music on YouTube'}
                            >
                              {isActive ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                            </a>
                          ) : (
                            <button
                              onClick={() => handleToggle(s.id)}
                              className={`p-2 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                                isActive
                                  ? 'bg-pink-500 text-white shadow-sm shadow-pink-500/30'
                                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                              }`}
                            >
                              {isActive ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>

                        {/* Volume Slider if Active */}
                        {isActive && (
                          <div className="pt-2 border-t border-pink-200/60 dark:border-pink-900/50 flex items-center gap-2 animate-fadeIn">
                            <Volume2 className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.05"
                              value={vol}
                              onChange={(e) => handleVolumeChange(s.id, parseFloat(e.target.value))}
                              className="w-full accent-pink-500 h-1.5 bg-pink-200 dark:bg-pink-900 rounded-lg cursor-pointer"
                            />
                            <span className="text-[10px] font-mono font-bold text-pink-600 dark:text-pink-400 w-8 text-right">
                              {Math.round(vol * 100)}%
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all"
          >
            Done Mixing
          </button>
        </div>
      </div>
    </div>
  );
};

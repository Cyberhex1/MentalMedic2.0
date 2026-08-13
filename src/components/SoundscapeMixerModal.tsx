import React, { useState } from 'react';
import {
  X,
  Volume2,
  Sliders,
  Sparkles,
  Play,
  Square,
  Youtube,
  Plus,
  Trash2,
  Disc,
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
  category: 'Focus & Noise' | 'Music & Vibe';
  icon: React.ReactNode;
  description: string;
}

const SOUNDSCAPES: SoundItem[] = [
  { id: 'brown', name: 'Brown Noise', category: 'Focus & Noise', icon: <Volume2 className="w-4 h-4 text-amber-500" />, description: 'Deep, warm rumble for executive dysfunction relief' },
  { id: 'cute_hyper', name: 'Hi Popping Sound', category: 'Music & Vibe', icon: <Sparkles className="w-4 h-4 text-fuchsia-500" />, description: 'Upbeat 8-bit playful synth rhythm' },
];

export const SoundscapeMixerModal: React.FC<SoundscapeMixerModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onUpdateProfile,
}) => {
  const [ytUrlInput, setYtUrlInput] = useState('');
  const [ytNameInput, setYtNameInput] = useState('');
  const [isAddingPlaylist, setIsAddingPlaylist] = useState(false);

  if (!isOpen) return null;

  const activeSoundscapes = userProfile.activeSoundscapes || ['brown'];
  const mixerVolumes = userProfile.mixerVolumes || { brown: 0.5 };
  const savedYoutubePlaylists = userProfile.youtubePlaylists || [];
  const currentYoutubeUrl = userProfile.currentYoutubeUrl || '';

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
      currentYoutubeUrl: '',
    });
  };

  const parseYoutubeEmbed = (url: string) => {
    try {
      const listMatch = url.match(/[?&]list=([^&]+)/);
      if (listMatch) return `https://www.youtube.com/embed/videoseries?list=${listMatch[1]}&autoplay=1`;
      
      const videoMatch = url.match(/(?:youtu\.be\/|v=|\/v\/|\/embed\/)([^?&\n]+)/);
      if (videoMatch) return `https://www.youtube.com/embed/${videoMatch[1]}?autoplay=1`;
      
      return url;
    } catch {
      return url;
    }
  };

  const handleSavePlaylist = () => {
    if (!ytUrlInput || !ytNameInput) return;
    const newPlaylist = {
      id: Date.now().toString(),
      name: ytNameInput,
      url: ytUrlInput,
    };
    onUpdateProfile({
      ...userProfile,
      youtubePlaylists: [...savedYoutubePlaylists, newPlaylist]
    });
    setYtUrlInput('');
    setYtNameInput('');
    setIsAddingPlaylist(false);
  };

  const handleDeletePlaylist = (id: string) => {
    onUpdateProfile({
      ...userProfile,
      youtubePlaylists: savedYoutubePlaylists.filter(p => p.id !== id)
    });
  };

  const handlePlayYoutube = (url: string) => {
    onUpdateProfile({
      ...userProfile,
      currentYoutubeUrl: url === currentYoutubeUrl ? '' : url
    });
  };

  const categories = ['Focus & Noise', 'Music & Vibe'] as const;

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
                  {activeSoundscapes.length + (currentYoutubeUrl ? 1 : 0)} Active
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Mix your favorite noise with saved YouTube playlists.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(activeSoundscapes.length > 0 || currentYoutubeUrl) && (
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

        {/* Scrollable Tracks & YouTube List */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {/* Native Soundscapes */}
          {categories.map((cat) => {
            const catSounds = SOUNDSCAPES.filter((s) => s.category === cat);
            if (catSounds.length === 0) return null;
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

          {/* YouTube Playlists Section */}
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-1">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                YouTube Playlists
              </h4>
              <button 
                onClick={() => setIsAddingPlaylist(!isAddingPlaylist)}
                className="text-[10px] flex items-center gap-1 font-bold text-pink-500 hover:text-pink-600 cursor-pointer"
              >
                {isAddingPlaylist ? 'Cancel' : <><Plus className="w-3 h-3" /> Add New</>}
              </button>
            </div>

            {isAddingPlaylist && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col gap-3 animate-fadeIn">
                <input
                  type="text"
                  placeholder="Playlist or Video Name (e.g. Lofi Girl)"
                  value={ytNameInput}
                  onChange={(e) => setYtNameInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <input
                  type="text"
                  placeholder="YouTube URL"
                  value={ytUrlInput}
                  onChange={(e) => setYtUrlInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <button
                  onClick={handleSavePlaylist}
                  disabled={!ytUrlInput || !ytNameInput}
                  className="w-full py-2 bg-pink-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs hover:bg-pink-600 transition-colors cursor-pointer"
                >
                  Save to Library
                </button>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-3">
              {savedYoutubePlaylists.map((playlist) => {
                const isActive = currentYoutubeUrl === playlist.url;
                return (
                  <div
                    key={playlist.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isActive
                        ? 'bg-red-50/80 dark:bg-red-950/30 border-red-300 dark:border-red-800 shadow-sm'
                        : 'bg-white dark:bg-slate-800/60 border-slate-100 dark:border-slate-800 hover:border-red-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-xl shadow-xs ${isActive ? 'bg-red-500 text-white' : 'bg-red-100 text-red-600 dark:bg-slate-700 dark:text-red-400'}`}>
                          <Youtube className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{playlist.name}</h5>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">YouTube Stream</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handlePlayYoutube(playlist.url)}
                          className={`p-2 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                            isActive
                              ? 'bg-red-500 text-white shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          {isActive ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleDeletePlaylist(playlist.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Delete Playlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {savedYoutubePlaylists.length === 0 && !isAddingPlaylist && (
                <div className="col-span-full py-8 flex flex-col items-center justify-center text-center px-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                  <Disc className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No playlists saved</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[250px]">
                    Add your favorite Lofi, classical, or ambient YouTube videos to play them here.
                  </p>
                </div>
              )}
            </div>

            {/* Embedded YouTube Player */}
            {currentYoutubeUrl && (
              <div className="mt-4 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg bg-black aspect-video animate-fadeIn">
                <iframe
                  width="100%"
                  height="100%"
                  src={parseYoutubeEmbed(currentYoutubeUrl)}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            )}
          </div>
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

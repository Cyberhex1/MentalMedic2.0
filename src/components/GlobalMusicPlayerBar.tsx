import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Sliders,
  X,
  Disc,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { TrackItem, UserProfile, AudioType } from '../types';

interface GlobalMusicPlayerBarProps {
  userProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onOpenMixer: () => void;
  onPlayTrack: (track: TrackItem) => void;
  onTogglePlayPause: () => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  onDismissBar: () => void;
  onStopAll: () => void;
  embedUrl?: string;
}

export const GlobalMusicPlayerBar: React.FC<GlobalMusicPlayerBarProps> = ({
  userProfile,
  onUpdateProfile,
  onOpenMixer,
  onTogglePlayPause,
  onNextTrack,
  onPrevTrack,
  onDismissBar,
  onStopAll,
  embedUrl,
}) => {
  const [showMiniVideo, setShowMiniVideo] = useState<boolean>(false);
  const currentTrack = userProfile.currentTrack;
  const activeSoundscape = userProfile.activeSoundscape;
  const isPlaying = !!userProfile.isPlayingMusic || !!activeSoundscape;
  const volume = userProfile.musicVolume ?? 0.7;

  // If nothing has ever been selected and not playing, don't show bar
  if (!currentTrack && !activeSoundscape) {
    return null;
  }

  const title = currentTrack
    ? currentTrack.title
    : activeSoundscape === 'brown'
    ? 'Brown Noise (ADHD Focus Rumble)'
    : activeSoundscape === 'cute_hyper'
    ? 'Hi Popping Synth Rhythm'
    : 'Focus Soundscape';

  const subtitle = currentTrack ? currentTrack.artist : 'Procedural Audio Engine';

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onUpdateProfile({
      ...userProfile,
      musicVolume: val,
      mixerVolumes: { ...(userProfile.mixerVolumes || {}), [activeSoundscape || 'brown']: val },
    });
  };

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl bg-slate-900/95 dark:bg-slate-950/95 border border-pink-500/30 backdrop-blur-xl text-white rounded-2xl p-3 md:px-5 md:py-2.5 shadow-2xl shadow-pink-500/20 z-40 animate-slideUp flex flex-col gap-2">
      {/* Mini Video Dock (Collapsible) */}
      {showMiniVideo && currentTrack && embedUrl && (
        <div className="w-full flex items-center justify-between p-2 rounded-xl bg-black/60 border border-slate-800">
          <div className="aspect-video w-48 max-w-full rounded-lg overflow-hidden bg-black shadow-inner">
            <iframe
              src={embedUrl}
              className="w-full h-full"
              title="Mini Focus Player"
              allow="autoplay; encrypted-media; picture-in-picture"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowMiniVideo(false)}
            className="p-1 text-slate-400 hover:text-white rounded-lg"
            title="Hide video dock"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Control Strip */}
      <div className="flex items-center justify-between gap-3">
        {/* Left: Track Info & Animated Wave */}
        <div className="flex items-center gap-3 min-w-0 max-w-[40%]">
          <div
            className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-md cursor-pointer group"
            onClick={onOpenMixer}
            title="Open Focus Music Studio"
          >
            {isPlaying ? (
              <div className="flex items-end gap-0.5 h-4">
                <span className="w-1 bg-white rounded-full animate-bounce h-3"></span>
                <span className="w-1 bg-white rounded-full animate-bounce h-4 delay-75"></span>
                <span className="w-1 bg-white rounded-full animate-bounce h-2 delay-150"></span>
              </div>
            ) : (
              <Disc className="w-5 h-5 text-white/80 group-hover:scale-110 transition-transform" />
            )}
          </div>

          <div className="min-w-0">
            <h4
              className="text-xs font-bold text-slate-100 truncate cursor-pointer hover:text-pink-400 transition-colors"
              onClick={onOpenMixer}
            >
              {title}
            </h4>
            <p className="text-[10px] text-slate-400 truncate">{subtitle}</p>
          </div>
        </div>

        {/* Center: Playback Controls */}
        <div className="flex items-center gap-2 md:gap-3">
          {currentTrack && (
            <button
              type="button"
              onClick={onPrevTrack}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Previous Track"
            >
              <SkipBack className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={onTogglePlayPause}
            className="w-9 h-9 rounded-full bg-pink-500 hover:bg-pink-400 text-white flex items-center justify-center shadow-lg shadow-pink-500/40 transition-all cursor-pointer hover:scale-105 active:scale-95"
            title={isPlaying ? 'Pause (Pauses audio stream)' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-white" />
            ) : (
              <Play className="w-4 h-4 fill-white ml-0.5" />
            )}
          </button>

          {currentTrack && (
            <button
              type="button"
              onClick={onNextTrack}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Next Track"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Right: Volume & Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {currentTrack && (
            <button
              type="button"
              onClick={() => setShowMiniVideo((prev) => !prev)}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                showMiniVideo
                  ? 'bg-pink-500/20 text-pink-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title={showMiniVideo ? 'Hide Mini Screen' : 'Show Mini Screen'}
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1.5">
            {volume === 0 ? (
              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-pink-400" />
            )}
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="w-16 md:w-20 accent-pink-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              title={`Volume: ${Math.round(volume * 100)}%`}
            />
          </div>

          <button
            type="button"
            onClick={onOpenMixer}
            className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-pink-400 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
            title="Open Music Studio"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Studio</span>
          </button>

          {/* Close / Dismiss Bar Button (Hides bar while keeping song playing) */}
          <button
            type="button"
            onClick={onDismissBar}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Minimize / Close player bar (Audio continues playing)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

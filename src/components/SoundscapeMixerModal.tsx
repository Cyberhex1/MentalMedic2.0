import React, { useState } from 'react';
import {
  X,
  Volume2,
  Sliders,
  Sparkles,
  Play,
  Pause,
  Plus,
  Trash2,
  Disc,
  Music2,
  Headphones,
  Search,
  ListMusic,
  Waves,
  ExternalLink,
} from 'lucide-react';
import { AudioType, UserProfile, TrackItem, MusicPlaylist } from '../types';
import { audioSynth } from '../lib/audioSynth';
import { DEFAULT_PLAYLISTS, createCustomPlaylistFromUrl, extractYouTubeId } from '../lib/musicData';

interface SoundscapeMixerModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onPlayTrack: (track: TrackItem, playlist?: MusicPlaylist) => void;
  onTogglePlayPause: () => void;
  onPlaySoundscape: (type: AudioType) => void;
  onStopAll: () => void;
}

export const SoundscapeMixerModal: React.FC<SoundscapeMixerModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onUpdateProfile,
  onPlayTrack,
  onTogglePlayPause,
  onPlaySoundscape,
  onStopAll,
}) => {
  const [activeTab, setActiveTab] = useState<'playlists' | 'soundscapes'>('playlists');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>('pl_lofi');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Add Playlist / Song Form State
  const [isAddingPlaylist, setIsAddingPlaylist] = useState<boolean>(false);
  const [newPlaylistName, setNewPlaylistName] = useState<string>('');
  const [newYoutubeUrl, setNewYoutubeUrl] = useState<string>('');
  const [newTrackTitle, setNewTrackTitle] = useState<string>('');
  const [addSongToExistingId, setAddSongToExistingId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Combine default and user-created playlists
  const allPlaylists: MusicPlaylist[] = [
    ...DEFAULT_PLAYLISTS,
    ...(userProfile.musicPlaylists || []),
  ];

  const selectedPlaylist =
    allPlaylists.find((p) => p.id === selectedPlaylistId) || allPlaylists[0] || DEFAULT_PLAYLISTS[0];

  const currentTrack = userProfile.currentTrack;
  const isPlayingMusic = !!userProfile.isPlayingMusic;
  const activeSoundscape = userProfile.activeSoundscape;
  const masterVolume = userProfile.musicVolume ?? 0.7;

  // Filter tracks by search query
  const filteredTracks = selectedPlaylist.tracks.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYoutubeUrl.trim()) return;

    const newPlaylist = createCustomPlaylistFromUrl(
      newPlaylistName.trim() || 'My YouTube Focus Playlist',
      newYoutubeUrl.trim(),
      newTrackTitle.trim() || undefined
    );

    const updatedUserPlaylists = [...(userProfile.musicPlaylists || []), newPlaylist];
    onUpdateProfile({
      ...userProfile,
      musicPlaylists: updatedUserPlaylists,
    });

    setSelectedPlaylistId(newPlaylist.id);
    setNewPlaylistName('');
    setNewYoutubeUrl('');
    setNewTrackTitle('');
    setIsAddingPlaylist(false);
  };

  const handleAddTrackToCurrentPlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYoutubeUrl.trim() || !addSongToExistingId) return;

    const { videoId } = extractYouTubeId(newYoutubeUrl.trim());
    const newTrack: TrackItem = {
      id: 't_user_' + Date.now(),
      title: newTrackTitle.trim() || newPlaylistName.trim() || 'YouTube Focus Song',
      artist: 'Custom Stream',
      duration: '3:30',
      youtubeId: videoId || newYoutubeUrl.trim(),
      youtubeUrl: newYoutubeUrl.trim(),
    };

    const updatedPlaylists = (userProfile.musicPlaylists || []).map((p) => {
      if (p.id === addSongToExistingId) {
        return { ...p, tracks: [...p.tracks, newTrack] };
      }
      return p;
    });

    // If it was a default playlist, clone it as custom
    if (!userProfile.musicPlaylists?.some((p) => p.id === addSongToExistingId)) {
      const base = DEFAULT_PLAYLISTS.find((p) => p.id === addSongToExistingId);
      if (base) {
        const cloned: MusicPlaylist = {
          ...base,
          id: 'pl_custom_' + Date.now(),
          name: `${base.name} (Custom)`,
          tracks: [...base.tracks, newTrack],
          isCustom: true,
        };
        updatedPlaylists.push(cloned);
        setSelectedPlaylistId(cloned.id);
      }
    }

    onUpdateProfile({
      ...userProfile,
      musicPlaylists: updatedPlaylists,
    });

    setAddSongToExistingId(null);
    setNewYoutubeUrl('');
    setNewTrackTitle('');
    setNewPlaylistName('');
  };

  const handleDeletePlaylist = (playlistId: string) => {
    const updated = (userProfile.musicPlaylists || []).filter((p) => p.id !== playlistId);
    onUpdateProfile({
      ...userProfile,
      musicPlaylists: updated,
    });
    if (selectedPlaylistId === playlistId) {
      setSelectedPlaylistId('pl_lofi');
    }
  };

  const handleDeleteTrack = (trackId: string) => {
    const updated = (userProfile.musicPlaylists || []).map((p) => {
      if (p.id === selectedPlaylist.id) {
        return { ...p, tracks: p.tracks.filter((t) => t.id !== trackId) };
      }
      return p;
    });
    onUpdateProfile({
      ...userProfile,
      musicPlaylists: updated,
    });
  };

  const handlePlayEntirePlaylist = () => {
    if (selectedPlaylist.tracks.length === 0) return;
    const isCurrentPlaylistPlaying =
      isPlayingMusic &&
      selectedPlaylist.tracks.some((t) => t.id === currentTrack?.id);

    if (isCurrentPlaylistPlaying) {
      onTogglePlayPause();
    } else {
      onPlayTrack(selectedPlaylist.tracks[0], selectedPlaylist);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 animate-fadeIn">
      <div className="bg-slate-950 border border-slate-800 text-slate-100 rounded-3xl max-w-4xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="p-4 md:px-6 md:py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-pink-500 to-purple-600 text-white rounded-2xl shadow-md shadow-pink-500/20">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white tracking-tight">Focus Music & Sound Studio</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30">
                  Spotify & YT Music Style
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Play zero-ad streams & neural soundscapes without popups or videos
              </p>
            </div>
          </div>

          {/* Mode Switcher & Close */}
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex gap-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('playlists')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'playlists'
                    ? 'bg-pink-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ListMusic className="w-3.5 h-3.5" />
                <span>Playlists</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('soundscapes')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'soundscapes'
                    ? 'bg-pink-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Waves className="w-3.5 h-3.5" />
                <span>Soundscapes</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {activeTab === 'playlists' ? (
            <>
              {/* Left Sidebar: Playlists List */}
              <div className="w-full md:w-72 border-b md:border-b-0 md:border-r border-slate-800/80 bg-slate-900/40 p-4 flex flex-col gap-3 overflow-y-auto">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Your Playlists
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingPlaylist(true);
                      setAddSongToExistingId(null);
                    }}
                    className="text-xs font-bold text-pink-400 hover:text-pink-300 flex items-center gap-1 bg-pink-500/10 hover:bg-pink-500/20 px-2 py-1 rounded-lg border border-pink-500/20 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add YouTube</span>
                  </button>
                </div>

                {/* Playlist Cards */}
                <div className="space-y-1.5 flex-1">
                  {allPlaylists.map((pl) => {
                    const isSelected = pl.id === selectedPlaylist.id;
                    const isThisPlaylistPlaying =
                      isPlayingMusic && pl.tracks.some((t) => t.id === currentTrack?.id);

                    return (
                      <div
                        key={pl.id}
                        onClick={() => setSelectedPlaylistId(pl.id)}
                        className={`group p-2.5 rounded-2xl flex items-center justify-between gap-2.5 cursor-pointer transition-all border ${
                          isSelected
                            ? 'bg-slate-800/90 border-pink-500/50 shadow-md text-white'
                            : 'bg-slate-900/30 border-transparent hover:bg-slate-800/50 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl bg-gradient-to-br ${
                              pl.coverGradient || 'from-pink-500 to-purple-600'
                            } flex items-center justify-center text-base shadow-sm shrink-0`}
                          >
                            {pl.icon || '🎵'}
                          </div>
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold truncate flex items-center gap-1.5">
                              <span>{pl.name}</span>
                              {isThisPlaylistPlaying && (
                                <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span>
                              )}
                            </h5>
                            <p className="text-[10px] text-slate-400 truncate">
                              {pl.tracks.length} {pl.tracks.length === 1 ? 'song' : 'songs'}
                            </p>
                          </div>
                        </div>

                        {pl.isCustom && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePlaylist(pl.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-700 transition-all cursor-pointer"
                            title="Delete Playlist"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Main Area: Playlist Header & Tracklist (Spotify Style) */}
              <div className="flex-1 flex flex-col overflow-y-auto bg-slate-950 p-4 md:p-6 space-y-4">
                {/* Playlist Hero Banner */}
                <div
                  className={`p-5 md:p-6 rounded-3xl bg-gradient-to-r ${
                    selectedPlaylist.coverGradient || 'from-pink-600 to-purple-800'
                  } text-white shadow-xl flex flex-col md:flex-row items-start md:items-end justify-between gap-4`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner shrink-0">
                      {selectedPlaylist.icon || '🎵'}
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/80">
                        Playlist
                      </span>
                      <h2 className="text-xl md:text-2xl font-black tracking-tight">{selectedPlaylist.name}</h2>
                      <p className="text-xs text-white/80 max-w-md line-clamp-2 mt-1">
                        {selectedPlaylist.description || 'Curated zero-stress focus tracks'}
                      </p>
                    </div>
                  </div>

                  {/* Play Master Button */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handlePlayEntirePlaylist}
                      className="px-5 py-2.5 rounded-full bg-white text-slate-950 hover:bg-white/90 font-black text-xs flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                      {isPlayingMusic && selectedPlaylist.tracks.some((t) => t.id === currentTrack?.id) ? (
                        <>
                          <Pause className="w-4 h-4 fill-slate-950" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-slate-950 ml-0.5" />
                          <span>Play All</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setAddSongToExistingId(selectedPlaylist.id)}
                      className="p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-all cursor-pointer"
                      title="Add song to this playlist"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="flex items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-xs">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search songs in playlist..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <span className="text-[11px] text-slate-500 font-semibold">
                    {filteredTracks.length} {filteredTracks.length === 1 ? 'Track' : 'Tracks'}
                  </span>
                </div>

                {/* Tracklist Table (Spotify Style) */}
                <div className="bg-slate-900/40 rounded-2xl border border-slate-800/80 overflow-hidden">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 px-4 py-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <div className="col-span-1 text-center">#</div>
                    <div className="col-span-6">Title & Artist</div>
                    <div className="col-span-3 text-right">Duration</div>
                    <div className="col-span-2 text-center">Play</div>
                  </div>

                  {/* Table Rows */}
                  <div className="divide-y divide-slate-800/50">
                    {filteredTracks.length === 0 ? (
                      <div className="py-8 text-center text-slate-500 text-xs">
                        No songs found matching your search.
                      </div>
                    ) : (
                      filteredTracks.map((track, idx) => {
                        const isThisTrackPlaying =
                          isPlayingMusic && currentTrack?.id === track.id;

                        return (
                          <div
                            key={track.id}
                            className={`grid grid-cols-12 items-center px-4 py-2.5 text-xs transition-colors group ${
                              isThisTrackPlaying
                                ? 'bg-pink-500/10 text-pink-400'
                                : 'hover:bg-slate-800/50 text-slate-300'
                            }`}
                          >
                            {/* Track Number or Animated Wave */}
                            <div className="col-span-1 text-center font-mono font-bold text-[11px] text-slate-400">
                              {isThisTrackPlaying ? (
                                <div className="flex items-end justify-center gap-0.5 h-3">
                                  <span className="w-0.5 bg-pink-400 rounded-full animate-bounce h-2"></span>
                                  <span className="w-0.5 bg-pink-400 rounded-full animate-bounce h-3 delay-75"></span>
                                  <span className="w-0.5 bg-pink-400 rounded-full animate-bounce h-1.5 delay-150"></span>
                                </div>
                              ) : (
                                idx + 1
                              )}
                            </div>

                            {/* Title & Artist */}
                            <div className="col-span-6 min-w-0 pr-2">
                              <h5
                                className={`font-bold text-xs truncate cursor-pointer hover:underline ${
                                  isThisTrackPlaying ? 'text-pink-400' : 'text-white'
                                }`}
                                onClick={() => {
                                  if (isThisTrackPlaying) {
                                    onTogglePlayPause();
                                  } else {
                                    onPlayTrack(track, selectedPlaylist);
                                  }
                                }}
                              >
                                {track.title}
                              </h5>
                              <p className="text-[10px] text-slate-400 truncate">{track.artist}</p>
                            </div>

                            {/* Duration */}
                            <div className="col-span-3 text-right text-[11px] font-mono text-slate-400">
                              {track.duration || 'Stream'}
                            </div>

                            {/* Action Play/Pause & Remove */}
                            <div className="col-span-2 flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  if (isThisTrackPlaying) {
                                    onTogglePlayPause();
                                  } else {
                                    onPlayTrack(track, selectedPlaylist);
                                  }
                                }}
                                className={`p-1.5 rounded-full font-bold transition-all cursor-pointer ${
                                  isThisTrackPlaying
                                    ? 'bg-pink-500 text-white shadow-md'
                                    : 'bg-slate-800 text-slate-300 hover:bg-pink-500 hover:text-white'
                                }`}
                                title={isThisTrackPlaying ? 'Pause Track' : 'Play Track'}
                              >
                                {isThisTrackPlaying ? (
                                  <Pause className="w-3.5 h-3.5 fill-current" />
                                ) : (
                                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                                )}
                              </button>

                              {selectedPlaylist.isCustom && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTrack(track.id)}
                                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded-md transition-all cursor-pointer"
                                  title="Remove Track"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Focus Soundscapes Tab */
            <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-950">
              <div>
                <h4 className="text-sm font-extrabold uppercase tracking-wider text-pink-400 mb-1">
                  Procedural Focus Noise & Synthesizers
                </h4>
                <p className="text-xs text-slate-400">
                  Instant, continuous neural acoustic relief without external video links. Only 1 sound plays at a time.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Brown Noise Card */}
                <div
                  className={`p-5 rounded-3xl border transition-all ${
                    activeSoundscape === 'brown'
                      ? 'bg-pink-950/40 border-pink-500/60 shadow-lg shadow-pink-500/10'
                      : 'bg-slate-900/60 border-slate-800 hover:border-pink-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        <Volume2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Brown Noise</h4>
                        <p className="text-[11px] text-slate-400">Deep, warm low-frequency rumble for ADHD & executive dysfunction</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onPlaySoundscape('brown')}
                      className={`p-2.5 rounded-2xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                        activeSoundscape === 'brown'
                          ? 'bg-pink-500 text-white shadow-md shadow-pink-500/30'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                      title={activeSoundscape === 'brown' ? 'Pause Noise' : 'Play Noise'}
                    >
                      {activeSoundscape === 'brown' ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                    </button>
                  </div>

                  {activeSoundscape === 'brown' && (
                    <div className="pt-3 border-t border-pink-500/20 flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-pink-400 shrink-0" />
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={masterVolume}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          onUpdateProfile({
                            ...userProfile,
                            musicVolume: val,
                            mixerVolumes: { ...(userProfile.mixerVolumes || {}), brown: val },
                          });
                          audioSynth.setSoundscapeVolume('brown', val);
                        }}
                        className="w-full accent-pink-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                      />
                      <span className="text-xs font-mono font-bold text-pink-400 w-10 text-right">
                        {Math.round(masterVolume * 100)}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Cute Hyper Hi Popping Synth */}
                <div
                  className={`p-5 rounded-3xl border transition-all ${
                    activeSoundscape === 'cute_hyper'
                      ? 'bg-pink-950/40 border-pink-500/60 shadow-lg shadow-pink-500/10'
                      : 'bg-slate-900/60 border-slate-800 hover:border-pink-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Hi Popping Rhythm</h4>
                        <p className="text-[11px] text-slate-400">Playful 8-bit algorithmic bell notes for dopamine replenishment</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onPlaySoundscape('cute_hyper')}
                      className={`p-2.5 rounded-2xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                        activeSoundscape === 'cute_hyper'
                          ? 'bg-pink-500 text-white shadow-md shadow-pink-500/30'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                      title={activeSoundscape === 'cute_hyper' ? 'Pause Synth' : 'Play Synth'}
                    >
                      {activeSoundscape === 'cute_hyper' ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                    </button>
                  </div>

                  {activeSoundscape === 'cute_hyper' && (
                    <div className="pt-3 border-t border-pink-500/20 flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-pink-400 shrink-0" />
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={masterVolume}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          onUpdateProfile({
                            ...userProfile,
                            musicVolume: val,
                            mixerVolumes: { ...(userProfile.mixerVolumes || {}), cute_hyper: val },
                          });
                          audioSynth.setSoundscapeVolume('cute_hyper', val);
                        }}
                        className="w-full accent-pink-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                      />
                      <span className="text-xs font-mono font-bold text-pink-400 w-10 text-right">
                        {Math.round(masterVolume * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Sub-Dialogs: Add YouTube Playlist / Song */}
        {(isAddingPlaylist || addSongToExistingId) && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-60 animate-fadeIn">
            <div className="bg-slate-900 border border-pink-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400">
                    <Music2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {addSongToExistingId ? 'Add Song to Playlist' : 'Add YouTube Focus Playlist'}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Converts YouTube links to audio tracks with no video display
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingPlaylist(false);
                    setAddSongToExistingId(null);
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={addSongToExistingId ? handleAddTrackToCurrentPlaylist : handleCreatePlaylist}
                className="space-y-3 text-xs"
              >
                {!addSongToExistingId && (
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Playlist Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Chillhop Afternoon Focus"
                      value={newPlaylistName}
                      onChange={(e) => setNewPlaylistName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-pink-500 font-medium"
                    />
                  </div>
                )}

                <div>
                  <label className="font-bold text-slate-300 block mb-1">YouTube URL or Video Link</label>
                  <input
                    type="text"
                    required
                    placeholder="https://www.youtube.com/watch?v=... or playlist link"
                    value={newYoutubeUrl}
                    onChange={(e) => setNewYoutubeUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-pink-500 font-medium"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Accepts playlists (<code className="text-pink-400">list=...</code>) or individual videos.
                  </p>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Track Title (Optional)</label>
                  <input
                    type="text"
                    placeholder="Custom track name..."
                    value={newTrackTitle}
                    onChange={(e) => setNewTrackTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-pink-500 font-medium"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingPlaylist(false);
                      setAddSongToExistingId(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold cursor-pointer shadow-md shadow-pink-500/20"
                  >
                    {addSongToExistingId ? 'Add Song' : 'Create Playlist'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Bottom Bar */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="w-4 h-4 text-pink-400" />
            <span>Music continues playing smoothly when you close this studio modal.</span>
          </div>

          <div className="flex items-center gap-2">
            {(isPlayingMusic || activeSoundscape) && (
              <button
                type="button"
                onClick={onStopAll}
                className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 font-bold text-xs border border-rose-500/30 transition-all cursor-pointer"
              >
                Stop All Audio
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-md shadow-pink-500/20 transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  X,
  Volume2,
  Play,
  Pause,
  Plus,
  Trash2,
  Music2,
  Headphones,
  Search,
  ListMusic,
  Waves,
  ArrowLeft,
  Youtube,
  Radio,
  Check,
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
  // Two-screen navigation for playlists: 'grid' -> 'tracks'
  const [playlistView, setPlaylistView] = useState<'grid' | 'tracks'>('grid');
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

  // Filter playlists or tracks by search
  const filteredPlaylists = allPlaylists.filter(
    (pl) =>
      pl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pl.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pl.tracks.some((t) => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredTracks = selectedPlaylist.tracks.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenPlaylistTracks = (playlistId: string) => {
    setSelectedPlaylistId(playlistId);
    setPlaylistView('tracks');
    setSearchQuery('');
  };

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
    setPlaylistView('tracks');
    setNewPlaylistName('');
    setNewYoutubeUrl('');
    setNewTrackTitle('');
    setIsAddingPlaylist(false);
  };

  const handleAddTrackToCurrentPlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYoutubeUrl.trim() || !addSongToExistingId) return;

    const { videoId, playlistId } = extractYouTubeId(newYoutubeUrl.trim());
    const newTrack: TrackItem = {
      id: 't_user_' + Date.now(),
      title: newTrackTitle.trim() || (playlistId ? 'Continuous YouTube Playlist' : 'YouTube Focus Song'),
      artist: playlistId ? 'YouTube Playlist Queue' : 'Custom Stream',
      duration: playlistId ? 'Playlist Queue' : '3:30',
      youtubeId: playlistId ? `videoseries?list=${playlistId}` : videoId || newYoutubeUrl.trim(),
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
    setIsAddingPlaylist(false);
  };

  const handleDeletePlaylist = (playlistId: string) => {
    const updated = (userProfile.musicPlaylists || []).filter((p) => p.id !== playlistId);
    onUpdateProfile({
      ...userProfile,
      musicPlaylists: updated,
    });
    if (selectedPlaylistId === playlistId) {
      setSelectedPlaylistId('pl_lofi');
      setPlaylistView('grid');
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
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-3 md:p-6 animate-fadeIn">
      <div className="bg-slate-950 border border-slate-800 text-slate-100 rounded-3xl max-w-4xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="p-4 md:px-6 md:py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/80 shrink-0">
          <div className="flex items-center gap-3">
            {activeTab === 'playlists' && playlistView === 'tracks' ? (
              <button
                type="button"
                onClick={() => setPlaylistView('grid')}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-pink-400 hover:text-white transition-all flex items-center gap-1.5 font-bold text-xs cursor-pointer shadow-sm"
                title="Back to All Playlists"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>All Playlists</span>
              </button>
            ) : (
              <div className="p-2.5 bg-gradient-to-tr from-pink-500 to-purple-600 text-white rounded-2xl shadow-md shadow-pink-500/20">
                <Headphones className="w-5 h-5" />
              </div>
            )}
            <div>
              <h3 className="text-base font-black text-white tracking-tight">
                {activeTab === 'playlists' && playlistView === 'tracks'
                  ? selectedPlaylist.name
                  : 'Focus Music & Sound Studio'}
              </h3>
              <p className="text-xs text-slate-400">
                {activeTab === 'playlists' && playlistView === 'tracks'
                  ? `${selectedPlaylist.tracks.length} tracks • Click any song to play`
                  : 'Choose a playlist or acoustic soundscape'}
              </p>
            </div>
          </div>

          {/* Mode Switcher & Close */}
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex gap-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('playlists');
                }}
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
        <div className="flex-1 overflow-y-auto bg-slate-950 p-4 md:p-6">
          {activeTab === 'playlists' ? (
            playlistView === 'grid' ? (
              /* SCREEN 1: FULL-WIDTH PLAYLISTS GRID */
              <div className="space-y-6">
                {/* Search & Add Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search playlists or songs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingPlaylist(true);
                      setAddSongToExistingId(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-pink-500/20 transition-all cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add YouTube Playlist</span>
                  </button>
                </div>

                {/* Grid of Playlist Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                  {filteredPlaylists.map((pl) => {
                    const isThisPlaylistPlaying =
                      isPlayingMusic && pl.tracks.some((t) => t.id === currentTrack?.id);

                    return (
                      <div
                        key={pl.id}
                        onClick={() => handleOpenPlaylistTracks(pl.id)}
                        className={`group p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                          isThisPlaylistPlaying
                            ? 'bg-slate-900 border-pink-500/60 shadow-xl shadow-pink-500/10 ring-1 ring-pink-500/30'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90 shadow-md'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3.5">
                            <div
                              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${
                                pl.coverGradient || 'from-pink-500 to-purple-600'
                              } flex items-center justify-center text-2xl shadow-lg shrink-0`}
                            >
                              {pl.icon || '🎵'}
                            </div>
                            <div>
                              <h4 className="text-base font-bold text-white group-hover:text-pink-400 transition-colors flex items-center gap-2">
                                <span>{pl.name}</span>
                                {isThisPlaylistPlaying && (
                                  <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse"></span>
                                )}
                              </h4>
                              <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                                {pl.description || 'Focus soundtrack collection'}
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
                              className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-rose-400 rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
                              title="Delete Playlist"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* Bottom Info & Action */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                          <span className="text-[11px] font-bold text-slate-400">
                            {pl.tracks.length} {pl.tracks.length === 1 ? 'track' : 'tracks'}
                          </span>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-pink-400 group-hover:underline">
                              Choose Tracks →
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isThisPlaylistPlaying) {
                                  onTogglePlayPause();
                                } else if (pl.tracks.length > 0) {
                                  onPlayTrack(pl.tracks[0], pl);
                                }
                              }}
                              className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-md shadow-pink-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                              title="Play Playlist"
                            >
                              {isThisPlaylistPlaying ? (
                                <Pause className="w-3.5 h-3.5 fill-white" />
                              ) : (
                                <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* SCREEN 2: FULL-WIDTH TRACK CHOOSER */
              <div className="space-y-6 animate-fadeIn">
                {/* Playlist Hero Banner */}
                <div
                  className={`p-6 rounded-3xl bg-gradient-to-r ${
                    selectedPlaylist.coverGradient || 'from-pink-600 to-purple-800'
                  } text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner shrink-0">
                      {selectedPlaylist.icon || '🎵'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/80">
                          Playlist
                        </span>
                        {selectedPlaylist.isCustom && (
                          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                            Custom
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl md:text-2xl font-black tracking-tight">{selectedPlaylist.name}</h2>
                      <p className="text-xs text-white/80 max-w-xl line-clamp-2 mt-1">
                        {selectedPlaylist.description || 'Curated zero-stress focus tracks'}
                      </p>
                    </div>
                  </div>

                  {/* Play & Add Actions */}
                  <div className="flex items-center gap-3 shrink-0 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingPlaylist(true);
                        setAddSongToExistingId(selectedPlaylist.id);
                      }}
                      className="px-4 py-2.5 rounded-full bg-black/20 hover:bg-black/30 text-white font-bold text-xs flex items-center gap-2 border border-white/20 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Song</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePlayEntirePlaylist}
                      className="px-6 py-2.5 rounded-full bg-white text-slate-950 hover:bg-white/90 font-black text-xs flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                      {isPlayingMusic && selectedPlaylist.tracks.some((t) => t.id === currentTrack?.id) ? (
                        <>
                          <Pause className="w-4 h-4 fill-slate-950" />
                          <span>Pause Playlist</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-slate-950 ml-0.5" />
                          <span>Play Continuous Queue</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Track Chooser Search & Filter */}
                <div className="flex items-center justify-between gap-4">
                  <h4 className="text-sm font-black text-white tracking-tight flex items-center gap-2">
                    <ListMusic className="w-4 h-4 text-pink-400" />
                    <span>Track List ({selectedPlaylist.tracks.length})</span>
                  </h4>

                  <div className="relative w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Filter tracks in this playlist..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </div>

                {/* Full-Width Spacious Track Table */}
                <div className="bg-slate-900/60 rounded-3xl border border-slate-800/80 overflow-hidden shadow-lg">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 px-5 py-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-800 bg-slate-900/80">
                    <div className="col-span-1 text-center">#</div>
                    <div className="col-span-8 md:col-span-7">Title & Artist</div>
                    <div className="hidden md:block md:col-span-2 text-right">Duration</div>
                    <div className="col-span-3 md:col-span-2 text-center">Action</div>
                  </div>

                  {/* Table Rows */}
                  <div className="divide-y divide-slate-800/50">
                    {filteredTracks.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-xs">
                        No tracks match your search in this playlist.
                      </div>
                    ) : (
                      filteredTracks.map((track, idx) => {
                        const isThisTrackPlaying =
                          isPlayingMusic && currentTrack?.id === track.id;

                        return (
                          <div
                            key={track.id}
                            onClick={() => {
                              if (isThisTrackPlaying) {
                                onTogglePlayPause();
                              } else {
                                onPlayTrack(track, selectedPlaylist);
                              }
                            }}
                            className={`grid grid-cols-12 items-center px-5 py-3.5 text-xs transition-all cursor-pointer group ${
                              isThisTrackPlaying
                                ? 'bg-pink-500/15 text-pink-300 font-medium'
                                : 'hover:bg-slate-800/60 text-slate-300'
                            }`}
                          >
                            {/* Track Number or Animated Wave */}
                            <div className="col-span-1 flex items-center justify-center font-mono text-xs text-slate-400">
                              {isThisTrackPlaying ? (
                                <div className="flex items-end gap-0.5 h-3.5">
                                  <span className="w-1 bg-pink-500 rounded-full animate-bounce h-3"></span>
                                  <span className="w-1 bg-pink-500 rounded-full animate-bounce h-3.5 delay-75"></span>
                                  <span className="w-1 bg-pink-500 rounded-full animate-bounce h-2 delay-150"></span>
                                </div>
                              ) : (
                                <span>{idx + 1}</span>
                              )}
                            </div>

                            {/* Title & Artist */}
                            <div className="col-span-8 md:col-span-7 min-w-0 pr-3">
                              <h5
                                className={`font-bold text-sm truncate ${
                                  isThisTrackPlaying
                                    ? 'text-pink-400'
                                    : 'text-white group-hover:text-pink-300 transition-colors'
                                }`}
                              >
                                {track.title}
                              </h5>
                              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                {track.artist}
                              </p>
                            </div>

                            {/* Duration */}
                            <div className="hidden md:block md:col-span-2 text-right text-xs font-mono text-slate-400">
                              {track.duration || 'Stream'}
                            </div>

                            {/* Play Button & Remove */}
                            <div className="col-span-3 md:col-span-2 flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (isThisTrackPlaying) {
                                    onTogglePlayPause();
                                  } else {
                                    onPlayTrack(track, selectedPlaylist);
                                  }
                                }}
                                className={`p-2 rounded-full transition-all cursor-pointer ${
                                  isThisTrackPlaying
                                    ? 'bg-pink-500 text-white shadow-md shadow-pink-500/40 scale-105'
                                    : 'bg-slate-800 text-slate-300 group-hover:bg-pink-500 group-hover:text-white'
                                }`}
                                title={isThisTrackPlaying ? 'Pause' : 'Play Track'}
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
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteTrack(track.id);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition-all cursor-pointer"
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
            )
          ) : (
            /* TAB 2: PROCEDURAL SOUNDSCAPES & ACOUSTICS */
            <div className="space-y-6">
              <div>
                <h4 className="text-base font-black text-white tracking-tight">
                  Neural Noise & Synthesizers
                </h4>
                <p className="text-xs text-slate-400">
                  Instant, continuous acoustic relief. Only 1 sound plays at a time.
                </p>
              </div>

              {/* Brown Noise */}
              <div
                className={`p-5 rounded-3xl border transition-all ${
                  activeSoundscape === 'brown'
                    ? 'bg-amber-950/30 border-amber-500/50 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      <Radio className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Brown Noise (ADHD Rumble)</h4>
                      <p className="text-xs text-slate-400">
                        Deep low-frequency acoustic mask that silences intrusive background noise.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onPlaySoundscape('brown')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer ${
                      activeSoundscape === 'brown'
                        ? 'bg-amber-500 text-slate-950 shadow-amber-500/30'
                        : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    {activeSoundscape === 'brown' ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Play Noise</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-slate-800/80">
                  <Volume2 className="w-4 h-4 text-amber-400" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={masterVolume}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      onUpdateProfile({
                        ...userProfile,
                        musicVolume: v,
                      });
                      if (activeSoundscape === 'brown') {
                        audioSynth.setSoundscapeVolume('brown', v);
                      }
                    }}
                    className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <span className="text-[11px] font-mono text-slate-400 w-10 text-right">
                    {Math.round(masterVolume * 100)}%
                  </span>
                </div>
              </div>

              {/* Hi Popping Rhythm */}
              <div
                className={`p-5 rounded-3xl border transition-all ${
                  activeSoundscape === 'cute_hyper'
                    ? 'bg-fuchsia-950/30 border-fuchsia-500/50 shadow-lg shadow-fuchsia-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30">
                      <Volume2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Hi Popping Rhythm</h4>
                      <p className="text-xs text-slate-400">
                        Playful procedural synth pops that stimulate momentum and dopamine.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onPlaySoundscape('cute_hyper')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer ${
                      activeSoundscape === 'cute_hyper'
                        ? 'bg-fuchsia-500 text-white shadow-fuchsia-500/30'
                        : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    {activeSoundscape === 'cute_hyper' ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Play Rhythm</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-slate-800/80">
                  <Volume2 className="w-4 h-4 text-fuchsia-400" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={masterVolume}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      onUpdateProfile({
                        ...userProfile,
                        musicVolume: v,
                      });
                      if (activeSoundscape === 'cute_hyper') {
                        audioSynth.setSoundscapeVolume('cute_hyper', v);
                      }
                    }}
                    className="w-full accent-fuchsia-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <span className="text-[11px] font-mono text-slate-400 w-10 text-right">
                    {Math.round(masterVolume * 100)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Add YouTube Playlist / Song Form Modal */}
        {isAddingPlaylist && (
          <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 text-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-scaleUp">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-red-500/20 text-red-400">
                    <Youtube className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {addSongToExistingId ? 'Add Song to Playlist' : 'Add YouTube Focus Playlist'}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Supports full YouTube playlist links or individual video URLs
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingPlaylist(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={
                  addSongToExistingId ? handleAddTrackToCurrentPlaylist : handleCreatePlaylist
                }
                className="space-y-3"
              >
                {!addSongToExistingId && (
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Playlist Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Lofi Chill Afternoon / Synthwave"
                      value={newPlaylistName}
                      onChange={(e) => setNewPlaylistName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-pink-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    YouTube URL (Full Playlist or Video URL)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="https://www.youtube.com/playlist?list=... or video URL"
                    value={newYoutubeUrl}
                    onChange={(e) => setNewYoutubeUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-pink-500 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Track / Stream Title (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Chillhop Beats"
                    value={newTrackTitle}
                    onChange={(e) => setNewTrackTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingPlaylist(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-xs font-bold text-white shadow-md shadow-pink-500/20"
                  >
                    {addSongToExistingId ? 'Add Song' : 'Load Full Playlist'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Bottom Bar */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/60 flex items-center justify-end gap-2 shrink-0">
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
  );
};

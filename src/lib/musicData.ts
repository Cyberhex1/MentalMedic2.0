import { MusicPlaylist, TrackItem } from '../types';

export const DEFAULT_PLAYLISTS: MusicPlaylist[] = [
  {
    id: 'pl_lofi',
    name: 'Lofi Study & Work Sanctuary',
    description: 'Chill aesthetic beats, zero-stress vinyl rhythms, and soft melodies for deep focus.',
    coverGradient: 'from-pink-500 via-purple-500 to-indigo-500',
    icon: '☕',
    tracks: [
      {
        id: 't_lofi_1',
        title: 'beats to relax/study to',
        artist: 'Lofi Girl',
        duration: 'Live Stream',
        youtubeId: 'jfKfPfyJRdk',
        youtubeUrl: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
      },
      {
        id: 't_lofi_2',
        title: 'Rainy Night in Shibuya',
        artist: 'Coffee Lofi Sessions',
        duration: '3:45',
        youtubeId: '5qap5aO4i9A',
        youtubeUrl: 'https://www.youtube.com/watch?v=5qap5aO4i9A',
      },
      {
        id: 't_lofi_3',
        title: 'Midnight Vinyl & Warm Light',
        artist: 'Chillhop Music',
        duration: '4:12',
        youtubeId: 'DWcJFNfaw9c',
        youtubeUrl: 'https://www.youtube.com/watch?v=DWcJFNfaw9c',
      },
      {
        id: 't_lofi_4',
        title: 'Cozy Cat Nap',
        artist: 'Purrple Cat',
        duration: '2:58',
        youtubeId: 'lTRiuFIWV54',
        youtubeUrl: 'https://www.youtube.com/watch?v=lTRiuFIWV54',
      },
      {
        id: 't_lofi_5',
        title: 'Quiet Bakery Morning',
        artist: 'Aesthetic Chill Lab',
        duration: '3:30',
        youtubeId: 'e3L1I627SMM',
        youtubeUrl: 'https://www.youtube.com/watch?v=e3L1I627SMM',
      },
    ],
  },
  {
    id: 'pl_piano',
    name: 'Peaceful Piano for Anxiety Relief',
    description: 'Acoustic minimalism and gentle neo-classical piano notes to lower nervous system arousal.',
    coverGradient: 'from-emerald-400 via-teal-500 to-cyan-600',
    icon: '🎹',
    tracks: [
      {
        id: 't_piano_1',
        title: 'Soft Morning Sonata in D Minor',
        artist: 'Quiet Haven Studio',
        duration: '3:20',
        youtubeId: 'cHKF8mQjIeo',
        youtubeUrl: 'https://www.youtube.com/watch?v=cHKF8mQjIeo',
      },
      {
        id: 't_piano_2',
        title: 'Breathing Room Piano',
        artist: 'Calm Mind Records',
        duration: '4:05',
        youtubeId: 'D6s6s4r0d-A',
        youtubeUrl: 'https://www.youtube.com/watch?v=D6s6s4r0d-A',
      },
      {
        id: 't_piano_3',
        title: 'Peaceful Studio Ghibli Melodies',
        artist: 'Neo Classical Winds',
        duration: '5:14',
        youtubeId: '0K4oj_yV5Is',
        youtubeUrl: 'https://www.youtube.com/watch?v=0K4oj_yV5Is',
      },
    ],
  },
  {
    id: 'pl_ambient',
    name: 'Deep Focus 40Hz & Nature Mist',
    description: 'Binaural soundscapes, rainfall resonance, and atmospheric tones for cognitive clarity.',
    coverGradient: 'from-amber-400 via-orange-500 to-rose-500',
    icon: '🌧️',
    tracks: [
      {
        id: 't_amb_1',
        title: '40Hz Gamma Focus Frequency',
        artist: 'Cognitive Flow Labs',
        duration: 'Continuous Stream',
        youtubeId: 'WPni755-Krg',
        youtubeUrl: 'https://www.youtube.com/watch?v=WPni755-Krg',
      },
      {
        id: 't_amb_2',
        title: 'Ancient Cedar Forest Rain',
        artist: 'Nature Bioacoustics',
        duration: '4:50',
        youtubeId: 'mPZkdNFkNps',
        youtubeUrl: 'https://www.youtube.com/watch?v=mPZkdNFkNps',
      },
      {
        id: 't_amb_3',
        title: 'Theta Wave Somatic Float',
        artist: 'Vagal Tone Sanctuary',
        duration: '6:10',
        youtubeId: '1ZYbU82GVz4',
        youtubeUrl: 'https://www.youtube.com/watch?v=1ZYbU82GVz4',
      },
    ],
  },
  {
    id: 'pl_synth',
    name: 'Smooth Synthwave Flow State',
    description: 'Upbeat retro synths with warm pads that propel momentum without overwhelming stimulation.',
    coverGradient: 'from-violet-500 via-fuchsia-500 to-pink-500',
    icon: '🌆',
    tracks: [
      {
        id: 't_synth_1',
        title: 'Neon Sunset Cruising',
        artist: 'Retro Horizon',
        duration: '3:50',
        youtubeId: '4xDzrJKXOOY',
        youtubeUrl: 'https://www.youtube.com/watch?v=4xDzrJKXOOY',
      },
      {
        id: 't_synth_2',
        title: 'Cyber Solitude & Code Flow',
        artist: 'Midnight Synth Lab',
        duration: '4:15',
        youtubeId: 'MVPTGNGiIUU',
        youtubeUrl: 'https://www.youtube.com/watch?v=MVPTGNGiIUU',
      },
      {
        id: 't_synth_3',
        title: 'Starry Skyline Drift',
        artist: 'Analog Pulse',
        duration: '3:35',
        youtubeId: '8Xuk4j6P4Lg',
        youtubeUrl: 'https://www.youtube.com/watch?v=8Xuk4j6P4Lg',
      },
    ],
  },
];

export function extractYouTubeId(urlOrId: string): { videoId?: string; playlistId?: string } {
  if (!urlOrId) return {};
  const clean = urlOrId.trim();

  // If already a clean 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) {
    return { videoId: clean };
  }

  // Extract playlist ID if present in URL (?list=... or &list=...)
  const playlistMatch = clean.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  const playlistId = playlistMatch ? playlistMatch[1] : undefined;

  // Extract video ID if present
  const videoMatch = clean.match(/(?:youtu\.be\/|v=|\/v\/|\/embed\/|watch\?v=|\/shorts\/)([a-zA-Z0-9_-]{11})/);
  const videoId = videoMatch ? videoMatch[1] : undefined;

  return { videoId, playlistId };
}

export function createCustomPlaylistFromUrl(
  name: string,
  urlOrId: string,
  customTrackTitle?: string
): MusicPlaylist {
  const { videoId, playlistId } = extractYouTubeId(urlOrId);
  const id = 'pl_' + Date.now();
  const title = name.trim() || (playlistId ? 'Full YouTube Playlist' : 'YouTube Focus Music');

  const tracks: TrackItem[] = [];

  if (playlistId) {
    // Add primary full playlist queue track
    tracks.push({
      id: 't_' + Date.now() + '_queue',
      title: customTrackTitle || `${title} (Full Playlist Queue)`,
      artist: 'Continuous YouTube Playlist',
      duration: 'Continuous Queue',
      youtubeId: `videoseries?list=${playlistId}`,
      youtubeUrl: urlOrId,
    });

    if (videoId) {
      tracks.push({
        id: 't_' + Date.now() + '_first',
        title: `${title} - Starting Track`,
        artist: 'YouTube Stream',
        duration: 'Track 1',
        youtubeId: `${videoId}?list=${playlistId}`,
        youtubeUrl: urlOrId,
      });
    }
  } else {
    // Single video/stream track
    tracks.push({
      id: 't_' + Date.now() + '_single',
      title: customTrackTitle || title,
      artist: 'YouTube Audio Stream',
      duration: 'Audio Stream',
      youtubeId: videoId || urlOrId,
      youtubeUrl: urlOrId,
    });
  }

  return {
    id,
    name: title,
    description: playlistId
      ? `Full continuous YouTube playlist (${playlistId})`
      : `Custom YouTube audio stream: ${urlOrId}`,
    coverGradient: playlistId
      ? 'from-red-500 via-pink-500 to-purple-600'
      : 'from-pink-500 via-rose-500 to-amber-500',
    icon: playlistId ? '▶️' : '🎵',
    tracks,
    isCustom: true,
  };
}

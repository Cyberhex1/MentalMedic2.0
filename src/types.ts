export type ActiveTab = 'todo' | 'sprint' | 'meditation' | 'yoga' | 'medical';

export type AudioType = 'brown' | 'pink' | 'white' | 'rain' | 'binaural' | 'drone' | 'office' | 'cafe' | 'keyboard' | 'coffee' | 'medieval' | 'lofi' | 'cute_hyper' | 'cute_chill' | 'asmr_tapping' | 'asmr_rustle' | 'asmr_scratch' | 'park' | 'island_breeze';

export type OfficeAudioType = 'teams_ping' | 'email_ping' | 'walking' | 'chair' | 'hvac' | 'keyboard' | 'office_keyboard' | 'chatter' | 'pages' | 'page_flip' | 'printer';

export interface TrackItem {
  id: string;
  title: string;
  artist: string;
  duration?: string;
  youtubeId: string;
  youtubeUrl?: string;
}

export interface MusicPlaylist {
  id: string;
  name: string;
  description?: string;
  coverGradient?: string;
  icon?: string;
  tracks: TrackItem[];
  isCustom?: boolean;
}

export interface UserProfile {
  name: string;
  roleTitle?: string;
  dailyGoalBits?: number;
  preferredNoise?: AudioType;
  avatarEmoji?: string;
  totalBitsLogged?: number;
  streakDays?: number;
  panicGroundingPhrase?: string;
  theme?: string;
  xp?: number;
  cuteSoundEffects?: boolean;
  cuteUiEffects?: boolean;
  tabOrder?: ActiveTab[];
  activeSoundscapes?: string[];
  activeSoundscape?: AudioType | null;
  mixerVolumes?: Record<string, number>;
  officeVolumes?: Record<string, number>;
  activeOfficeAudio?: string[];
  youtubePlaylists?: { id: string; name: string; url: string }[];
  musicPlaylists?: MusicPlaylist[];
  currentTrack?: TrackItem | null;
  isPlayingMusic?: boolean;
  musicVolume?: number;
  currentYoutubeUrl?: string;
}

export type Priority = 'low' | 'medium' | 'high';
export type EisenhowerCategory = 'urgent_important' | 'not_urgent_important' | 'urgent_not_important' | 'not_urgent_not_important';
export type Rule135Category = 'big' | 'medium' | 'small';

export interface FocusBit {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
}

export interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  priority?: Priority;
  eisenhower?: EisenhowerCategory;
  rule135?: Rule135Category;
  isFrog?: boolean;
  project?: string;
  focusBits: FocusBit[];
  createdAt: number;
}

export interface SymptomLog {
  id: string;
  date: string;
  timestamp: number;
  symptomName: string;
  severity: number;
  triggers: string | string[];
  copingMethod?: string;
  notes?: string;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  category: string;
  pinned: boolean;
  date: string;
  timestamp: number;
}

export interface SessionLog {
  id: string;
  taskTitle?: string;
  date?: string;
  timestamp: number;
  durationMinutes?: number;
  tasksCompleted: number;
  completedBits?: number;
  energyStart?: number;
  energyEnd: number;
  sprintsCount?: number;
  effortRating: string;
  notes: string;
}

export type BurnoutPhase = 'honeymoon' | 'onset' | 'chronic' | 'burnout' | 'habitual';
export interface BurnoutPhaseInfo {
  id?: BurnoutPhase;
  phase?: number;
  title?: string;
  tagline?: string;
  label?: string;
  description?: string;
  symptoms?: string[];
  color?: string;
  daysRange?: string;
  rules?: string[];
}

export type SprintPhase = 'work' | 'rest';
export interface SprintConfig {
  name: string;
  workDuration: number;
  restDuration: number;
}

export interface GroundingStep {
  id: string;
  count?: number;
  sense?: string;
  example?: string;
  title?: string;
  instruction?: string;
  detail?: string;
  completed?: boolean;
}

export interface AppSnapshot {
  userProfile: UserProfile;
  todos: TodoItem[];
  symptomLogs: SymptomLog[];
  notes: NoteItem[];
  sessionLogs: SessionLog[];
  battery: number;
  lastUpdated: number;
}

export interface VirtualCoworker {
  id: string;
  name: string;
  status: 'focusing' | 'typing' | 'idle';
  avatarUrl: string;
  activityLabel: string;
}

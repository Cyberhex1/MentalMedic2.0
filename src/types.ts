export type ActiveTab = 'somatic' | 'todo' | 'sprint' | 'meditation' | 'yoga' | 'medical';

export type AudioType =
  | 'brown'
  | 'pink'
  | 'white'
  | 'rain'
  | 'binaural'
  | 'drone'
  | 'office'
  | 'cafe'
  | 'keyboard'
  | 'coffee'
  | 'medieval'
  | 'lofi'
  | 'cute_hyper'
  | 'cute_chill'
  | 'asmr_tapping'
  | 'asmr_rustle'
  | 'asmr_scratch'
  | 'park'
  | 'island_breeze';

export type OfficeAudioType =
  | 'teams_ping'
  | 'email_ping'
  | 'walking'
  | 'chair'
  | 'hvac'
  | 'keyboard'
  | 'office_keyboard'
  | 'chatter'
  | 'pages'
  | 'page_flip'
  | 'printer';

export interface FocusBit {
  id: string;
  title: string;
  completed: boolean;
  estimatedMinutes?: number;
  category?: string;
  createdAt: number;
}

export type EisenhowerCategory =
  | 'urgent_important'
  | 'not_urgent_important'
  | 'urgent_not_important'
  | 'not_urgent_not_important';

export type Rule135Category = 'big' | 'medium' | 'small';

export interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  eisenhower: EisenhowerCategory;
  rule135?: Rule135Category;
  isFrog?: boolean;
  focusBits: FocusBit[];
  dueDate?: string;
  category?: string;
  project?: string;
  notes?: string;
  createdAt: number;
}

export interface SymptomLog {
  id: string;
  date: string;
  timestamp: number;
  symptomName: string;
  severity: number; // 1 to 10
  triggers?: string;
  copingMethod?: string;
  bodyArea?: string;
  notes?: string;
}

export interface SessionLog {
  id: string;
  date: string;
  timestamp: number;
  tasksCompleted: number;
  sprintsCount: number;
  energyEnd: number;
  notes?: string;
  effortRating: 'low' | 'standard' | 'high';
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  category: 'general' | 'somatic' | 'office' | 'task' | 'gentle_reminders';
  pinned: boolean;
  date: string;
  timestamp: number;
}

export interface UserProfile {
  name: string;
  roleTitle: string;
  dailyGoalBits: number;
  preferredNoise: AudioType;
  avatarEmoji: string;
  totalBitsLogged: number;
  streakDays: number;
  panicGroundingPhrase: string;
  medicalEmergencyNote?: string;
  theme?: 'light' | 'dark';
  // Gamified progression & features
  xp?: number;
  level?: number;
  levelTitle?: string;
  levelEmoji?: string;
  tabOrder?: string[];
  cuteSoundEffects?: boolean;
  cuteUiEffects?: boolean;
  typingSounds?: boolean;
  mixerVolumes?: Record<string, number>;
  activeSoundscapes?: string[];
  officeVolumes?: Record<string, number>;
  activeOfficeAudio?: string[];
  youtubePlaylists?: { id: string; name: string; url: string }[];
  currentYoutubeUrl?: string;
}

export interface VirtualCoworker {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: string;
  currentFocus: string;
  timeAgo: string;
}

export type SprintPhase = 'work' | 'rest';

export interface SprintConfig {
  workDuration: number; // in seconds
  restDuration: number; // in seconds
  name: string;
}

export interface GroundingStep {
  id: string;
  title: string;
  instruction: string;
  detail: string;
  completed: boolean;
}

export type BurnoutPhase = 1 | 2 | 3;

export interface BurnoutPhaseInfo {
  phase: BurnoutPhase;
  title: string;
  daysRange: string;
  color: string;
  tagline: string;
  description: string;
  rules: string[];
}


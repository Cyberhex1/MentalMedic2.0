export interface CareerLevel {
  level: number;
  title: string;
  emoji: string;
  xpRequired: number;
  description: string;
  badgeColor: string;
  isSpecial?: boolean;
}

export const CAREER_LEVELS: CareerLevel[] = [
  {
    level: 1,
    title: 'NEET',
    emoji: '🏚️',
    xpRequired: 0,
    description: 'Not in Education, Employment, or Training... yet!',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-300',
  },
  {
    level: 2,
    title: 'Entry Level with 5 Yrs Experience',
    emoji: '💼',
    xpRequired: 250,
    description: 'Meets unreasonable modern job posting requirements. (~1 day of work)',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  {
    level: 3,
    title: 'Junior Coffee Fetcher',
    emoji: '☕',
    xpRequired: 750,
    description: 'Master of oat milk espresso ratios and sprint coffee runs. (~3 days)',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  {
    level: 4,
    title: 'Associate Yippie',
    emoji: '🎉',
    xpRequired: 1750,
    description: 'Enthusiastically attends all optional Zoom standups! (~1 week)',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  {
    level: 5,
    title: 'Keyboard Warrior Specialist',
    emoji: '⌨️',
    xpRequired: 3500,
    description: '120 WPM typing speed with custom mechanical switches. (~2 weeks)',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  },
  {
    level: 6,
    title: 'Associate-Try Hard',
    emoji: '👔',
    xpRequired: 6000,
    description: 'Assistant TO the manager. Taking work way too seriously. (~3 weeks)',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  {
    level: 7,
    title: 'Meeting That Could Be An Email Lead',
    emoji: '📧',
    xpRequired: 9000,
    description: 'Master at converting calendar blocks into quick Slack messages. (~1 month)',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  },
  {
    level: 8,
    title: 'When Do I Get My Own Office: Manager',
    emoji: '🚪',
    xpRequired: 13000,
    description: 'Staring longingly at corner offices with window views. (~1.5 months)',
    badgeColor: 'bg-pink-100 text-pink-800 border-pink-200',
  },
  {
    level: 9,
    title: 'Middle Management Buffer',
    emoji: '🛡️',
    xpRequired: 18000,
    description: 'Shielding the team from executive chaos with calm vibes. (~2 months)',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
  },
  {
    level: 10,
    title: 'District Dictator',
    emoji: '👑',
    xpRequired: 24000,
    description: 'Rules the regional branch with an iron fist and sticky notes. (~2.5 months)',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
  },
  {
    level: 11,
    title: 'Heads or Tails of Operations',
    emoji: '🪙',
    xpRequired: 31000,
    description: 'Flips a coin for critical strategic budget allocations. (~3.5 months)',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
  },
  {
    level: 12,
    title: 'Region Grandmaster',
    emoji: '🧙‍♂️',
    xpRequired: 39000,
    description: 'Legendary oversight of multiple productivity districts. (~4.5 months)',
    badgeColor: 'bg-violet-100 text-violet-800 border-violet-200',
  },
  {
    level: 13,
    title: 'Excel Spreadsheet Sorcerer',
    emoji: '📊',
    xpRequired: 48000,
    description: 'Casts VLOOKUP, INDEX-MATCH, and macro spells effortlessly. (~5.2 months)',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  },
  {
    level: 14,
    title: 'GirlBoyThey Boss',
    emoji: '💅',
    xpRequired: 57000,
    description: 'Slaying quarterly goals while maintaining impeccable boundaries. (~5.7 months)',
    badgeColor: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
  },
  {
    level: 15,
    title: 'Big Boss Baby CEO',
    emoji: '👶💼',
    xpRequired: 65000,
    description: 'The supreme corporate pinnacle! Runs the company from an executive crib. (~6 months)',
    badgeColor: 'bg-yellow-200 text-yellow-950 border-yellow-400 font-black',
  },
  // --- SPECIAL ASCENDED LEVELS ---
  {
    level: 16,
    title: 'ASCENDED PRODUCTION COMPLETELY',
    emoji: '🌌',
    xpRequired: 75000,
    description: 'Beyond earthly metrics. Pure cosmic productivity flow state!',
    badgeColor: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none font-black shadow-lg shadow-pink-500/30',
    isSpecial: true,
  },
  {
    level: 17,
    title: 'OVERLORD OF UNINTERRUPTED FLOW',
    emoji: '⚡',
    xpRequired: 90000,
    description: 'Zero burnout, infinite focus bits, immune to corporate distractions!',
    badgeColor: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-none font-black shadow-lg shadow-cyan-500/30',
    isSpecial: true,
  },
  {
    level: 18,
    title: 'SUPREME COSMIC FREELANCER',
    emoji: '🪐',
    xpRequired: 105000,
    description: 'Transcended all jobs. Basking in ultimate freedom and somatic peace.',
    badgeColor: 'bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-600 text-white border-none font-black shadow-xl shadow-purple-500/40 animate-pulse',
    isSpecial: true,
  },
];

export function getLevelForXP(xp: number = 0): CareerLevel {
  let currentLevel = CAREER_LEVELS[0];
  for (const lvl of CAREER_LEVELS) {
    if (xp >= lvl.xpRequired) {
      currentLevel = lvl;
    } else {
      break;
    }
  }
  return currentLevel;
}

export function getNextLevelInfo(xp: number = 0): { nextLevel: CareerLevel | null; xpNeeded: number; progressPercent: number } {
  const current = getLevelForXP(xp);
  const next = CAREER_LEVELS.find((l) => l.level === current.level + 1) || null;

  if (!next) {
    return { nextLevel: null, xpNeeded: 0, progressPercent: 100 };
  }

  const range = next.xpRequired - current.xpRequired;
  const currentInLevel = xp - current.xpRequired;
  const progressPercent = Math.min(100, Math.max(0, Math.round((currentInLevel / range) * 100)));
  const xpNeeded = next.xpRequired - xp;

  return { nextLevel: next, xpNeeded, progressPercent };
}

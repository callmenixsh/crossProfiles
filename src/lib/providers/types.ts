export type PlatformKey =
  | "github"
  | "leetcode"
  | "codeforces"
  | "gfg"
  | "codechef"
  | "tuf"
  | "monkeytype"
  | "atcoder"
  | "codewars"
  | "gitlab"
  | "devto";

export const PLATFORMS: PlatformKey[] = [
  "github",
  "leetcode",
  "codeforces",
  "gfg",
  "codechef",
  "tuf",
  "monkeytype",
  "atcoder",
  "codewars",
  "gitlab",
  "devto",
];

export type CategoryKey = "development" | "dsa" | "typing";

export interface PlatformCategory {
  id: CategoryKey;
  label: string;
  description: string;
  keys: PlatformKey[];
}

export const PLATFORM_CATEGORIES: PlatformCategory[] = [
  {
    id: "development",
    label: "Development",
    description: "Project footprint, stars and contribution activity",
    keys: ["github", "gitlab", "devto"],
  },
  {
    id: "dsa",
    label: "DSA & Competitive Programming",
    description: "Problem solving, ratings and contest history",
    keys: ["codeforces", "codechef", "atcoder", "leetcode", "gfg", "tuf", "codewars"],
  },
  {
    id: "typing",
    label: "Typing",
    description: "Accuracy, WPM and streaks",
    keys: ["monkeytype"],
  },
];

export const PLATFORM_META: Record<
  PlatformKey,
  { label: string; domain: string; accent: string; category: CategoryKey }
> = {
  github: { label: "GitHub", domain: "github.com", accent: "#a1a1aa", category: "development" },
  leetcode: { label: "LeetCode", domain: "leetcode.com", accent: "#ffa116", category: "dsa" },
  codeforces: { label: "Codeforces", domain: "codeforces.com", accent: "#4f94ef", category: "dsa" },
  gfg: { label: "GeeksforGeeks", domain: "geeksforgeeks.org", accent: "#2f8d46", category: "dsa" },
  codechef: { label: "CodeChef", domain: "codechef.com", accent: "#e6822e", category: "dsa" },
  tuf: { label: "takeUforward", domain: "takeuforward.org", accent: "#a855f7", category: "dsa" },
  monkeytype: { label: "Monkeytype", domain: "monkeytype.com", accent: "#e2555f", category: "typing" },
  atcoder: { label: "AtCoder", domain: "atcoder.jp", accent: "#5aa9f5", category: "dsa" },
  codewars: { label: "Codewars", domain: "codewars.com", accent: "#b1361e", category: "dsa" },
  gitlab: { label: "GitLab", domain: "gitlab.com", accent: "#fc6d26", category: "development" },
  devto: { label: "Dev.to", domain: "dev.to", accent: "#e4e4e7", category: "development" },
};

export interface LanguageStat {
  name: string;
  count: number;
}

export interface DayContribution {
  date: string;
  count: number;
}

export interface GitHubData {
  name: string;
  login: string;
  avatar: string;
  url: string;
  bio: string | null;
  location: string | null;
  company: string | null;
  followers: number;
  following: number;
  publicRepos: number;
  totalStars: number;
  publicGists?: number;
  totalForks?: number;
  createdAt?: string;
  languages: LanguageStat[];
  totalContributions: number;
  heatmap: DayContribution[];
}

export interface LeetCodeData {
  name: string;
  username: string;
  avatar: string;
  url: string;
  ranking: number | null;
  reputation: number | null;
  totalSolved: number;
  totalQuestions: number | null;
  solvedByDifficulty: { easy: number; medium: number; hard: number };
  contestRating: number | null;
  globalRanking: number | null;
  topPercentage: number | null;
  attendedContests: number | null;
  heatmap: DayContribution[];
}

export interface CodeforcesData {
  handle: string;
  name: string | null;
  avatar: string;
  url: string;
  rating: number | null;
  maxRating: number | null;
  rank: string | null;
  maxRank: string | null;
  contribution: number | null;
  organization: string | null;
  ratingHistory: {
    contest: string;
    date: string;
    rating: number;
  }[];
  heatmap?: DayContribution[];
}

export interface GfgData {
  name: string;
  username: string;
  avatar: string | null;
  url: string;
  totalSolved: number;
  byDifficulty?: { school: number; basic: number; easy: number; medium: number; hard: number };
  rank: number | null;
  totalActiveDays: number;
  totalContests: number;
  currentRating: number | null;
  maxRating: number | null;
  badgesCount: number;
  heatmap: DayContribution[];
}

export interface CodechefData {
  name: string;
  url: string;
  rating: number | null;
  stars: number;
  globalRank: number | null;
  countryRank: number | null;
  maxRating: number | null;
  div?: number;
  heatmap?: DayContribution[];
}

export interface TufData {
  displayName: string | null;
  username: string;
  url: string;
  totalSolved: number;
  totalQuestions: number;
  acceptanceRate: number | null;
  byDifficulty: { easy: number; medium: number; hard: number };
  topicAnalysis: { topic: string; count: number }[];
  totalSubmissions: number;
  totalActiveDays: number;
  currentStreak: number;
  longestStreak: number;
  heatmap: DayContribution[];
}

export interface MonkeyTypeData {
  name: string | null;
  url: string;
  addedAt: number | null;
  completedTests: number;
  startedTests: number;
  timeTypingSeconds: number;
  bestWpm: number | null;
  bestAcc: number | null;
  pbByTime: { mode: number; wpm: number }[];
  streak: number;
  maxStreak: number;
  xp: number;
  isPremium: boolean;
}

export interface AtCoderData {
  handle: string;
  url: string;
  rating: number;
  highestRating: number;
  contests: number;
  lastContest: { name: string; date: string } | null;
  history: { contest: string; date: string; rating: number }[];
}

export interface CodewarsRank {
  rank: number;
  name: string;
  color: string;
  score: number;
}

export interface CodewarsData {
  username: string;
  url: string;
  clan: string | null;
  honor: number;
  leaderboardPosition: number | null;
  totalCompleted: number;
  overall: CodewarsRank;
  languages: { language: string; rank: CodewarsRank }[];
}

export interface GitLabData {
  username: string;
  name: string;
  avatar: string;
  url: string;
  publicProjects: number;
  totalStars: number;
  topLanguages: LanguageStat[];
}

export interface DevToData {
  username: string;
  name: string;
  avatar: string;
  url: string;
  summary: string | null;
  location: string | null;
  websiteUrl: string | null;
  githubUsername: string | null;
  followers: number;
  following: number;
  postsCount: number;
  joinedAt: string | null;
}

export type ProviderStats =
  | GitHubData
  | LeetCodeData
  | CodeforcesData
  | GfgData
  | CodechefData
  | TufData
  | MonkeyTypeData
  | AtCoderData
  | CodewarsData
  | GitLabData
  | DevToData;

export type ProviderResult<T extends ProviderStats = ProviderStats> =
  | { ok: true; data: T; cached: boolean }
  | { ok: false; error: string };

export interface AllStats {
  github: ProviderResult<GitHubData>;
  leetcode: ProviderResult<LeetCodeData>;
  codeforces: ProviderResult<CodeforcesData>;
  gfg: ProviderResult<GfgData>;
  codechef: ProviderResult<CodechefData>;
  tuf: ProviderResult<TufData>;
  monkeytype: ProviderResult<MonkeyTypeData>;
  atcoder: ProviderResult<AtCoderData>;
  codewars: ProviderResult<CodewarsData>;
  gitlab: ProviderResult<GitLabData>;
  devto: ProviderResult<DevToData>;
}
import type {
  AllStats,
  PlatformKey,
  ProviderResult,
  ProviderStats,
} from "./types";
import { getGitHubStats } from "./github";
import { getLeetCodeStats } from "./leetcode";
import { getCodeforcesStats } from "./codeforces";
import { getGfgStats } from "./gfg";
import { getCodechefStats } from "./codechef";
import { getTufStats } from "./tuf";
import { getMonkeyTypeStats } from "./monkeytype";
import { getAtCoderStats } from "./atcoder";
import { getCodewarsStats } from "./codewars";
import { getGitLabStats } from "./gitlab";
import { getDevToStats } from "./devto";

export interface Handles {
  github: string;
  leetcode: string;
  codeforces: string;
  gfg: string;
  codechef: string;
  tuf: string;
  monkeytype: string;
  atcoder: string;
  codewars: string;
  gitlab: string;
  devto: string;
}

const PROVIDERS: Record<PlatformKey, (h: string) => Promise<ProviderStats>> = {
  github: getGitHubStats,
  leetcode: getLeetCodeStats,
  codeforces: getCodeforcesStats,
  gfg: getGfgStats,
  codechef: getCodechefStats,
  tuf: getTufStats,
  monkeytype: getMonkeyTypeStats,
  atcoder: getAtCoderStats,
  codewars: getCodewarsStats,
  gitlab: getGitLabStats,
  devto: getDevToStats,
};

export async function fetchAllStats(handles: Handles): Promise<AllStats> {
  const entries = Object.keys(PROVIDERS) as PlatformKey[];
  const settled = await Promise.all(
    entries.map(async (key) => {
      const handle = handles[key].trim();
      if (handle.length === 0) {
        return [key, { ok: false, error: "Handle not set" } as ProviderResult] as const;
      }
      const result = await wrap(() => PROVIDERS[key](handle));
      return [key, result] as const;
    })
  );

  const stats = {} as AllStats;
  for (const [key, result] of settled) {
    (stats as Record<PlatformKey, ProviderResult>)[key] = result;
  }
  return stats;
}

async function wrap(
  fn: () => Promise<ProviderStats>
): Promise<ProviderResult> {
  try {
    const data = await fn();
    return { ok: true, data, cached: false };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
import { fetchJson, ProviderError, withCache } from "./fetch";
import { statsKey } from "./cache-key";
import type { DayContribution, GfgData } from "./types";

const BASE = "https://gfg-stats.tashif.codes";

interface GfgEnvelope<T> {
  status?: string;
  message?: string;
  data?: T;
}

interface GfgSummaryData {
  totalSolved?: number;
  totalActiveDays?: number;
  totalContests?: number;
  currentRating?: number | null;
  maxRating?: number | null;
  rank?: number | null;
  badgesCount?: number;
}

interface GfgProfileData {
  displayName?: string | null;
  avatar?: string | null;
}

interface GfgHeatmapData {
  dailyContributions?: { date: string; count?: number }[];
}

interface GfgSolvedData {
  byDifficulty?: {
    school?: number;
    basic?: number;
    easy?: number;
    medium?: number;
    hard?: number;
  };
}

export async function getGfgStats(handle: string): Promise<GfgData> {
  const key = statsKey("gfg", handle);
  return withCache(key, 12 * 3600, async () => {
    const [summaryEnv, profileEnv, heatmapEnv, solvedEnv] = await Promise.allSettled([
      fetchJson<GfgEnvelope<GfgSummaryData>>(
        `${BASE}/${encodeURIComponent(handle)}`,
        20000
      ),
      fetchJson<GfgEnvelope<GfgProfileData>>(
        `${BASE}/${encodeURIComponent(handle)}/profile`,
        20000
      ),
      fetchJson<GfgEnvelope<GfgHeatmapData>>(
        `${BASE}/${encodeURIComponent(handle)}/heatmap`,
        20000
      ),
      fetchJson<GfgEnvelope<GfgSolvedData>>(
        `${BASE}/${encodeURIComponent(handle)}/solved-problems?limit=1`,
        20000
      ),
    ]);

    if (
      summaryEnv.status === "rejected" &&
      profileEnv.status === "rejected" &&
      heatmapEnv.status === "rejected" &&
      solvedEnv.status === "rejected"
    ) {
      const first =
        summaryEnv.status === "rejected"
          ? summaryEnv.reason
          : profileEnv.status === "rejected"
            ? profileEnv.reason
            : null;
      if (first instanceof ProviderError && first.status === 404) {
        throw new ProviderError("GeeksforGeeks user not found", 404);
      }
      throw first instanceof Error
        ? first
        : new ProviderError("GfG stats API unreachable");
    }

    const summary =
      summaryEnv.status === "fulfilled" ? summaryEnv.value?.data ?? {} : {};
    const profile =
      profileEnv.status === "fulfilled" ? profileEnv.value?.data ?? {} : {};
    const heatmap =
      heatmapEnv.status === "fulfilled" ? heatmapEnv.value?.data ?? {} : {};
    const solved =
      solvedEnv.status === "fulfilled" ? solvedEnv.value?.data ?? {} : {};

    if (summary.totalSolved === undefined) {
      throw new ProviderError("Could not load GeeksforGeeks stats");
    }

    const heat: DayContribution[] = (heatmap.dailyContributions ?? [])
      .filter((d) => typeof d.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d.date))
      .map((d) => ({ date: d.date, count: d.count ?? 0 }));

    const byDifficulty = solved.byDifficulty ?? {};

    return {
      name: profile.displayName || handle,
      username: handle,
      avatar: profile.avatar ?? null,
      url: `https://www.geeksforgeeks.org/profile/${encodeURIComponent(handle)}`,
      totalSolved: summary.totalSolved ?? 0,
      byDifficulty: {
        school: byDifficulty.school ?? 0,
        basic: byDifficulty.basic ?? 0,
        easy: byDifficulty.easy ?? 0,
        medium: byDifficulty.medium ?? 0,
        hard: byDifficulty.hard ?? 0,
      },
      rank: summary.rank ?? null,
      totalActiveDays: summary.totalActiveDays ?? 0,
      totalContests: summary.totalContests ?? 0,
      currentRating: summary.currentRating ?? null,
      maxRating: summary.maxRating ?? null,
      badgesCount: summary.badgesCount ?? 0,
      heatmap: heat,
    };
  });
}
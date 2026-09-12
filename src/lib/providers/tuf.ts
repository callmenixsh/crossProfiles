import { fetchJson, ProviderError, withCache } from "./fetch";
import type { DayContribution, TufData } from "./types";

const BASE = "https://tuf-stats.tashif.codes";

interface TufEnvelope<T> {
  status?: string;
  username?: string;
  data?: T;
}

interface TufStatsData {
  totalSolved?: number;
  totalQuestions?: number;
  acceptanceRate?: number | null;
  byDifficulty?: { easy?: number; medium?: number; hard?: number };
  topicAnalysis?: { topic: string; count?: number }[];
}

interface TufHeatmapData {
  totalSubmissions?: number;
  totalActiveDays?: number;
  currentStreak?: number;
  longestStreak?: number;
  dailyContributions?: { date: string; count?: number }[];
}

interface TufProfileData {
  displayName?: string | null;
  avatar?: string | null;
}

export async function getTufStats(handle: string): Promise<TufData> {
  const key = `tuf:${handle.toLowerCase()}`;
  return withCache(key, 3 * 3600, async () => {
    const [statsEnv, heatmapEnv, profileEnv] = await Promise.allSettled([
      fetchJson<TufEnvelope<TufStatsData>>(
        `${BASE}/${encodeURIComponent(handle)}/stats`,
        20000
      ),
      fetchJson<TufEnvelope<TufHeatmapData>>(
        `${BASE}/${encodeURIComponent(handle)}/heatmap`,
        20000
      ),
      fetchJson<TufEnvelope<TufProfileData>>(
        `${BASE}/${encodeURIComponent(handle)}/profile`,
        20000
      ),
    ]);

    if (
      statsEnv.status === "rejected" &&
      heatmapEnv.status === "rejected" &&
      profileEnv.status === "rejected"
    ) {
      const first =
        statsEnv.status === "rejected" ? statsEnv.reason : heatmapEnv.status === "rejected" ? heatmapEnv.reason : profileEnv.reason;
      if (first instanceof ProviderError && first.status === 404) {
        throw new ProviderError("takeUforward user not found", 404);
      }
      throw first instanceof Error ? first : new ProviderError("Stats API unreachable");
    }

    const stats =
      statsEnv.status === "fulfilled" ? statsEnv.value?.data ?? {} : {};
    const heatmap =
      heatmapEnv.status === "fulfilled" ? heatmapEnv.value?.data ?? {} : {};
    const profile =
      profileEnv.status === "fulfilled" ? profileEnv.value?.data ?? {} : {};

    const byDifficulty = stats.byDifficulty;
    const totalSolved = stats.totalSolved;
    if (totalSolved === undefined && byDifficulty === undefined) {
      throw new ProviderError("Could not load takeUforward stats");
    }

    const heat: DayContribution[] = (heatmap.dailyContributions ?? []).map(
      (d) => ({ date: d.date, count: d.count ?? 0 })
    );

    return {
      displayName: profile.displayName ?? null,
      username: handle,
      url: `https://takeuforward.org/profile/${encodeURIComponent(handle)}`,
      totalSolved: totalSolved ?? 0,
      totalQuestions: stats.totalQuestions ?? 0,
      acceptanceRate: stats.acceptanceRate ?? null,
      byDifficulty: {
        easy: byDifficulty?.easy ?? 0,
        medium: byDifficulty?.medium ?? 0,
        hard: byDifficulty?.hard ?? 0,
      },
      topicAnalysis: (stats.topicAnalysis ?? []).map((t) => ({
        topic: t.topic,
        count: t.count ?? 0,
      })),
      totalSubmissions: heatmap.totalSubmissions ?? 0,
      totalActiveDays: heatmap.totalActiveDays ?? 0,
      currentStreak: heatmap.currentStreak ?? 0,
      longestStreak: heatmap.longestStreak ?? 0,
      heatmap: heat,
    };
  });
}
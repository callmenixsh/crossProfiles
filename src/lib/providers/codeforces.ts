import { fetchJson, ProviderError, withCache } from "./fetch";
import { statsKey } from "./cache-key";
import type { CodeforcesData, DayContribution } from "./types";

const BASE = "https://codeforces.com/api";

interface CfUserInfo {
  result?: {
    handle: string;
    name?: string | null;
    avatar?: string;
    titlePhoto?: string;
    rating?: number;
    maxRating?: number;
    rank?: string;
    maxRank?: string;
    contribution?: number;
    organization?: string;
  }[];
  status?: string;
  comment?: string;
}

interface CfRating {
  result?: {
    contestName: string;
    newRating: number;
    ratingUpdateTimeSeconds: number;
  }[];
}

interface CfStatus {
  result?: {
    verdict: string;
    creationTimeSeconds: number;
  }[];
  status?: string;
  comment?: string;
}

export async function getCodeforcesStats(handle: string): Promise<CodeforcesData> {
  const key = statsKey("codeforces", handle);
  return withCache(key, 3 * 3600, async () => {
    const info = await fetchJson<CfUserInfo>(
      `${BASE}/user.info?handles=${encodeURIComponent(handle)}`,
      15000
    );

    if (info.status !== "OK" || !info.result?.length) {
      throw new ProviderError(info.comment || "Codeforces user not found", 404);
    }

    const user = info.result[0];

    let history: CodeforcesData["ratingHistory"] = [];
    let cfRating: CfRating | undefined;
    try {
      cfRating = await fetchJson<CfRating>(
        `${BASE}/user.rating?handle=${encodeURIComponent(handle)}`,
        15000
      );
    } catch {
      // rating history is best-effort
    }

    if (cfRating?.result) {
      history = cfRating.result.map((r) => ({
        contest: r.contestName,
        date: new Date(r.ratingUpdateTimeSeconds * 1000).toISOString().slice(0, 10),
        rating: r.newRating,
      }));
    }

    let heat: DayContribution[] = [];
    try {
      const cfStatus = await fetchJson<CfStatus>(
        `${BASE}/user.status?handle=${encodeURIComponent(handle)}&count=5000`,
        20000
      );
      if (cfStatus.status === "OK" && cfStatus.result) {
        const byDate = new Map<string, number>();
        for (const s of cfStatus.result) {
          if (s.verdict !== "OK") continue;
          const date = new Date(s.creationTimeSeconds * 1000).toISOString().slice(0, 10);
          byDate.set(date, (byDate.get(date) ?? 0) + 1);
        }
        heat = [...byDate.entries()]
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => a.date.localeCompare(b.date));
      }
    } catch {
      // heatmap is best-effort; non-fatal
    }

    return {
      handle: user.handle,
      name: user.name ?? null,
      avatar: user.titlePhoto || user.avatar || "",
      url: `https://codeforces.com/profile/${user.handle}`,
      rating: user.rating ?? null,
      maxRating: user.maxRating ?? null,
      rank: user.rank ?? null,
      maxRank: user.maxRank ?? null,
      contribution: user.contribution ?? null,
      organization: user.organization ?? null,
      ratingHistory: history,
      heatmap: heat,
    };
  });
}
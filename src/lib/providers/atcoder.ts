import { fetchJson, ProviderError, withCache } from "./fetch";
import { statsKey } from "./cache-key";
import type { AtCoderData } from "./types";

interface AtCoderHistoryItem {
  IsRated: boolean;
  Place: number;
  OldRating: number;
  NewRating: number;
  Performance: number;
  ContestScreenName: string;
  ContestName: string;
  ContestNameEn: string;
  EndTime: string;
}

export async function getAtCoderStats(handle: string): Promise<AtCoderData> {
  const key = statsKey("atcoder", handle);
  return withCache(key, 6 * 3600, async () => {
    let history: AtCoderHistoryItem[];
    try {
      history = await fetchJson<AtCoderHistoryItem[]>(
        `https://atcoder.jp/users/${encodeURIComponent(handle)}/history/json`,
        15000,
        { "User-Agent": "Mozilla/5.0" }
      );
    } catch (err) {
      if (err instanceof ProviderError && err.status === 404) {
        throw new ProviderError("AtCoder user not found", 404);
      }
      throw err;
    }

    if (!Array.isArray(history)) {
      throw new ProviderError("Could not load AtCoder stats");
    }

    const rated = history.filter((h) => h.IsRated && typeof h.NewRating === "number");
    const rating = rated.length > 0 ? rated[rated.length - 1].NewRating : 0;
    const highestRating = rated.reduce((max, h) => Math.max(max, h.NewRating), 0);
    const last = rated[rated.length - 1];

    return {
      handle,
      url: `https://atcoder.jp/users/${encodeURIComponent(handle)}`,
      rating,
      highestRating,
      contests: rated.length,
      lastContest: last
        ? { name: last.ContestName || last.ContestNameEn, date: last.EndTime.slice(0, 10) }
        : null,
      history: rated.map((h) => ({
        contest: h.ContestName || h.ContestNameEn,
        date: h.EndTime.slice(0, 10),
        rating: h.NewRating,
      })),
    };
  });
}
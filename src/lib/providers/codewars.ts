import { fetchJson, ProviderError, withCache } from "./fetch";
import type { CodewarsData, CodewarsRank } from "./types";

interface CodewarsApiUser {
  username?: string;
  name?: string;
  clan?: string;
  honor?: number;
  leaderboardPosition?: number;
  codeChallenges?: { totalCompleted?: number };
  ranks?: {
    overall?: Partial<CodewarsRank>;
    languages?: Record<string, Partial<CodewarsRank>>;
  };
}

export async function getCodewarsStats(handle: string): Promise<CodewarsData> {
  const key = `cw:${handle.toLowerCase()}`;
  return withCache(key, 6 * 3600, async () => {
    let user: CodewarsApiUser;
    try {
      user = await fetchJson<CodewarsApiUser>(
        `https://www.codewars.com/api/v1/users/${encodeURIComponent(handle)}`,
        15000
      );
    } catch (err) {
      if (err instanceof ProviderError && err.status === 404) {
        throw new ProviderError("Codewars user not found", 404);
      }
      throw err;
    }

    const overall = {
      rank: user.ranks?.overall?.rank ?? -8,
      name: user.ranks?.overall?.name ?? "none",
      color: user.ranks?.overall?.color ?? "#666",
      score: user.ranks?.overall?.score ?? 0,
    };

    const languages = Object.entries(user.ranks?.languages ?? {})
      .map(([language, r]) => ({
        language,
        rank: {
          rank: r.rank ?? overall.rank,
          name: r.name ?? overall.name,
          color: r.color ?? overall.color,
          score: r.score ?? 0,
        },
      }))
      .sort((a, b) => b.rank.score - a.rank.score)
      .slice(0, 10);

    return {
      username: user.username || handle,
      url: `https://www.codewars.com/users/${encodeURIComponent(handle)}`,
      clan: user.clan || null,
      honor: user.honor ?? 0,
      leaderboardPosition:
        typeof user.leaderboardPosition === "number" ? user.leaderboardPosition : null,
      totalCompleted: user.codeChallenges?.totalCompleted ?? 0,
      overall,
      languages,
    };
  });
}
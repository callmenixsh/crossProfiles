import { fetchJson, ProviderError, withCache } from "./fetch";
import type { MonkeyTypeData } from "./types";

const BASE = "https://api.monkeytype.com";

interface MtBest {
  wpm?: number;
  acc?: number;
  punctuation?: boolean;
  language?: string;
}

interface MtResponse {
  message?: string;
  data?: {
    name?: string | null;
    addedAt?: number;
    typingStats?: {
      completedTests?: number;
      startedTests?: number;
      timeTyping?: number;
    };
    personalBests?: {
      time?: Record<string, MtBest[]>;
      words?: Record<string, MtBest[]>;
    };
    xp?: number;
    streak?: number;
    maxStreak?: number;
    isPremium?: boolean;
  };
}

export async function getMonkeyTypeStats(handle: string): Promise<MonkeyTypeData> {
  const key = `mt:${handle.toLowerCase()}`;
  return withCache(key, 6 * 3600, async () => {
    let res: MtResponse;
    try {
      res = await fetchJson<MtResponse>(
        `${BASE}/users/${encodeURIComponent(handle)}/profile`,
        20000,
        { Accept: "application/json" }
      );
    } catch (err) {
      if (err instanceof ProviderError && err.status === 404) {
        throw new ProviderError("Monkeytype user not found", 404);
      }
      throw err;
    }

    const data = res.data;
    if (!data) {
      throw new ProviderError(
        res.message ? `Monkeytype: ${res.message}` : "Could not load Monkeytype profile"
      );
    }

    const pbTime = data.personalBests?.time ?? {};
    const pbWords = data.personalBests?.words ?? {};

    let bestWpm: number | null = null;
    let bestAcc: number | null = null;
    for (const map of [pbTime, pbWords]) {
      for (const list of Object.values(map)) {
        for (const entry of list) {
          const wpm = entry.wpm ?? 0;
          if (bestWpm === null || wpm > bestWpm) {
            bestWpm = wpm;
            bestAcc = entry.acc ?? null;
          }
        }
      }
    }

    const pbByTime: { mode: number; wpm: number }[] = [];
    for (const [mode, list] of Object.entries(pbTime)) {
      const wpm = Math.max(...list.map((e) => e.wpm ?? 0));
      pbByTime.push({ mode: Number(mode), wpm });
    }
    pbByTime.sort((a, b) => a.mode - b.mode);

    return {
      name: data.name ?? null,
      url: `https://monkeytype.com/profile/${encodeURIComponent(handle)}`,
      addedAt: data.addedAt ?? null,
      completedTests: data.typingStats?.completedTests ?? 0,
      startedTests: data.typingStats?.startedTests ?? 0,
      timeTypingSeconds: data.typingStats?.timeTyping ?? 0,
      bestWpm,
      bestAcc,
      pbByTime,
      streak: data.streak ?? 0,
      maxStreak: data.maxStreak ?? 0,
      xp: data.xp ?? 0,
      isPremium: data.isPremium ?? false,
    };
  });
}
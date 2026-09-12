import { postJson, ProviderError, withCache } from "./fetch";
import { statsKey } from "./cache-key";
import type { DayContribution, LeetCodeData } from "./types";

const GQL = "https://leetcode.com/graphql";

interface LcCalendarNode {
  userCalendar?: {
    submissionCalendar?: string | null;
  } | null;
}

interface LcQueryResult {
  errors?: { message: string }[];
  data?: {
    matchedUser?: {
      username?: string;
      profile?: {
        userAvatar?: string;
        realName?: string;
        reputation?: number;
        ranking?: number;
      };
      submitStatsGlobal?: {
        acSubmissionNum?: { difficulty: string; count: number }[];
      };
    } | null;
    cur?: LcCalendarNode | null;
    prev?: LcCalendarNode | null;
    userContestRanking?: {
      attendedContestsCount?: number;
      rating?: number;
      globalRanking?: number;
      topPercentage?: number;
    } | null;
    allQuestionsCount?: { difficulty: string; count: number }[];
  };
}

export async function getLeetCodeStats(handle: string): Promise<LeetCodeData> {
  const key = statsKey("leetcode", handle);
  return withCache(key, 6 * 3600, async () => {
    let res: LcQueryResult;
    try {
      res = await postJson<LcQueryResult>(GQL, {
        query: QUERY,
        variables: {
          username: handle,
          year: new Date().getUTCFullYear(),
          prevYear: new Date().getUTCFullYear() - 1,
        },
      });
    } catch (err) {
      if (err instanceof ProviderError && err.status === 404) {
        throw new ProviderError("LeetCode user not found", 404);
      }
      throw err;
    }

    const matched = res?.data?.matchedUser;
    const notFound = matched === undefined || matched === null;
    const errMsg = res?.errors?.[0]?.message;

    if (notFound) {
      throw new ProviderError(
        errMsg && /does not exist|not found/i.test(errMsg)
          ? "LeetCode user not found"
          : (errMsg ?? "LeetCode user not found"),
        404
      );
    }

    const profile = matched.profile;
    const username = matched.username || handle;
    const ac = matched.submitStatsGlobal?.acSubmissionNum ?? [];
    const byDifficulty = (name: string) =>
      ac.find((d) => d.difficulty === name)?.count ?? 0;

    const totalQuestions =
      res?.data?.allQuestionsCount?.find((d) => d.difficulty === "All")?.count ??
      null;

    const ranking = res?.data?.userContestRanking;

    const heatmap = parseSubmissionCalendar(
      [res?.data?.cur?.userCalendar, res?.data?.prev?.userCalendar]
    );

    return {
      name: profile?.realName || username,
      username,
      avatar: profile?.userAvatar ?? "",
      url: `https://leetcode.com/u/${encodeURIComponent(username)}/`,
      ranking: profile?.ranking ?? null,
      reputation: profile?.reputation ?? null,
      totalSolved: byDifficulty("All"),
      totalQuestions,
      solvedByDifficulty: {
        easy: byDifficulty("Easy"),
        medium: byDifficulty("Medium"),
        hard: byDifficulty("Hard"),
      },
      contestRating: ranking?.rating ?? null,
      globalRanking: ranking?.globalRanking ?? null,
      topPercentage: ranking?.topPercentage ?? null,
      attendedContests: ranking?.attendedContestsCount ?? null,
      heatmap,
    };
  });
}

function parseSubmissionCalendar(
  calendars: (LcCalendarNode["userCalendar"] | null | undefined)[]
): DayContribution[] {
  const byDate = new Map<string, number>();
  for (const cal of calendars) {
    const raw = cal?.submissionCalendar;
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw) as Record<string, number>;
      for (const [ts, count] of Object.entries(parsed)) {
        const iso = toIso(new Date(Number(ts) * 1000));
        byDate.set(iso, (byDate.get(iso) ?? 0) + count);
      }
    } catch {
      // malformed calendar payload; skip
    }
  }
  return [...byDate.entries()].map(([date, count]) => ({ date, count }));
}

function toIso(d: Date): string {
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${d.getUTCFullYear()}-${mm}-${dd}`;
}

const QUERY = `query getUserStats($username: String!, $year: Int!, $prevYear: Int!) {
  matchedUser(username: $username) {
    username
    profile { userAvatar realName reputation ranking }
    submitStatsGlobal { acSubmissionNum { difficulty count } }
  }
  cur: matchedUser(username: $username) {
    userCalendar(year: $year) { submissionCalendar }
  }
  prev: matchedUser(username: $username) {
    userCalendar(year: $prevYear) { submissionCalendar }
  }
  userContestRanking(username: $username) {
    attendedContestsCount rating globalRanking topPercentage
  }
  allQuestionsCount { difficulty count }
}`;
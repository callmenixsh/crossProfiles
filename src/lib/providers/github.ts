import {
  fetchJson,
  fetchText,
  postJson,
  ProviderError,
  withCache,
} from "./fetch";
import type { DayContribution, GitHubData, LanguageStat } from "./types";

const BASE = "https://api.github.com";

interface GhUser {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  location: string | null;
  company: string | null;
  public_repos: number;
  public_gists: number;
  created_at: string;
  followers: number;
  following: number;
}

interface GhRepo {
  language: string | null;
  stargazers_count: number;
  forks_count: number;
}

interface GhContributionDay {
  date: string;
  contributionCount: number;
}

export async function getGitHubStats(handle: string): Promise<GitHubData> {
  const key = `gh:v3:${handle.toLowerCase()}`;
  return withCache(key, 6 * 3600, async () => {
    const headers = ghHeaders();
    let user: GhUser;
    try {
      user = await fetchJson<GhUser>(`${BASE}/users/${encodeURIComponent(handle)}`, 15000, headers);
    } catch (err) {
      if (err instanceof ProviderError && err.status === 404) {
        throw new ProviderError("GitHub user not found", 404);
      }
      throw err;
    }

    const repos: GhRepo[] = [];
    for (const page of [1, 2]) {
      const list = await fetchJson<GhRepo[]>(
        `${BASE}/users/${encodeURIComponent(handle)}/repos?per_page=100&sort=updated&page=${page}`,
        20000,
        headers
      );
      repos.push(...list);
      if (list.length < 100 || page === 2) break;
    }

    const langMap = new Map<string, number>();
    let totalStars = 0;
    let totalForks = 0;
    for (const repo of repos) {
      totalStars += repo.stargazers_count;
      totalForks += repo.forks_count;
      if (repo.language) langMap.set(repo.language, (langMap.get(repo.language) ?? 0) + 1);
    }
    const languages: LanguageStat[] = [...langMap.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    let totalContributions = 0;
    let heatmap: DayContribution[] = [];

    try {
      const cal = process.env.GITHUB_TOKEN
        ? await fetchContributionsCalendar(handle)
        : await fetchContributionsScrape(handle);
      totalContributions = cal.total;
      heatmap = cal.days;
    } catch {
      // heatmap is best-effort; non-fatal
    }

    return {
      name: user.name ?? user.login,
      login: user.login,
      avatar: user.avatar_url,
      url: user.html_url,
      bio: user.bio,
      location: user.location,
      company: user.company,
      followers: user.followers,
      following: user.following,
      publicRepos: user.public_repos,
      publicGists: user.public_gists,
      totalStars,
      totalForks,
      createdAt: user.created_at,
      languages,
      totalContributions,
      heatmap,
    };
  });
}

function ghHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

interface ContributionsResult {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: {
          totalContributions: number;
          weeks: { contributionDays: GhContributionDay[] }[];
        };
      };
    };
  };
  message?: string;
}

async function fetchContributionsCalendar(
  handle: string
): Promise<{ total: number; days: DayContribution[] }> {
  const query = `query ($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays { date contributionCount }
          }
        }
      }
    }
  }`;

  const res = await postJson<ContributionsResult>(
    "https://api.github.com/graphql",
    { query, variables: { login: handle } },
    20000
  );

  const cal = res?.data?.user?.contributionsCollection?.contributionCalendar;
  if (!cal) {
    throw new ProviderError(res?.message ?? "Could not load contribution calendar");
  }

  const days: DayContribution[] = [];
  for (const week of cal.weeks) {
    for (const day of week.contributionDays) {
      days.push({ date: day.date, count: day.contributionCount });
    }
  }
  return { total: cal.totalContributions, days };
}

async function fetchContributionsScrape(
  handle: string
): Promise<{ total: number; days: DayContribution[] }> {
  const html = await fetchText(
    `https://github.com/users/${encodeURIComponent(handle)}/contributions`,
    20000,
    {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    }
  );

  const cells = [
    ...html.matchAll(
      /<td[^>]*data-date="(\d{4}-\d{2}-\d{2})"[^>]*id="(contribution-day-component-[^"]+)"[^>]*>/g
    ),
  ];

  const tips = new Map<string, string>();
  for (const tip of html.matchAll(
    /<tool-tip[^>]*for="(contribution-day-component-[^"]+)"[^>]*>\s*(.*?)\s*<\/tool-tip>/g
  )) {
    tips.set(tip[1], tip[2]);
  }

  const days: DayContribution[] = [];
  let total = 0;
  for (const match of cells) {
    const tip = tips.get(match[2]);
    const count = parseContributionCount(tip);
    total += count;
    days.push({ date: match[1], count });
  }

  if (days.length === 0) {
    throw new ProviderError("No contribution cells found");
  }

  return { total, days };
}

function parseContributionCount(tipText: string | undefined): number {
  if (!tipText) return 0;
  const match = tipText.match(/^\s*(\d+)\s+contributions?/i);
  return match ? parseInt(match[1], 10) : 0;
}
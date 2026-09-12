import { fetchJson, ProviderError, withCache } from "./fetch";
import type { GitLabData, LanguageStat } from "./types";

interface GitLabUser {
  id: number;
  username: string;
  name: string;
  avatar_url: string;
  web_url: string;
}

interface GitLabProject {
  name: string;
  star_count: number;
  primary_language: string | null;
}

export async function getGitLabStats(handle: string): Promise<GitLabData> {
  const key = `gl:${handle.toLowerCase()}`;
  return withCache(key, 12 * 3600, async () => {
    let users: GitLabUser[] = [];
    try {
      users = await fetchJson<GitLabUser[]>(
        `https://gitlab.com/api/v4/users?username=${encodeURIComponent(handle)}`,
        15000
      );
    } catch (err) {
      if (err instanceof ProviderError && err.status === 404) {
        throw new ProviderError("GitLab user not found", 404);
      }
      throw err;
    }

    if (!Array.isArray(users) || users.length === 0) {
      throw new ProviderError("GitLab user not found", 404);
    }
    const user =
      users.find((u) => u.username.toLowerCase() === handle.toLowerCase()) ?? users[0];

    let projects: GitLabProject[] = [];
    try {
      projects = await fetchJson<GitLabProject[]>(
        `https://gitlab.com/api/v4/users/${user.id}/projects?per_page=100&order_by=updated_at&sort=desc`,
        15000
      );
    } catch {
      projects = [];
    }
    if (!Array.isArray(projects)) projects = [];

    let totalStars = 0;
    const langMap = new Map<string, number>();
    for (const project of projects) {
      totalStars += project.star_count ?? 0;
      if (project.primary_language) {
        langMap.set(project.primary_language, (langMap.get(project.primary_language) ?? 0) + 1);
      }
    }
    const topLanguages: LanguageStat[] = [...langMap.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return {
      username: user.username,
      name: user.name,
      avatar: user.avatar_url,
      url: user.web_url,
      publicProjects: projects.length,
      totalStars,
      topLanguages,
    };
  });
}
import { fetchJson, ProviderError, withCache } from "./fetch";
import type { DevToData } from "./types";

interface DevToApiUser {
  username?: string;
  name?: string;
  profile_image_90?: string;
  summary?: string | null;
  location?: string | null;
  website_url?: string | null;
  github_username?: string | null;
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
  joined_at?: string;
}

export async function getDevToStats(handle: string): Promise<DevToData> {
  const key = `dt:${handle.toLowerCase()}`;
  return withCache(key, 12 * 3600, async () => {
    let user: DevToApiUser;
    try {
      user = await fetchJson<DevToApiUser>(
        `https://dev.to/api/users/by_username?url=${encodeURIComponent(handle)}`,
        15000
      );
    } catch (err) {
      if (err instanceof ProviderError && err.status === 404) {
        throw new ProviderError("Dev.to user not found", 404);
      }
      throw err;
    }

    if (!user || !user.username) {
      throw new ProviderError("Dev.to user not found", 404);
    }

    return {
      username: user.username,
      name: user.name || user.username,
      avatar: user.profile_image_90 || "",
      url: `https://dev.to/${user.username}`,
      summary: user.summary || null,
      location: user.location || null,
      websiteUrl: user.website_url || null,
      githubUsername: user.github_username || null,
      followers: user.followers_count ?? 0,
      following: user.following_count ?? 0,
      postsCount: user.posts_count ?? 0,
      joinedAt: user.joined_at?.slice(0, 10) ?? null,
    };
  });
}
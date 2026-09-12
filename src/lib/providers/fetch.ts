import { cacheGet, cacheSet } from "@/lib/cache";

export class ProviderError extends Error {
  constructor(
    message: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = "ProviderError";
  }
}

export async function fetchText(
  url: string,
  timeoutMs = 15000,
  headers: Record<string, string> = {}
): Promise<string> {
  let res: Response;
  try {
    res = await fetch(url, {
      headers: { "User-Agent": "crossprofiles/1.0", ...headers },
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (err) {
    if (err instanceof Error && err.name === "TimeoutError") {
      throw new ProviderError("Request timed out");
    }
    throw new ProviderError("Network error");
  }

  if (res.status === 404) throw new ProviderError("Profile not found", 404);
  if (res.status === 403 || res.status === 429) {
    throw new ProviderError("Rate limited by the platform", res.status);
  }
  if (!res.ok) throw new ProviderError(`Request failed (${res.status})`, res.status);

  return res.text();
}

export async function fetchJson<T>(
  url: string,
  timeoutMs = 15000,
  headers: Record<string, string> = {}
): Promise<T> {
  const raw = await fetchText(url, timeoutMs, headers);
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new ProviderError("Malformed response");
  }
}

export async function postJson<T>(
  url: string,
  body: unknown,
  timeoutMs = 15000
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "User-Agent": "crossprofiles/1.0" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (err) {
    if (err instanceof Error && err.name === "TimeoutError") {
      throw new ProviderError("Request timed out");
    }
    throw new ProviderError("Network error");
  }

  if (res.status === 404) throw new ProviderError("Profile not found", 404);
  if (res.status === 403 || res.status === 429) {
    throw new ProviderError("Rate limited by the platform", res.status);
  }
  if (!res.ok) throw new ProviderError(`Request failed (${res.status})`, res.status);

  try {
    return (await res.json()) as T;
  } catch {
    throw new ProviderError("Malformed response");
  }
}

export async function withCache<T>(
  key: string,
  ttlSeconds: number,
  fn: () => Promise<T>
): Promise<T> {
  const hit = await cacheGet<T>(key, ttlSeconds);
  if (hit) return hit;

  const value = await fn();
  await cacheSet(key, value);
  return value;
}

export function fmtHandle(handle: string): string {
  return handle.trim().toLowerCase();
}
import { db } from "./db";

export function cacheGet<T>(key: string, ttlSeconds: number): T | null {
  const row = db
    .prepare("SELECT value, updatedAt FROM cache WHERE key = ?")
    .get(key) as { value: string; updatedAt: number } | undefined;

  if (!row) return null;
  if (Date.now() - row.updatedAt > ttlSeconds * 1000) return null;

  try {
    return JSON.parse(row.value) as T;
  } catch {
    return null;
  }
}

export function cacheSet(key: string, value: unknown): void {
  db.prepare(
    `INSERT INTO cache (key, value, updatedAt) VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updatedAt = excluded.updatedAt`
  ).run(key, JSON.stringify(value), Date.now());
}

export function cacheClear(key: string): void {
  db.prepare("DELETE FROM cache WHERE key = ?").run(key);
}
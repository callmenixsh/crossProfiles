import { ensureSchema, getSql } from "./db";

interface CacheRow {
  value: string;
  updatedAt: number;
}

export async function cacheGet<T>(key: string, ttlSeconds: number): Promise<T | null> {
  await ensureSchema();
  const rows = await getSql()<CacheRow[]>`SELECT value, "updatedAt" FROM cache WHERE key = ${key}`;
  const row = rows[0];
  if (!row) return null;
  if (Date.now() - row.updatedAt > ttlSeconds * 1000) return null;

  try {
    return JSON.parse(row.value) as T;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown): Promise<void> {
  await ensureSchema();
  await getSql()`
    INSERT INTO cache (key, value, "updatedAt")
    VALUES (${key}, ${JSON.stringify(value)}, ${Date.now()})
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, "updatedAt" = EXCLUDED."updatedAt"
  `;
}

export async function cacheClear(key: string): Promise<void> {
  await ensureSchema();
  await getSql()`DELETE FROM cache WHERE key = ${key}`;
}
import type { Handles } from "./providers";
import { EMPTY_SOCIALS, SOCIAL_KEYS, type Socials } from "./socials";
import { PLATFORMS } from "./providers/types";

export type HandleKey = keyof Handles;

export const HANDLE_KEYS: HandleKey[] = [
  "github",
  "leetcode",
  "codeforces",
  "gfg",
  "codechef",
  "tuf",
  "monkeytype",
  "atcoder",
  "codewars",
  "gitlab",
  "devto",
];

const PLATFORM_SET = new Set<string>(PLATFORMS);

export function sanitizeDisabled(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  for (const item of input) {
    if (typeof item === "string" && PLATFORM_SET.has(item)) seen.add(item);
  }
  return PLATFORMS.filter((key) => seen.has(key));
}

export function parseDisabled(stored: string | null | undefined): string[] {
  if (!stored) return [];
  try {
    const raw: unknown = JSON.parse(stored);
    if (!Array.isArray(raw)) return [];
    return sanitizeDisabled(raw);
  } catch {
    return [];
  }
}

export const USERNAME_RE = /^[a-z0-9](?:[a-z0-9-]{0,37}[a-z0-9])?$/;

const ALLOWED = /^[a-zA-Z0-9._-]*$/;
const MAX_LEN = 48;

export function sanitizeHandles(
  input: unknown,
  opts: { requireAny?: boolean } = {}
): {
  ok: boolean;
  handles: Handles;
  errors: string[];
} {
  const errors: string[] = [];
  const source =
    input && typeof input === "object" ? (input as Record<string, unknown>) : {};

  const handles: Handles = {
    github: "",
    leetcode: "",
    codeforces: "",
    gfg: "",
    codechef: "",
    tuf: "",
    monkeytype: "",
    atcoder: "",
    codewars: "",
    gitlab: "",
    devto: "",
  };

  for (const key of HANDLE_KEYS) {
    const raw = source[key];
    if (raw === undefined || raw === null) continue;
    if (typeof raw !== "string") {
      errors.push(`${key}: must be a string`);
      continue;
    }
    const value = raw.trim();
    if (value.length > MAX_LEN) {
      errors.push(`${key}: too long`);
      continue;
    }
    if (value && !ALLOWED.test(value)) {
      errors.push(`${key}: invalid characters`);
      continue;
    }
    handles[key] = value;
  }

  const anyHandle = HANDLE_KEYS.some((k) => handles[k].length > 0);
  if (!anyHandle && (opts.requireAny ?? true)) {
    errors.push("at least one handle is required");
  }

  return { ok: errors.length === 0, handles, errors };
}

const SOCIAL_MAX_LEN = 120;

export function sanitizeSocials(input: unknown): {
  ok: boolean;
  socials: Socials;
  errors: string[];
} {
  const errors: string[] = [];
  const source =
    input && typeof input === "object" ? (input as Record<string, unknown>) : {};

  const socials: Socials = { ...EMPTY_SOCIALS };

  for (const key of SOCIAL_KEYS) {
    const raw = source[key];
    if (raw === undefined || raw === null) continue;
    if (typeof raw !== "string") {
      errors.push(`${key}: must be a string`);
      continue;
    }
    const value = raw.trim();
    if (value.length > SOCIAL_MAX_LEN) {
      errors.push(`${key}: too long`);
      continue;
    }
    if (!value) continue;

    if (key === "website") {
      const url = /^https?:\/\//i.test(value) ? value : `https://${value}`;
      if (!/^https?:\/\/[^\s]+\.[^\s]+$/i.test(url)) {
        errors.push("website: enter a valid URL");
        continue;
      }
      socials[key] = value;
    } else {
      if (/\s/.test(value) || /[^a-zA-Z0-9._-]/.test(value)) {
        errors.push(`${key}: invalid handle`);
        continue;
      }
      socials[key] = value;
    }
  }

  return { ok: errors.length === 0, socials, errors };
}
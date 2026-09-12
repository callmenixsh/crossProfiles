import type { PlatformKey } from "./types";

const CACHE_PREFIX: Record<PlatformKey, string> = {
  github: "gh:v3",
  leetcode: "lc:v2",
  codeforces: "cf",
  gfg: "gfg:v3",
  codechef: "cc",
  tuf: "tuf",
  monkeytype: "mt",
  atcoder: "ac",
  codewars: "cw",
  gitlab: "gl",
  devto: "dt",
};

export function statsKey(key: PlatformKey, handle: string): string {
  return `${CACHE_PREFIX[key]}:${handle.trim().toLowerCase()}`;
}
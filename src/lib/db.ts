import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

const dataDir = path.join(process.cwd(), "data");
fs.mkdirSync(dataDir, { recursive: true });

export const db = new DatabaseSync(path.join(dataDir, "crossprofiles.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS profiles (
    id           TEXT PRIMARY KEY,
    slug         TEXT NOT NULL UNIQUE,
    editTokenHash TEXT NOT NULL,
    github       TEXT,
    leetcode     TEXT,
    codeforces   TEXT,
    gfg          TEXT,
    codechef     TEXT,
    tuf          TEXT,
    createdAt    INTEGER NOT NULL,
    updatedAt    INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS cache (
    key       TEXT PRIMARY KEY,
    value     TEXT NOT NULL,
    updatedAt INTEGER NOT NULL
  );
`);

const profileColumns = (db.prepare("PRAGMA table_info(profiles)").all() as { name: string }[]).map(
  (c) => c.name
);
if (!profileColumns.includes("monkeytype")) {
  db.exec("ALTER TABLE profiles ADD COLUMN monkeytype TEXT");
}
if (!profileColumns.includes("atcoder")) {
  db.exec("ALTER TABLE profiles ADD COLUMN atcoder TEXT");
}
if (!profileColumns.includes("codewars")) {
  db.exec("ALTER TABLE profiles ADD COLUMN codewars TEXT");
}
if (!profileColumns.includes("gitlab")) {
  db.exec("ALTER TABLE profiles ADD COLUMN gitlab TEXT");
}
if (!profileColumns.includes("devto")) {
  db.exec("ALTER TABLE profiles ADD COLUMN devto TEXT");
}
if (!profileColumns.includes("socials")) {
  db.exec("ALTER TABLE profiles ADD COLUMN socials TEXT");
}
if (!profileColumns.includes("theme")) {
  db.exec("ALTER TABLE profiles ADD COLUMN theme TEXT");
}
if (!profileColumns.includes("buttons")) {
  db.exec("ALTER TABLE profiles ADD COLUMN buttons TEXT");
}

export interface ProfileRow {
  id: string;
  slug: string;
  editTokenHash: string;
  github: string | null;
  leetcode: string | null;
  codeforces: string | null;
  gfg: string | null;
  codechef: string | null;
  tuf: string | null;
  monkeytype: string | null;
  atcoder: string | null;
  codewars: string | null;
  gitlab: string | null;
  devto: string | null;
  socials: string | null;
  theme: string | null;
  buttons: string | null;
  createdAt: number;
  updatedAt: number;
}

export function findProfileBySlug(slug: string): ProfileRow | undefined {
  return db.prepare("SELECT * FROM profiles WHERE slug = ?").get(slug) as
    | ProfileRow
    | undefined;
}

export function findProfileByTokenHash(tokenHash: string): ProfileRow | undefined {
  return db
    .prepare("SELECT * FROM profiles WHERE editTokenHash = ?")
    .get(tokenHash) as ProfileRow | undefined;
}

export interface HandlesInput {
  github: string;
  leetcode: string;
  codeforces: string;
  gfg: string;
  codechef: string;
  tuf: string;
  monkeytype: string;
  atcoder: string;
  codewars: string;
  gitlab: string;
  devto: string;
}

export function createProfile(input: {
  slug: string;
  editTokenHash: string;
  handles: HandlesInput;
  socials?: string;
  theme?: string;
  buttons?: string;
}): ProfileRow {
  const id = crypto.randomUUID();
  const now = Date.now();

  db.prepare(
    `INSERT INTO profiles (id, slug, editTokenHash, github, leetcode, codeforces, gfg, codechef, tuf, monkeytype, atcoder, codewars, gitlab, devto, socials, theme, buttons, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    input.slug,
    input.editTokenHash,
    input.handles.github ?? null,
    input.handles.leetcode ?? null,
    input.handles.codeforces ?? null,
    input.handles.gfg ?? null,
    input.handles.codechef ?? null,
    input.handles.tuf ?? null,
    input.handles.monkeytype ?? null,
    input.handles.atcoder ?? null,
    input.handles.codewars ?? null,
    input.handles.gitlab ?? null,
    input.handles.devto ?? null,
    input.socials ?? null,
    input.theme ?? null,
    input.buttons ?? null,
    now,
    now
  );

  return findProfileBySlug(input.slug)!;
}

export function updateProfileHandles(
  slug: string,
  handles: HandlesInput,
  socials?: string,
  theme?: string,
  buttons?: string
): ProfileRow | undefined {
  db.prepare(
    `UPDATE profiles
     SET github = ?, leetcode = ?, codeforces = ?, gfg = ?, codechef = ?, tuf = ?, monkeytype = ?, atcoder = ?, codewars = ?, gitlab = ?, devto = ?, socials = ?, theme = ?, buttons = ?, updatedAt = ?
     WHERE slug = ?`
  ).run(
    handles.github ?? null,
    handles.leetcode ?? null,
    handles.codeforces ?? null,
    handles.gfg ?? null,
    handles.codechef ?? null,
    handles.tuf ?? null,
    handles.monkeytype ?? null,
    handles.atcoder ?? null,
    handles.codewars ?? null,
    handles.gitlab ?? null,
    handles.devto ?? null,
    socials ?? null,
    theme ?? null,
    buttons ?? null,
    Date.now(),
    slug
  );
  return findProfileBySlug(slug);
}

export function deleteProfile(slug: string): void {
  db.prepare("DELETE FROM profiles WHERE slug = ?").run(slug);
}
import postgres from "postgres";

let sql: ReturnType<typeof postgres> | null = null;
let schemaReady: Promise<void> | null = null;

const INT8 = 20;

const INT8_TYPE: Record<string, postgres.PostgresType> = {
  bigint: {
    to: INT8,
    from: [INT8],
    parse: (value) => Number(value),
    serialize: (value) => String(value),
  },
};

export function getSql() {
  if (!sql) {
    const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        "Missing Postgres connection string. Set POSTGRES_URL (or DATABASE_URL) in your environment."
      );
    }
    sql = postgres(url, {
      max: 1,
      connect_timeout: 10,
      types: INT8_TYPE,
    });
  }
  return sql;
}

export function ensureSchema(): Promise<void> {
  return (schemaReady ??=
    (async () => {
      const handle = getSql();
      await handle`
        CREATE TABLE IF NOT EXISTS profiles (
          id             TEXT PRIMARY KEY,
          slug           TEXT NOT NULL UNIQUE,
          "editTokenHash" TEXT NOT NULL,
          github         TEXT,
          leetcode       TEXT,
          codeforces     TEXT,
          gfg            TEXT,
          codechef       TEXT,
          tuf            TEXT,
          monkeytype     TEXT,
          atcoder        TEXT,
          codewars       TEXT,
          gitlab         TEXT,
          devto          TEXT,
          socials        TEXT,
          theme          TEXT,
          buttons        TEXT,
          disabled       TEXT,
          "createdAt"    BIGINT NOT NULL,
          "updatedAt"    BIGINT NOT NULL
        )
      `;
      await handle`
        CREATE TABLE IF NOT EXISTS cache (
          key         TEXT PRIMARY KEY,
          value       TEXT NOT NULL,
          "updatedAt" BIGINT NOT NULL
        )
      `;
      await handle`
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS disabled TEXT
      `;
    })());
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
  disabled: string | null;
  createdAt: number;
  updatedAt: number;
}

export async function findProfileBySlug(slug: string): Promise<ProfileRow | undefined> {
  await ensureSchema();
  const rows = await getSql()<ProfileRow[]>`
    SELECT id, slug, "editTokenHash", github, leetcode, codeforces, gfg, codechef, tuf,
           monkeytype, atcoder, codewars, gitlab, devto, socials, theme, buttons, disabled,
           "createdAt", "updatedAt"
    FROM profiles WHERE slug = ${slug}
  `;
  return rows[0];
}

export async function findProfileByTokenHash(
  tokenHash: string
): Promise<ProfileRow | undefined> {
  await ensureSchema();
  const rows = await getSql()<ProfileRow[]>`
    SELECT id, slug, "editTokenHash", github, leetcode, codeforces, gfg, codechef, tuf,
           monkeytype, atcoder, codewars, gitlab, devto, socials, theme, buttons, disabled,
           "createdAt", "updatedAt"
    FROM profiles WHERE "editTokenHash" = ${tokenHash}
  `;
  return rows[0];
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

export async function createProfile(input: {
  slug: string;
  editTokenHash: string;
  handles: HandlesInput;
  socials?: string;
  theme?: string;
  buttons?: string;
  disabled?: string;
}): Promise<ProfileRow> {
  await ensureSchema();
  const now = Date.now();
  await getSql()`
    INSERT INTO profiles (id, slug, "editTokenHash", github, leetcode, codeforces, gfg, codechef, tuf, monkeytype, atcoder, codewars, gitlab, devto, socials, theme, buttons, disabled, "createdAt", "updatedAt")
    VALUES (${crypto.randomUUID()}, ${input.slug}, ${input.editTokenHash}, ${input.handles.github ?? null}, ${input.handles.leetcode ?? null}, ${input.handles.codeforces ?? null}, ${input.handles.gfg ?? null}, ${input.handles.codechef ?? null}, ${input.handles.tuf ?? null}, ${input.handles.monkeytype ?? null}, ${input.handles.atcoder ?? null}, ${input.handles.codewars ?? null}, ${input.handles.gitlab ?? null}, ${input.handles.devto ?? null}, ${input.socials ?? null}, ${input.theme ?? null}, ${input.buttons ?? null}, ${input.disabled ?? null}, ${now}, ${now})
  `;
  return (await findProfileBySlug(input.slug))!;
}

export async function updateProfileHandles(
  slug: string,
  handles: HandlesInput,
  socials?: string,
  theme?: string,
  buttons?: string,
  disabled?: string
): Promise<ProfileRow | undefined> {
  await ensureSchema();
  await getSql()`
    UPDATE profiles
    SET github = ${handles.github ?? null},
        leetcode = ${handles.leetcode ?? null},
        codeforces = ${handles.codeforces ?? null},
        gfg = ${handles.gfg ?? null},
        codechef = ${handles.codechef ?? null},
        tuf = ${handles.tuf ?? null},
        monkeytype = ${handles.monkeytype ?? null},
        atcoder = ${handles.atcoder ?? null},
        codewars = ${handles.codewars ?? null},
        gitlab = ${handles.gitlab ?? null},
        devto = ${handles.devto ?? null},
        socials = ${socials ?? null},
        theme = ${theme ?? null},
        buttons = ${buttons ?? null},
        disabled = ${disabled ?? null},
        "updatedAt" = ${Date.now()}
    WHERE slug = ${slug}
  `;
  return findProfileBySlug(slug);
}

export async function deleteProfile(slug: string): Promise<void> {
  await ensureSchema();
  await getSql()`DELETE FROM profiles WHERE slug = ${slug}`;
}
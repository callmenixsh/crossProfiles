import { NextResponse } from "next/server";
import { createProfile, findProfileBySlug } from "@/lib/db";
import { generateEditToken, generateSlug, hashToken } from "@/lib/slug";
import { sanitizeHandles, sanitizeSocials, USERNAME_RE } from "@/lib/validate";
import { parseTheme } from "@/lib/themes";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const { ok, handles, errors } = sanitizeHandles(body, { requireAny: false });
  if (!ok) {
    return NextResponse.json({ error: errors }, { status: 400 });
  }

  const socialsResult = sanitizeSocials(body?.socials);
  if (!socialsResult.ok) {
    return NextResponse.json({ error: socialsResult.errors }, { status: 400 });
  }

  const rawUsername = typeof body?.username === "string" ? body.username.trim() : "";

  let slug: string;
  if (rawUsername) {
    const username = rawUsername.toLowerCase();
    if (!USERNAME_RE.test(username)) {
      return NextResponse.json(
        { error: ["Username must be 1–39 characters: lowercase letters, numbers and dashes."] },
        { status: 400 }
      );
    }
    if (findProfileBySlug(username)) {
      return NextResponse.json(
        { error: [`"${username}" is already taken — try another username or leave it blank.`] },
        { status: 409 }
      );
    }
    slug = username;
  } else {
    slug = generateSlug();
  }

  const editToken = generateEditToken();

  const profile = createProfile({
    slug,
    editTokenHash: hashToken(editToken),
    handles,
    socials: JSON.stringify(socialsResult.socials),
    theme: parseTheme(body?.theme),
  });

  return NextResponse.json(
    {
      slug: profile.slug,
      editToken,
      handles: publicHandles(profile),
      socials: socialsResult.socials,
      theme: parseTheme(profile.theme),
    },
    { status: 201 }
  );
}

function publicHandles(profile: {
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
}) {
  return {
    github: profile.github ?? "",
    leetcode: profile.leetcode ?? "",
    codeforces: profile.codeforces ?? "",
    gfg: profile.gfg ?? "",
    codechef: profile.codechef ?? "",
    tuf: profile.tuf ?? "",
    monkeytype: profile.monkeytype ?? "",
    atcoder: profile.atcoder ?? "",
    codewars: profile.codewars ?? "",
    gitlab: profile.gitlab ?? "",
    devto: profile.devto ?? "",
  };
}
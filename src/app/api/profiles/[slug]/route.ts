import { NextResponse } from "next/server";
import {
  deleteProfile,
  findProfileBySlug,
  updateProfileHandles,
} from "@/lib/db";
import { hashToken } from "@/lib/slug";
import { parseDisabled, sanitizeDisabled, sanitizeHandles, sanitizeSocials } from "@/lib/validate";
import { parseSocials, parseButtons, type ProfileButton } from "@/lib/socials";
import { parseTheme } from "@/lib/themes";
import { clearStatsCache } from "@/lib/providers";

export const dynamic = "force-dynamic";

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

function load(ctx: { params: Promise<{ slug: string }> }) {
  return ctx.params;
}

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await load(ctx);
  const profile = await findProfileBySlug(slug);
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }
  return NextResponse.json({
    slug: profile.slug,
    handles: publicHandles(profile),
    socials: parseSocials(profile),
    theme: parseTheme(profile.theme),
    buttons: parseButtons(profile),
    disabled: parseDisabled(profile.disabled),
  });
}

function sanitizeButtons(raw: unknown): ProfileButton[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (b): b is ProfileButton =>
        typeof b === "object" &&
        b !== null &&
        typeof (b as ProfileButton).label === "string" &&
        typeof (b as ProfileButton).url === "string" &&
        (b as ProfileButton).label.trim().length > 0 &&
        (b as ProfileButton).url.trim().length > 0
    )
    .map((b) => ({
      label: b.label.trim().slice(0, 50),
      url: b.url.trim().slice(0, 500),
    }))
    .slice(0, 10);
}

export async function PUT(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await load(ctx);
  const body = await req.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";

  const profile = await findProfileBySlug(slug);
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }
  if (profile.editTokenHash !== hashToken(token)) {
    return NextResponse.json({ error: "Invalid edit token" }, { status: 401 });
  }

  const { ok, handles, errors } = sanitizeHandles(body);
  if (!ok) {
    return NextResponse.json({ error: errors }, { status: 400 });
  }

  const socialsResult = sanitizeSocials(body?.socials);
  if (!socialsResult.ok) {
    return NextResponse.json({ error: socialsResult.errors }, { status: 400 });
  }

  await clearStatsCache(publicHandles(profile));
  await clearStatsCache(handles);

  const finalTheme = body?.theme === undefined ? profile.theme : parseTheme(body.theme);
  const finalButtons = body?.buttons === undefined ? profile.buttons : JSON.stringify(sanitizeButtons(body.buttons));
  const finalDisabled = JSON.stringify(sanitizeDisabled(body?.disabled));
  const updated = await updateProfileHandles(
    slug,
    handles,
    JSON.stringify(socialsResult.socials),
    finalTheme ?? undefined,
    finalButtons ?? undefined,
    finalDisabled
  );
  return NextResponse.json({
    slug: updated?.slug,
    handles: updated ? publicHandles(updated) : null,
    socials: updated ? parseSocials(updated) : null,
    theme: updated ? parseTheme(updated.theme) : null,
    buttons: updated ? parseButtons(updated) : null,
    disabled: updated ? parseDisabled(updated.disabled) : null,
  });
}

export async function DELETE(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await load(ctx);
  const body = await req.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";

  const profile = await findProfileBySlug(slug);
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }
  if (profile.editTokenHash !== hashToken(token)) {
    return NextResponse.json({ error: "Invalid edit token" }, { status: 401 });
  }

  await deleteProfile(slug);
  return NextResponse.json({ ok: true });
}

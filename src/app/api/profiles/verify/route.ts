import { NextResponse } from "next/server";
import { findProfileBySlug } from "@/lib/db";
import { hashToken } from "@/lib/slug";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const slug = typeof body?.slug === "string" ? body.slug.trim().toLowerCase() : "";
  const token = typeof body?.token === "string" ? body.token.trim() : "";

  if (!/^[a-z0-9](?:[a-z0-9-]{0,37}[a-z0-9])?$/.test(slug)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }
  if (!token) {
    return NextResponse.json({ error: "Enter your edit key." }, { status: 400 });
  }

  const profile = findProfileBySlug(slug);
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }
  if (profile.editTokenHash !== hashToken(token)) {
    return NextResponse.json(
      { error: "Invalid edit key — check it was copied correctly." },
      { status: 401 }
    );
  }

  return NextResponse.json({ ok: true });
}
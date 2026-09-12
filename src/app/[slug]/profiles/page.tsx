import { notFound } from "next/navigation";
import { findProfileBySlug } from "@/lib/db";
import { parseSocials, parseButtons } from "@/lib/socials";
import { parseTheme } from "@/lib/themes";
import { ProfilesPageShell } from "@/components/profiles-page-shell";
import type { Handles } from "@/lib/providers";

export const dynamic = "force-dynamic";

export default async function ProfilesPage(props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await props.params;
  const searchParams = await props.searchParams;

  const profile = findProfileBySlug(slug);
  if (!profile) notFound();

  const handles: Handles = {
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

  const token = typeof searchParams.token === "string" ? searchParams.token : "";

  const initialSocials = parseSocials(profile);
  const theme = parseTheme(profile.theme);
  const initialButtons = parseButtons(profile);

  return (
    <ProfilesPageShell
      slug={slug}
      token={token}
      handles={handles}
      socials={initialSocials}
      theme={theme}
      buttons={initialButtons}
    />
  );
}
import { notFound } from "next/navigation";
import { findProfileBySlug } from "@/lib/db";
import { fetchAllStats, type Handles } from "@/lib/providers";
import { parseSocials, parseButtons } from "@/lib/socials";
import { parseTheme } from "@/lib/themes";
import { Dashboard } from "@/components/dashboard";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: PageProps<"/[slug]">) {
  const { slug } = await props.params;
  return {
    title: `${slug} · CrossProfiles`,
    description: "A single-page showcase of coding profiles and stats.",
  };
}

export default async function ProfilePage(props: PageProps<"/[slug]">) {
  const { slug } = await props.params;
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

  const stats = await fetchAllStats(handles);

  return (
    <Dashboard
      slug={slug}
      handles={handles}
      stats={stats}
      socials={parseSocials(profile)}
      theme={parseTheme(profile.theme)}
      buttons={parseButtons(profile)}
    />
  );
}
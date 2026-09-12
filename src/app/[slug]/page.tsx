import { notFound } from "next/navigation";
import { findProfileBySlug } from "@/lib/db";
import { clearStatsCache, fetchAllStats, type Handles } from "@/lib/providers";
import { parseSocials, parseButtons } from "@/lib/socials";
import { parseTheme } from "@/lib/themes";
import { parseDisabled } from "@/lib/validate";
import { Dashboard } from "@/components/dashboard";
import { SiteFooter } from "@/components/site-footer";
import { ThemeShell } from "@/components/theme-context";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: PageProps<"/[slug]">) {
  const { slug } = await props.params;
  return {
    title: `${slug} · CrossProfiles`,
    description: "A single-page showcase of coding profiles and stats.",
  };
}

export default async function ProfilePage(props: PageProps<"/[slug]">) {
  const searchParams = await props.searchParams;
  const { slug } = await props.params;
  const profile = await findProfileBySlug(slug);
  if (!profile) notFound();

  const disabled = new Set(parseDisabled(profile.disabled));
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
  for (const key of disabled) {
    handles[key as keyof Handles] = "";
  }

  if (searchParams.refresh === "1") {
    await clearStatsCache(handles);
  }
  const stats = await fetchAllStats(handles);

  return (
    <ThemeShell theme={parseTheme(profile.theme)}>
      <Dashboard
        slug={slug}
        handles={handles}
        stats={stats}
        socials={parseSocials(profile)}
        theme={parseTheme(profile.theme)}
        buttons={parseButtons(profile)}
      />
      <SiteFooter />
    </ThemeShell>
  );
}
import { ExternalLink, Globe, Link2, RefreshCw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SOCIAL_KEYS, SOCIAL_META, socialUrl, type ProfileButton, type SocialKey, type Socials } from "@/lib/socials";
import { GitHubCard } from "@/components/platforms/github-card";
import { LeetCodeCard } from "@/components/platforms/leetcode-card";
import { CodeforcesCard } from "@/components/platforms/codeforces-card";
import { GfgCard } from "@/components/platforms/gfg-card";
import { CodechefCard } from "@/components/platforms/codechef-card";
import { TufCard } from "@/components/platforms/tuf-card";
import { MonkeyTypeCard } from "@/components/platforms/monkeytype-card";
import { AtCoderCard } from "@/components/platforms/atcoder-card";
import { CodewarsCard } from "@/components/platforms/codewars-card";
import { GitLabCard } from "@/components/platforms/gitlab-card";
import { DevToCard } from "@/components/platforms/devto-card";
import { UnavailableCard } from "@/components/platforms/unavailable-card";
import { PLATFORM_CATEGORIES, PLATFORM_META, type AllStats, type PlatformKey } from "@/lib/providers/types";
import { CombinedActivityCard } from "@/components/combined-activity-card";
import { ModeToggle } from "@/components/mode-toggle";
import { EditProfileButton } from "@/components/edit-profile-button";
import type { ThemeKey } from "@/lib/themes";
import type {
  AtCoderData,
  CodechefData,
  CodeforcesData,
  CodewarsData,
  DayContribution,
  DevToData,
  GfgData,
  GitLabData,
  GitHubData,
  LeetCodeData,
  MonkeyTypeData,
  TufData,
} from "@/lib/providers/types";
import type { Handles } from "@/lib/providers";

interface Props {
  slug: string;
  handles: Handles;
  stats: AllStats;
  socials?: Socials;
  theme?: ThemeKey;
  buttons?: ProfileButton[];
}

const ORDER: PlatformKey[] = ["github", "gitlab", "devto", "leetcode", "gfg", "tuf", "codewars", "codeforces", "codechef", "atcoder", "monkeytype"];

export function Dashboard({ slug, handles, stats, socials, buttons = [] }: Props) {
  const present = ORDER.filter((key) => handles[key].trim().length > 0);
  const name = resolveName(stats, handles);
  const avatar = resolveAvatar(stats);
  const github = stats.github.ok ? stats.github.data : null;
  const hasCategories = PLATFORM_CATEGORIES.filter((g) => g.keys.some((k) => present.includes(k))).length > 1;

  const socialPills: SocialKey[] = socials
    ? SOCIAL_KEYS.filter((key) => socials[key].trim().length > 0)
    : [];

  return (
    <div className="relative">
      <div className="absolute right-5 top-5 z-20">
        <ModeToggle />
      </div>
      <div className="relative mx-auto w-full max-w-5xl px-5 pt-6 pb-16">
        <header className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="relative shrink-0">
          {avatar ? (
            <Image
              src={avatar}
              alt=""
              width={88}
              height={88}
              loading="eager"
              className="size-20 rounded-2xl object-cover ring-1 ring-white/10"
            />
          ) : (
            <div className="grid size-20 place-items-center rounded-2xl bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 text-2xl font-semibold text-violet-200 ring-1 ring-white/10">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-semibold tracking-tight text-zinc-50">{name}</h1>
          {github?.bio && <p className="mt-1 line-clamp-1 text-sm text-zinc-400">{github.bio}</p>}
          {github?.location && <p className="mt-0.5 text-xs text-zinc-500">{github.location}</p>}

          {(socialPills.length > 0 || buttons.length > 0) && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {socialPills.map((key) => {
                const meta = SOCIAL_META[key];
                const value = socials![key].trim();
                const href = socialUrl(key, value);
                const Icon = key === "website" ? Globe : Link2;
                return (
                  <a
                    key={key}
                    href={href ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cp-pill group inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all hover:-translate-y-px hover:text-zinc-200 active:scale-[0.97]"
                  >
                    <Icon className="size-3.5" />
                    {meta.label}
                    <ExternalLink className="size-3 opacity-60 transition-opacity group-hover:opacity-100" />
                  </a>
                );
              })}
              {buttons.map((b) => {
                const url = /^https?:\/\//i.test(b.url) ? b.url : `https://${b.url}`;
                return (
                  <a
                    key={`${b.label}-${b.url}`}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cp-pill group inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all hover:-translate-y-px hover:text-zinc-200 active:scale-[0.97]"
                  >
                    <Link2 className="size-3.5" />
                    {b.label}
                    <ExternalLink className="size-3 opacity-60 transition-opacity group-hover:opacity-100" />
                  </a>
                );
              })}
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <EditProfileButton slug={slug} />
            <Link
              href={`/${slug}?refresh=1`}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-zinc-500 transition-colors hover:bg-zinc-800/60 hover:text-zinc-200"
            >
              <RefreshCw className="size-3" />
              Refresh stats
            </Link>
          </div>
        </div>
      </header>

      <div className="space-y-10">
        {PLATFORM_CATEGORIES.map((group) => {
          const keys = group.keys.filter((key) => present.includes(key));
          if (keys.length === 0) return null;
          const heatmapSources = keys.flatMap((key) => {
            if (key === "github") return [];
            const heatmap = heatmapOf(stats[key]);
            return heatmap && heatmap.length > 0
              ? [{ key, label: PLATFORM_META[key].label, data: heatmap }]
              : [];
          });
          return (
            <section key={group.id} aria-label={group.label}>
              {hasCategories && (
                <h2 className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
                  {group.label}
                </h2>
              )}
              {heatmapSources.length >= 2 && (
                <div className="mb-4">
                  <CombinedActivityCard sources={heatmapSources} />
                </div>
              )}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {keys.map((key) => (
                  <div key={key} className={key === "github" ? "md:col-span-2" : ""}>
                    {renderCard(key, stats, slug)}
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
      </div>
  </div>
  );
}

function heatmapOf(
  result: { ok: boolean } | undefined
): DayContribution[] | null {
  if (!result || !result.ok) return null;
  const heatmap = (result as unknown as { data?: { heatmap?: DayContribution[] } }).data?.heatmap;
  return Array.isArray(heatmap) && heatmap.length > 0 ? heatmap : null;
}

function renderCard(key: PlatformKey, stats: AllStats, slug: string) {
  const result = stats[key];
  if (!result) return null;
  if (!result.ok) return <UnavailableCard platform={key} error={result.error} slug={slug} />;
  switch (key) {
    case "github":
      return <GitHubCard data={result.data as GitHubData} />;
    case "leetcode":
      return <LeetCodeCard data={result.data as LeetCodeData} />;
    case "codeforces":
      return <CodeforcesCard data={result.data as CodeforcesData} />;
    case "gfg":
      return <GfgCard data={result.data as GfgData} />;
    case "codechef":
      return <CodechefCard data={result.data as CodechefData} />;
    case "tuf":
      return <TufCard data={result.data as TufData} />;
    case "monkeytype":
      return <MonkeyTypeCard data={result.data as MonkeyTypeData} />;
    case "atcoder":
      return <AtCoderCard data={result.data as AtCoderData} />;
    case "codewars":
      return <CodewarsCard data={result.data as CodewarsData} />;
    case "gitlab":
      return <GitLabCard data={result.data as GitLabData} />;
    case "devto":
      return <DevToCard data={result.data as DevToData} />;
  }
}

function resolveName(stats: AllStats, handles: Handles): string {
  if (stats.github.ok) return stats.github.data.name;
  if (stats.leetcode.ok) return stats.leetcode.data.name;
  if (stats.codeforces.ok && stats.codeforces.data.name) return stats.codeforces.data.name;
  if (stats.tuf.ok && stats.tuf.data.displayName) return stats.tuf.data.displayName;
  if (stats.gfg.ok && stats.gfg.data.name) return stats.gfg.data.name;
  if (stats.codechef.ok && stats.codechef.data.name) return stats.codechef.data.name;
  if (stats.monkeytype.ok && stats.monkeytype.data.name) return stats.monkeytype.data.name;
  if (stats.gitlab.ok) return stats.gitlab.data.name;
  if (stats.devto.ok) return stats.devto.data.name;
  for (const key of ORDER) {
    if (handles[key]) return handles[key];
  }
  return "Developer";
}

function resolveAvatar(stats: AllStats): string | null {
  if (stats.github.ok && stats.github.data.avatar) return stats.github.data.avatar;
  if (stats.codeforces.ok && stats.codeforces.data.avatar) return stats.codeforces.data.avatar;
  if (stats.gfg.ok && stats.gfg.data.avatar) return stats.gfg.data.avatar;
  return null;
}
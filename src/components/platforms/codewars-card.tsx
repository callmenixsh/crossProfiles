import { Braces, Flame, Star, Target, Trophy } from "lucide-react";
import { SectionCard } from "@/components/section-card";
import { ProfileLink } from "@/components/profile-link";
import { Stat } from "@/components/stat";
import { HBarList } from "@/components/charts/hbar";
import type { CodewarsData } from "@/lib/providers/types";

const ACCENT = "#b1361e";

export function CodewarsCard({ data }: { data: CodewarsData }) {
  const hasLanguages = data.languages.length > 0;
  const bestLanguage = hasLanguages
    ? [...data.languages].sort((a, b) => b.rank.score - a.rank.score)[0].language
    : null;
  return (
    <SectionCard
      icon={Braces}
      title="Codewars"
      subtitle={`@${data.username}${data.clan ? ` · ${data.clan}` : ""}`}
      accent={ACCENT}
      action={<ProfileLink url={data.url} />}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-zinc-800 bg-zinc-950/60 px-3 py-1 text-xs font-medium text-zinc-200">
            {data.overall.name}
          </span>
          <span className="text-xs text-zinc-500">
            #{data.leaderboardPosition?.toLocaleString("en-US") ?? "—"} on the leaderboard
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Stat icon={Flame} label="Honor" value={data.honor.toLocaleString("en-US")} />
          <Stat icon={Target} label="Completed" value={data.totalCompleted} />
          <Stat icon={Braces} label="Rank score" value={data.overall.score} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Stat
            icon={Trophy}
            label="Leaderboard"
            value={data.leaderboardPosition?.toLocaleString("en-US") ?? "—"}
          />
          <Stat icon={Braces} label="Languages" value={data.languages.length} />
          <Stat icon={Star} label="Best language" value={bestLanguage ?? "—"} />
        </div>
        {hasLanguages && (
          <HBarList
            items={data.languages.map((l) => ({ label: l.language, value: l.rank.score }))}
            accent={ACCENT}
            emptyText="No language ranks"
          />
        )}
      </div>
    </SectionCard>
  );
}

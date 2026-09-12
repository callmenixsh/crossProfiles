import { Flame, History, MessageSquare, Swords, Trophy } from "lucide-react";
import { SectionCard } from "@/components/section-card";
import { ProfileLink } from "@/components/profile-link";
import { Stat } from "@/components/stat";
import type { CodeforcesData } from "@/lib/providers/types";

const ACCENT = "#5aa9f5";

export function CodeforcesCard({ data }: { data: CodeforcesData }) {
  return (
    <SectionCard
      icon={Swords}
      title="Codeforces"
      subtitle={data.name ? `@${data.handle} · ${data.name}` : `@${data.handle}`}
      accent={ACCENT}
      action={<ProfileLink url={data.url} />}
    >
      <div className="space-y-4">
        {(data.rank || data.maxRank) && (
          <div className="flex flex-wrap items-center gap-2">
            {data.rank && (
              <span className="rounded-full border border-zinc-800 bg-zinc-950/60 px-3 py-1 text-xs font-medium text-zinc-200">
                {data.rank}
              </span>
            )}
            {data.maxRank && (
              <span className="rounded-full border border-zinc-800 bg-zinc-950/60 px-3 py-1 text-xs text-zinc-500">
                peak: {data.maxRank}
              </span>
            )}
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <Stat icon={Trophy} label="Rating" value={data.rating ?? "—"} />
          <Stat icon={Flame} label="Max rating" value={data.maxRating ?? "—"} />
          <Stat icon={History} label="Rated contests" value={data.ratingHistory.length} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Stat
            icon={MessageSquare}
            label="Contribution"
            value={data.contribution?.toLocaleString("en-US") ?? "—"}
          />
          <Stat icon={Trophy} label="Max rank" value={data.maxRank ?? "—"} />
        </div>
      </div>
    </SectionCard>
  );
}

import { Calendar, Newspaper, Users } from "lucide-react";
import { SectionCard } from "@/components/section-card";
import { ProfileLink } from "@/components/profile-link";
import { Stat } from "@/components/stat";
import type { DevToData } from "@/lib/providers/types";

const ACCENT = "#e4e4e7";

export function DevToCard({ data }: { data: DevToData }) {
  return (
    <SectionCard
      icon={Newspaper}
      title="Dev.to"
      subtitle={`@${data.username}`}
      accent={ACCENT}
      action={<ProfileLink url={data.url} />}
    >
      <div className="space-y-4">
        {data.summary && (
          <p className="line-clamp-2 text-xs leading-relaxed text-zinc-400">{data.summary}</p>
        )}
        <div className="grid grid-cols-3 gap-3">
          <Stat icon={Users} label="Followers" value={data.followers.toLocaleString("en-US")} />
          <Stat icon={Newspaper} label="Posts" value={data.postsCount} />
          <Stat icon={Users} label="Following" value={data.following.toLocaleString("en-US")} />
        </div>
        {(data.location || data.githubUsername || data.joinedAt) && (
          <div className="flex flex-wrap gap-1.5">
            {data.location && (
              <span className="rounded-full border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-xs text-zinc-400">
                {data.location}
              </span>
            )}
            {data.githubUsername && (
              <span className="rounded-full border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-xs text-zinc-400">
                github/@ {data.githubUsername}
              </span>
            )}
            {data.joinedAt && (
              <span className="inline-flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-xs text-zinc-400">
                <Calendar className="size-3" />
                {data.joinedAt}
              </span>
            )}
          </div>
        )}
      </div>
    </SectionCard>
  );
}
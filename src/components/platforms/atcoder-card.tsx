import { Medal, Trophy } from "lucide-react";
import { SectionCard } from "@/components/section-card";
import { ProfileLink } from "@/components/profile-link";
import { Stat } from "@/components/stat";
import { RatingLine } from "@/components/charts/rating-line";
import type { AtCoderData } from "@/lib/providers/types";

const ACCENT = "#5aa9f5";

export function AtCoderCard({ data }: { data: AtCoderData }) {
  return (
    <SectionCard
      icon={Medal}
      title="AtCoder"
      subtitle={`@${data.handle}`}
      accent={ACCENT}
      action={<ProfileLink url={data.url} />}
    >
      <div className="space-y-4">
        {data.lastContest && (
          <p className="text-xs text-zinc-500">
            Last rated contest ·{" "}
            <span className="text-zinc-300">{data.lastContest.name}</span> ·{" "}
            <span className="tabular">{data.lastContest.date}</span>
          </p>
        )}
        <div className="grid grid-cols-3 gap-3">
          <Stat icon={Trophy} label="Rating" value={data.rating} />
          <Stat icon={Trophy} label="Highest" value={data.highestRating} />
          <Stat icon={Medal} label="Contests" value={data.contests} />
        </div>
        {data.history.length > 0 && (
          <RatingLine
            data={data.history.map((h) => ({
              date: h.date,
              rating: h.rating,
              contest: h.contest,
            }))}
            accent={ACCENT}
          />
        )}
      </div>
    </SectionCard>
  );
}

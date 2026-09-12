import { Binary, Flame, Sparkles, TrendingUp, Trophy, Users } from "lucide-react";
import { SectionCard } from "@/components/section-card";
import { ProfileLink } from "@/components/profile-link";
import { Stat } from "@/components/stat";
import { DifficultyDonut } from "@/components/charts/difficulty-donut";
import type { LeetCodeData } from "@/lib/providers/types";

const ACCENT = "#ffa116";

export function LeetCodeCard({ data }: { data: LeetCodeData }) {
  const { easy, medium, hard } = data.solvedByDifficulty;

  return (
    <SectionCard
      icon={Binary}
      title="LeetCode"
      subtitle={`@${data.username}`}
      accent={ACCENT}
      action={<ProfileLink url={data.url} />}
    >
      <div className="space-y-4">
        <DifficultyDonut
          segments={[
            { label: "Easy", value: easy, color: "#34d399" },
            { label: "Medium", value: medium, color: "#fbbf24" },
            { label: "Hard", value: hard, color: "#fb7185" },
          ]}
          center={data.totalSolved.toLocaleString("en-US")}
          centerSub="solved"
        />
<div className="grid grid-cols-3 gap-3">
          <Stat icon={Trophy} label="Rating" value={data.contestRating ?? "—"} />
          <Stat icon={Flame} label="Contests" value={data.attendedContests ?? "—"} />
          <Stat icon={Users} label="Rank" value={data.globalRanking ?? "—"} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Stat
            icon={Binary}
            label="Solved"
            value={data.totalQuestions ? `${data.totalSolved}/${data.totalQuestions}` : data.totalSolved}
          />
          <Stat icon={Sparkles} label="Reputation" value={data.reputation ?? "—"} />
          <Stat icon={TrendingUp} label="Top" value={data.topPercentage != null ? `${data.topPercentage}%` : "—"} />
        </div>
      </div>
    </SectionCard>
  );
}
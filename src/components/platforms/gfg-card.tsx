import { Award, CalendarDays, Flame, Leaf, Medal, Sigma, Trophy } from "lucide-react";
import { SectionCard } from "@/components/section-card";
import { ProfileLink } from "@/components/profile-link";
import { Stat } from "@/components/stat";
import { DifficultyDonut } from "@/components/charts/difficulty-donut";
import type { GfgData } from "@/lib/providers/types";

const ACCENT = "#2f8d46";

export function GfgCard({ data }: { data: GfgData }) {
  const byDifficulty = data.byDifficulty ?? { school: 0, basic: 0, easy: 0, medium: 0, hard: 0 };
  const { school, basic, easy, medium, hard } = byDifficulty;

  return (
    <SectionCard
      icon={Leaf}
      title="GeeksforGeeks"
      subtitle={`@${data.username}`}
      accent={ACCENT}
      action={<ProfileLink url={data.url} />}
    >
      <div className="space-y-4">
        <DifficultyDonut
          segments={[
            { label: "Easy", value: school + basic + easy, color: "#34d399" },
            { label: "Medium", value: medium, color: "#fbbf24" },
            { label: "Hard", value: hard, color: "#fb7185" },
          ]}
          center={data.totalSolved.toLocaleString("en-US")}
          centerSub="solved"
        />
        <div className="grid grid-cols-3 gap-3">
          <Stat icon={Sigma} label="Solved" value={data.totalSolved} />
          <Stat icon={Medal} label="Rank" value={data.rank ?? "—"} />
          <Stat icon={Flame} label="Rating" value={data.currentRating ?? "—"} />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat icon={Trophy} label="Peak rating" value={data.maxRating ?? "—"} />
          <Stat icon={CalendarDays} label="Contests" value={data.totalContests} />
          <Stat icon={Flame} label="Active days" value={data.totalActiveDays} />
          <Stat icon={Award} label="Badges" value={data.badgesCount} />
        </div>
      </div>
    </SectionCard>
  );
}
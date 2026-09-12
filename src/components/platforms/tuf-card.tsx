import { CheckCircle2, FileText, Flame, Sparkles, Target, Timer } from "lucide-react";
import { SectionCard } from "@/components/section-card";
import { ProfileLink } from "@/components/profile-link";
import { Stat } from "@/components/stat";
import { DifficultyDonut } from "@/components/charts/difficulty-donut";
import type { TufData } from "@/lib/providers/types";

const ACCENT = "#a855f7";

export function TufCard({ data }: { data: TufData }) {
  return (
    <SectionCard
      icon={Sparkles}
      title="takeUforward"
      subtitle={`@${data.username}`}
      accent={ACCENT}
      action={<ProfileLink url={data.url} />}
    >
      <div className="space-y-4">
        <DifficultyDonut
          segments={[
            { label: "Easy", value: data.byDifficulty.easy, color: "#34d399" },
            { label: "Medium", value: data.byDifficulty.medium, color: "#fbbf24" },
            { label: "Hard", value: data.byDifficulty.hard, color: "#fb7185" },
          ]}
          center={data.totalSolved.toLocaleString("en-US")}
          centerSub="solved"
        />
<div className="grid grid-cols-3 gap-3">
          <Stat icon={Timer} label="Active days" value={data.totalActiveDays} />
          <Stat icon={Flame} label="Current streak" value={data.currentStreak} />
          <Stat icon={Flame} label="Longest streak" value={data.longestStreak} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Stat icon={Target} label="Questions" value={data.totalQuestions} />
          <Stat
            icon={CheckCircle2}
            label="Acceptance"
            value={data.acceptanceRate != null ? `${data.acceptanceRate}%` : "—"}
          />
          <Stat icon={FileText} label="Submissions" value={data.totalSubmissions} />
        </div>
      </div>
    </SectionCard>
  );
}
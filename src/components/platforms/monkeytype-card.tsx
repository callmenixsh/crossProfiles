import { AlertCircle, CheckCircle2, Flame, Gauge, Keyboard, Timer, Zap } from "lucide-react";
import { SectionCard } from "@/components/section-card";
import { ProfileLink } from "@/components/profile-link";
import { Stat } from "@/components/stat";
import { HBarList } from "@/components/charts/hbar";
import type { MonkeyTypeData } from "@/lib/providers/types";

const ACCENT = "#e2555f";

export function MonkeyTypeCard({ data }: { data: MonkeyTypeData }) {
  const hours = Math.round(data.timeTypingSeconds / 3600);

  return (
    <SectionCard
      icon={Keyboard}
      title="Monkeytype"
      subtitle={data.name ?? `@${new URL(data.url).pathname.split("/").pop()}`}
      accent={ACCENT}
      action={<ProfileLink url={data.url} />}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat icon={Zap} label="WPM" value={data.bestWpm?.toFixed(1) ?? "—"} />
          <Stat
            icon={CheckCircle2}
            label="Accuracy"
            value={data.bestAcc !== null ? `${data.bestAcc.toFixed(1)}%` : "—"}
          />
          <Stat icon={Timer} label="Tests" value={data.completedTests} />
          <Stat icon={Flame} label="Streak" value={data.streak} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Stat icon={Gauge} label="Time typing" value={hours > 0 ? `${hours} h` : "—"} />
          <Stat icon={AlertCircle} label="XP" value={data.xp} />
        </div>
        {data.pbByTime.length > 0 && (
          <HBarList
            items={data.pbByTime.map((pb) => ({
              label: `${pb.mode}s`,
              value: pb.wpm,
            }))}
            accent={ACCENT}
            valueSuffix=" wpm"
          />
        )}
      </div>
    </SectionCard>
  );
}

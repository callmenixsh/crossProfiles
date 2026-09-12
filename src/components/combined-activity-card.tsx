"use client";

import { useState } from "react";
import { CalendarRange } from "lucide-react";
import { SectionCard } from "@/components/section-card";
import {
  ContributionHeatmap,
  HEATMAP_LEVELS,
} from "@/components/charts/contribution-heatmap";
import { mergeHeatmaps } from "@/lib/heatmap";
import type { DayContribution, PlatformKey } from "@/lib/providers/types";

const ACCENT = "#818cf8";
const HIGHLIGHT_LEVELS = ["#3730a3", "#4f46e5", "#6366f1", "#818cf8"];

export interface HeatmapSource {
  key: PlatformKey;
  label: string;
  data: DayContribution[];
}

export function CombinedActivityCard({ sources }: { sources: HeatmapSource[] }) {
  const [selected, setSelected] = useState<PlatformKey | "all">("all");

  const merged = mergeHeatmaps(sources.map((s) => s.data));
  if (merged.length === 0) return null;

  const selectedSource = selected === "all" ? null : sources.find((s) => s.key === selected);
  const highlight = selectedSource
    ? {
        counts: new Map(
          selectedSource.data.filter((d) => d.count > 0).map((d) => [d.date, d.count] as const)
        ),
        levels: HIGHLIGHT_LEVELS,
      }
    : undefined;

  return (
    <SectionCard
      icon={CalendarRange}
      title="Combined activity"
      subtitle={sources.map((s) => s.label).join(" · ")}
      accent={ACCENT}
      className="md:col-span-2"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs text-zinc-500">Show:</span>
          <Chip active={selected === "all"} onClick={() => setSelected("all")} label="All" accent={ACCENT} />
          {sources.map((s) => (
            <Chip
              key={s.key}
              active={selected === s.key}
              onClick={() => setSelected(s.key)}
              label={s.label}
              accent={ACCENT}
            />
          ))}
        </div>
        <ContributionHeatmap
          data={merged}
          levels={HEATMAP_LEVELS}
          totalLabel="activities across platforms"
          highlight={highlight}
        />
      </div>
    </SectionCard>
  );
}

function Chip({
  label,
  active,
  onClick,
  accent,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  accent: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={
        active
          ? { borderColor: `${accent}99`, background: `color-mix(in srgb, ${accent} 15%, transparent)`, color: accent }
          : undefined
      }
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs transition-all ${
        active
          ? ""
          : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
      }`}
    >
      {label}
    </button>
  );
}
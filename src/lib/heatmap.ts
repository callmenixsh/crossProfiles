import type { DayContribution } from "@/lib/providers/types";

export function mergeHeatmaps(
  sources: DayContribution[][]
): DayContribution[] {
  const byDate = new Map<string, number>();
  for (const source of sources) {
    for (const day of source) {
      byDate.set(day.date, (byDate.get(day.date) ?? 0) + day.count);
    }
  }
  return [...byDate.entries()].map(([date, count]) => ({ date, count }));
}
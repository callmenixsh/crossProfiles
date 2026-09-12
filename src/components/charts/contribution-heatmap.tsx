import type { DayContribution } from "@/lib/providers/types";

interface Props {
  data: DayContribution[];
  levels?: string[];
  empty?: string;
  totalLabel?: string;
  highlight?: { counts: Map<string, number>; levels: string[] };
}

const DEFAULT_LEVELS = ["#0f766e", "#0d9488", "#14b8a6", "#5eead4"];
const DEFAULT_EMPTY = "var(--cp-empty-cell, rgba(255,255,255,0.06))";

export const HEATMAP_LEVELS = ["#14532d", "#16a34a", "#22c55e", "#4ade80"];
export const HEATMAP_HIGHLIGHT_LEVELS = ["#1e3a8a", "#2563eb", "#3b82f6", "#60a5fa"];

const WEEKDAYS = ["Mon", "Wed", "Fri"];

function startOfWeek(d: Date): Date {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  const day = date.getDay(); // 0 Sun .. 6 Sat
  date.setDate(date.getDate() - day);
  return date;
}

export function ContributionHeatmap({
  data,
  levels = DEFAULT_LEVELS,
  empty = DEFAULT_EMPTY,
  totalLabel = "contributions",
  highlight,
}: Props) {
  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-800 py-8 text-center text-xs text-zinc-500">
        No activity yet
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dataMax = parseDate(sorted[sorted.length - 1].date);
  const last = dataMax > today ? dataMax : today;
  const gridStart = startOfWeek(last);
  gridStart.setDate(gridStart.getDate() - 52 * 7);
  const lastIso = toIso(last);

  const windowed = sorted.filter((d) => d.date >= toIso(gridStart) && d.date <= lastIso);
  if (windowed.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-800 py-8 text-center text-xs text-zinc-500">
        No activity in the last year
      </div>
    );
  }

  const byDate = new Map(windowed.map((d) => [d.date, d.count]));
  const cols = 53;
  const cell = 10;
  const gap = 3;
  const topPad = 16;
  const total = windowed.reduce((a, d) => a + d.count, 0);

  const monthLabels: { index: number; label: string }[] = [];
  for (let c = 0; c < cols; c++) {
    const date = new Date(gridStart);
    date.setDate(date.getDate() + c * 7);
    const month = MONTHS[date.getMonth()];
    const prev = c > 0 ? new Date(gridStart).setDate(gridStart.getDate() + (c - 1) * 7) : null;
    if (c === 0 || (prev !== null && new Date(prev).getMonth() !== date.getMonth())) {
      monthLabels.push({ index: c, label: month });
    }
  }

  const width = cols * (cell + gap) - gap;
  const height = 7 * (cell + gap) - gap;
  const svgHeight = topPad + height;

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <p className="tabular text-sm font-medium text-zinc-200">
          {total.toLocaleString("en-US")}{" "}
          <span className="text-xs font-normal text-zinc-500">{totalLabel} · last year</span>
        </p>
        <div className="flex items-center gap-1 text-[10px] text-zinc-500">
          Less
          {[empty, ...levels].map((c, i) => (
            <span key={i} className="size-2.5 rounded-[3px]" style={{ background: c }} />
          ))}
          More
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <svg
          viewBox={`0 0 ${width} ${svgHeight}`}
          className="w-full h-auto min-w-[634px]"
          role="img"
          aria-label={totalLabel}
        >
          {monthLabels.map(({ index, label }) => (
            <text
              key={index}
              x={index * (cell + gap)}
              y={12}
              fontSize={9}
              style={{ fill: "var(--cp-faint, #71717a)" }}
            >
              {label}
            </text>
          ))}
          {Array.from({ length: cols }, (_, c) => {
            const weekStart = new Date(gridStart);
            weekStart.setDate(weekStart.getDate() + c * 7);
            return Array.from({ length: 7 }, (_, r) => {
              const date = new Date(weekStart);
              date.setDate(weekStart.getDate() + r);
              const iso = toIso(date);
              if (iso > lastIso) return null;
              const count = byDate.get(iso);
              if (count === undefined) {
                return <rect key={iso} x={c * (cell + gap)} y={topPad + r * (cell + gap)} width={cell} height={cell} rx={2} style={{ fill: empty }} />;
              }
              const highlightCount = highlight?.counts.get(iso);
              const palette = highlightCount !== undefined && highlight ? highlight.levels : levels;
              const countForLevel = highlightCount !== undefined ? highlightCount : count;
              const level = countForLevel === 0 ? 0 : Math.min(4, 1 + Math.floor((countForLevel - 1) / 3));
              return (
                <rect
                  key={iso}
                  x={c * (cell + gap)}
                  y={topPad + r * (cell + gap)}
                  width={cell}
                  height={cell}
                  rx={2}
                  style={{ fill: level === 0 ? empty : palette[level - 1] }}
                >
                  <title>{`${iso}: ${count}`}</title>
                </rect>
              );
            });
          })}
          {WEEKDAYS.map((label, i) => (
            <text
              key={label}
              x={-2}
              y={topPad + (i + 1) * 2 * (cell + gap)}
              fontSize={9}
              textAnchor="end"
              style={{ fill: "var(--cp-faint, #52525b)" }}
            >
              {label}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}

function parseDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toIso(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
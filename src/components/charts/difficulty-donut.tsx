interface Segment {
  label: string;
  value: number;
  color: string;
}

interface Props {
  segments: Segment[];
  center?: string;
  centerSub?: string;
}

const R = 60;
const STROKE = 13;
const C = 2 * Math.PI * R;
const GAP = 6;

export function DifficultyDonut({ segments, center, centerSub }: Props) {
  const total = segments.reduce((a, s) => a + s.value, 0);

  if (total === 0) {
    return (
      <div className="mx-auto grid aspect-square size-32 place-items-center rounded-full border border-dashed border-zinc-800 text-xs text-zinc-500">
        No data
      </div>
    );
  }

  const arcs = segments.filter((s) => s.value > 0).map((s, i, arr) => {
    const len = (s.value / total) * C;
    const start = arr.slice(0, i).reduce((a, x) => a + (x.value / total) * C, 0);
    return { ...s, len, start };
  });
  const single = arcs.length <= 1;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
      <div className="relative mx-auto size-40 shrink-0">
        <svg viewBox="0 0 160 160" className="cp-donut-svg size-full -rotate-90">
          <circle
            cx={80}
            cy={80}
            r={R}
            fill="none"
            style={{ stroke: "var(--cp-empty-cell, rgba(255,255,255,0.06))" }}
            strokeWidth={STROKE}
          />
          {arcs.map((s) => {
            const dash = single ? s.len : Math.max(0, s.len - GAP);
            return (
              <circle
                key={s.label}
                cx={80}
                cy={80}
                r={R}
                fill="none"
                stroke={s.color}
                strokeWidth={STROKE}
                strokeDasharray={`${dash} ${C - dash}`}
                strokeDashoffset={-s.start}
                strokeLinecap="butt"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="tabular text-xl font-semibold text-zinc-100">
              {center ?? total.toLocaleString("en-US")}
            </p>
            {centerSub && (
              <p className="mt-0.5 text-[10px] uppercase tracking-wider text-zinc-500">
                {centerSub}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="w-full space-y-2 sm:max-w-[150px]">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center justify-between gap-3 text-xs">
            <span className="flex items-center gap-2 text-zinc-400">
              <span className="size-2.5 rounded-sm" style={{ background: s.color }} />
              {s.label}
            </span>
            <span className="tabular font-medium text-zinc-200">
              {s.value.toLocaleString("en-US")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
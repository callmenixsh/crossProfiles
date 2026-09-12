export interface BarDatum {
  label: string;
  value: number;
}

interface Props {
  items: BarDatum[];
  accent: string;
  valueSuffix?: string;
  emptyText?: string;
}

export function HBarList({ items, accent, valueSuffix = "", emptyText = "No data" }: Props) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-800 py-6 text-center text-xs text-zinc-500">
        {emptyText}
      </div>
    );
  }

  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.label} className="space-y-1">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="truncate text-zinc-300">{item.label}</span>
            <span className="tabular shrink-0 text-xs text-zinc-500">
              {item.value.toLocaleString("en-US")}
              {valueSuffix}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full" style={{ background: "var(--cp-track, var(--cp-line))" }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.max(3, (item.value / max) * 100)}%`,
                background: `linear-gradient(90deg, color-mix(in srgb, ${accent} 55%, transparent), ${accent})`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
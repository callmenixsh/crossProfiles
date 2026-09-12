"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface RatingPoint {
  date: string;
  rating: number;
  contest: string;
}

interface Props {
  data: RatingPoint[];
  accent: string;
}

export function RatingLine({ data, accent }: Props) {
  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-800 py-14 text-center text-xs text-zinc-500">
        No rating history yet
      </div>
    );
  }

  const ratings = data.map((d) => d.rating);
  const min = Math.min(...ratings);
  const max = Math.max(...ratings);
  const pad = Math.max(50, Math.round((max - min) * 0.2));
  const domain: [number, number] = [Math.max(0, min - pad), max + pad];

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 6, right: 6, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`fill-${accent.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accent} stopOpacity={0.35} />
              <stop offset="100%" stopColor={accent} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--cp-line, rgba(255,255,255,0.05))" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "var(--cp-faint, #71717a)" }}
            tickLine={false}
            axisLine={false}
            minTickGap={48}
          />
          <YAxis
            domain={domain}
            tick={{ fontSize: 11, fill: "var(--cp-faint, #71717a)" }}
            tickLine={false}
            axisLine={false}
            width={44}
          />
          <Tooltip content={<RatingTooltip />} />
          <Area
            type="monotone"
            dataKey="rating"
            stroke={accent}
            strokeWidth={2}
            fill={`url(#fill-${accent.replace("#", "")})`}
            dot={false}
            activeDot={{ r: 3, fill: accent, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function RatingTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: RatingPoint }[];
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/95 px-3 py-2 text-xs shadow-xl">
      <p className="font-medium text-zinc-200">{p.rating.toLocaleString("en-US")}</p>
      <p className="text-zinc-500">{p.contest}</p>
    </div>
  );
}
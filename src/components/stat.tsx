import type { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  label: string;
  value: string | number;
}

export function Stat({ icon: Icon, label, value }: Props) {
  return (
    <div className="cp-stat rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-2.5">
      <div className="flex items-center gap-1 text-[10px] text-zinc-500">
        <Icon className="size-3 text-zinc-600" />
        <span className="truncate">{label}</span>
      </div>
      <p className="tabular mt-1 text-base font-semibold text-zinc-100">
        {typeof value === "number" ? value.toLocaleString("en-US") : value}
      </p>
    </div>
  );
}
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  accent: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function SectionCard({
  icon: Icon,
  title,
  subtitle,
  accent,
  action,
  children,
  className,
}: Props) {
  return (
    <Card className={cn("cp-card h-full py-3.5", className)}>
      <CardHeader className="flex flex-row items-start gap-3 px-4">
        <span
          className="cp-icon-badge grid size-8 shrink-0 place-items-center rounded-lg ring-1 ring-white/10"
          style={{ background: `color-mix(in srgb, ${accent} 18%, transparent)` }}
        >
          <Icon className="size-4" style={{ color: accent }} />
        </span>
        <div className="min-w-0">
          <CardTitle className="flex items-center gap-2 text-[15px]">{title}</CardTitle>
          {subtitle ? (
            <p className="mt-0.5 truncate text-xs text-zinc-500">{subtitle}</p>
          ) : null}
        </div>
        {action ? <CardAction>{action}</CardAction> : null}
      </CardHeader>
      <CardContent className="px-4">{children}</CardContent>
    </Card>
  );
}
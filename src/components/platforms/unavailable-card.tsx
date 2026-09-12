import Link from "next/link";
import { SectionCard } from "@/components/section-card";
import { PLATFORM_ICONS } from "@/lib/platform-icons";
import { PLATFORM_META, type PlatformKey } from "@/lib/providers/types";

interface Props {
  platform: PlatformKey;
  error: string;
  slug?: string;
}

export function UnavailableCard({ platform, error, slug }: Props) {
  const meta = PLATFORM_META[platform];
  const Icon = PLATFORM_ICONS[platform];

  return (
    <SectionCard
      icon={Icon}
      title={meta.label}
      subtitle="Unavailable right now"
      accent={meta.accent}
      action={
        slug ? (
          <Link
            href={`/${slug}/profiles`}
            className="rounded-lg border border-zinc-800 px-2.5 py-1.5 text-xs text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
          >
            Fix
          </Link>
        ) : undefined
      }
    >
      <p className="text-xs leading-relaxed text-zinc-500">{error}</p>
    </SectionCard>
  );
}
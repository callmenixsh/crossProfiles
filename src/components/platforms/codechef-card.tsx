import { ChefHat, Flame, Globe, Trophy, Users } from "lucide-react";
import { SectionCard } from "@/components/section-card";
import { ProfileLink } from "@/components/profile-link";
import { Stat } from "@/components/stat";
import type { CodechefData } from "@/lib/providers/types";

const ACCENT = "#e6822e";

export function CodechefCard({ data }: { data: CodechefData }) {
  return (
    <SectionCard
      icon={ChefHat}
      title="CodeChef"
      subtitle={data.name}
      accent={ACCENT}
      action={<ProfileLink url={data.url} />}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-500">Current rating</span>
          <div className="flex items-center gap-2">
            {data.stars > 0 && (
              <span className="flex">
                {Array.from({ length: Math.min(data.stars, 7) }).map((_, i) => (
                  <StarSolid key={i} />
                ))}
              </span>
            )}
            <span className="tabular text-xl font-semibold text-zinc-100">
              {data.rating ?? "Unrated"}
            </span>
          </div>
        </div>

<div className="grid grid-cols-2 gap-3">
          <Stat icon={Flame} label="Highest rating" value={data.maxRating ?? "—"} />
          <Stat icon={Globe} label="Global rank" value={data.globalRank ?? "—"} />
          <Stat icon={Users} label="Country rank" value={data.countryRank ?? "—"} />
          <Stat icon={Trophy} label="Div" value={data.rating ? tier(data.rating) : "—"} />
        </div>
      </div>
    </SectionCard>
  );
}

function StarSolid() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 text-amber-400" fill="currentColor" aria-hidden>
      <path d="M12 2l2.9 6.26 6.86.9-5.02 4.75 1.3 6.79L12 17.27 5.96 20.7l1.3-6.79L2.24 9.16l6.86-.9L12 2z" />
    </svg>
  );
}

function tier(rating: number): string {
  if (rating >= 2200) return "1";
  if (rating >= 2000) return "2";
  if (rating >= 1750) return "3";
  if (rating >= 1600) return "4";
  if (rating >= 1400) return "5";
  if (rating >= 1200) return "6";
  return "7";
}
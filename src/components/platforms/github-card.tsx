import { Calendar, Code2, Flame, FolderGit2, GitFork, Star, Users } from "lucide-react";
import { SectionCard } from "@/components/section-card";
import { ProfileLink } from "@/components/profile-link";
import { Stat } from "@/components/stat";
import { ContributionHeatmap, HEATMAP_LEVELS } from "@/components/charts/contribution-heatmap";
import { HBarList } from "@/components/charts/hbar";
import type { GitHubData } from "@/lib/providers/types";

const ACCENT = "#a1a1aa";

export function GitHubCard({ data }: { data: GitHubData }) {
  return (
    <SectionCard
      icon={GitFork}
      title="GitHub"
      subtitle={`@${data.login}`}
      accent={ACCENT}
      action={<ProfileLink url={data.url} />}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat icon={Users} label="Followers" value={data.followers} />
          <Stat icon={Users} label="Following" value={data.following} />
          <Stat icon={FolderGit2} label="Repositories" value={data.publicRepos} />
          <Stat icon={Star} label="Stars" value={data.totalStars} />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat icon={Code2} label="Gists" value={data.publicGists ?? 0} />
          <Stat icon={GitFork} label="Forks" value={data.totalForks ?? 0} />
          <Stat icon={Calendar} label="Member since" value={data.createdAt ? new Date(data.createdAt).getFullYear() : "—"} />
          <Stat icon={Flame} label="Contributions" value={data.totalContributions} />
        </div>
        {data.heatmap.length > 0 && (
          <ContributionHeatmap
            data={data.heatmap}
            levels={HEATMAP_LEVELS}
            totalLabel="contributions"
          />
        )}
        {data.languages.length > 0 && (
          <HBarList
            items={data.languages.map((l) => ({ label: l.name, value: l.count }))}
            accent={ACCENT}
          />
        )}
      </div>
    </SectionCard>
  );
}

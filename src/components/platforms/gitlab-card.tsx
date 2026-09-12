import { FolderGit2, Star } from "lucide-react";
import { SectionCard } from "@/components/section-card";
import { ProfileLink } from "@/components/profile-link";
import { Stat } from "@/components/stat";
import { HBarList } from "@/components/charts/hbar";
import type { GitLabData } from "@/lib/providers/types";

const ACCENT = "#fc6d26";

export function GitLabCard({ data }: { data: GitLabData }) {
  const hasLanguages = data.topLanguages.length > 0;
  return (
    <SectionCard
      icon={FolderGit2}
      title="GitLab"
      subtitle={`@${data.username}`}
      accent={ACCENT}
      action={<ProfileLink url={data.url} />}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Stat icon={FolderGit2} label="Public projects" value={data.publicProjects} />
          <Stat icon={Star} label="Stars" value={data.totalStars.toLocaleString("en-US")} />
        </div>
        {hasLanguages && (
          <HBarList
            items={data.topLanguages.map((l) => ({ label: l.name, value: l.count }))}
            accent={ACCENT}
            emptyText="No languages detected"
          />
        )}
      </div>
    </SectionCard>
  );
}

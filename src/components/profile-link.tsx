import { ExternalLink } from "lucide-react";

interface Props {
  url: string;
  label?: string;
}

export function ProfileLink({ url, label = "Profile" }: Props) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open ${label}`}
      className="cp-profile-link inline-flex items-center gap-1 rounded-lg border border-zinc-800 px-2.5 py-1.5 text-xs text-zinc-400 transition-all hover:-translate-y-px hover:border-zinc-700 hover:bg-zinc-800/60 hover:text-zinc-200 active:scale-[0.97]"
    >
      {label}
      <ExternalLink className="size-3" />
    </a>
  );
}
import { Sparkles } from "lucide-react";
import { ProfileForm } from "@/components/profile-form";
import { SiteFooter } from "@/components/site-footer";
import { platformSuggestionUrl } from "@/lib/config";
import { ThemeShell } from "@/components/theme-context";

export default function Home() {
  return (
    <ThemeShell theme="default">
      <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-8 px-5 pt-16 pb-16 text-center">
        <div className="space-y-5">
          <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
            <Sparkles className="size-3.5" />
            One link for your whole dev footprint
          </span>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-zinc-50 sm:text-5xl">
            Every profile.
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-amber-300 bg-clip-text text-transparent">
              One clean page.
            </span>
          </h1>
          <p className="mx-auto max-w-md text-[15px] leading-relaxed text-zinc-400">
            Your GitHub, LeetCode, Codeforces and more — live stats on one public page.
          </p>
        </div>

        <div className="w-full rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6 text-left shadow-[0_20px_80px_-20px_rgba(168,85,247,0.25)] backdrop-blur">
          <ProfileForm />
        </div>

        <p className="text-xs text-zinc-600">
          Missing a platform?{" "}
          <a
            href={platformSuggestionUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-400 hover:underline"
          >
            Suggest it on GitHub
          </a>
        </p>
      </div>
      <SiteFooter />
    </ThemeShell>
  );
}
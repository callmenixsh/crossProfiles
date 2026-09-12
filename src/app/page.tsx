import { ArrowRight, GitFork, Sparkles } from "lucide-react";
import { ProfileForm } from "@/components/profile-form";
import { PLATFORM_META } from "@/lib/providers/types";
import type { PlatformKey } from "@/lib/providers/types";
import { platformSuggestionUrl } from "@/lib/config";
import { ThemeShell } from "@/components/theme-context";

const HIGHLIGHTS: PlatformKey[] = [
  "github",
  "gitlab",
  "devto",
  "leetcode",
  "gfg",
  "tuf",
  "codewars",
  "codeforces",
  "codechef",
  "atcoder",
  "monkeytype",
];

export default function Home() {
  return (
    <ThemeShell theme="default">
    <div className="mx-auto flex w-full flex-col gap-12 px-5 pt-8 pb-24 lg:max-w-5xl">
      <section className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
            <Sparkles className="size-3.5" />
            Your entire dev footprint, in one link
          </div>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-zinc-50 sm:text-5xl">
            Every profile.
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-amber-300 bg-clip-text text-transparent">
              One clean page.
            </span>
          </h1>
          <p className="max-w-md text-[15px] leading-relaxed text-zinc-400">
            Pick a username, save your edit key, then connect your handles — GitHub contributions,
            LeetCode solving, Codeforces rating and more, all on one live dashboard.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {HIGHLIGHTS.map((key) => {
              const meta = PLATFORM_META[key];
              return (
                <span
                  key={key}
                  className="rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-xs text-zinc-300"
                >
                  <span
                    className="mr-1.5 inline-block size-1.5 rounded-full align-middle"
                    style={{ background: meta.accent }}
                  />
                  {meta.label}
                </span>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6 shadow-[0_20px_80px_-20px_rgba(168,85,247,0.25)] backdrop-blur">
          <h2 className="mb-4 text-sm font-medium text-zinc-200">Create your page</h2>
          <ProfileForm />
        </div>
      </section>

      <section className="flex items-center justify-center">
        <a
          href={platformSuggestionUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-3 rounded-full border border-zinc-800 bg-zinc-900/40 px-4 py-2 text-sm text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200"
        >
          <GitFork className="size-4" />
          <span>
            Missing a platform?{" "}
            <span className="text-zinc-300 group-hover:underline">Suggest it on GitHub</span>
          </span>
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </a>
      </section>
    </div>
    </ThemeShell>
  );
}
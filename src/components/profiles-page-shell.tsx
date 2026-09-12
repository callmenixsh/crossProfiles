"use client";

import { useState } from "react";
import { GitFork } from "lucide-react";
import { ThemeShell } from "@/components/theme-context";
import { ModeToggle } from "@/components/mode-toggle";
import { ProfilesPanel } from "@/components/profiles-panel";
import { SiteFooter } from "@/components/site-footer";
import { platformSuggestionUrl } from "@/lib/config";
import type { Handles } from "@/lib/providers";
import type { ProfileButton, Socials } from "@/lib/socials";
import type { ThemeKey } from "@/lib/themes";

interface Props {
  slug: string;
  token: string;
  handles: Handles;
  socials: Socials;
  theme: ThemeKey;
  buttons: ProfileButton[];
  disabled: string[];
}

export function ProfilesPageShell({ slug, token, handles, socials, theme, buttons, disabled }: Props) {
  const [liveTheme, setLiveTheme] = useState<ThemeKey>(theme);

  return (
    <ThemeShell theme={liveTheme}>
      <div className="relative">
        <div className="absolute right-5 top-5 z-20">
          <ModeToggle />
        </div>
        <div className="mx-auto w-full max-w-2xl px-5 pt-8 pb-16">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold text-zinc-50">Add your profiles</h1>
              <p className="mt-1 text-sm text-zinc-500">
                <a href={`/${slug}`} className="text-violet-400 hover:underline">
                  /{slug}
                </a>
                {" "}· your public page
              </p>
            </div>
            <a
              href={platformSuggestionUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/40 px-3 py-1.5 text-xs text-zinc-400 transition-all hover:border-zinc-700 hover:text-zinc-200 active:scale-[0.97]"
              title="Open a GitHub issue to request a new platform"
            >
              <GitFork className="size-3.5" />
              Missing a platform?
            </a>
          </div>

          <ProfilesPanel
            slug={slug}
            initialToken={token}
            initialHandles={handles}
            initialSocials={socials}
            initialTheme={theme}
            initialButtons={buttons}
            initialDisabled={disabled}
            onThemeChange={setLiveTheme}
          />
        </div>
        <SiteFooter />
      </div>
    </ThemeShell>
  );
}
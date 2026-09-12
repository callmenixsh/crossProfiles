"use client";

import { useState } from "react";
import { ThemeShell } from "@/components/theme-context";
import { ModeToggle } from "@/components/mode-toggle";
import { ProfilesPanel } from "@/components/profiles-panel";
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
}

export function ProfilesPageShell({ slug, token, handles, socials, theme, buttons }: Props) {
  const [liveTheme, setLiveTheme] = useState<ThemeKey>(theme);

  return (
    <ThemeShell theme={liveTheme}>
      <div className="relative">
        <div className="absolute right-5 top-5 z-20">
          <ModeToggle />
        </div>
        <div className="mx-auto w-full max-w-2xl px-5 pt-8 pb-16">
          <h1 className="mb-1 text-xl font-semibold text-zinc-50">Add your profiles</h1>
          <p className="mb-6 text-sm text-zinc-500">
            <a href={`/${slug}`} className="text-violet-400 hover:underline">
              /{slug}
            </a>
            {" "}· your public page
          </p>

          <ProfilesPanel
            slug={slug}
            initialToken={token}
            initialHandles={handles}
            initialSocials={socials}
            initialTheme={theme}
            initialButtons={buttons}
            onThemeChange={setLiveTheme}
          />
        </div>
      </div>
    </ThemeShell>
  );
}
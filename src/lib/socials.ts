export const SOCIAL_KEYS = ["x", "github", "linkedin", "youtube", "website"] as const;
export type SocialKey = (typeof SOCIAL_KEYS)[number];

export type Socials = Record<SocialKey, string>;

export const EMPTY_SOCIALS: Socials = {
  x: "",
  github: "",
  linkedin: "",
  youtube: "",
  website: "",
};

export const SOCIAL_META: Record<SocialKey, { label: string; domain: string }> = {
  x: { label: "X", domain: "x.com" },
  github: { label: "GitHub", domain: "github.com" },
  linkedin: { label: "LinkedIn", domain: "linkedin.com/in" },
  youtube: { label: "YouTube", domain: "youtube.com/@" },
  website: { label: "Website", domain: "https://…" },
};

export interface ProfileButton {
  label: string;
  url: string;
}

export const EMPTY_BUTTONS: ProfileButton[] = [];

export type SocialsRow = { socials: string | null };

export function parseSocials(row: SocialsRow): Socials {
  if (!row.socials) return { ...EMPTY_SOCIALS };
  try {
    const parsed = JSON.parse(row.socials) as Partial<Socials>;
    const out = { ...EMPTY_SOCIALS };
    for (const key of SOCIAL_KEYS) {
      const val = parsed[key];
      if (typeof val === "string") out[key] = val;
    }
    return out;
  } catch {
    return { ...EMPTY_SOCIALS };
  }
}

export type ButtonsRow = { buttons: string | null };

export function parseButtons(row: ButtonsRow): ProfileButton[] {
  if (!row.buttons) return [];
  try {
    const parsed = JSON.parse(row.buttons);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (b): b is ProfileButton =>
          typeof b === "object" &&
          b !== null &&
          typeof b.label === "string" &&
          typeof b.url === "string" &&
          b.label.trim().length > 0 &&
          b.url.trim().length > 0
      )
      .slice(0, 10);
  } catch {
    return [];
  }
}

export function socialUrl(key: SocialKey, value: string): string | null {
  const v = value.trim().replace(/^@/, "");
  if (!v) return null;
  switch (key) {
    case "x":
      return `https://x.com/${encodeURIComponent(v)}`;
    case "github":
      return `https://github.com/${encodeURIComponent(v)}`;
    case "linkedin":
      return `https://www.linkedin.com/in/${encodeURIComponent(v)}`;
    case "youtube":
      return `https://www.youtube.com/@${encodeURIComponent(v)}`;
    case "website":
      return /^https?:\/\//i.test(v) ? v : `https://${v}`;
  }
}

export const SOCIAL_REDIRECT_URLS: Record<SocialKey, (handle: string) => string | null> = {
  x: (v) => (v.trim() ? `https://x.com/${encodeURIComponent(v.trim().replace(/^@/, ""))}` : null),
  github: (v) => (v.trim() ? `https://github.com/${encodeURIComponent(v.trim().replace(/^@/, ""))}` : null),
  linkedin: (v) => (v.trim() ? `https://www.linkedin.com/in/${encodeURIComponent(v.trim().replace(/^@/, ""))}` : null),
  youtube: (v) => (v.trim() ? `https://www.youtube.com/@${encodeURIComponent(v.trim().replace(/^@/, ""))}` : null),
  website: (v) => {
    const t = v.trim();
    if (!t) return null;
    return /^https?:\/\//i.test(t) ? t : `https://${t}`;
  },
};

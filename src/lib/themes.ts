export const THEME_KEYS = ["default", "glass", "3d", "code"] as const;
export type ThemeKey = (typeof THEME_KEYS)[number];

export const DEFAULT_THEME: ThemeKey = "default";

export interface ThemeMeta {
  key: ThemeKey;
  label: string;
  blurb: string;
}

export const THEMES: ThemeMeta[] = [
  { key: "default", label: "Brutal", blurb: "Neobrutalism — hard black borders and solid offset shadows." },
  { key: "glass", label: "Glass", blurb: "Frosted glass panes over vivid color glows." },
  { key: "3d", label: "Neo", blurb: "Soft neumorphic panels pressed into the page." },
  { key: "code", label: "Swiss", blurb: "Minimal Swiss style — sharp lines, black on white." },
];

export function parseTheme(value: unknown): ThemeKey {
  return typeof value === "string" && (THEME_KEYS as readonly string[]).includes(value)
    ? (value as ThemeKey)
    : DEFAULT_THEME;
}
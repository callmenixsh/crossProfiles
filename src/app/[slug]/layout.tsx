import type { ReactNode } from "react";
import { findProfileBySlug } from "@/lib/db";
import { parseTheme } from "@/lib/themes";
import { ThemeShell } from "@/components/theme-context";

export default async function SlugLayout(props: {
  params: Promise<{ slug: string }>;
  children: ReactNode;
}) {
  const { slug } = await props.params;
  const profile = findProfileBySlug(slug);
  const theme = profile ? parseTheme(profile.theme) : "default";
  return <ThemeShell theme={theme}>{props.children}</ThemeShell>;
}
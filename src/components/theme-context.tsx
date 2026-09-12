import type { ReactNode } from "react";
import type { ThemeKey } from "@/lib/themes";

export function ThemeShell({ theme, children }: { theme: ThemeKey; children: ReactNode }) {
  return (
    <div data-theme={theme} className="cp-shell relative">
      <div aria-hidden className="cp-glow pointer-events-none fixed inset-0" />
      <div className="relative">{children}</div>
    </div>
  );
}
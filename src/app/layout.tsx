import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { InlineScript } from "@/components/inline-script";
import { AUTHOR_GITHUB_URL } from "@/lib/config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CrossProfiles — Showcase every profile in one place",
  description:
    "Aggregate your GitHub, LeetCode, Codeforces, GeeksforGeeks, CodeChef and takeUforward stats onto one clean, shareable page.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="relative min-h-full flex flex-col bg-[#08080b] text-zinc-100">
        <InlineScript
          html={`(function(){try{var m=localStorage.getItem("cp-mode");document.documentElement.dataset.mode=m==="dark"?"dark":"light";}catch(e){document.documentElement.dataset.mode="light";}})();`}
        />
        <div
          aria-hidden
          className="pointer-events-none fixed inset-x-0 top-0 h-80 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(168,85,247,0.12),transparent_100%)]"
        />
        <main className="relative z-10 flex-1">{children}</main>
        <footer className="relative z-10 mx-auto w-full max-w-5xl px-5 py-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 font-medium text-zinc-300 hover:text-zinc-100">
            <span className="grid size-6 place-items-center rounded-md bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xs text-white shadow-[0_0_16px_rgba(168,85,247,0.35)]">
              ✦
            </span>
            <span className="tracking-tight">
              cross<span className="text-violet-400">profiles</span>
            </span>
          </Link>
          <p className="mx-auto mt-3 max-w-md text-xs leading-relaxed text-zinc-600">
            Built for sharing your grind — stats are cached and fetched live from public APIs.
          </p>
          <a
            href={AUTHOR_GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 text-xs text-zinc-400 transition-all hover:-translate-y-px hover:text-zinc-200 hover:border-zinc-700 active:scale-[0.97]"
          >
            <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
              <path d="M8 0a8 8 0 0 0-2.53 15.59c.4.07.55-.17.55-.38v-1.5c-2.24.48-2.71-.95-2.71-.95-.37-.93-.9-1.18-.9-1.18-.73-.5.06-.49.06-.49.81.06 1.24.83 1.24.83.72 1.23 1.88.88 2.34.67.07-.52.28-.88.51-1.08-1.78-.2-3.65-.89-3.65-3.97 0-.88.31-1.59.83-2.15-.08-.2-.36-1.01.08-2.11 0 0 .68-.21 2.2.82a7.55 7.55 0 0 1 4 0c1.52-1.03 2.2-.82 2.2-.82.44 1.1.16 1.91.08 2.11.52.56.83 1.27.83 2.15 0 3.09-1.87 3.77-3.66 3.97.29.25.55.74.55 1.49v2.2c0 .21.15.46.55.38A8 8 0 0 0 8 0Z" />
            </svg>
            @callmenixsh
          </a>
        </footer>
      </body>
    </html>
  );
}
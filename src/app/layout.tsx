import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { InlineScript } from "@/components/inline-script";
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
        <InlineScript
          html={`(function() {
  var SITE_ID = 'crossprofiles';
  var SITE_URL = 'https://crossprofiles.vercel.app';
  var COOLDOWN_MS = 2000;

  var createVisitorId = function() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }
    return 'v_' + Date.now() + '_' + Math.random().toString(36).slice(2);
  };

  var getVisitorId = function() {
    try {
      var key = 'visteria_vid_' + SITE_ID;
      var existing = localStorage.getItem(key);
      if (existing) return existing;
      var created = createVisitorId();
      localStorage.setItem(key, created);
      return created;
    } catch (e) {
      return createVisitorId();
    }
  };

  var lastTracked = sessionStorage.getItem('visteria_last_' + SITE_ID);
  var now = Date.now();

  if (lastTracked && now - parseInt(lastTracked) < COOLDOWN_MS) return;

  if (document.hidden) return;

  sessionStorage.setItem('visteria_last_' + SITE_ID, now.toString());

  fetch('https://visteria.vercel.app/api/visits/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      siteId: SITE_ID,
      siteUrl: SITE_URL,
      visitorId: getVisitorId(),
      url: location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      visitedAt: new Date().toISOString()
    }),
    keepalive: true
  }).catch(function() {});
})();`}
        />
        <div
          aria-hidden
          className="pointer-events-none fixed inset-x-0 top-0 h-80 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(168,85,247,0.12),transparent_100%)]"
        />
        <main className="relative z-10 flex-1">{children}</main>
      </body>
    </html>
  );
}
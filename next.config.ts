import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "assets.leetcode.com" },
      { protocol: "https", hostname: "userpic.codeforces.org" },
      { protocol: "https", hostname: "userpic.codeforces.com" },
      { protocol: "https", hostname: "static.takeuforward.org" },
      { protocol: "https", hostname: "media.geeksforgeeks.org" },
    ],
  },
};

export default nextConfig;

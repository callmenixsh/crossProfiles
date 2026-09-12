import { fetchJson, fetchText, ProviderError, withCache } from "./fetch";
import type { CodechefData, DayContribution } from "./types";

const PAGE_BASE = "https://www.codechef.com/users";
const STATS_BASE = "https://codechef-stats.tashif.codes";

interface CodechefEnvelope<T> {
  status?: string;
  data?: T;
}

interface CodechefHeatmapData {
  dailyContributions?: { date: string; count?: number }[];
}

export async function getCodechefStats(handle: string): Promise<CodechefData> {
  const key = `cc:${handle.toLowerCase()}`;
  return withCache(key, 12 * 3600, async () => {
    const [htmlEnv, heatmapEnv] = await Promise.allSettled([
      fetchText(
        `${PAGE_BASE}/${encodeURIComponent(handle)}`,
        20000,
        { "Accept-Language": "en-US,en;q=0.9" }
      ),
      fetchJson<CodechefEnvelope<CodechefHeatmapData>>(
        `${STATS_BASE}/${encodeURIComponent(handle)}/heatmap`,
        20000
      ),
    ]);

    if (htmlEnv.status === "rejected") {
      const err = htmlEnv.reason;
      if (err instanceof ProviderError && err.status === 404) {
        throw new ProviderError("CodeChef user not found", 404);
      }
      throw err;
    }

    const data = parseCodechef(htmlEnv.value, handle);

    if (!data) {
      throw new ProviderError("Could not parse profile — CodeChef page structure may have changed");
    }

    const heatmapSource =
      heatmapEnv.status === "fulfilled" ? heatmapEnv.value?.data ?? {} : {};
    const heat: DayContribution[] = (heatmapSource.dailyContributions ?? [])
      .filter((d) => typeof d.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d.date))
      .map((d) => ({ date: d.date, count: d.count ?? 0 }));

    return {
      ...data,
      heatmap: heat,
    };
  });
}

function parseCodechef(html: string, handle: string): Omit<CodechefData, "heatmap"> | null {
  if (!userExists(html)) return null;

  let rating: number | null = null;
  const rawRating = html.match(/class="rating-number"[^>]*>\s*([\d,]+)/)?.[1];
  if (rawRating) rating = parseInt(rawRating.replace(/,/g, ""), 10);

  const maxRating = numNear(html, "Highest Rating");
  const ranks = parseRanks(html);

  const div = Number(html.match(/\(Div\s*(\d+)\)/)?.[1] ?? NaN);
  const name =
    html.match(/class="h2-style"[^>]*>\s*([^<]+?)\s*<\//)?.[1]?.trim() || handle;

  return {
    name,
    url: `https://www.codechef.com/users/${encodeURIComponent(handle)}`,
    rating,
    stars: starsFromRating(rating),
    globalRank: ranks.global,
    countryRank: ranks.country,
    maxRating,
    div: Number.isFinite(div) ? div : undefined,
  };
}

function userExists(html: string): boolean {
  return html.includes("user-details");
}

function starsFromRating(rating: number | null): number {
  if (rating === null || rating === undefined) return 0;
  if (rating >= 2200) return 7;
  if (rating >= 2000) return 6;
  if (rating >= 1800) return 5;
  if (rating >= 1600) return 4;
  if (rating >= 1400) return 3;
  if (rating >= 1200) return 2;
  return 1;
}

function parseRanks(html: string): { global: number | null; country: number | null } {
  const block =
    html.slice(html.indexOf("rating-ranks")).match(/<ul[^>]*>([\s\S]*?)<\/ul>/)?.[1] ?? "";
  const out: { global: number | null; country: number | null } = {
    global: null,
    country: null,
  };
  for (const li of block.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)) {
    const inner = li[1];
    const strong = inner.match(/<strong>\s*([^<]+?)\s*<\/strong>/)?.[1];
    const text = inner
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!strong || strong.trim() === "") continue;
    const clean = strong.trim();
    const num = parseInt(clean.replace(/[,\s]/g, ""), 10);
    if (Number.isNaN(num)) continue;
    if (/Global Rank/i.test(text)) out.global = num;
    else if (/Country Rank/i.test(text)) out.country = num;
  }
  return out;
}

function numNear(text: string, label: string): number | null {
  const re = new RegExp(label, "ig");
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    const start = Math.max(0, match.index - 60);
    const end = Math.min(text.length, match.index + 60);
    const nums = (text.slice(start, end).match(/\d[\d,]*/g) ?? []).map((n) =>
      parseInt(n.replace(/,/g, ""), 10)
    );
    const val = nums.find((n) => n > 0 && n < 10_000_000);
    if (val) return val;
  }
  return null;
}
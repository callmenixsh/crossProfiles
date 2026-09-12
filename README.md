# CrossProfiles

A single-page showcase that turns your coding handles into one shareable dashboard —
GitHub, LeetCode, Codeforces, GeeksforGeeks, CodeChef, takeUforward and Monkeytype stats
are fetched live and rendered with charts.

No accounts. Onboarding is a short flow: pick a username → save your one-time edit key (like a
password) → add your profiles on a page grouped by category (Development, Competitive
Programming, DSA & Interview Prep, Typing). Your showcase is live at `/{username}`.

## Requirements

- Node.js **22.5+** (uses the built-in `node:sqlite` module; no native DB deps)
- npm

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000 and create your page.

### Optional: GitHub contribution heatmap accuracy

By default the GitHub heatmap is scraped from the public profile page (no token needed).
For the exact same data via the GitHub GraphQL API, set a token:

```bash
# .env.local
GITHUB_TOKEN=ghp_xxxxxxxx
```

## Platforms & data sources

| Platform         | Source                                                    | Cache |
| ---------------- | --------------------------------------------------------- | ----- |
| GitHub           | REST `api.github.com` (+ GraphQL calendar if token set)    | 6h    |
| LeetCode         | official GraphQL `leetcode.com/graphql`                    | 6h    |
| Codeforces       | official `codeforces.com/api`                              | 3h    |
| GeeksforGeeks    | community API `gfg-stats.tashif.codes`                     | 12h   |
| CodeChef         | public profile page scrape                                 | 12h   |
| takeUforward     | community API `tuf-stats.tashif.codes`                     | 3h    |
| Monkeytype       | public profile API `api.monkeytype.com`                    | 6h    |

All fetches are cached in SQLite (`data/crossprofiles.db`). A failed platform renders an
"Unavailable" card instead of breaking the page.

## Storing data

Profiles and provider cache live in a local SQLite database (`node:sqlite`). If you deploy
elsewhere, mount/persist the `data/` directory (or swap `src/lib/db.ts` for a hosted store).

## API

- `POST /api/profiles` — `{ username? }` → `{ slug, editToken }` (`409` if the username is taken). No handles required yet.
- `GET /api/profiles/:slug` — public handles
- `PUT /api/profiles/:slug` — add/update handles (`{ token, github?, leetcode?, … }`)
- `DELETE /api/profiles/:slug` — delete (`{ token }`)

## Pages

- `/` — step 1: claim a username, get your edit key
- `/{slug}` — the live showcase, grouped by category
- `/{slug}/profiles` — step 3: add/update profiles (edit key required) — also the old `/edit` redirects here
- `/{slug}/profiles?token=…` — pre-fills the edit key from the link

## Scripts

- `npm run dev` / `npm run build` / `npm run start` / `npm run lint`
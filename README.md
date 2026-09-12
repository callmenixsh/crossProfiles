# CrossProfiles

A single-page showcase that turns your coding handles into one shareable dashboard —
GitHub, LeetCode, Codeforces, GeeksforGeeks, CodeChef, takeUforward, AtCoder, Codewars,
Monkeytype, GitLab and DEV.to stats are fetched live and rendered with charts and heatmaps.

No accounts. Onboarding is a short flow: pick a username → save your one-time edit key
(like a password) → add your profiles, socials and custom links. Your showcase is live at
`/{username}` in one of four themes, with per-platform "hide" toggles.

## Requirements

- Node.js **20.9+** (Next.js 16 requirement)
- npm

## Getting started

```bash
npm install
npm run dev
```

The app needs a Postgres connection string (e.g. a free [Neon](https://neon.tech) database).
Tables are created automatically on first use.

```bash
# .env.local
POSTGRES_URL=postgresql://user:password@your-host/neondb
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

| Platform         | Source                                                        | Cache |
| ---------------- | ------------------------------------------------------------- | ----- |
| GitHub           | REST `api.github.com` (+ GraphQL calendar if token set)        | 6h    |
| LeetCode         | official GraphQL `leetcode.com/graphql`                        | 6h    |
| Codeforces       | official `codeforces.com/api`                                  | 3h    |
| GeeksforGeeks    | community API `gfg-stats.tashif.codes`                         | 12h   |
| CodeChef         | community API `codechef-stats.tashif.codes` + profile scrape   | 12h   |
| takeUforward     | community API `tuf-stats.tashif.codes`                         | 3h    |
| AtCoder          | official `atcoder.jp/users/…/history/json`                     | 6h    |
| Codewars         | official `codewars.com/api/v1`                                 | 6h    |
| Monkeytype       | public API `api.monkeytype.com`                                | 6h    |
| GitLab           | official `gitlab.com/api/v4`                                   | 12h   |
| DEV.to           | official `dev.to/api`                                          | 12h   |

All fetches are cached in Postgres (a `cache` table in the same database). A failed
platform renders an "Unavailable" card instead of breaking the page. Visit
`/{slug}?refresh=1` (or the "Refresh stats" button on a display page) to bypass the cache
and fetch fresh stats on demand.

## Storing data

Profiles and provider cache live in Postgres — set `POSTGRES_URL` (or `DATABASE_URL`) in
your environment. The schema (`profiles`, `cache`) is created/upgraded automatically on
first access, so there's no migration step for a new database.

## API

- `POST /api/profiles` — `{ username? }` → `{ slug, editToken }` (`409` if the username is taken). No handles required yet.
- `GET /api/profiles/:slug` — public handles + socials, theme, buttons, disabled list
- `PUT /api/profiles/:slug` — add/update handles (`{ token, github?, leetcode?, …, socials?, theme?, buttons?, disabled? }`)
- `DELETE /api/profiles/:slug` — delete (`{ token }`)

## Pages

- `/` — step 1: claim a username, get your edit key
- `/{slug}` — the live showcase, grouped by category, with socials & custom links as pills
- `/{slug}/profiles` — add/update profiles, socials, custom buttons, theme and hide toggles (edit key required) — the old `/edit` redirects here
- `/{slug}/profiles?token=…` — pre-fills the edit key from the link

## Scripts

- `npm run dev` / `npm run build` / `npm run start` / `npm run lint`
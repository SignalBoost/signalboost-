# SignalBoost – Hybrid Trending Feed

SignalBoost is a GitHub Pages site (custom domain **www.signalboostapp.com**) that surfaces a curated trending feed of travel, tech, and finance content from Reddit, RSS, and YouTube.

---

## How the dynamic feed works

A **GitHub Actions workflow** (`generate-feed.yml`) runs every hour and on manual trigger. It executes `api/generate-feed.mjs`, which:

1. Pulls **top posts** (past 24 h) from a curated list of subreddits (travel / tech / finance).
2. Fetches items from **RSS feeds** (travel news).
3. (Optional) Queries the **YouTube Data API v3** for trending travel and tech videos.
4. Normalises all items into a consistent shape, de-duplicates by URL, and writes the result to `feed.json` at the repo root.

The front-end (`index.html`) reads `https://www.signalboostapp.com/feed.json` and renders cards from the `items` array.

### `feed.json` shape

```json
{
  "updated_at": "2026-04-08T10:05:00.000Z",
  "items": [
    {
      "title": "Why solo travel is booming",
      "url": "https://www.reddit.com/r/solotravel/comments/abc123/…",
      "cat": "travel",
      "source": "r/solotravel",
      "thumb": "https://…",
      "ts": "2026-04-08T08:00:00.000Z"
    }
  ]
}
```

---

## Setup

### 1. Add the `YOUTUBE_API_KEY` secret (optional but recommended)

YouTube results require a [YouTube Data API v3](https://console.cloud.google.com/apis/library/youtube.googleapis.com) key.

1. Open **Google Cloud Console → APIs & Services → Credentials**.
2. Create an **API key** and restrict it to the *YouTube Data API v3*.
3. In this GitHub repo go to **Settings → Secrets and variables → Actions → New repository secret**.
4. Name: `YOUTUBE_API_KEY`, value: your API key.

If the secret is absent the workflow skips YouTube gracefully and still produces a feed from Reddit + RSS.

### 2. Customise subreddits

Edit the `REDDIT_SUBREDDITS` array near the top of `api/generate-feed.mjs`:

```js
const REDDIT_SUBREDDITS = [
  // travel
  'travel',
  'solotravel',
  'digitalnomad',
  // tech
  'technology',
  'programming',
  // finance
  'personalfinance',
  'investing',
];
```

### 3. Customise RSS feeds

Edit the `RSS_FEEDS` array in `api/generate-feed.mjs`:

```js
const RSS_FEEDS = [
  {
    url: 'https://www.theguardian.com/travel/rss',
    cat: 'travel',
    source: 'The Guardian – Travel',
  },
  // Add more feeds here ↓
  {
    url: 'https://feeds.example.com/tech',
    cat: 'tech',
    source: 'Example Tech',
  },
];
```

### 4. Run locally

```bash
# Install dependencies
npm install

# (Optional) set your YouTube key
export YOUTUBE_API_KEY=YOUR_KEY_HERE

# Generate feed.json
npm run generate-feed
```

---

## GitHub Pages deployment

The site is served from the `main` branch root (`/`). The workflow pushes `feed.json` back to `main` with `[skip ci]` in the commit message so it does **not** trigger another workflow run or interfere with GitHub Pages deployment.

---

## Constraints & notes

- No TikTok / Instagram scraping (violates ToS and is fragile).
- Only `https://` URLs are included in `feed.json`.
- Output is capped at **60 items** (`MAX_ITEMS` in `generate-feed.mjs`).
- Node.js 22 is used in the workflow; the script uses only native `fetch` + `fast-xml-parser`.

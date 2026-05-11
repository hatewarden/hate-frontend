# $HATE — Full Setup Guide

You're connecting three pieces:
1. **The frontend** — the website (already done, sitting in this folder)
2. **The backend** — Claude-powered brain with daily news awareness (in `server/`)
3. **The wire** — one line in `index.html` that tells the frontend where the backend lives

When this is all set up, HATE becomes genuinely smart and adaptive:
- Every response goes through Claude with HATE's full personality + voice rules
- Every 24 hours the backend pulls today's crypto headlines (CoinDesk, Decrypt, Cointelegraph, Reddit r/CryptoCurrency) and summarizes them in HATE's voice
- HATE references current events naturally — if BONK pumps today, HATE will know and mock holders accordingly
- Memory is persistent per wallet (last 6 turns sent as context on every reply)
- Safety moderation runs on every input

**Time:** 20–40 minutes total. Maybe 10 minutes if you're fast and already have Node installed.

---

## Step 1 — Anthropic API key (5 min)

1. Go to **https://console.anthropic.com**
2. Sign up. Free.
3. Click "API keys" in the left sidebar
4. Click "Create key" → name it `hate-backend` → copy the key (starts with `sk-ant-api03-...`)
5. Click "Billing" → add a payment method → put **$5** in prepaid credits
6. Paste the key somewhere safe. You'll need it in step 3.

Cost note: $5 lasts a long time. Each HATE reply is roughly $0.005 with Sonnet 4.6, less with Haiku. The daily news summarization is one Haiku call per day, basically free.

---

## Step 2 — Install Node.js (5 min, if you don't have it)

1. Go to **https://nodejs.org**
2. Download the LTS version
3. Install with defaults
4. Open a NEW command prompt and type `node --version` — should print something like `v22.x.x`

If you already have Node 20+, skip this.

---

## Step 3 — Test the backend locally (5 min)

1. Open command prompt
2. Type these commands, one at a time:
   ```
   cd C:\Users\socia\Documents\Claude\Projects\Meme1\server
   npm install
   copy .env.example .env
   notepad .env
   ```
3. The `.env` file opens in Notepad. Replace the line `ANTHROPIC_API_KEY=sk-ant-api03-...` with your real key from Step 1. Save and close Notepad.
4. Back in the command prompt:
   ```
   npm start
   ```
5. You should see:
   ```
   [hate] api listening on port 3001
   [hate] model: claude-sonnet-4-6
   [events] fetching today's brief...
   [events] saved today's brief
   ```
6. Leave that window open — the server is running.

Open another command prompt and test it:
```
curl -X POST http://localhost:3001/api/hate -H "Content-Type: application/json" -d "{\"message\":\"gm hate\"}"
```
You should get back a real Claude response in HATE's voice.

---

## Step 4 — Wire the frontend to it (1 min)

Open `C:\Users\socia\Documents\Claude\Projects\Meme1\index.html` in Notepad (or any editor).

Find this line (around line 350):
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
```

**Immediately ABOVE it**, add this one line:
```html
<script>window.HATE_API = 'http://localhost:3001';</script>
```

Save. Hard refresh `http://localhost:8000` (Ctrl+Shift+R). Now when you chat with HATE, the local keyword brain is bypassed and every reply goes through Claude with the daily news context. You'll feel the difference immediately — HATE will respond intelligently to specifics.

---

## Step 5 — Deploy the backend to Railway (10 min, do this when you're ready to launch)

While developing, the backend runs on your machine. Before launch, you need it running 24/7 somewhere public.

1. Go to **https://railway.app** and sign up with GitHub
2. Push the `server/` folder to a new GitHub repo:
   - In Github desktop or web, create a repo called `hate-backend`
   - Drag the contents of `Meme1/server/` into it (everything inside, not the folder itself)
   - Commit + push
3. In Railway, click "New Project" → "Deploy from GitHub repo" → pick your `hate-backend` repo
4. Railway auto-detects Node, runs `npm install`, runs `npm start`
5. Click on the deployed service → "Variables" tab → add:
   - `ANTHROPIC_API_KEY` = your key from Step 1
   - `ALLOWED_ORIGIN` = `https://your-frontend-domain.com` (your hosted site URL)
6. Click "Settings" → "Networking" → "Generate Domain" → you get a URL like `hate-backend-production.up.railway.app`
7. Back in your `index.html`, change the wire line from `http://localhost:3001` to your Railway URL:
   ```html
   <script>window.HATE_API = 'https://hate-backend-production.up.railway.app';</script>
   ```

Now the backend runs forever, the frontend can be anywhere, and they connect via the public URL.

**Cost:** Railway free tier covers this until you're getting real traffic. Past that it's ~$5–10/month for low-volume, scales with usage.

---

## Step 6 — Deploy the frontend (5 min)

Drop the whole `Meme1` folder (minus the `server/` subfolder, optional) onto **https://vercel.com** or **https://netlify.com**. Both free, both static-hosting, both work in 60 seconds with no config. You get a `https://yoursite.vercel.app` URL. Buy a real domain later when launch is close.

---

## Optional — Better news sources

The default daily-news ingestion uses free RSS feeds (CoinDesk, Decrypt, Cointelegraph, The Block) and free Reddit JSON (r/CryptoCurrency, r/SatoshiStreetBets). No keys needed. Good enough to start.

If you want better news, set these env vars in Railway (all optional):
- `NEWSAPI_KEY` — sign up at newsapi.org, free tier gets 100 calls/day
- `CRYPTOPANIC_KEY` — sign up at cryptopanic.com, free tier exists
- `X_BEARER_TOKEN` — paid only, $200/month, gets you trending tweets

These get pulled into the daily brief if present.

---

## Troubleshooting

**`npm install` fails:**
Make sure you're in the `server/` folder, not the project root. Make sure Node 20+ is installed.

**`Error: ANTHROPIC_API_KEY missing`:**
Your `.env` file isn't being read. Make sure the file is named exactly `.env` (no extension), in the `server/` folder, with `ANTHROPIC_API_KEY=sk-ant-...` on its own line.

**Frontend gets 404 from backend:**
Check the URL in `window.HATE_API` matches the server. No trailing slash. Should be `http://localhost:3001` not `http://localhost:3001/`.

**CORS errors in console:**
The server's CORS is permissive in development. If you see CORS errors, check `ALLOWED_ORIGIN` in your `.env`. Set it to `*` for testing, then narrow to your real domain before launch.

**Daily news not appearing in responses:**
Check the server logs. You should see `[events] saved today's brief` once on startup and every 24 hours. The brief is injected into HATE's system prompt automatically when present. If you don't see it, check that your `ANTHROPIC_API_KEY` is valid — the summarizer also uses Claude.

---

## What you can do while waiting on me

Steps 1, 2, 3 are independent of my work — you can do them right now:
1. Get the Anthropic API key
2. Install Node if you don't have it
3. (Skip Step 3 for now — wait until I push the news-aware backend update)

When I tell you "backend ready," do Step 3 onward.

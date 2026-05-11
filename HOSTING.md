# $HATE — Where to Host & How to Launch

## TL;DR

The site is two pieces. They live in different places.

- **Frontend** (everything you see): static files. Hosted free on **Vercel**.
- **Backend** (Claude proxy + daily news): Node.js server. ~$5/mo on **Railway**.
- **Domain**: Cloudflare Registrar, ~$10/year for a .com (cheapest legal price).

**Total: about $70 per year. ~$5.80/month after the domain.**

If you want to test free first (with caveats), there's a `$0/mo path` below.

---

## How the pieces fit together

```
                  ┌─────────────────────────┐
                  │   YOUR DOMAIN (.com)    │
                  │   registered at         │
                  │   cloudflare registrar  │
                  └────────────┬────────────┘
                               │ DNS
                               ▼
       ┌────────────────────────────────────────┐
       │                VERCEL                  │
       │  serves: index.html, style.css,        │
       │  app.js, brain.js, presale.html,       │
       │  bribe.html, staking.html, etc.        │
       │  this is "the website"                 │
       └──────────────┬─────────────────────────┘
                      │ POST /api/hate
                      ▼
       ┌────────────────────────────────────────┐
       │                RAILWAY                 │
       │  runs: server.js + events.js           │
       │  proxies to Claude                     │
       │  refreshes news every 24h              │
       └──────────────┬─────────────────────────┘
                      │ Claude API calls
                      ▼
       ┌────────────────────────────────────────┐
       │           ANTHROPIC API                │
       │  Sonnet (chat) + Haiku (moderation)    │
       └────────────────────────────────────────┘
```

You're picking one host per layer. Vercel for the website. Railway for the server. Cloudflare for the domain.

---

## Why these specifically

There are other options. Here's why I'm recommending these:

| Layer | Pick | Why | Alternatives |
|---|---|---|---|
| Frontend | **Vercel** | Free forever, drag-drop deploy, auto SSL, custom domains free | Netlify (identical), Cloudflare Pages (faster CDN), GitHub Pages (more limited) |
| Backend | **Railway** | $5/mo always-on, GitHub auto-deploy, env vars in UI | Render ($7/mo or free w/ cold starts), Fly.io (more technical), DigitalOcean App Platform ($5/mo) |
| Domain | **Cloudflare Registrar** | Sells at wholesale cost, no markup, no upsells | Namecheap ($10–13/yr), Porkbun ($9/yr). Avoid GoDaddy. |

**Stay away from:** GoDaddy (upsell hell), Wix/Squarespace (can't host this stack), shared hosting like Bluehost (can't run Node).

---

## Cost reality check

**Recommended path (Vercel + Railway + Cloudflare):**
- Vercel: $0/mo
- Railway: $5/mo (after free trial credit) — only when backend gets used
- Domain: $10/year (.com)
- Anthropic API usage: ~$0.005 per chat. With 1,000 chats/day = ~$150/month at Sonnet. Switch to Haiku and it's $15/month.

**$0 testing path:**
- Vercel: $0
- Render free tier: $0 (but the backend sleeps after 15 min idle → first request takes ~30s. Bad UX for real users. Fine for personal testing.)
- vercel.app subdomain: $0 (no custom domain)
- Anthropic: pay per use, top up $5 to start

Realistic launch budget: **$80–100 total to get started** (domain + small API credit + first month of backend).

---

# STEP-BY-STEP

Read all of Part 1 before starting. Each section assumes the previous is done.

---

## Part 1 — Sign up for the accounts (5 minutes)

Open these in new tabs. Create accounts on each. Use the same email everywhere to keep your life simple.

1. **GitHub** — go to `github.com` → "Sign up" → free account. You'll use this as the storage for your code that Vercel and Railway both pull from.

2. **Vercel** — go to `vercel.com` → "Sign Up" → click "Continue with GitHub". This automatically connects your GitHub account.

3. **Railway** — go to `railway.app` → "Login" → "Login with GitHub". Same deal.

4. **Cloudflare** — go to `cloudflare.com` → "Sign Up" → free account. (You'll need this for the domain in Part 5.)

5. **Anthropic** — if you haven't yet: `console.anthropic.com` → sign up → "Billing" → add a payment method → put $10 in prepaid credits. Generate an API key, save it somewhere safe.

---

## Part 2 — Put your code on GitHub (10 minutes)

You need two GitHub repos: one for the frontend, one for the backend. They go to different hosts.

### Install GitHub Desktop (easiest path for non-devs)

1. Download from `desktop.github.com` → install with defaults → sign in with your GitHub account.

### Create the frontend repo

1. Open GitHub Desktop → File → "New repository"
2. Name: `hate-frontend`
3. Local path: pick somewhere on your computer like `C:\Users\socia\Documents\GitHub`
4. Click "Create repository"
5. GitHub Desktop creates an empty folder. **Copy everything from `C:\Users\socia\Documents\Claude\Projects\Meme1` into this new folder EXCEPT the `server/` subfolder.** That means: copy `index.html`, `style.css`, `app.js`, `brain.js`, all the `.html` pages, `favicon.svg`, `serve.bat`, the `.md` docs, etc. Do NOT copy the `server` folder.
6. In GitHub Desktop you'll now see all the files as "changes." Type a commit message at the bottom left (e.g., "initial frontend") → click "Commit to main"
7. Click "Publish repository" at the top → leave "Keep this code private" UNchecked (so Vercel can read it) OR check it and pay Vercel a buck a month later — your call → click "Publish"

### Create the backend repo

1. File → "New repository" → name: `hate-backend` → same parent local path
2. **Copy everything from `Meme1/server/` into this new folder.** That's `server.js`, `events.js`, `package.json`, `.env.example`, `README.md`.
3. **Do NOT copy your `.env` file** — it has your Anthropic key in it. (If you accidentally do, delete it from the new folder before committing.)
4. Commit ("initial backend") → Publish (keep public unless you want to pay for private)

You now have two repos at `github.com/yourusername/hate-frontend` and `github.com/yourusername/hate-backend`.

---

## Part 3 — Deploy the backend to Railway (10 minutes)

The backend goes up first so the frontend has somewhere to talk to.

1. Go to `railway.app/dashboard`
2. Click "New Project" → "Deploy from GitHub repo"
3. Pick `hate-backend`
4. Railway detects Node, starts deploying. Wait ~2 minutes.
5. While it's deploying, click the service → "Variables" tab → click "Raw Editor" → paste:
   ```
   ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here
   ALLOWED_ORIGIN=*
   HATE_MODEL=claude-sonnet-4-6
   ```
   Click "Update Variables". (We'll narrow `ALLOWED_ORIGIN` after you have a real domain.)
6. The service redeploys with the env vars. Wait ~1 minute.
7. Click "Settings" → scroll to "Networking" → "Generate Domain". Railway gives you a URL like `hate-backend-production-1234.up.railway.app`. Copy it.
8. Test it: in a browser, go to `https://hate-backend-production-1234.up.railway.app/api/health`. You should see a JSON response with `"status": "hate is awake"`.

**Done.** Your backend is live, public, always-on, pulling daily crypto news in the background, ready to serve Claude responses.

---

## Part 4 — Deploy the frontend to Vercel (5 minutes)

1. Go to `vercel.com/new`
2. Click "Import" next to `hate-frontend` in the repo list
3. Vercel detects it as a static site automatically. Don't change anything.
4. Click "Deploy"
5. ~30 seconds later, you get a live URL like `hate-frontend-abc123.vercel.app`. Click it to confirm the site loads.

**Done.** Your site is live at a vercel.app URL. Anyone in the world can visit it right now.

But the chat doesn't know about the backend yet. That's Part 7. First let's get a real domain.

---

## Part 5 — Buy a domain (5 minutes)

Skip this if you want to launch on the free `vercel.app` URL. You can come back later.

1. Go to `dash.cloudflare.com` → in the left sidebar click "Domain Registration" → "Register Domains"
2. Search the name you want. Some good $HATE adjacent options to check:
   - `hate.chat`
   - `chamberhate.com`
   - `hatecoin.io`
   - `hate-9000.com`
   - `thechamber.lol`
   - `feedhate.com`
   - `bribehate.com`
3. .com is the most trustworthy for crypto users. .io is fine. .xyz is cheap but reads as low-effort. Avoid .biz, .info, .top.
4. Pick one → check out. Should be **$10–12 for the first year**. Cloudflare doesn't upsell. Confirm.
5. Cloudflare adds the domain to your account automatically. You don't need to configure DNS manually — they handle the basics.

---

## Part 6 — Connect the domain to Vercel (10 min active + up to 1h DNS propagation)

1. Back in Vercel → your `hate-frontend` project → "Settings" → "Domains" → "Add"
2. Type your domain (e.g., `hate.chat`) → "Add"
3. Vercel will say "This domain is configured incorrectly." It'll show you DNS records you need to set.
4. Go to `dash.cloudflare.com` → click your domain → "DNS" → "Records"
5. Vercel typically gives you either:
   - An `A` record pointing to `76.76.21.21`
   - And/or a `CNAME` for `www` pointing to `cname.vercel-dns.com`
6. Add them as records in Cloudflare. **Important:** for each record, click the orange cloud icon to turn it grey (DNS-only). Cloudflare's proxy can interfere with Vercel's SSL setup.
7. Back in Vercel, wait ~2 minutes, refresh the Domains page. The yellow warning should turn into a green check.
8. Visit your domain. Site loads. SSL works automatically.

---

## Part 7 — Wire the frontend to the backend (2 minutes)

Right now your site uses the local keyword brain. To activate Claude:

1. In your local `hate-frontend` folder, open `index.html` in Notepad (or VS Code, etc.)
2. Find this line near the bottom:
   ```html
   <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
   ```
3. **Immediately ABOVE it**, add this line, using YOUR Railway URL:
   ```html
   <script>window.HATE_API = 'https://hate-backend-production-1234.up.railway.app';</script>
   ```
4. Save the file.
5. In GitHub Desktop, you'll see this change. Commit it ("wire to backend") → click "Push origin" at the top.
6. Vercel sees the push automatically, redeploys in ~30 seconds.
7. Visit your domain again. Now type something in the chamber — HATE responds via Claude with full intelligence and today's news context.

---

## Part 8 — Lock down the backend (2 minutes, do this once everything works)

While testing, your backend's `ALLOWED_ORIGIN` is `*`, which lets anyone call it. Tighten it now.

1. Back in Railway → service → Variables → change `ALLOWED_ORIGIN` from `*` to your actual domain:
   ```
   ALLOWED_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
   ```
2. Save. Railway redeploys.

Now only your frontend can hit your backend. Anyone else trying gets blocked by CORS.

---

## What you should see when everything works

- Visit `https://yourdomain.com` → the chamber loads
- Type "what's happening in crypto today" → HATE responds with a comment about *actual today's news* (because Claude saw your daily brief in its system prompt)
- Type "i'm holding bonk" → HATE references BONK specifically, possibly with today's BONK news if any
- Wait 24 hours, type the same thing → different response, drawn from tomorrow's news
- Visit `https://yourbackend.railway.app/api/today` → see the actual daily brief JSON
- Visit `https://yourbackend.railway.app/api/health` → see uptime + brief metadata

---

## $0 testing path (no domain, free backend)

If you want to validate the whole flow before spending anything:

1. Skip Part 5 and 6 entirely (no domain)
2. In Part 3, use **Render.com** instead of Railway:
   - render.com → "New" → "Web Service" → connect `hate-backend` repo
   - Environment: Node
   - Build command: `npm install`
   - Start command: `npm start`
   - Instance type: **Free**
   - Add env vars: `ANTHROPIC_API_KEY`, `ALLOWED_ORIGIN=*`
   - Deploy
3. In Part 7, use your `https://hate-backend.onrender.com` URL instead of Railway's.

**The catch:** Render's free tier sleeps the server after 15 minutes of no traffic. First request after sleep takes ~30 seconds (cold start). Real users will think it's broken. Fine for personal testing, not fine for launch.

When you're ready, move to Railway and the cold starts go away.

---

## Updating the site after launch

Every change to the code:
1. Edit the file locally
2. Open GitHub Desktop → see the change → commit → push
3. Vercel auto-deploys frontend changes in ~30s
4. Railway auto-deploys backend changes in ~1 min
5. Refresh the site

That's it. No FTP, no SSH, no server admin.

---

## Common problems

**"My domain shows a Vercel error page"**
- DNS hasn't propagated yet. Wait 30 min. Try `whatsmydns.net` to check if your DNS records are visible globally.
- Make sure Cloudflare proxy is OFF (grey cloud) for the A and CNAME records.

**"HATE just says 'no.' to everything (the keyword fallback)"**
- The frontend isn't reaching the backend. Open browser console → look for fetch errors.
- Check `window.HATE_API` URL is correct (no trailing slash, https, matches your Railway URL exactly).
- Check Railway is healthy: visit `https://yourbackend.railway.app/api/health` directly.

**"CORS errors in browser console"**
- `ALLOWED_ORIGIN` in Railway env vars doesn't match your frontend domain.
- During testing, set it to `*`. Lock it down only after everything works.

**"Backend uses too much Anthropic credit"**
- Switch `HATE_MODEL=claude-haiku-4-5-20251001` in Railway env vars. Much cheaper, slightly less witty. Save Sonnet for verified holders later.

**"Daily news brief is empty"**
- Visit `/api/today` on your backend. If you see `"brief": ""`, the news sources failed. Check Railway logs. Common causes: CDN blocking server-side requests, Reddit rate limit. Usually resolves on next refresh.

---

## Recap of what you'll have at the end

- Production website at `https://yourdomain.com` (free hosting forever)
- Real Claude-powered HATE backend, always-on
- Daily news ingestion running automatically
- HTTPS / SSL on everything
- Auto-deploy on every code change
- Anonymous-team-friendly hosting (nothing reveals your identity unless you put it in code)
- Total cost: ~$70/year + API usage

When you're ready to launch:
1. Buy a domain (Part 5)
2. Run through the full flow once on a test wallet
3. Tweet the link from your $HATE account
4. Watch the chat fill up

---

## What's NOT covered here

- **X account & Twitter automation** (separate task — let me know when you want this)
- **Solana contract deployment** (covered in `HATE_mood_oracle.md`)
- **Wallet connect integration** (currently mocked, real one is a separate task)
- **Analytics** (skip until you have traffic — Vercel includes basic analytics free)
- **CDN tuning / image optimization** (Vercel does this automatically)

---

If anything in here is unclear, ask me about that specific step and I'll go deeper.

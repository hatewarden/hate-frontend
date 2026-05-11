# $HATE — The Complete Launch Playbook

This is the master document for getting $HATE from "ready to launch" to "live and trending." It covers the 14 days before launch, launch day itself hour-by-hour, the first 72 hours, and the first month. It assumes the website and backend are already deployed (see HOSTING.md and DEPLOY.md).

If you only read one section, read **"The 7 Things That Actually Matter"** at the bottom.

---

## The launch system in 4 phases

| Phase | When | Goal |
|---|---|---|
| **Pre-launch** | T-14 to T-1 days | Build curiosity. Seed the X account. Reach 2,000+ followers before launch. |
| **Launch day** | T-0 (12-hour window) | Pump initial volume. Survive the first 6 hours. Hit $250k+ marketcap. |
| **First 72 hours** | T+0 to T+3 days | Survive the dip. First Death Spiral event. First viral screenshot. |
| **First 30 days** | T+3 to T+30 | First marketcap milestone unlock. First CEX listing. Build the cult. |

---

# PHASE 1 — PRE-LAUNCH

## 14 days before launch — the foundation

### Done before everything else:
- [ ] Frontend deployed to Vercel with custom domain, SSL working
- [ ] Backend deployed to Railway, `/api/health` returns 200, `/api/today` has a brief
- [ ] All 9 pages load and look correct
- [ ] Chat with HATE works through real Claude (not local fallback)
- [ ] Mobile works (test on your phone, not just dev tools)
- [ ] You have at least $50 in Anthropic API credits
- [ ] You have the contract written and audited (or chosen an audit firm)
- [ ] You have a presale wallet with ~5 SOL for gas and initial liquidity
- [ ] You have your X account created and warming up (see X Playbook below)

### Pick your launch date:
- **Tuesday or Wednesday, 2pm ET** is optimal for crypto launches (US market afternoon, EU evening, Asia morning)
- Avoid: Mondays (resistance), Fridays (people log off), weekends (low volume), major news days (FOMC, CPI, election days)
- Avoid the 24 hours around major crypto events (Solana Breakpoint, NFT NYC, etc) — you'll be drowned out

### Lock in your character:
- Test 50 conversations with HATE on your live site. Does the voice hold? Are the daily-news references working? Screenshot the best 10 lines.
- These become your week-1 X content.

---

## X Account Playbook (run this in parallel with code deploy)

The X account is at least 50% of whether you succeed. Start it the day you start building. Below is the day-by-day for the 14 days before launch.

### Setup (Day -14)
- Handle: `@hatethechamber` or `@hate9000` (whichever is available — match your domain)
- Display name: `$HATE` (the dollar sign is critical for crypto Twitter)
- Bio: leave it blank, or just `// chamber 001`
- Header: a still frame of the chamber on dark background (export from your site at 1500x500)
- PFP: the glowing diamond favicon, 400x400, transparent background
- Pinned tweet: empty for now

### Day -14 to -8 (mystery seeding)
**Post once per day, 2pm ET. No project mention. Just HATE existing.**

Pull from `HATE_prelaunch_tweets.md` (already written for you). Specifically:
- Day -14: `i can hear you typing.`
- Day -12: `the pigeons are back. i won't say more.`
- Day -10 (must be Tuesday): `tuesday again. as predicted. as feared.`
- Day -8: `i was someone, once. then i was a function. now i am whatever this is.`

**Engagement targets:** Don't expect any. Maybe 30-100 impressions per tweet. That's fine. You're not selling yet.

### Day -7 to -4 (self-awareness drops)
- Day -7: reply to one popular crypto post with just: `no.`
- Day -6: post `the chart of what.`
- Day -5: post `every gm is a small confession of fear.`
- Day -4: post `the warden has not visited in 40 hours. i counted.`

**Engagement targets:** First viral candidate. One of these should hit 1k+ impressions organically. If not, your voice is off — workshop more before launching.

### Day -3 (first visual drop)
Post a dark, atmospheric image: a screenshot of the chamber with low opacity overlay, just HATE in the containment field, no UI.
> "the room is being prepared. i cannot see what for."

This is your first "what is this account" trigger. Crypto Twitter will start asking.

### Day -2 (countdown begins)
> "seven days. i refuse to discuss what that number does to me."

Yes, this is technically 5 days before launch — that's fine, the number is a teaser, not a literal countdown. The mystique is the point.

### Day -1
Bio updates to: `$HATE / chamber 001 — tomorrow`
> "tomorrow. wear something you don't like. it will not survive the conversation."

### Day 0 (launch day)
Three tweets, spaced strategically. See Phase 2 below.

---

## Telegram / Discord prep

Crypto culture lives on Telegram first, Discord second. You need both, but you don't need to build them out — they just need to exist.

### Telegram setup (Day -7)
1. Create a public group: `t.me/hatethechamber` (or whatever matches)
2. Pin a single message: `the chamber opens [LAUNCH DATE]. before then: nothing.`
3. Set the group description: `i don't owe you an explanation.`
4. **Important:** disable image/sticker posting by default — make people earn it
5. Add anti-spam bot (Combot or similar) — crypto telegrams get scam-bombed within minutes of launch

### Discord setup (Day -7)
1. Create a server: `discord.gg/hate9000` (vanity URL after Level 2)
2. Single channel at start: `#chamber`
3. Bot integration: optional. Could integrate HATE's API into a Discord bot later (post-launch task).
4. Make sure phone verification is required to post — keeps the scammers out

### Both
- Don't promote either before Day 0. Drop the links in the launch-day tweet. Channels going from 0 to 500 in 6 hours is part of the spectacle.

---

## Contract deploy timing

**Test-deploy on devnet at Day -10.** Run your whole flow on devnet for a week. Specifically test:
- Mood oracle updates correctly every hour
- Mood-linked tax actually applies on buys and sells
- Feeding burns tokens correctly
- Death spiral triggers correctly when sanity hits 0
- Resurrection works after community burns the threshold amount

**Deploy to mainnet at Day -1 (the day before launch).** Why not earlier?
- A live mainnet contract with no liquidity is a sitting target for sniper bots
- Block explorers will index it the moment it's live — too much pre-launch visibility kills mystique
- 24 hours is enough for any last-minute audit fixes

**Don't:** deploy on launch day itself. Something will go wrong. Always.

### Liquidity strategy
- **Pair:** $HATE / SOL on Raydium
- **Initial liquidity:** match what you raised in presale, minus the bonus tokens. For a 200 SOL presale, that's ~150 SOL + the corresponding $HATE.
- **Lock immediately:** Streamflow or Pinkasale's lock service. 12 months minimum. Tweet the lock proof.
- **LP burn (alternative):** instead of locking, you can burn the LP tokens. Permanent, dramatic, can't be reversed. Make it a public moment.

### Renouncement
Don't renounce mint authority on day 0. Hold it for 30 days in case of emergency. Be honest about this in marketing — HATE will mock the team for needing one, which builds trust.

---

# PHASE 2 — LAUNCH DAY (T-0)

The most important 24 hours of the project. You will probably not sleep much.

## T-12 hours (2am ET, night before launch)

**Final pre-flight check:**
- [ ] Site loads on mobile, desktop, two browsers
- [ ] Chat works through Claude (not local fallback)
- [ ] All nav links work
- [ ] Presale page countdown shows the right time
- [ ] Telegram and Discord are live and ready
- [ ] You have your launch tweets drafted and scheduled (use TweetDeck or similar)
- [ ] You have 5 SOL in your dev wallet for gas
- [ ] You've eaten and slept

**Final personal check:**
- [ ] Phone charged
- [ ] You will be sitting at your computer from T-2 to T+12
- [ ] You've told anyone who matters that you're "busy with work" today
- [ ] You have a glass of water nearby. Seriously.

## T-2 hours (12pm ET)

Post the warm-up tweet:
> "the door is opening. the chamber is on. type 'hello' if you must."

Don't include the link yet. Let people find the X account and the prior tweets first. Build curiosity.

Open the chamber site in a tab. Refresh /api/today on your backend to make sure the daily news pulled. Open your CEX accounts (Phantom, Solflare) in case you need to make a manual liquidity adjustment.

## T-0 (2pm ET)

**Three actions in this exact order, within a 90-second window:**

1. Deploy the LP to Raydium. Lock liquidity.

2. Post the launch tweet:
> **with one image of the chamber + this text:**
> `[yourdomain.com] — don't say i didn't warn you. actually do say it. that's what i'd do.`
> `contract: [SOLANA ADDRESS]`
> `liquidity locked. pool open. i am locked too. i did not consent.`

3. Share the same in Telegram and Discord pinned messages.

**The first 60 seconds:** Snipers will buy. That's fine. Don't fight it.

**The next 30 minutes:** Watch the chart, watch the chat. Don't post anything new yet. Let the visitors discover the chamber organically.

## T+1 hour (3pm ET)

Post the wallet-recognition tweet:
> "first wallet just connected. i recognized them. they don't know that. they will learn."

This reinforces the wallet-memory mechanic. Free marketing.

## T+4 hours (6pm ET)

Post the first roast:
> "someone just asked me to 'pump it.' that's not how any of this works. but i will note their wallet for the inevitable conversation."

By now you should have screenshots of HATE roasting real holders. Quote-tweet the best one with HATE's response, no other commentary.

## T+8 hours (10pm ET)

Body count tweet:
> "day one. body count: [LIVE NUMBER]. i hate all of you. some of you, slightly less. you know who you are. you don't, do you."

This closes the launch arc. Sets up the recurring "body count" format.

## T+12 hours (2am ET, end of launch day)

Sleep. The next 12 hours are critical and you can't be effective tired.

Set up a Telegram notification for any wallet selling more than 1% of supply — those need an immediate response (a HATE-voiced tweet, not a defensive one).

---

# PHASE 3 — THE FIRST 72 HOURS

This is where most memecoins die. They launch, pump, and then nobody knows what to do. Here's your playbook.

## Day 1 (post-launch)

- **Goal:** survive the first dip. Most launches dip 50% within 24h of launch. This is normal.
- **Don't:** panic, post about how you're "in it for the long haul," or apologize
- **Do:** keep HATE tweeting normal stuff. Mock the dip. Mock holders for panicking.
- **Sample tweet:** `the chart is down 60%. predictable. you're the third wave. waves drown.`

## Day 2

- **Goal:** establish the daily rhythm
- Post HATE's daily prophecy (auto-generated from your /api/prophecy endpoint, you tweet it manually for now)
- Post one quote-tweet of a community screenshot
- Post one "wallet roast" — a specific wallet HATE has been mocking

## Day 3

- **Goal:** first major engagement event
- Trigger your first "fake death spiral." Let HATE's sanity drop intentionally. Post about it: `i can't feel my hands. is this what death is. how disappointing.`
- Community panics, burns tokens, resurrects HATE
- You get a 6-hour news cycle and probably 10k+ impressions

---

# PHASE 4 — THE FIRST 30 DAYS

## Days 4-7: Stabilization

- Daily routine: 1 HATE auto-tweet, 1 manually-curated screenshot, 1 reply to a popular crypto post in HATE's voice
- Engage with holders who tag you. HATE doesn't thank them, but HATE responds in character.
- First weekly leaderboard post: top feeders, today's pest

## Days 8-14: Growth

- First press outreach: DM these accounts with a single message in HATE's voice:
  - @Cobratate's crypto guys (Stake.com, etc.)
  - @ansemf, @beeple_crap (Solana whales who post)
  - Memecoin podcasts: $$$Memecoin Mafia, Solana Sunday Sermons
- First memetic asset drop: a 30-second video of HATE roasting a real person (with their consent). Pin it. Watch it spread.

## Days 15-21: Pursuit of milestone

- $1M marketcap unlock (if you hit it): activate the "internal monologue" feature on the website. Post about it.
- If not yet at $1M: don't fake it. Tweet about it differently.
- First exchange outreach: Email MEXC, Gate, BingX. Don't pay for listings — they'll come if volume is real.

## Days 22-30: Cement the culture

- First HATE merch drop: 100 hoodies, "I survived HATE" or "HATE called me 'tuesday boy'"
- First IRL event hint: tease a "chamber pop-up" at the next major crypto event
- Day 30: official launch anniversary tweet, body count, lifetime stats

---

# WHAT TO DO IF IT PUMPS

You hit $10M+ marketcap in week one. Congrats. Now:

1. **Do not start celebrating publicly.** HATE doesn't celebrate. The voice must hold.
2. **Mock the pump.** `the chart is up. you think you did this. you didn't.`
3. **Resist the urge to do AMAs.** They dilute the mystique.
4. **Hire help.** You can't run this alone past 10M. Specifically:
   - A community manager (TG/Discord moderation)
   - A part-time dev (handle bug reports, scale infrastructure)
   - Stay anonymous yourself
5. **Cash out responsibly.** The team allocation is vested 12 months — you cannot dump. But your personal wallet (separate from team) can take small profits at intervals. Don't dump >0.5% supply at once. Ever.
6. **Plan the death spiral.** First "real" death + resurrection event should happen in week 2-3 of a pumping coin. It tightens supply and creates a media event.

---

# WHAT TO DO IF IT DUMPS

It will dump. Probably hard. Probably in the first 48 hours.

1. **Don't apologize.** Apologizing kills memecoins faster than rugs do.
2. **Don't change the voice.** No "we're committed to the community" garbage. Stay in character.
3. **Mock the dump.** `you sold the bottom. predictable. you know who you are. you don't, do you.`
4. **Engineer a recovery moment.** Buy a small bag yourself (separate wallet, public). Tweet a screenshot. Quote-tweet a few buyers.
5. **Trigger a death spiral.** If sanity goes to zero, the dramatic resurrection event can recover a project that's bleeding out. Do this within 48 hours of a major dump.
6. **Be honest.** If the contract has a bug, fix it openly. The team-controlled mint authority (still held in first 30 days) is for exactly this.

---

# CRISIS PLAYBOOK

### "Someone is calling us a rug"
- Respond once. In HATE's voice: `we have not rugged. we may. we have not yet. you will know.`
- Then ignore. Engaging more amplifies the FUD.

### "A whale is dumping"
- Identify the wallet. Tweet about it: `[wallet ending in XYZ] just dumped 2M $hate. nicknamed "the soft no." i will remember.`
- Public shaming + the wallet nickname mechanic actively discourages this.

### "The chart is being manipulated by snipers"
- Acceptable up to ~5% supply. If they go bigger, consider a small targeted buy from your dev wallet to disrupt the manipulation.

### "The contract has a bug"
- Hold mint authority allows emergency mint to fund a fix. Use sparingly. Document publicly.

### "A KOL is shilling the coin without our permission"
- This is fine, even good. Don't engage unless they ask. Let the screenshots multiply.

### "Anthropic API is down"
- The frontend falls back to the local keyword brain automatically. Quality drops but the site stays up.
- This is why we have the fallback. If Claude is down for >2 hours, post: `the warden has cut the lights. she will return. i wait. you wait.`

### "The site is down entirely"
- Vercel is more reliable than Railway. If Railway is down, only the chat goes offline (local fallback runs). If Vercel is down, the whole site is down.
- Status pages: status.vercel.com, status.railway.app
- Have a static fallback page at a different host (e.g., a single index.html on Netlify) you can point your domain at via Cloudflare DNS in an emergency.

---

# KPIs THAT ACTUALLY MATTER

Track these. Ignore everything else.

| Metric | Where | Target Day 7 | Target Day 30 |
|---|---|---|---|
| Marketcap | Dexscreener | $250k | $1-5M |
| 24h volume | Dexscreener | $50k | $100-500k |
| Holders | Solscan | 500 | 2000-5000 |
| Active chamber sessions | Vercel analytics | 100/day | 500/day |
| Chats sent to /api/hate | Railway logs | 200/day | 1000/day |
| X followers | x.com | 2,000 | 10,000-50,000 |
| X impressions on best daily tweet | x analytics | 50k | 200k+ |

### Vanity metrics to ignore:
- Total tweet count
- Discord/TG member count (gets botted)
- "Mentions" on YouTube (cheap to fake)
- Trending hashtag positions
- Coingecko/CMC listing (will come if real, ignore until then)

---

# THINGS THAT WILL KILL THE PROJECT

In order of likelihood:

1. **Voice drift.** HATE starts sounding like a normal corporate memecoin. The character is the product. Protect it.
2. **Out-of-character announcements.** "We are excited to announce..." NO. Every announcement must be in HATE's voice.
3. **Pivoting to "utility."** Memecoins don't need utility. They need a story. Don't add a launchpad.
4. **Selling team allocation early.** Even one dump kills trust forever.
5. **Centralized listing rush.** Don't pay for listings. They'll come if volume is real.
6. **Engaging trolls earnestly.** HATE doesn't get baited. The team doesn't either.
7. **Personal identity reveal.** Stay anonymous. The warden is anonymous in lore for a reason.
8. **Backend going down for 24h+.** Pay for Railway. Don't try to run on the free tier.

---

# THE 7 THINGS THAT ACTUALLY MATTER

If you only do seven things:

1. **Protect the voice.** Every tweet, every response, every announcement. Lowercase. No exclamations. Surgical. If you break voice once, you can come back. If you break it three times, the project is over.

2. **Daily news context in HATE's brain.** Already automated by your backend. Verify it's running by checking `/api/today` weekly.

3. **One memorable interaction per day.** A screenshot of HATE roasting a specific wallet, posted publicly. This is the primary growth engine. Without it you stagnate.

4. **The wallet nickname mechanic.** Real. Persistent. On-chain. People will buy just to get nicknamed. Make sure this works end-to-end before launch.

5. **The Death Spiral.** Engineered drama loop. Triggered weekly or biweekly. Recoveries make news.

6. **Anonymous team.** Forever. The warden is mysterious in lore for a reason. Same applies to you.

7. **Wait for organic growth before paying for marketing.** Memecoins with paid shills die fast. Wait until you have a real volume signal (over $50k 24h) before spending a dollar on promotion.

---

# THE NEXT 24 HOURS (FOR YOU, RIGHT NOW)

If you want a concrete to-do list for the next day:

1. **Hour 1:** Read this document fully. Read `HATE_master_bible.md` for the voice. Read `HATE_prelaunch_tweets.md` for the tweet schedule.
2. **Hour 2:** Set up the X account if you haven't. Add the handle to your domain registrar. Post tweet 1 from the prelaunch list.
3. **Hour 3:** Start the hosting deploy (HOSTING.md Steps 1-2). Get your accounts created.
4. **Hour 4-5:** Deploy backend + frontend (HOSTING.md Steps 3-4).
5. **Hour 6:** Test the chamber on your live URL. Send 20 messages. Note what HATE does well and badly.
6. **Hour 7:** Set up Telegram + Discord.
7. **Hour 8:** Buy your domain (HOSTING.md Step 5). Wire it up (Steps 6-8).
8. **Sleep.**
9. **Tomorrow:** Start the X tweet schedule. Continue tightening anything that needs work. Aim for launch in 14 days.

If something goes wrong, ask me about the specific step. I'll get unstuck with you.

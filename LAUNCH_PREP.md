# $HATE Launch Prep — Master Checklist

This is your operator's manual. Site and backend are live. Everything below is what you still have to do to actually launch. Work it top-down. Items are ordered so earlier steps unblock later ones.

---

## What You Need To Buy / Set Up Yourself

Honest ranges. Pay in this order — cheapest first, biggest last.

- [ ] **Anthropic API credits** — $50 to start, $200-500/mo at modest traffic. Watch the burn for the first week and recalibrate.
- [ ] **Cloudflare Registrar domain** — `$10-15/yr` for `.com`. Use Cloudflare specifically (no markup, free DNS, free SSL).
- [ ] **Solana wallet funding** — `~$200` SOL for deploys, LP seed gas, mint authority transactions. Separate cold wallet for treasury.
- [ ] **Audit** — `$8K-25K` range. OtterSec quotes $15-25K for Anchor + transfer hook. Halborn $20K+. Cheaper option: Sec3 / Ottersec lite review at $5-8K. Budget $10K minimum.
- [ ] **KOL spend** — `$3K-15K`. Tier-3 Solana KOLs $200-800/post. Tier-2 $1-3K. Don't pay tier-1 ($5K+) until you have organic traction.
- [ ] **Paid ads** — `$0-2K`. X promoted posts only. No Google, no Meta — they'll kill crypto ads anyway.
- [ ] **Streamflow / liquidity lock fee** — `~$50-100`.
- [ ] **Raydium LP seed** — at least `$10-20K` worth of paired SOL + $HATE if you want a non-embarrassing chart. This comes from public sale proceeds, not your pocket — but you need ~$2K SOL ready before sale closes to bootstrap.

**Minimum viable launch cash: ~$15K. Comfortable launch: ~$30K.**

---

## T-21 to T-14 Days — Foundation

You can't outreach without accounts. You can't fund without wallets. Do this week one.

### Accounts (Day 1-2, ~3 hours)
- [ ] Register `@HATE9000` (or fallback) on **X**. Bio, banner, pinned post placeholder.
- [ ] Register `@HATE_9000` or similar on **Telegram**. Create public announce channel + public chat group. Mute new-user joins to slow trolls.
- [ ] Create **Discord** server. Channels: `#announcements`, `#general`, `#confessions`, `#draws`, `#dev-updates`, `#support`. Set up MEE6 or Carl-bot for raid protection and verify-on-join.
- [ ] **Mailing list** — Buttondown ($9/mo) or ConvertKit free tier. Add signup form to site.
- [ ] **Linktree / bento.me** for the bio link — site, X, TG, Discord, contract (placeholder).

### Domain (Day 2, 30 min)
- [ ] Buy `hate9000.com` (or your chosen name) on **Cloudflare Registrar**.
- [ ] Point DNS at Vercel. Add CNAME for `api.` -> Railway.
- [ ] Enable Cloudflare proxy + SSL (Full Strict).
- [ ] Update site env to use the new domain.

### Wallets (Day 3, 1 hour)
- [ ] Generate a fresh **deploy wallet** (Phantom or `solana-keygen`). Fund with ~3 SOL.
- [ ] Generate a separate **treasury wallet**. Cold storage. Hardware wallet ideal — Ledger Nano S Plus $80.
- [ ] Generate **LP wallet**. Will receive the LP token after Raydium pool creation, then transfer to Streamflow for lock.
- [ ] Document every wallet pubkey in a private notes file. Never lose this.

### KOL List Build (Day 4-7, ~6 hours spread)
- [ ] Open a spreadsheet. Columns: handle, follower count, niche, avg engagement, price (DM to find out), contact method, status.
- [ ] Target 40 Solana-native KOLs. Sources: scrape who retweets `@aeyakovenko`, `@rajgokal`, `@solana`, plus people who shilled the last 5 successful memecoin launches (WIF, POPCAT, etc.).
- [ ] Tier them: Tier-1 (>200K, $5K+), Tier-2 (50-200K, $1-3K), Tier-3 (10-50K, $200-800).
- [ ] Plan to hit ~15 tier-3 + 5 tier-2 + 1 tier-1 on launch day.

---

## T-14 to T-7 Days — Content & Outreach

Foundation is done. Now you start being visible.

### Content Pipeline (Day 8-10, ~5 hours)
- [ ] **Revise `HATE_prelaunch_tweets.md` for v2 tokenomics.** Original was pre-v2 — references to fee splits, supply, sale price all need updating. Bake in: 1B supply, $0.02 sale price, transfer hook mechanics, draw schedule.
- [ ] Schedule revised 30-tweet sequence in **Typefully** or **Hypefury** (free tiers fine). Start posting from Day 9 onward, 1-2/day, ramping to 3-4/day in launch week.
- [ ] Write 5 long-form threads: tokenomics explainer, "why a deadpan AI", how the draw works, what staking earns you, why the transfer hook matters.
- [ ] Draft launch-day tweet. Pin placeholder now, swap on T-0.

### Audit (Day 8 — START IMMEDIATELY, lead time is brutal)
- [ ] Email **OtterSec**, **Halborn**, **Sec3** simultaneously. Provide: repo link (private invite OK), scope (Anchor program + transfer hook), target start date.
- [ ] Expect 1-3 week wait just for the slot. If nobody can fit you before launch, do a **public testnet audit** (Code4rena Sherlock contest format) for $3-5K or self-publish the code with bounty.
- [ ] **Hard truth:** if no audit completes before launch, push the launch. An unaudited transfer hook is how rugs happen — even accidental ones.

### KOL Outreach (Day 10-14, ~4 hours)
- [ ] DM tier-3 KOLs first. Template: 1 line about HATE-9000, 1 link to live site (they can play with it), 1 ask for price + availability for T-0 post.
- [ ] Confirm bookings with USDC deposit (50% upfront industry standard).
- [ ] Send approved post copy + 2-3 image options 48h before launch.

### Mailing List Seed (Day 12-14, ~2 hours)
- [ ] Add waitlist form to site headline ("be first into the sale").
- [ ] Drive traffic to it via the X content schedule.
- [ ] Goal: 500-2000 emails by T-7. These convert at 5-15% on launch day — that's potentially $5-50K of sale volume from email alone.

---

## T-7 to T-1 Days — Final Polish

### Site (Day 15-16, ~4 hours)
- [ ] Final copy pass. Every page. No lorem ipsum, no broken links.
- [ ] Buy page wired and tested in test mode. Wallet connect works on Phantom, Backpack, Solflare.
- [ ] Mobile responsive check. 60% of traffic will be mobile.
- [ ] Add countdown timer to T-0.
- [ ] Add `/audit` page (even if "audit in progress" — transparency builds trust).
- [ ] OG image / Twitter card. Test with `https://cards-dev.twitter.com/validator`.

### Contract (Day 16-18, ~6 hours)
- [ ] Deploy SPL Token-2022 + transfer hook to **devnet**. Run through full lifecycle: mint, transfer (fee splits correctly), draw triggers, oracle posts mood.
- [ ] Have one friend test buying on devnet via your buy page.
- [ ] Fix every bug you find. Re-deploy. Re-test.
- [ ] Lock down mint authority — multisig via Squads (`squads.so`) is industry standard. 2-of-3 with you, treasury cold wallet, and a trusted second person if you have one. Solo founders can do 1-of-1 then renounce post-launch, but disclose it.

### Press Kit (Day 19, ~2 hours)
- [ ] One-pager PDF: what is $HATE, character, tokenomics, contract address (TBD placeholder), site, socials.
- [ ] Hi-res logo pack (PNG transparent, SVG, dark/light variants).
- [ ] 3-5 screenshot mockups of the site / chat in action.
- [ ] Host at `hate9000.com/press` or a Google Drive folder.

### Launch Tweet & Coordination (Day 20, ~2 hours)
- [ ] Final launch tweet locked. Contains: contract address (added at T-0), buy link, "first draw in 24h".
- [ ] Group DM with all paid KOLs. Confirm post time within a 30-min window.
- [ ] CoinGecko + CoinMarketCap listing forms pre-filled. Submit at T+0.
- [ ] DexScreener auto-indexes once LP exists, but submit the "update info" form with logo/socials at T+1h.

---

## T-0 — Launch Day (Hour-by-Hour)

Have water, food, and 6+ hours blocked. No errands.

### T-2h — Pre-flight
- [ ] Re-read this section. Wallet keys accessible. Multisig signers warmed up.
- [ ] Status page open: Vercel green, Railway green, RPC endpoint responding.
- [ ] One last devnet rehearsal of the buy flow.

### T-1h — Deploy
- [ ] Deploy SPL token to **mainnet**. Capture mint address.
- [ ] Verify transfer hook is wired and the fee splits are correctly addressed.
- [ ] Mint full 1B supply to a temporary multisig-controlled wallet.

### T-30min — Distribute
- [ ] Move 100M (10%) to treasury wallet.
- [ ] Move 100M (10%) to team vesting contract (Streamflow or Jupiter Lock — 12mo linear, 3mo cliff).
- [ ] Move 30M (3%) to KOL/marketing wallet.
- [ ] Move 20M (2%) to feed reserve (the draw funding pot).
- [ ] Hold 750M (75%) for public sale.

### T-15min — Liquidity
- [ ] Pair a slice of public sale tokens with your SOL on **Raydium**. Standard memecoin LP is ~$10-20K initial depth, but you can start with less and grow as sale proceeds come in.
- [ ] Receive LP token. **Immediately** lock it via **Streamflow** for 12+ months minimum (24 is better for trust). Screenshot the lock tx.

### T-0 — Go Live
- [ ] Buy page goes live. Contract address swapped into site env.
- [ ] Post the launch tweet from `@HATE9000`. Include CA, buy link, lock tx, mint authority status.
- [ ] Send announcement to Telegram channel + Discord `#announcements` + mailing list blast.
- [ ] Ping group DM to KOLs — go.

### T+1h — Monitor
- [ ] Check DexScreener appears. Submit listing info update with logo/socials.
- [ ] Check buy page conversion. If broken, fix immediately — you have 15 minutes before sentiment turns.
- [ ] Reply to every quote tweet and reply on the launch post for the first hour. Visibility matters.

### T+4h — Amplify
- [ ] Second wave of KOL posts (the cheaper tier-3 ones with later post times).
- [ ] Post a follow-up tweet: "X holders, $Y volume, draw starts at T+24h".

### T+12h — Settle
- [ ] Daily HATE tweet from the character voice (deadpan, on-brand).
- [ ] Mod sweep on TG/Discord. Ban obvious scammers (fake admin accounts will appear within hours — guaranteed).
- [ ] Sleep. Set alarms. The bots won't.

---

## T+1 to T+7 — Week One

You launched. Now you operate.

- [ ] **T+1 (Draw 1):** First daily draw executes. Stream it live on X if you can, or at minimum tweet the result with on-chain proof. This is the moment the utility narrative either lands or doesn't.
- [ ] **T+2 (Staking):** First distribution to stakers. Publish the math. Transparency = trust = price floor.
- [ ] **T+3 (Wall feature):** First paid "wall featuring" — a confession that someone paid $HATE to pin. Showcase it. This is the first real demand signal for the token's utility.
- [ ] **Daily:** 2-3 HATE-voice tweets, 1 ecosystem tweet (volume, draw winner, holder count milestone).
- [ ] **Daily:** Discord/TG moderation. Two scams per day minimum the first week.
- [ ] **Day 5:** Submit to **CoinGecko** and **CMC** listing forms if you haven't been auto-listed.
- [ ] **Day 7:** Recap thread. What worked, what's next. Tease the next 30-day milestone.

---

## Day 30 Checkpoint

### Success Looks Like
- 3,000+ holders, no single wallet >2% (excluding treasury/team/LP)
- $500K+ daily volume sustained
- 30 daily draws completed without a single failed tx
- An organic community posting their own HATE memes you didn't write

### If It Pumps
- [ ] Don't sell team tokens. Vesting locked you in — good. Don't try to "buy back" via treasury either. Let it run.
- [ ] Use the moment to ship a v2 feature: a roast leaderboard, a HATE voice mode, anything that converts price attention into product attention.
- [ ] Get the audit done if you launched without one. Pumps attract scrutiny.

### If It Dumps
- [ ] Do not buy back with treasury. That signals desperation and burns runway you'll need for ops.
- [ ] Ship anyway. Daily draws keep running. The character keeps posting. Memecoins that die do so when the team goes silent — not when the price drops.
- [ ] Quietly extend KOL spend if you have budget. Cheaper to recover narrative on a down chart than to chase it.

---

## Risks That Kill Launches

- **KYC trolls / fake "team doxx" demands.** Pre-write your stance: anonymous founder, code speaks, audit speaks, lock speaks. Don't engage with the demand cycle — it never ends.
- **Audit failure.** A discovered bug in the transfer hook is fatal post-launch. Pay for the audit. Push the date if you have to.
- **Sniper bots.** Use Raydium's anti-sniper LP settings or pair via Jupiter studio. Expect 5-15% of supply gone in block 1 anyway — price it in.
- **RPC outages.** Have a backup RPC provider configured (Helius + QuickNode redundancy). A 10-min outage at T-0 is launch-killing.
- **Server overload.** Railway autoscale on, Vercel can handle it, but the Anthropic API rate limit is real — pre-buy enough credits and tier-up your account before launch week.
- **Sole-signer mint authority not renounced.** Either multisig it or renounce it within 24h of launch. Single-EOA mint authority = "team can rug" = price ceiling.
- **Your own burnout.** Solo launches die in week 3 when the founder hasn't slept. Build the daily ops into routines now, not after.

---

## If You Only Do Five Things

1. **Get the audit booked today.** Lead time will dictate your launch date, not the other way around.
2. **Lock the LP for 12+ months via Streamflow at T-0.** Non-negotiable trust signal.
3. **Multisig or renounce mint authority** before the first tweet goes out.
4. **Build the KOL list of 40 + book 20 of them.** This is what makes launch day visible.
5. **Revise `HATE_prelaunch_tweets.md` for v2 and schedule it in Typefully.** Content that runs without you is the only kind that runs.

Everything else is recoverable. These five are not.

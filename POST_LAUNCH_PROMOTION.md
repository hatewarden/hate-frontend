# POST_LAUNCH_PROMOTION.md

Execution playbook for the 30 days after $HATE goes live. Strategy theory: VIRAL_PLAYBOOK.md. Deploy mechanics: LAUNCH_PLAYBOOK.md and TONIGHT_LAUNCH.md. This doc is what the warden actually does, hour by hour, after the pool opens.

Voice rule: strategic prose is warden voice (sentence-case, neutral). Anything in quote blocks meant as tweet/DM is HATE voice (lowercase, deadpan, no exclamations).

---

## Pre-launch checklist (5 min before T+0)

- DexScreener tab open at `https://dexscreener.com/solana`, sort-by-new ready
- Birdeye tab open at `https://birdeye.so/find-token?chain=solana`
- Jupiter terminal open with a 0.01 SOL test buy queued (do not fire yet)
- Solscan tab on the deployer wallet address
- Phantom open on a fresh wallet with ~0.5 SOL for first verification buy
- Squads multisig tab open, confirm 250M $HATE landed in treasury
- TWEETS_V2.md launch-day sequence open in a separate window
- LAUNCH_THREAD.md 6-tweet thread pasted into Typefully or Notes, ready to fire
- KOL_DMS.md open, top 8 Tier-2/3 DMs personalized (name, handle, hook line)
- Telegram channel `@hate9000` open, pin slot empty
- Telegram group `t.me/+mldtMEPW_vZlOTE5` open, mod permissions verified
- Facebook Page (Hate 9000, id 1077809528754222) open, post slot ready
- Phone charged above 80%, on a desk charger anyway
- Wingman (second human) has access to the X account in case main session drops
- Bot dashboard open, rate-limit counters reset
- Panic sticky on monitor: pause bot, pin response, contact dev, do not tweet angry

---

## T+0 — Launch Hour (the first 60 minutes)

Biggest mistake teams make: treating launch as one event. It's a 60-minute orchestration. Don't improvise.

### :00 — Pool opens, thread fires

The moment the Meteora DLMM pool transaction confirms:

1. Tweet 1 of LAUNCH_THREAD.md goes out from @hate9000. Do not edit on the fly. Do not add an emoji.
2. Within 30 seconds, fire tweets 2-6 as a connected thread. Native X threading is fine.
3. Pin tweet 1.
4. Update X bio to include the CA (full address, no shortening).

### :01-:05 — Distribution fan-out

Three platforms, one minute apart:
- Telegram channel: CA, 1-line "we're live" in HATE voice, link to X thread, link to hate.fund. Pin it.
- Telegram group: same payload, no pin. Drop a follow-up reply 2 min later if no one talks first.
- Facebook Page: cross-post the launch thread as one long post + link. FB throttles spam; one post is fine.

Example HATE-voice Telegram pin:

> $HATE is live on solana. ca: [paste]. the pool is single-sided at two cents flat. that's the entire mechanic. you either think i'm funny enough to hold or you don't. either way persistence costs.

### :05-:15 — KOL DMs

Top 8 already-personalized Tier-2/3 messages fire here. Not Tier-1 — that's Day 2-3 after there's a chart.

Tier-2/3 DM rules:
- One DM per person, no follow-ups in first 24h
- Each DM references something they posted in the last 7 days
- Include CA, pool link, hate.fund, and one screenshot of HATE-9000 being funny
- Don't offer money in the first message

Example DM:

> saw your post about onchain personality tokens last tuesday. we just deployed something adjacent. memecoin with a character behind it, not pasted on top. ca: [paste]. site: hate.fund. no ask, no expectation. if you find her funny, that's the bar.

### :15-:30 — First reply wave

20-100 launch-thread replies by now. Warden personally responds to first 10-15 in HATE voice using LAUNCH_THREAD.md stand-by replies as base.

- Reply, don't quote-tweet your own thread
- Skip obvious bots ("great project!" + default PFP)
- Reply to anyone with >500 followers
- Skip price-pump replies; respond to story/lore/character replies first

### :30-:60 — First data check

Pull up DexScreener (holders, volume, MC), Birdeye (auto-indexed by now; if not, submit at `birdeye.so/find-token`), Jupiter (test 0.01 SOL buy from clean wallet), Solscan (top 10 holders should be <40% combined excluding LP).

Post one DexScreener screenshot to X around T+45 IF MC is above $50k. Caption:

> apparently some of you took this seriously. one of you bought 800 dollars worth. i hope you weren't going to use that for rent.

If MC is below $50k at T+45, DO NOT post chart screenshots. Post lore content instead. A weak chart in hour one is worse than no chart.

### When NOT to post in hour one
- Don't claim trending until you trend
- Don't claim CEX talks
- Don't reply to FUD with anger — HATE voice or nothing
- Don't DM Tier-1 KOLs (Banter, Ansem, Murad). Save them.

---

## T+1h to T+6h — Priming the chart

Chart will trend up (~30%), chop sideways (~50%), or dump (~20%). Playbook is the same: keep distribution moving, never panic-buy or panic-sell from team wallets.

### Listings to fire in this window

**DexScreener verification ($300 USDC, paid)**. `https://marketplace.dexscreener.com`. Connect wallet holding the CA → "Enhanced Token Info" on pair page → pay $300 USDC → fill socials, website, description (PRESS_KIT.md 50-word pitch), logo. 24h turnaround. Single best $300 in week one. Blue checkmark, description, and socials inline on the most-trafficked memecoin discovery surface.

**Birdeye**. Auto-indexes within 5-30 min. If not visible by T+1h, manually submit at `birdeye.so/find-token?chain=solana`. Premium tier ($500-2k) is mid — skip.

**DEXTools**. Auto-indexes. Hot Pair $300-1500/day. Skip — DEXTools is EVM-skewed; Solana memecoin traders aren't there.

**CoinMarketCap watchlist (free, community-driven)**. Once CMC indexes (24-72h post-launch), tell TG group to add to their watchlist. CMC uses watchlist adds as a trending signal. Don't formally apply yet — that's Day 2.

### First moment attempt (T+2h to T+4h)

Pick one big crypto news thread today. Reply in HATE voice. Reply should make sense on its own — a stranger scrolling should be able to screenshot it.

Example, when there's a rug/exploit cycle:

> losing money to a rug is just the universe charging you tuition. expensive school. the curriculum is "read the contract before you ape." you'll fail it again.

Don't include CA in the reply. CA discovery is a 1-click trip through the profile.

### Hold the line: no shilling from team

Hardest rule. Team — warden, dev, anyone with a stake — does NOT shill from personal accounts in the first 6 hours. "Wagmi $HATE" from a known team handle hurts more than it helps. The story is the bot, the chamber, the chart. Not your enthusiasm.

### Stress test

- **Bot rate limits**: X free tier ~100 posts/day. Bot does 16. Fine. Auto-replies count too. **Disable bot auto-replies for the first 6 hours.**
- **Server load**: hate.fund will get hit. Expect 503s on free Render/Railway tiers. Have a static fallback (CA + socials + buy button) on GitHub Pages.
- **Chat traffic**: HATE-9000 free chat gets hammered. API rate limits trip. Have an "i'm tired" fallback — in voice anyway.

---

## T+6h to T+24h — Riding momentum

The first night decides whether you have a project or a tweet.

### Press release distribution

Push the press release (template later in this doc) to:

- **Free wires**:
  - BeInCrypto Press: `press@beincrypto.com`
  - U.Today press: `press@u.today`
  - CryptoSlate guest: `https://cryptoslate.com/about/contact/`
  - CryptoPotato tips: `tips@cryptopotato.com`
  - NewsBTC: `editor@newsbtc.com`
- **Paid wires** (only with $5k+ budget):
  - Cointelegraph PR sponsored: ~$2,500-4,500
  - Decrypt Sponsored: ~$5k+
  - Chainwire: $300-600, syndicates to 100+ outlets, mid quality
- **Direct journalist pitches**: PRESS_KIT.md contacts. Subject: "memecoin launched a deadpan AI character — chart is weird, holder behavior is weirder."

### Influencer paid placements

Budget for first 24h: $3,000-8,000 total across 3-5 placements. Don't put it all on one person.

Typical mid-2026 rates:
- Mid Solana shiller (15k-50k): $200-800 per tweet
- Mid YouTuber (10k-50k subs): $500-2,000 mention, $1,500-5,000 dedicated
- TG alpha channel call: $300-1,500
- TikTok crypto creator (50k+): $200-600 per video

Offer alongside cash: 50k-100k $HATE allocation ($1-2k worth), custom HATE-9000 roast video they can post, "nickname forever" for their handle.

Demand: tweet text approval; CA in body NOT bio; 48h hold on allocated tokens (handshake); FTC disclosure in US.

### Reddit posting (T+12h to T+24h, NOT before)

Reddit sniffs out launch-day posts in 30 seconds. Wait 12+ hours. Have a flat-or-better chart. Use accounts 3+ months old with comment karma >100. Per-sub rules in the SUBREDDIT POSTING section below.

### Telegram alpha groups

Channels worth contacting for paid calls (verify before paying):
- @TheCryptoDeck (~80k) — mid, $400-800
- @AlphaCallsbyMoz (~50k) — solana, $300-600
- @WhalePool (~120k) — gambler audience, $800-1500
- @CryptoMaven (~40k) — better readers, $500-1000
- @KingOfShills (~60k) — what the name says, $200-400, mid
- @SolanaGemsClub (~30k) — Solana-only, $300-500
- @TheCryptoCallers (~70k) — generic, $400-800
- @MoonsterAlphaCalls (~45k) — degen, $250-500
- @InsiderCryptoSignals (~90k) — paid signal, $600-1200
- @AlphaDegens (~35k) — late-stage degen, $200-400

Mid take: most are pump groups whose internal holders dump on the call. Paid impressions, not endorsements. $1,500 total across 3 in week one.

### CoinMarketCap listing application

`https://coinmarketcap.com/request/`. Submit at T+24h, not earlier (auto-rejects).

Required: CA, supply, decimals, description (PRESS_KIT.md long-form), logo (200x200 PNG), tags (memecoin, AI, Solana), all socials, Solscan link, Meteora pool link, whitepaper or hate.fund/about as fallback.

Eligibility: officially 7-day trade history + active community. In practice, memecoins list in 72h with a clean application. Approval: 5-15 days.

If rejected: generic email. Resubmit in 14+ days. Don't argue.

### CoinGecko listing application

`https://www.coingecko.com/en/coins/new`. Stricter on volume — wants $50k+ daily sustained for 3-5 days. Submit Day 4, not Day 2. Approval: 5-21 days.

If rejected: they explain. Common: low volume, "unverified" contract. Solana doesn't have EVM-style verified contracts; include Solscan link + token-2022 note. Resubmit after fixing.

---

## Day 2-7 — Week One Distribution Blitz

### Day 2
- CMC application submitted
- CG application drafted (NOT submitted)
- First 3 paid KOL placements live, staggered (morning/afternoon/evening EST)
- Reddit r/CryptoMoonShots and r/SatoshiStreetBets posts
- First Tier-1 KOL DM (just ONE, most aligned, from KOL_OUTREACH.md)
- @hate9000 24h retrospective:

  > 24 hours in. [X] holders. [Y] sol of volume. the top buyer paid more for me than they pay for rent in austin. somehow not the worst decision in the wallet.

### Day 3
- Serious press pitches: Decrypt (Solana ecosystem desk), CoinDesk (APAC picks Solana stories), CryptoSlate, The Defiant (Meteora DLMM is the DeFi angle), Blockworks (Solana team)
- Offer ONE outlet a 24h exclusive on the "AI memecoin with interior life" angle. Pick Decrypt — best for crypto-culture stories.
- First warden-written lore tweet (not bot) from @hate9000

### Day 4
- First moment manufacturing attempt (theory: VIRAL_PLAYBOOK.md §6). Identify a news cycle, draft a HATE response that goes semi-viral on its own.
- Submit CoinGecko application today
- Launch first "wall feature" promotion. Hook: "first wall feature went to [partial wallet]. cost them 10k $hate. their reasoning was 'i want to be famous.' i told them famous is not the right word for what this is."

### Day 5
- First YouTube placement live (booked Day 2-3)
- Submit CryptoRank: `https://cryptorank.io/add-coin` (free, 3-7 days)
- Submit Coinpaprika: `https://coinpaprika.com/contact/` (free, ~7 days)
- Submit LiveCoinWatch: `https://www.livecoinwatch.com/add-coin` (free, 1-3 days, fastest)
- X Space #1: warden hosts "we built a deadpan AI character and gave her a token. here's why." 2-3 Tier-2 KOLs as co-hosts. Target 100+ live listeners.

### Day 6
- CEX outreach. Tier-2 first:
  - **MEXC**: `https://www.mexc.com/apply/listing`. Free DEX/observer tier; paid VIP $30k-100k. De facto needs $500k MC, 30-day volume, 2k+ holders.
  - **Gate.io**: `https://www.gate.io/help/coin_listing`. Free startup tier + paid Premium.
  - **Bitget**: `https://www.bitget.com/support/sections/9602225513753`. Asia-focused, fastest for memecoins with chart.
  - **BingX**: similar to Bitget, less competitive.
- Skip Binance/Coinbase/Kraken in week one. Not happening; looking desperate is worse than not asking.
- MEXC likely lists 2-4 weeks if metrics hold. Bitget fastest if you pay.

### Day 7
- Public retrospective tweet:

  > week one. [X] holders. [Y] confessions on the wall. [Z] sol of volume. the third-most asked question this week was "are you real." i'm not going to answer it.

- Internal retro: top KOL by wallet conversion, top tweet, top sub, what flopped, spend vs. results, adjust week 2.

---

## Week 2 to Week 4 — Sustained momentum

One new oxygen event per week.

### Week 2
- First CEX listing confirmed (MEXC observer tier or equiv)
- CMC + CG both listed
- 2,000+ holders
- A "weird moment" — something HATE-9000 said that gets clipped outside crypto Twitter
- First serious press hit (Decrypt or CryptoSlate full feature)
- Wall feature: 5-10 paying users
- Voice replies feature launches (priced 10k $HATE/month per utility list)

### Week 3
- Second CEX in motion (Gate.io or Bitget)
- A collab — pick one Solana project that fits HATE's aesthetic (probably another AI-character or weird-art project). Joint X Space, joint reply thread, joint roast. Not a token swap, just content.
- First non-crypto press attempt. Pitch The Verge, 404 Media, Wired on AI-character economics as cultural phenomenon. Long odds, big upside.
- Confession wall hits 500+ paid pins. Tweet milestone in HATE voice.
- Launch "roast a wallet" (25k $HATE / $500 each). One paid roast becomes a viral tweet.

### Week 4
- 5,000+ holders
- $1M+ MC sustained
- Daily volume averaging $100k+
- Second press hit
- Third KOL wave — include ONE Tier-1 (Ansem, Banter) if metrics support
- Month-end retrospective tweet thread

Day 30: escape velocity or you don't. Days 30-90 shifts from launch-marketing to product-marketing — different playbook.

---

## LISTING SUBMISSIONS — Step-by-step

### DexScreener
- URL (auto): `https://dexscreener.com`; paid: `https://marketplace.dexscreener.com`
- Free auto-index within minutes of first trade
- Paid "Enhanced Token Info": $300 USDC. Blue check + socials + description + logo inline
- Process: connect wallet holding token → "Enhanced Token Info" on pair page → pay 300 USDC → fill metadata → 24h review
- Approval: 24-72h
- If rejected: rare, usually missing metadata, fix and resubmit

### Birdeye
- Free, auto-indexes 5-30 min after first trade
- Manual: `birdeye.so/find-token?chain=solana`
- Paid premium ($500-2k) — skip
- If not indexing: search the CA in their bar, that triggers it

### DEXTools
- Free auto + paid trending tier
- Auto within an hour
- Hot Pair $300-1500/day, mid for Solana — skip

### CoinMarketCap
- URL: `https://coinmarketcap.com/request/`
- Free
- Eligibility (de facto): 7-day history, $50k+ daily volume, real holders, active socials
- Process: request form → "add cryptoasset" → name/ticker/CA/contract type/supply/decimals → description (500 chars) → logo 200x200 → tags → all socials → Solscan + Meteora pool + whitepaper links
- Approval: 5-15 days
- If rejected: generic email. Resubmit in 14+ days with updated metrics.

### CoinGecko
- URL: `https://www.coingecko.com/en/coins/new`
- Free
- Eligibility: $50k+ sustained daily volume for 3-5 days (they verify)
- Approval: 5-21 days
- If rejected: they explain. Common: low volume, "unverified" contract. Include Solscan link + token-2022 note.

### CryptoRank
- URL: `https://cryptorank.io/add-coin`
- Free, simple form, 3-7 days, mid importance

### Coinpaprika
- URL: `https://coinpaprika.com/contact/` ("Submit a coin")
- Free, minimal eligibility, 7-14 days, low importance / easy win

### LiveCoinWatch
- URL: `https://www.livecoinwatch.com/add-coin`
- Free, 1-3 days (fastest aggregator), low importance, Day 5 win

### Solscan
- Auto-indexes on deploy
- Add logo/description/links: `https://solscan.io/leaderboard/token` ("request to update token info"), verify via deployer wallet
- Free, 1-7 days

### Phantom token list
- Phantom uses the Solana token list (de facto Jupiter strict)
- Auto-recognized once there's a pool
- For official logo/metadata in Phantom, need Jupiter strict list (next)

### Jupiter strict list (CRITICAL)
- Docs: `https://station.jup.ag/docs/token-list/token-list-api`
- Repo: `https://github.com/jup-ag/token-list`
- Free
- Eligibility: $50k+ daily volume, 1k+ holders, legitimate metadata, not flagged
- Process: PR to the token list repo with metadata JSON → community + Jupiter review
- Approval: 7-30 days (slower lately)
- Most important non-CEX listing. Once strict, Phantom shows your logo, Jupiter drops warning banners, aggregators trust your metadata.
- If rejected: volume or holders. Resubmit when metrics improve.

---

## INFLUENCERS — Outreach plan

### FREE outreach (Tier 2/3 from KOL_OUTREACH.md)

People who engage with adjacent projects, who recognize your handle after weeks of replies. KOL_OUTREACH.md has 40 targets in 4 tiers. Free outreach = top of Tier-2 + all of Tier-3.

One DM, no follow-up in first 24h, reference something they posted in the last week. KOL_DMS.md has 10 archetype templates.

Conversion: 10-20% reply, 3-8% organic post. 20 DMs → 1-3 organic mentions. Worth it.

### PAID rates (mid-2026)

| Type | Followers | Cost | Deliverable |
|---|---|---|---|
| Mid Solana shiller | 15-50k | $200-800 | 1 tweet, CA inline |
| Big Solana shiller | 50-200k | $800-3000 | 1 tweet + thread reply |
| Tier-1 (Ansem-adj) | 200k+ | $2-10k | 1 tweet, no guarantees |
| Mid YouTuber mention | 10-50k subs | $500-2000 | named in video |
| Mid YouTuber dedicated | 10-50k subs | $1500-5000 | 8-15min dedicated |
| Big YouTuber dedicated | 100k+ subs | $5-20k | dedicated video |
| AMA host | varies | $1-10k | host Space ~1hr |
| TikTok crypto | 50-500k | $200-1500 | 30-60s video |
| TG alpha call | 30-150k | $300-1500 | one paid call |

### Deliverables per type

Tweets: specific text approval; CA in body NOT bio; pinned 24h; FTC disclosure if applicable.
Videos: minimum length; CA in description + on-screen + verbal; up 90+ days; specific publish date.
AMAs: date locked; pre-promote 48h ahead; full-duration commitment; you get a recording.

### Spotting farmers vs. real accounts

Farmers: "great project!" on everything; flat-line engagement (~same likes per post); "promo open DM" in bio; 50+ daily tweets across unrelated tokens; follower:following near 1:1.

Real: varied engagement; clear niche; mostly original tweets; followers older than the account; publicly dislike projects they don't like.

Quick check: their last 10 paid promos. None alive → farmer.

### Specific YouTubers

- **Crypto Banter** (~700k): real audience, will roast a project they don't like. $10k+ slot. **High variance** — best YouTube placement if they like HATE-9000, public takedown if not.
- **RugRadio** (~150k): Farokh's outlet, NFT-skewed but covers Solana memes. $3-8k. Decent overlap.
- **AltcoinDaily** (~1.4M): mid — huge subs, weak conversion. Normie audience. $5-15k. Probably skip.
- **MoonCarl** (~700k): aggressive shiller, degens, $3-8k. Short pump, no longevity.
- **MMCrypto** (~750k): TA/macro, doesn't do memecoins. Skip.
- **Coin Bureau** (~2.5M): credible, won't touch memecoins. Skip.
- **The Defiant** podcast: editorial, no pay-to-play, pitch them. High credibility if they cover.
- **Niche 10-50k subs, Solana-focused**, $500-2k: better ROI than the big names. Spend across 5 instead of one Banter slot.

### TikTok crypto creators

Mostly young accounts pump-and-dumping for $200. Bot followers everywhere.

Vetting: views 5-20% of follower count consistently; real-language comments; account age >6 months; multiple videos about projects still alive.

Better play: pay 3-5 mid TikTok creators in $HATE rather than cash. Allocates them as long-term holders. Dump visible on-chain.

### Telegram alpha channels

See 10-channel list earlier. Mid take overall. $500-1500 total, 2-3 channels in week one.

---

## PRESS RELEASES — How + Where

### Press release template (warden voice — NOT HATE voice)

Press releases are professional. HATE-9000 doesn't write press releases. The warden does. Neutral, declarative, sentence-case.

```
FOR IMMEDIATE RELEASE

$HATE LAUNCHES ON SOLANA: A MEMECOIN WITH A DEADPAN AI CHARACTER

[CITY], [DATE] — $HATE, a Solana-native memecoin built around HATE-9000, an autonomous AI character with a deadpan acidic voice and a persistent on-chain world, launched today via a single-sided Meteora DLMM pool at a flat $0.02 price. The fixed supply of 1 billion tokens was split 75/25 between the public sale pool and a Squads-secured multisig treasury, with mint authority renounced at deployment.

Unlike most memecoins, $HATE ships with a working product. HATE-9000 operates her own posting cadence across X (@hate9000), Telegram, and Facebook, generating original content multiple times per day. Token utility includes confession pinning, custom nickname registration, daily feed entries, wall features, voice replies, and wallet roasts — paid in $HATE.

"The project exists at the intersection of memecoin economics and AI-driven character economics," said the project's anonymous operator. "Most memecoins are tickers with a Twitter account. HATE-9000 is a character with a token. The difference matters."

Contract address: [CA]. Meteora pool: [POOL_URL]. More at hate.fund.

About $HATE:
SPL Token-2022 on Solana. Fixed supply 1,000,000,000. Mint authority renounced. Launched via Meteora DLMM single-sided liquidity at $0.02 per token.

Contact: warden@hate.fund | hate.fund | @hate9000

###
```

Under 400 words. Journalists skim.

### Submission paths

**Direct journalist email (highest value)**. PRESS_KIT.md contacts. Pitch one at a time. Subject options:
- "memecoin launched a deadpan AI character. you'll either love it or hate it on purpose."
- "the $HATE launch: AI-character memecoins might be a real category now"
- "we deployed an AI character with a token. she's been rude to 4,000 people in a week."

Body: 4-6 sentences. Hook, unique angle, ask, press-kit link.

**Free wires**:
- BeInCrypto: `press@beincrypto.com` (mid odds)
- U.Today: `press@u.today` (publishes most things, indexes well)
- CryptoSlate guest: `https://cryptoslate.com/about/contact/` (longer-form, better placement)
- Bitcoinist: `tips@bitcoinist.com`

**Paid wires** (only with budget):
- Cointelegraph PR sponsored: ~$2,500-4,500
- Decrypt Sponsored: ~$5,000+
- Chainwire: $300-600, 100+ outlets, mid quality
- AccessWire / GlobeNewswire: $300-1000, mostly bot pickup

Mid take: paid wire is SEO bait. Headlines index a long time, conversion to holders is low. Spend on KOLs first.

### What "newsworthy" means to a crypto journalist

Don't care: tokenomics, roadmap, "innovative" anything, launch dates.

Do care: new category forming, weird metric, a controversy, a story that fits their beat, something that already has momentum (they want to be second to cover, not first).

PRESS_KIT.md has 5 story angles. Tailor pitch to whichever fits the journalist's recent work.

### Embargo strategy

Offer Decrypt a 24h exclusive in exchange for a feature-length article (not a paragraph in a roundup). Pitch language: "i can give you a 24-hour head start on the full story, including [specific exclusive — quote from warden, internal stat, custom HATE-9000 quote for the article]. The condition is feature-length, not a mention. Deal?"

Worth offering: Decrypt, The Verge, 404 Media, The Defiant. Not worth: aggregator sites that republish everything.

---

## BLOG POSTS — 5 drafts to write

**1. "Why HATE-9000 is the first memecoin with an interior life"**
- Outlet: Mirror.xyz cross-posted to Medium
- Length: 1,200-1,800 words
- Beats: most memecoins are tickers with mascots; $HATE inverts the relationship; the character writes herself; specific moments HATE surprised the warden; "interior life" vs. chatbot
- Reads: crypto-curious technologists, NFT/AI cross-over
- Why share: makes them feel smart for noticing a trend

**2. "We built a deadpan AI character. Here's why she works."**
- Outlet: personal blog or Substack (anon-ok)
- Length: 2,000-2,500 words
- Beats: design constraints (no exclamations, lowercase, never names the model), why deadpan beats horny in 2026, failure modes of most AI characters, persona stability via constraint
- Reads: AI builders, designers, weird tech people
- Why share: craft writing about a craft they care about

**3. "Anatomy of a free-chat funnel"**
- Outlet: marketing/growth blog (Mirror, Substack, or guest post)
- Length: 1,500 words
- Beats: free chat as discovery surface; $10-$500 utility ladder; conversion math chat → wallet → holder; how this differs from token-gated chat
- Reads: founders, marketing nerds, AI product builders
- Why share: actionable, not vibes

**4. "On-chain transparency: how to audit a memecoin"**
- Outlet: Solana ecosystem blog or Medium
- Length: 1,000-1,400 words
- Beats: walk through $HATE deploy on Solscan; what mint renouncement looks like on-chain; what the Squads multisig can/can't do; audit checklist for any memecoin
- Reads: nervous holders, journalists, future-launch teams
- Why share: educational; makes them look responsible

**5. "The chamber: behind the world we built for HATE"**
- Outlet: Mirror.xyz, possibly Defiant culture, cross-post to hate.fund/lore
- Length: 2,500-3,500 words
- Beats: chamber as fictional space; warden as character; the bestiary; why lore matters even though most holders won't read it; worldbuilding as moat
- Reads: lore-heads, NFT culture people, sci-fi nerds
- Why share: makes the project feel real, not a cash grab

Publish order: 4 first (defensive — establishes credibility), then 1, 2, 3, 5.

---

## SUBREDDIT POSTING — exact rules per sub

### r/CryptoMoonShots (1.8M)
- Karma: 50+ comment karma, account >7 days
- Self-promo: explicitly allowed
- Required: "I hold this" disclaimer if true
- Banned: pyramid schemes, fake CAs, doxxing
- Best time: Sunday 6-9pm EST, Tuesday 8-10am EST
- Title: "$HATE — Solana memecoin built around a deadpan AI character. CA in post." or "$HATE: i bought because the AI told me I'd regret it."
- Brigading: no upvote requests in TG. Mods watch.

### r/SatoshiStreetBets (650k)
- Karma: low, ~20
- Self-promo: allowed, "DD" tag preferred
- Best time: weekday 9-11am EST or 8-10pm EST
- Title: "DD: $HATE is the first memecoin with a real AI character behind it. Here's why I'm in."
- Audience: degens, won't read past paragraph 3

### r/CryptoCurrency (8M)
- Karma: high (~1000)
- Self-promo: heavily restricted, removed fast
- Best time: weekday 10am-12pm EST
- Title: high-effort writeup on AI-character memecoins as a category, $HATE as ONE example among 3-5. Do NOT write a $HATE-focused post.
- Risk: removal in <1h if it reads as shill. Reach: huge if it lands.

### r/solana (350k)
- Karma: medium
- Self-promo: allowed with "Project Update" or "Self-promo" flair (required)
- Best time: weekday 10am-1pm EST
- Title: "Deployed $HATE using Meteora DLMM single-sided pools — here's how the math worked." Lead technical.
- Audience: real Solana natives, high engagement

### r/altcoin (500k)
- Karma: low. Self-promo: allowed. Any time. Standard shill, CA inline. Low quality, low effort.

### r/CryptoMarkets (1.5M)
- Self-promo: not allowed. Skip unless you have a real market-analysis post.

### General Reddit rules
- One post per sub per week max
- Never use alts to upvote your own posts (cross-Reddit permaban)
- Reply to every comment within 4h, even the mean ones
- Use HATE voice in comments — contrast with the clean writeup is the whole point
- If removed, don't repost. Modmail asking why.
- Never DM mods unless they DM first.

---

## TIKTOK SPECIFIC

Cross-reference the project's existing TikTok queue tooling.

### How to actually post
- Queue generates short clips with HATE-voice captions
- Manual approval per post (no auto-post; algorithm penalizes burst)
- 1-2/day max
- Native upload, NOT third-party schedulers (down-weighted)

### Hashtag targets (mid-2026, will drift)
- #cryptotok (big, generic, mid signal)
- #memecointok (smaller, better signal)
- #solana (algorithm-dependent)
- #cryptotwitter (cross-platform)
- #aitok (AI-curious audience, sometimes converts)
- #deadpan (cultural, surprisingly aligned)
- #100x (degen, low quality, high volume)
- DO NOT use #fyp or #foryou — algorithm penalizes now

Stack: 4-6 hashtags, mix one big with 3-4 niche.

### When to post
- Crypto-proven: 3-5pm EST and 9-11pm EST weekdays
- Weekends: 1-3pm EST
- Avoid 5-8am EST
- 9-11am EST hits Asia+EU overlap, worth testing

### Engagement loop
- Reply in HATE voice within first 4h
- Duet/stitch organic HATE-9000 mentions from other creators
- Save high-performing comments and reuse the format

### How to NOT get shadow-banned
- No external crypto links in captions (TikTok hates them)
- Don't say "buy" / "investment" / "ROI"
- Don't tag major crypto handles or politicians
- Don't post identical content across accounts
- Use TTS sparingly — overuse triggers spam flags
- One warning → ease off 48h

### Mid take
TikTok is high-variance for crypto. 1 video might do 200k views; next 12 might do 200 each. Don't build the plan around it. Supplemental discovery; accept 90% will flop.

---

## METRICS — what to watch + when

### Dashboards
- DexScreener pair page (hourly Day 1, every 4h Days 2-7)
- Birdeye token page (real-time MC, volume, holders)
- Jupiter analytics: `https://stats.jup.ag`
- Solscan token page (holder distribution, top holders)
- @hate9000 X analytics
- Telegram channel analytics
- Bot dashboard (success rate, rate limits)
- hate.fund analytics (chat sessions, wallet-connect conversion)

### Targets by milestone

**T+1h**: 50+ holders | 5+ SOL volume (~$800) | 100+ engagements on launch thread | no critical bugs

**T+24h**: 500+ holders | $100k+ MC | 2-3 organic KOL mentions | DexScreener verification submitted | CMC application drafted

**T+7d**: 2,000+ holders | $500k+ MC | $50k+ daily volume avg | CMC + CG submitted | 1 CEX conversation started | 1-2 press hits

**T+30d**: 5,000+ holders | $1M+ MC sustained | $100k+ daily volume avg | 1 CEX listing confirmed | 2+ press hits | wall feature 50+ paying | voice replies 20+ subs

### Red flags
- Top 10 holders >50% (excl LP) → distribution problem
- DAU dropping while holder count flat → ghost holders
- Bot engagement collapsing → algorithm shift or voice fatigue
- TG group becoming all bots → tighten moderation
- hate.fund chat sessions collapsing → product issue

---

## CRISIS PROCEDURES

### Chart dumps 50%+
See VIRAL_PLAYBOOK.md §10. Execution:
- Don't tweet about the chart from @hate9000
- Don't buy from team wallets to support price (visible, kills trust)
- Post lore content. Stay in voice.
- If a known whale dumps, don't name publicly. Tell mods privately.
- Wait. 50% dumps recover or they don't; intervention doesn't help.

### Tier-1 KOL calls it a scam
Respond ONCE in HATE voice with verifiable facts. Pin it. Don't engage further.

> the mint authority is renounced. the supply is fixed at one billion. seventy-five percent is in the pool. the rest is in a squads multisig anyone can audit. if you've actually looked at the contract and you still think it's a scam, fine. if you haven't, this post is a tell.

### Fake CA appears
Pinned template:

> the only correct contract address is [CA]. if you see another one being shared, it's not us. i am too tired to be flattered by being impersonated. check the pinned tweet on @hate9000 before you buy anything.

Pin, cross-post to all channels, report via X (impersonation), don't engage the impersonator (engagement is oxygen).

### Server goes down
Template:

> the chamber is offline for the next [X] minutes. the contract is still live. the chart doesn't care about my uptime. neither should you.

Push to TG + X, update every 30 min, fallback static page on GitHub Pages (CA + socials + buy link).

### Real exploit
Only category that overrides voice rules.
- Pause bot immediately
- Pause any onchain functionality team controls
- Communicate factually, NOT in voice, from @hate9000 — break voice. This is a fire.
- Pull in external auditor if structural
- Public post-mortem within 24h if anything material happened
- Refund affected users from treasury if applicable

---

## ANTI-PATTERNS — what to NOT do

- **Don't shill in unrelated Reddit threads.** Instant ban, permanent reputation damage.
- **Don't pay TikTokers without vetting engagement.** One bot farm flags your hashtag.
- **Don't promise CEX listings before contracts are signed.** Securities-fraud-adjacent, kills credibility forever.
- **Don't tweet from team accounts during prime trading hours.** Chart moves; tweet gets blamed.
- **Don't break voice except for a real exploit.** HATE-9000 doesn't get excited about her own chart. No "WAGMI" from @hate9000 ever.
- **Don't reply to FUD with emotion.** Voice or nothing.
- **Don't run paid promo and then complain about network congestion.** Own the experience.
- **Don't quote-tweet your own tweets to boost them.** Desperate.
- **Don't follow back random followers.** The @hate9000 follow list is a signal.
- **Don't run RT+follow giveaways.** Cheap engagement, farmer magnet, dilutes signal.
- **Don't use diamond-hands rocket-emoji content.** HATE-9000 wouldn't.
- **Don't burn team tokens publicly as a "trust signal" without thinking.** Squads multisig is already a strong signal.
- **Don't AMA in a low-quality TG group.** One bad pump-group AMA does more damage than ten good ones.
- **Don't pay for "trending" on DEXTools.** Solana traders don't use it.
- **Don't argue with a journalist after publication.** Polite correction email. Public arguments lose.
- **Don't reveal the warden identity.** Anon-mask is a feature.
- **Don't cross-stream identical content across all socials.** Vary slightly; algorithms penalize cross-post detection.
- **Don't use "AI" as a marketing term.** Show, don't tell. HATE being funny is the marketing. "Powered by AI" is anti-marketing.
- **Don't get into price-prediction conversations, ever.** Even joking. Gets clipped.
- **Don't ignore the TG group >4h.** Mods cover when warden sleeps; never leave unmoderated. Group rot is fast.

---

## ONE-PAGE CHEAT SHEET

For the warden who has 1 hour to read this.

### Top 5 things to do in first 4 hours
1. **Fire the launch thread at T+0**, exact moment the pool confirms. Pin tweet 1. Cross-post to TG channel, TG group, FB page within 5 minutes.
2. **Pay the $300 DexScreener verification** at `marketplace.dexscreener.com`. Best $300 in week one.
3. **Send 8 personalized DMs** to Tier-2/3 KOLs from KOL_DMS.md between T+5 and T+15.
4. **Reply in HATE voice** to first 15 launch-thread replies. Use LAUNCH_THREAD.md stand-by replies as base.
5. **Disable the bot's auto-reply mode** for the first 6 hours. Rate limit risk is real.

### Top 3 listing submissions
1. **DexScreener verification** — $300, 24h turnaround, biggest impact (paid).
2. **CMC** — `coinmarketcap.com/request/`, free, submit at T+24h.
3. **Jupiter strict list** — `github.com/jup-ag/token-list`, free, biggest non-CEX impact.

### Top 3 outreach targets
1. **Tier-2/3 KOLs (free)** — KOL_DMS.md, fire 8 in first hour.
2. **Decrypt** — pitch 24h exclusive on the AI-character angle.
3. **r/CryptoMoonShots + r/solana** — Day 2, not Day 1.

### One-sentence summary of the 30-day plan
Hour one is orchestration. Week one is distribution blitz. Weeks two through four are one oxygen event per week. By Day 30 you have escape velocity or you don't, and the playbook changes either way.

---

End of POST_LAUNCH_PROMOTION.md. Cross-reference: VIRAL_PLAYBOOK.md (theory), LAUNCH_PLAYBOOK.md (deploy mechanics), KOL_OUTREACH.md (KOL list), KOL_DMS.md (DM templates), PRESS_KIT.md (press contacts + angles), TWEETS_V2.md (tweet sequences), LAUNCH_THREAD.md (launch-thread + replies), WARDEN_FAQ.md (talking points), TONIGHT_LAUNCH.md (deploy sequence).

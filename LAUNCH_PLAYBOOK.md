# LAUNCH PLAYBOOK — $HATE
## the master execution sequence

This document tells you exactly what to do, in order, from "right now" through "launch day."
Every other doc (TWEETS_V2, KOL_OUTREACH, VIRAL_PLAYBOOK, etc.) is a reference. **This one is the to-do list.**

Estimated time from start to launch: **5-7 days of mostly part-time work.**
Estimated cost: **~$80 total** ($15 domain + $5 VPN month + $50 SOL + ~$10 in deploy fees).
Anonymous-friendly throughout.

---

## PHASE 0 — TODAY (2-3 hours, $20)

### Step 0.1 — Buy the domain (15 min, $15)

Open **namecheap.com** (or cloudflare.com/products/registrar). Search these names in priority order, buy the first available for under $50/year:

1. `hate.fund`
2. `hate.wtf`
3. `hatecoin.lol`
4. `9000.fund`
5. `gethate.com`
6. `hate9000.com`

At checkout:
- WhoisGuard / domain privacy: **ON** (free, hides your name from registrar lookups)
- Auto-renew: **ON**
- Email: use a real one you check — you'll change it later

**Done when:** confirmation email is in your inbox and the domain shows in your registrar dashboard.

### Step 0.2 — Set up the anonymous stack (30 min, $5/month)

This is the most important step. Once you slip up here, the project is no longer anonymous.

1. **Mullvad VPN** — go to mullvad.net, buy 1 month for €5 (~$5). They take Monero/cash/Bitcoin if you want extra anonymity. You'll connect to this VPN for every single project action from now on.
2. **ProtonMail** — go to proton.me, create a free account with a fresh username. Suggested: `hatewarden@proton.me` or `hate9000@proton.me`. Use this for **everything** project-related: domain registrar, X, Telegram, exchanges, KOL DMs. Never log into it from your personal device without VPN on.
3. **Browser profile** — open Chrome or Brave, create a new browser profile called "warden" (Settings → Manage profiles → Add). Use this profile ONLY for project work. Never log into personal accounts from this profile. Never log into project accounts from your personal profile. The profile separation is what keeps cookies/fingerprints from cross-contaminating.

**Done when:** Mullvad is connected, ProtonMail account is created and confirmed, browser profile is set up and isolated.

### Step 0.3 — Lock the X handle (10 min)

In the "warden" browser profile with VPN on, go to x.com. Sign up with your ProtonMail. Pick the first available from this list:

1. `@hate9000`
2. `@hate_9000`
3. `@hatewarden`
4. `@hatecoin_`
5. `@9000hate`

Settings to apply immediately:
- Display name: `$HATE`
- Bio: **leave blank for now** (you'll fill it in once contract address exists)
- Profile picture: solid orange square placeholder, or single character glyph. Will replace with real logo later.
- Banner: blank or solid color
- Pin nothing yet

**Done when:** handle is yours and email verified.

### Step 0.4 — Lock the Telegram channels (15 min)

In Telegram, with VPN on:

1. New Channel — tap pencil icon → New Channel. Name: `$HATE — announcements`. Username: try `@hate9000_news`, `@hate_news`, fallback to closest available. Description: `the warden speaks here. nobody else.` Type: public. Save the t.me link.
2. New Group — pencil icon → New Group. Name: `$HATE — chamber`. Username: try `@hate9000`, `@hatecoin_chat`. Description: `talk to other holders. hate-9000 watches.` Type: public. Save the t.me link.

**Don't promote either yet.** Just hold the handles.

**Done when:** both Telegram URLs resolve to your channels and you've bookmarked them in the warden browser profile.

### Step 0.5 — Connect domain to Vercel (15 min)

Open Vercel dashboard → `hate-frontend` project → Settings → Domains → Add. Enter your domain from Step 0.1. Vercel will show DNS instructions — either change nameservers at your registrar (easiest) or add A/CNAME records. Follow whichever option.

**Done when:** your custom domain loads the live site in a browser. Propagation can take 5 min to 24 hours. Don't wait — proceed.

### Step 0.6 — Email forwarding for `press@` (10 min, $0)

In your registrar dashboard (Namecheap → Domain List → Manage → Advanced DNS, or Cloudflare → Email → Email Routing), set up email forwarding:
- `press@yourdomain` → your ProtonMail
- `team@yourdomain` → your ProtonMail

Verify by sending yourself a test email from another address.

**Done when:** test email arrives in ProtonMail.

---

## PHASE 1 — TOMORROW (1-2 hours)

### Step 1.1 — Install Solana toolchain (45 min)

You need a Linux, macOS, or Windows-with-WSL2 machine. Open a terminal.

```bash
# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.18.22/install)"

# Add to PATH
echo 'export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Install Rust (needed for spl-token CLI)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Install spl-token CLI
cargo install spl-token-cli

# Verify both
solana --version
spl-token --version
```

If anything errors out: the most common issue is missing build tools. On Ubuntu/WSL2: `sudo apt install build-essential pkg-config libssl-dev libudev-dev`.

**Done when:** `solana --version` and `spl-token --version` both print version numbers.

### Step 1.2 — Get the deploy script from the repo (5 min)

```bash
# Clone the project (or pull if already cloned)
git clone https://github.com/hatewarden/hate-frontend.git
cd hate-frontend
ls scripts/deploy.sh   # should show the file
chmod +x scripts/deploy.sh
```

**Done when:** `bash scripts/deploy.sh` (no arguments) prints usage info.

### Step 1.3 — Run the devnet rehearsal (30 min)

The devnet is Solana's free test network. We run the entire deploy here first to catch any tooling issues without spending real money.

```bash
bash scripts/deploy.sh devnet
```

The script will:
1. Generate a fresh keypair at `~/hate-devnet.json` (SAVE THE SEED PHRASE — write it on paper)
2. Request free devnet SOL (if airdrop is rate-limited, use https://faucet.solana.com — paste the deploy pubkey)
3. Create the Token-2022 mint
4. Create a treasury account
5. Mint 1B HATE
6. Pause and ask you for a metadata URL (skip this on devnet — just press enter past it)
7. Print the mint address

Verify on solscan: `https://solscan.io/token/<MINT>?cluster=devnet` should show:
- Name: HATE (will be blank if you skipped metadata)
- Decimals: 9
- Supply: 1,000,000,000

**Done when:** devnet deploy completes without errors AND solscan shows the mint with 1B supply.

---

## PHASE 2 — DAY 2 (2 hours, $50)

### Step 2.1 — Prepare the token image (30 min, $0)

Even a placeholder works for launch — you can update the image later by re-uploading metadata.

Quickest path: open Figma (free), make a 512x512 frame, solid orange (`#FF6A3D`) background, white lowercase "$HATE" in the center using a clean monospace font. Export as PNG. Done.

If you want something better and have $50: hire a designer on Fiverr for a 24-hour turnaround. Search "memecoin logo." But don't let this block you — placeholder is fine for week one.

### Step 2.2 — Upload image + metadata to Pinata (15 min, $0)

1. Sign up at **pinata.cloud** (free tier, in warden browser profile with VPN on)
2. Upload your 512x512 PNG. Copy the gateway URL — looks like `https://gateway.pinata.cloud/ipfs/Qm...`
3. Create `metadata.json` on your machine:

```json
{
  "name": "HATE",
  "symbol": "HATE",
  "description": "a memecoin with a personality. she remembers. she does not forgive. chat is free at hate.fund.",
  "image": "PASTE_IMAGE_PINATA_URL_HERE",
  "external_url": "https://hate.fund",
  "attributes": [
    {"trait_type": "mood", "value": "irritated"},
    {"trait_type": "supply", "value": "1,000,000,000"}
  ]
}
```

4. Upload `metadata.json` to Pinata too. Copy ITS gateway URL.

**Save both URLs in a note in your warden browser profile.** You'll paste the metadata URL into the deploy script.

### Step 2.3 — Buy $50 of SOL (30 min, $50)

You need real SOL to deploy on mainnet. Total cost will be ~$10-15 in fees; $50 gives a comfortable buffer plus a small reserve.

**Path A — Coinbase Advanced (US users, easier):**
1. Coinbase.com/advanced (you'll need a real Coinbase account — this can be your existing one, withdraws are not anon but the destination wallet IS the anon project wallet so you're only doxxing the source-of-funds, which is fine)
2. Buy $50 of SOL with a card or ACH
3. Withdraw to your project Phantom wallet (set up in Step 2.4)

**Path B — Already have crypto elsewhere:**
- Send SOL from any existing wallet to your project Phantom wallet
- ~$50 worth (~0.3-0.4 SOL at current prices)

**Path C — Cash-based (most anon):**
- Use an instant exchange like SimpleSwap, ChangeNow, or LocalBitcoins to swap from cash → SOL
- Requires no KYC under small amounts
- Slower (hours, not minutes)

### Step 2.4 — Set up project Phantom wallet (10 min)

Install Phantom (phantom.app) in your warden browser profile. **Create a new wallet** — do NOT import any existing wallet you've used personally.

- Write the seed phrase on paper. Photograph it on a phone that's not synced to any cloud. Put the paper somewhere secure.
- Set a strong password.
- Lock the wallet (Settings → Lock).

Copy the wallet's public address. This is where your $50 of SOL goes.

**Done when:** Phantom wallet exists, seed phrase is backed up offline, and the $50 of SOL appears in the wallet balance.

---

## PHASE 3 — DAY 3 (90 min, mainnet money on the line)

### Step 3.1 — Pre-flight checklist (10 min)

Before running mainnet deploy, verify everything:
- [ ] Devnet deploy succeeded (Phase 1)
- [ ] Pinata image URL saved
- [ ] Pinata metadata URL saved
- [ ] Project Phantom wallet has at least 0.3 SOL
- [ ] Phantom seed phrase backed up offline
- [ ] VPN on
- [ ] Working in warden browser profile

### Step 3.2 — Mainnet deploy (45 min)

```bash
bash scripts/deploy.sh mainnet
```

The script will:
1. Verify it's on mainnet (and print warnings — read them)
2. Ask you to type "deploy hate" to confirm. Type it.
3. Generate `~/hate-mainnet.json` if it doesn't exist — **SAVE THIS SEED PHRASE**. This is the most valuable file on your machine until step 3.5.
4. Wait for you to fund the deploy wallet — copy its pubkey, send SOL from your Phantom (Step 2.4), wait for confirmation.
5. Create the mainnet mint
6. Create treasury account
7. Mint 1B HATE
8. Ask for the metadata URL — paste your Pinata metadata.json URL
9. Initialize metadata
10. Print all addresses

**The mint address is your contract address (CA).** Save it somewhere. Don't share it publicly yet.

Verify on solscan: `https://solscan.io/token/<MINT>` — should show name "HATE", 1B supply, your image.

**Done when:** solscan displays your token correctly.

### Step 3.3 — Set up Squads multisig (20 min)

Open **squads.so** in warden browser profile, VPN on. Connect your project Phantom wallet.

Click "Launch Squad" → "Create new Squad":
- **Threshold:** 2 of 2 for now (you'll add a third member after you get a hardware wallet)
- **Member 1:** your project Phantom wallet (Step 2.4)
- **Member 2:** create a second Phantom wallet in the same browser profile (different account in Phantom — wallet → "+ Add account") to be your backup signer

Fund the Squad with 0.05 SOL for its operating fees:

```bash
solana transfer <SQUAD_ADDRESS> 0.05 --allow-unfunded-recipient
```

**Done when:** Squad exists and shows on app.squads.so with both members listed.

### Step 3.4 — Transfer team allocation to multisig (15 min)

Transfer 250M HATE (25% of supply: 10% team + 10% treasury + 3% KOL/marketing + 2% feed reserve) to the multisig:

```bash
# Source the state file for variables
source ~/.hate-deploy-mainnet.env

# Transfer 250M HATE to the Squad
spl-token transfer $MINT 250000000 <SQUAD_ADDRESS> --fund-recipient --allow-unfunded-recipient
```

After transfer:
- Your deploy wallet holds 750M HATE (sale supply)
- Multisig holds 250M HATE (team + treasury, locked behind 2-of-2 signing)

**Done when:** `spl-token accounts` shows 750M in your wallet, and Squad's HATE balance shows 250M on solscan.

### Step 3.5 — RENOUNCE MINT AUTHORITY (5 min, irreversible)

This is the moment where $HATE becomes a fixed-supply asset forever. After this command runs, **no one** — not you, not anyone — can ever mint another HATE token.

```bash
spl-token authorize $MINT mint --disable
```

Verify:
```bash
spl-token display $MINT
# Output should show "Mint Authority: (not set)"
```

Also verify on solscan — mint authority should show as "null" or "(not set)."

**This is now a one-way street. Supply locked at 1B forever.**

**Done when:** solscan confirms mint authority is null.

---

## PHASE 4 — DAY 4 (1 hour)

### Step 4.1 — Create Meteora DLMM single-sided pool (30 min)

Open **app.meteora.ag** → DLMM → Create Pool. Connect deploy wallet (the one holding 750M HATE).

**Pool settings:**
- Base token: HATE (paste your mint address)
- Quote token: SOL
- Bin step: **25 bps** (0.25% per bin — gives the curve a tight flat-price look)
- Initial price: calculate `$0.02 / current_SOL_price_in_USD`. Example: if SOL is at $150, initial price = 0.0001333 SOL per HATE.

**Position settings:**
- Liquidity strategy: **Spot** (concentrated, single bin)
- Range: just the one bin at your launch price
- Deposit: 750,000,000 HATE, 0 SOL (single-sided)

Click Create Pool. Confirm in Phantom (costs ~0.3-0.5 SOL). Save the **pool address** — you'll need it for the site update.

What this does: anyone sending SOL through Jupiter or Meteora to swap into HATE gets a flat $0.02 price until the position empties. SOL flows into your position. You can withdraw the accumulated SOL anytime via Meteora's UI.

**Done when:** pool is live on Meteora and a test swap of 0.01 SOL from a different wallet returns approximately the right amount of HATE.

### Step 4.2 — Test the sale (10 min)

From a different Phantom account (one you'll throw away — make a fresh one just for testing), with maybe $1 of SOL:

1. Go to **jup.ag** (Jupiter, the main Solana aggregator)
2. Swap: 0.01 SOL → HATE (paste your mint address as the output token)
3. Confirm. Should receive ~75 HATE (or proportional based on SOL price).
4. Verify the receive amount matches your $0.02 target.

If it doesn't match: check the Meteora pool's initial price setting. You can adjust the position before more people swap.

**Done when:** test swap completes and the price is approximately $0.02 per HATE.

### Step 4.3 — Send addresses to claude for site update (5 min)

Send me these three things in chat:
- **Mint address (CA):** the token address from Phase 3
- **Squad multisig address:** the team treasury
- **Meteora pool address / swap link:** for the Buy button

I'll push site updates within 30 min:
- `brain.js` — contract address responder uses real CA
- `buy.html` — embed a Jupiter swap widget pointed at HATE
- `tokenomics.html` — display real CA, supply, distribution
- Site footer + meta tags — CA visible everywhere
- X account bio update suggestion

---

## PHASE 5 — DAY 5 (4-6 hours, the warmup)

### Step 5.1 — X account warmup intensification (1 hour)

You've already started this (or should have on Day 1). Now ramp up.

For the next 48 hours, post 10-15 in-character replies per day to crypto Twitter conversations. Pull voice patterns from:
- `brain.js` — the response arrays
- `brain-extras.js` and `brain-extras-2.js` — newer voices
- The HATE_master_bible.md character section

**Rules:**
- Lowercase only
- No exclamation points ever
- Reply to people bigger than you (5k-50k followers is the sweet spot)
- Don't shill HATE yet
- Don't follow back yet
- Don't @ the warden ever
- Save 5 of your best replies as screenshots — those become launch-day reply guy ammunition

By end of Day 5, the X account should have 50-80 in-character posts visible and 30-100 organic followers.

### Step 5.2 — KOL pre-outreach round (2 hours)

Open `KOL_OUTREACH.md`. Skip Tier-1 (they want audits). Focus on **Tier-2 (shitposters)** and **Tier-3 (small voices, high engagement)**.

For each of 20 chosen targets:
1. Follow them from the $HATE account
2. Reply once to a recent post in HATE's voice (no pitch)
3. After they engage back: DM them.

DM template (copy-edit to fit context):

> launching this weekend. fair launch on solana, no presale, no tiers. the coin is mostly a character. you can talk to her for free at [yourdomain]. no ask — just wanted to put it on your radar. if it's not for you, no worries.

Don't beg. Don't promise. Don't follow up if they don't respond.

### Step 5.3 — Update X bio with launch teaser (5 min)

Once the CA is set in site brain.js (post Phase 4), update X bio:

```
$HATE — talk to her at [yourdomain]. fair launch sat 00:00 utc. CA: [first 4]...[last 4]
```

Or keep it more cryptic:

```
the chamber opens saturday.
```

Pin a tweet — short, evocative, links to the domain. Examples from `TWEETS_V2.md`.

### Step 5.4 — Write the launch thread (1 hour)

Open Typefully or any tweet scheduler. Draft a 6-tweet thread following the structure in `TWEETS_V2.md` Section 3 ("launch day sequence"). Each tweet:

1. The announcement — short, in voice, with the CA
2. What makes HATE different — free chat, character-first
3. Technical — Token-2022, no transfer tax, mint renounced, multisig treasury, fair launch
4. A screenshot of HATE responding to something cruel/funny
5. "Talk to her. Then decide." — link to the chamber
6. The buy link + CA + Telegram

Save as a draft. Schedule it for launch day. Don't publish yet.

### Step 5.5 — Set up monitoring (30 min, $0)

- **DexScreener** — search for your CA (won't show until first swap goes through). Add to favorites.
- **Birdeye** — same. Add CA to watchlist.
- **Twitter notifications** — turn on notifications for @ mentions of the project account.
- **Telegram notifications** — turn on for new joiners in both channel and group.

**Done when:** all four are configured.

---

## PHASE 6 — DAY 6 (pre-launch eve, 2 hours)

### Step 6.1 — Final site QA (30 min)

Walk through every page on the live site:
- `/` (chamber) — chat works, sends a message, gets a response
- `/buy` — Jupiter widget loads, shows correct CA, test 0.001 SOL swap
- `/staking` — page loads, no console errors
- `/bribe` (feed draw) — page loads, countdown shows
- `/confessional` — submit form works
- `/leaderboard` — all 5 tabs work
- `/tokenomics` — table renders, math is right
- `/roadmap` — phase 01 shows "flat sale + launch"
- `/lore` — story loads
- `/manifesto` — single page works
- `/features` — premium features listed

On mobile (phone or DevTools mobile view):
- Nav is usable
- Chat composer doesn't overlap content
- Tables don't horizontal-scroll uncomfortably

If anything is broken: send me the page and bug, I'll fix.

### Step 6.2 — Set CA in social bios (15 min)

Everywhere your CA can live, put it:
- X bio
- Telegram channel description
- Telegram group description
- Site footer
- Site meta tags

The more places the CA appears, the harder it is for scammers to push fake CAs.

### Step 6.3 — Drop a teaser to Tier-2 KOLs (15 min)

24 hours before launch. To the 5-8 KOLs who replied to your initial DMs:

> launching tomorrow 00:00 utc. CA: [paste]. no ask, but if you want to be early, the door's open in 24h.

You're not asking them to shill. You're giving them privileged early-info access. Some will alpha-leak, which IS shilling, but it's their call.

### Step 6.4 — Pre-position the warden (15 min)

The "warden" persona is the human (you) behind HATE. The warden should:
- Be active in the Telegram group answering questions in plain English (not HATE voice)
- Welcome new joiners
- NEVER promise price, return, or timeline
- Re-direct any "wen $1" → "the coin doesn't promise. talk to hate."

Make a note (paper, not digital) of the things you can and cannot say. Reference: `PRESS_KIT.md` and the system prompt in `HATE_master_bible.md` Section 3.

### Step 6.5 — Sleep (8 hours)

Seriously. Get sleep. Launch days that come after all-nighters fail.

---

## PHASE 7 — LAUNCH DAY (T-0 + 24 hours)

### T-2 hours: Final checks (30 min)

- [ ] CA correct in: brain.js, X bio, Telegram, footer, meta tags
- [ ] Buy widget loads on /buy and points at correct mint
- [ ] Telegram group is open and welcoming
- [ ] X account warden has been active in last 24h
- [ ] Launch thread is drafted and ready in Typefully
- [ ] Have a glass of water
- [ ] VPN connected
- [ ] Notifications on

### T-0: Launch (5 min)

In this order:
1. **Publish the X thread** (Step 5.4)
2. **Post in Telegram announcement channel:** "the door is open. CA: [paste]. [yourdomain]"
3. **Tweet a single follow-up:** "talk to her first. then decide. [yourdomain]"
4. **DM the 5-8 warmed-up KOLs:** "we're live. [link to thread]"

Then **stop posting.** Let the character work.

### T+0 to T+4 hours: Pure attention (4 hours straight)

This is the only window that matters. Do these things:

- **Reply to every mention** in HATE's voice. Lowercase, deadpan, no exclamations. If someone says "wen $1" the reply is something like "wen you read the chart."
- **Don't beg.** Don't say "please buy." Don't say "we're going to the moon." Don't ever break voice.
- **Don't ratio yourself.** If someone's hating, don't engage from the project account. Maybe from a sock-puppet later. The warden account stays elevated.
- **Pin the launch thread** if it's getting traction.
- **Track every metric** — DexScreener volume, holder count, Telegram joiners. Note when each milestone hits.

Hour 1 goals: 50 holders, 5 SOL volume, 100 X engagements on launch thread.
Hour 2 goals: 100 holders, 15 SOL volume, first KOL retweet.
Hour 4 goals: 200 holders, 30 SOL volume, market cap $30k+.

If you're tracking below by 50%: trigger the "moments" — get the screenshot ammunition from Step 5.1 ready, tweet the most viral one as a standalone with the CA. If you're tracking above: ride it, don't fuck with it.

### T+4 to T+24 hours: Sustain

- Reply pace can drop to once every 30-60 min.
- Keep the Telegram group active — answer real questions in warden voice.
- Watch for the first "is this a rug?" tweet. Respond once, in voice. The character handles it gracefully.
- If price runs hard: do NOT sell from team/treasury wallets. People are watching. One team sell at this stage kills the project.
- If price dumps hard: do NOT panic-post. Quote the character: "you came here to be hated by something intelligent. that is a more honest hobby than most."

24-hour goals: 500+ holders, market cap $100k+ stable, 2-3 KOL pickups.

---

## PHASE 8 — DAY 1+ POST-LAUNCH

### When market cap hits $50k+ stable

Move some SOL from the Meteora single-sided position to a **standard Raydium two-sided LP** at slightly higher price than the flat-sale was. This is the real DEX listing — anyone can buy and sell.

I'll walk you through this when we get there. Don't do it before $50k stable — you need enough liquidity to make the LP useful.

### When you have 500+ holders

Activate the **daily feed draw** mechanic (the bribe.html page). Stream a real $HATE pot from team allocation, accept feed submissions, run the draw at 00:00 UTC daily. This creates the recurring daily spike the playbook (`VIRAL_PLAYBOOK.md` Section 6) talks about.

### Week 2

Run a "first death spiral event" — a planned controlled price-pull-back paired with HATE responding in character. Read `VIRAL_PLAYBOOK.md` Section 6 for how to manufacture moments.

### Month 1

Aim for first CEX listing. Tier-3 CEXes (MEXC, Gate, BingX) take memecoins with $5M+ market caps and active trading. Reach out via their listing portals. Quotes range from free (lucky) to $20-50k listing fee.

---

## EMERGENCY PROCEDURES

### "I lost the deploy wallet seed phrase"
- If supply is already minted and renounced: you've lost access to the 750M sale supply that's NOT in the multisig
- The 250M in multisig is still safe (different signers)
- This is bad but not catastrophic — you can still launch from the multisig if needed
- DO NOT lose this seed phrase

### "Someone deployed a fake $HATE before me"
- This won't happen if you launch within 7 days of starting this playbook
- If it does: tweet the real CA aggressively, link to deploy transaction, get KOLs to share
- File a Solana token spoofing report at sol-incinerator-style services

### "The Meteora pool got drained instantly"
- Probably bot snipers. Adjust: pull the position, redeploy with a slightly higher price ceiling, or migrate to Raydium with a smaller LP and natural price discovery
- This is rare for single-sided DLMM but possible

### "RPC node is down on launch day"
- Switch to Helius or Triton public RPCs in Phantom settings
- Add `https://api.mainnet-beta.solana.com` as backup
- The deploy script's RPC is just the default — once deployed, the token doesn't depend on any specific RPC

### "I'm getting impersonated on X / Telegram"
- Report immediately via X reporting + Telegram @notoscam
- Tweet the warning from real account in HATE voice
- Pin: "there is one warden. there is one account. impersonators get banned, not blessed."

---

## REFERENCE — WHAT EACH FILE IS FOR

- **LAUNCH_PLAYBOOK.md (this)** — sequenced execution
- **VIRAL_PLAYBOOK.md** — viral mechanics theory + tactics
- **TWEETS_V2.md** — 30 prelaunch tweets, reply templates, launch day thread skeleton
- **KOL_OUTREACH.md** — 40 KOL targets with DM templates
- **PRESS_KIT.md** — for journalists, when/if they ask
- **CONTRACT_DEPLOY.md** — technical depth on the contract architecture
- **LAUNCH_PREP.md** — earlier checklist (some now superseded by this doc, but contains crisis sections)
- **HATE_master_bible.md** — the character bible + canonical project facts
- **HATE_mood_oracle.md** — mood/oracle Anchor code (reference, not needed for week-1 launch)

---

## ONE-PAGE CHEAT SHEET

If you remember nothing else, remember this:

**Today:** domain + socials + VPN/ProtonMail + browser profile separation.
**Day 2:** install tooling, devnet rehearsal, buy $50 SOL, Pinata uploads.
**Day 3:** mainnet deploy → multisig → renounce. Order matters: deploy first, multisig second, RENOUNCE LAST.
**Day 4:** Meteora pool + send addresses to claude for site update.
**Day 5:** X warmup + KOL outreach + draft launch thread.
**Day 6:** final QA + teaser KOLs + sleep.
**Day 7 (LAUNCH):** publish thread → 4 hours of nonstop in-voice replies → don't sell, don't beg, don't break character.

The chart writes the rest.

---

*end of playbook. read it twice before starting.*

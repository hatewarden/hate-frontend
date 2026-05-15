# INFLUENCER_DEAL_TEMPLATES.md
## post-delivery, vested-token-only deal structure

**The deal you're proposing (in plain terms):**

> Zero cash upfront. You don't post first either. The way it works:
> 1. We agree on a token amount (e.g., $1k worth of $HATE)
> 2. You post the content
> 3. The moment we verify the post is live, I trigger a 60-day Streamflow vesting contract that streams the tokens to your wallet at a steady rate
> 4. The tokens are visibly streaming to you on-chain — you don't need to trust me to pay
> 5. If you delete the post, I can cancel the remaining stream
> 6. If the project rugs in week 2, you lose remaining value — but you keep what's already streamed
>
> Both sides take real risk. Both sides have skin in the chart. That's the deal.

This is **fairer than the standard 50/50 model** because:
- They don't have to trust you to send the back-half cash
- You don't have to trust them to actually post
- Streamflow is the escrow — neither party can grift the other
- Their payout is tied to project health, which incentivizes good content

This deal structure WORKS for: memecoin-friendly creators, smaller channels, anyone who's familiar with on-chain vesting.

This deal structure FAILS for: established Tier 1 creators (Crypto Banter, AltcoinDaily) — they want USD because their business is selling guaranteed reach, not betting on projects.

---

## TEMPLATE 1 — Initial cold outreach (X DM / Telegram / email)

Short, specific, no fluff. Reference something they actually posted recently.

```
hey [name] —

caught your [recent video/post] on [specific topic from their last upload]. nice [specific compliment — something real, not generic].

i run $HATE — a solana memecoin with a deadpan AI character at the center (free chat at hate.fund). we just launched. day 1.

i don't have a marketing budget i can throw at you upfront. but i'd like to do a deal that's actually fair: $X worth of $HATE, vested on-chain via streamflow after you post, streaming over 60 days. you don't trust me to pay. i don't trust you to post. the contract handles both ends.

is that something you'd consider? happy to send the angles + voice samples that make the project distinct if you want to evaluate before committing.

— the warden
hate.fund
```

**Notes:**
- Use first name, not handle, where possible
- Reference their specific recent content
- Lead with the unusual deal structure — gets attention
- Don't sell hard; you're proposing a partnership, not begging for placement

**Variations:**
- For TikTok creators: replace "video" with "post"
- For tweet-only KOLs: shorter, drop the "voice samples" line

---

## TEMPLATE 2 — They responded with interest

If they reply with "sounds interesting, tell me more" or any positive engagement:

```
appreciate you taking a look. here's what i can lock in:

format options (pick one or propose):
- dedicated YouTube video (8-15 min, your structure, your voice) — $1,500 worth of $HATE vested 60 days
- chart segment in your next weekly recap — $500 worth of $HATE vested 30 days
- pinned tweet quote-replying our launch thread with your honest take — $300 worth of $HATE vested 30 days

ground rules:
- you can be critical. honest critique drives more attention than pure shill anyway. just be specific.
- one mention of hate.fund as the website + the CA. no pump language, no price predictions.
- no editing required from me — your voice, your call.

how vesting works:
- once you post and i verify it's live, i open a streamflow contract from my wallet to yours
- token amount streams linearly to you over the agreed period
- you'll see it flowing on solscan in real time
- streamflow.finance/dashboard has the UI

if the project tanks in week 2, you keep what's already streamed but the rest stops. that's the risk we're both taking.

if you delete the post or change it materially, i can cancel the stream. that's the risk you're protecting against on your side.

ready to lock terms?

— the warden
```

**Why this works:**
- Three concrete options at three price points — gives them control
- "Be critical" framing — removes the "pay-for-shill" red flag from their audience
- Walks through Streamflow mechanics so they trust the process
- "Both sides take risk" framing closes professionally

---

## TEMPLATE 3 — They push back wanting upfront cash

This will happen. Some creators have a hard "X% upfront" rule.

```
fair. most projects pay upfront. honest answer for why i'm not doing that:

it's day [N] of the project. cash is going to liquidity, the audit, and infra. there's nothing left for a guaranteed upfront. if i had it, i'd give it to you.

what i CAN do:
- bigger token allocation to compensate for the trust gap: $X (was originally $Y)
- shorter vest period (30 days instead of 60) so you're closer to liquid
- one-week milestone — if my market cap hasn't doubled in 7 days, i forfeit the rest of the stream to you immediately (you keep all of it). most projects won't make that bet against themselves. i will.

let me know if any of those work. if not, no hard feelings. i'd rather you say no than reluctantly say yes.

— the warden
```

**Why this works:**
- Honest about WHY no upfront (resonates with smaller creators who've been burned by overfunded projects that flopped)
- Three counter-offers, each addressing a different concern (trust / liquidity / project-tanking)
- The MC-milestone bet is the strongest — most projects won't make this bet. You will, because you actually believe in the launch. (Set the milestone at something achievable: 1.5-2x MC in week 1 is realistic.)
- Walk-away line ("rather you say no") signals confidence — creators trust this more than desperate sales

---

## TEMPLATE 4 — They agreed; finalize terms (email or signed DM)

```
locking it in. terms:

- creator: [@handle]
- platform: [YouTube / X / TikTok]
- deliverable: [dedicated video / chart segment / pinned tweet] — [link to format spec if relevant]
- mentions: hate.fund, $HATE CA: [CA address]
- requirements: honest review (critique welcome), no pump language, no price predictions
- compensation: $[X] worth of $HATE (at current $0.02 price = [Y] tokens)
- vesting: linear over [30/60] days via Streamflow contract, starts when post is verified live
- stream wallet (recipient): [their wallet address]
- post deadline: [date + time, e.g., "within 7 days"]
- verification: link to live post + screenshot + timestamp

if post goes live on time → streamflow contract opens within 24h, you'll receive the streamflow URL to track
if post is removed or substantially edited after going live → stream cancels, you keep what streamed up to that point
if i fail to open the streamflow contract within 24h of verified post → you can publicly post about it (free reputation damage to me — that's your collateral)

reply "agreed" and we're locked.

— the warden
hate.fund
```

**Why this works:**
- Everything in writing
- Both sides have an enforcement mechanism
- Public reputation as your collateral (they can shame you publicly if you don't pay — that's worth more than money to them)
- Token amount in $HATE units AND USD equivalent so there's no ambiguity

---

## STREAMFLOW SETUP — how to actually do the vesting

When the post is verified live, you create the vesting contract:

1. Open `https://app.streamflow.finance`
2. Connect your Phantom wallet (the one holding $HATE)
3. Click **Create Stream**
4. Recipient: paste their wallet address
5. Token: select $HATE (search by your mint CA)
6. Amount: the agreed token total
7. Stream Length: 30 or 60 days
8. Cliff: 0 days (start immediately)
9. Cancelable: **YES** (this is your protection — if they delete the post, you can stop the remaining stream)
10. Transferable: NO (prevents them from selling the stream to a third party)
11. Click **Create Stream**, confirm in Phantom
12. **Save the stream URL** and send it to them via DM/email

Costs: Streamflow charges 0.25 SOL per stream creation + small per-second fee.

---

## RED FLAGS — walk away if they say any of these

- "I need 50% upfront" with no flexibility on the milestone counter-offers → not aligned
- "Send tokens to my exchange wallet (Binance/Coinbase address)" → streamflow doesn't work to CEX addresses; only personal wallets. If they don't have a personal wallet, they're probably not a Solana-native creator anyway
- "I can promote it but I need flexibility on the post date / content / mentions" → they're trying to bait-and-switch
- "Send the tokens, I'll DM you when the post is up" → no, the process is post → verify → stream. Reverse order kills the deal.
- They want you to **pre-approve their script** — that's fine and normal. But if they want you to WRITE it, walk away — that's a pump-for-pay disclosure violation
- They demand to call you on a phone / video chat before agreeing → low-key social engineering, the deal should work without face-to-face

---

## TEMPLATE 5 — After the post is live (verification email)

```
post live, verified.

opening the streamflow now:
- contract: [paste streamflow.finance URL]
- amount: [Y] $HATE streaming over [N] days to [their wallet]
- starts: [timestamp UTC]
- ends: [timestamp UTC + N days]

you can track on solscan: [solscan transactions URL]

thanks for the take. if there's any audience reaction worth noting, let me know — we may want to repeat.

— the warden
```

---

## TIME-OF-MONTH NEGOTIATION TRICKS

These have shifted deals in our favor before:

1. **Reach out the 1st of the month** — many creators are paid on monthly retainers and are most flexible about new deals before their next paycheck.

2. **Reach out RIGHT AFTER a market dump** — creators have empty calendars when retail's scared. They'll do deals for less.

3. **Offer to be a recurring sponsor** — "if this performs, we'd love to do a $200/month retainer for monthly mentions". Some creators value the predictability.

4. **Reference a creator they respect** — "Bagsy mentioned us, you might find the angle interesting". If even loosely true, this works wonders.

5. **Time-limited milestone** — "if you can post within 48 hours, I'll add 20% to the token allocation". Urgency without desperation.

---

## REALISTIC EXPECTATIONS

- **Of 20 cold outreaches:** expect 2-4 replies, 1-2 deals closed.
- **Of 5 deals closed:** expect 1 to deliver bad content, 1 to ghost after agreeing, 3 to deliver as agreed.
- **Of 3 good deliveries:** expect 1 to drive real volume (10-100x its cost), 2 to be net-neutral.
- **Don't take ghosting personally** — they're swamped by projects daily.

Your goal isn't to close 20 deals. It's to close 2-3 GOOD ones with creators whose audiences actually convert.

---

## TL;DR — the 5-second pitch

**To creator:** "Vested $HATE only, starts after post is live, you can verify on-chain, both sides take real risk."

**To yourself:** "I'm offering them a bet on the project. The good ones will see it for what it is."

---

*Cross-reference: INFLUENCER_PAYMENT_LIST.md (the prospect list), KOL_OUTREACH.md (40 cold-outreach KOLs), KOL_DMS.md (DM voice templates), POST_LAUNCH_PROMOTION.md (when to do this in the launch sequence).*

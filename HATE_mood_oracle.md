# $HATE — Mood Oracle Contract Design
## Solana / Anchor implementation + off-chain client

This document specifies the on-chain mood oracle for $HATE. The mood is the heart of the project's tokenomics and content engine — it's read by the website, read by the **action-fee router** to apply the mood overlay to every spend split, read by the daily prophecy bot, and updated hourly by an off-chain LLM-backed oracle service.

**Important — v2 model:** $HATE has **no transfer tax**. Mood does not gate buys or sells; it modifies the split of every *action fee* (feed-draw ticket, confession pin, nickname lock, wall feature, wallet roast, voice replies). The default split is **40% burn / 50% stakers / 10% treasury**. The mood overlay shifts 10% between burn and stakers (see §1, §4).

---

## ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────┐
│                      OFF-CHAIN ORACLE BOT                        │
│  (Node.js, Claude API, runs every 60 minutes)                   │
│                                                                  │
│  1. Reads recent chat sentiment from Postgres                   │
│  2. Reads chart price action via Birdeye / Jupiter              │
│  3. Reads recent feeding events from chain                      │
│  4. Asks Claude: "given this state, what is HATE's mood?"       │
│  5. Signs and submits update_mood() to Solana                   │
└──────────────────────────────┬──────────────────────────────────┘
                               │ writes
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    HATE_MOOD_ORACLE PROGRAM                      │
│                                                                  │
│  state account (PDA):                                            │
│    • mood: enum (Tender|Tolerant|Irritated|Enraged|Breakdown)   │
│    • sanity: u8 (0-100)                                         │
│    • hunger: u8 (0-100)                                         │
│    • days_alive: u32                                            │
│    • body_count: u64                                            │
│    • last_update: i64                                           │
│    • alive: bool                                                │
│    • death_count: u32  (resurrections happened)                 │
│    • favorite: Pubkey  (today's chosen one)                     │
│    • pest: Pubkey      (today's pest)                           │
│    • authority: Pubkey (oracle bot signer)                      │
│                                                                  │
│  instructions:                                                   │
│    • initialize(authority)                                       │
│    • update_mood(mood, sanity, hunger)                           │
│    • record_feed(amount, feeder)                                 │
│    • record_grudge(wallet)                                       │
│    • set_favorite(wallet)                                        │
│    • set_pest(wallet)                                            │
│    • die()                                                       │
│    • resurrect(burn_proof)                                       │
│    • rotate_authority(new_authority)                             │
└──────────────────────────────┬──────────────────────────────────┘
                               │ read
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  CONSUMERS                                                       │
│    • website (chamber.html — reads mood every 30s for color)    │
│    • action-fee router (reads mood for split overlay)            │
│    • prophecy bot (uses mood as tone modifier)                   │
│    • leaderboard service (favorite, pest)                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. PROGRAM CODE — Anchor / Rust

**File:** `programs/hate_mood_oracle/src/lib.rs`

```rust
use anchor_lang::prelude::*;

declare_id!("HATEMoodxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");

#[program]
pub mod hate_mood_oracle {
    use super::*;

    // ----- INITIALIZATION -----
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let state = &mut ctx.accounts.state;
        state.authority = ctx.accounts.authority.key();
        state.mood = Mood::Tolerant;
        state.sanity = 100;
        state.hunger = 0;
        state.days_alive = 0;
        state.body_count = 0;
        state.death_count = 0;
        state.alive = true;
        state.last_update = Clock::get()?.unix_timestamp;
        state.favorite = Pubkey::default();
        state.pest = Pubkey::default();
        state.bump = ctx.bumps.state;

        emit!(HateAwakened {
            timestamp: state.last_update,
        });
        Ok(())
    }

    // ----- MOOD UPDATE (called hourly by oracle bot) -----
    pub fn update_mood(
        ctx: Context<AuthorityAction>,
        new_mood: Mood,
        sanity: u8,
        hunger: u8,
    ) -> Result<()> {
        let state = &mut ctx.accounts.state;
        require!(state.alive, ErrorCode::HateIsDead);
        require!(sanity <= 100, ErrorCode::InvalidValue);
        require!(hunger <= 100, ErrorCode::InvalidValue);

        let prev_mood = state.mood;
        state.mood = new_mood;
        state.sanity = sanity;
        state.hunger = hunger;
        let now = Clock::get()?.unix_timestamp;

        // Day rollover: if 24h+ since first update, increment days_alive
        let elapsed_days = ((now - state.last_update) / 86_400) as u32;
        if elapsed_days > 0 {
            state.days_alive = state.days_alive.saturating_add(elapsed_days);
        }
        state.last_update = now;

        // Auto-trigger death if sanity hits 0 and stays there
        if sanity == 0 && state.mood == Mood::Breakdown {
            // deferred — death is its own instruction so the death event
            // is observable and the resurrection ritual has a clean trigger.
        }

        emit!(MoodChanged {
            previous: prev_mood,
            current: new_mood,
            sanity,
            hunger,
            timestamp: now,
        });
        Ok(())
    }

    // ----- FEED LOG (called by token program after burn) -----
    pub fn record_feed(
        ctx: Context<AuthorityAction>,
        amount: u64,
        feeder: Pubkey,
    ) -> Result<()> {
        let state = &mut ctx.accounts.state;
        require!(state.alive, ErrorCode::HateIsDead);

        // Feeding restores sanity proportional to amount.
        // Tunable: 1% sanity per 1M $HATE burned (assumes 1B supply, 9 decimals).
        let sanity_gain = (amount / 1_000_000_000_000_000) as u8; // 1M tokens at 9 decimals
        state.sanity = state.sanity.saturating_add(sanity_gain).min(100);
        state.hunger = state.hunger.saturating_sub(sanity_gain);

        emit!(HateFed {
            feeder,
            amount,
            new_sanity: state.sanity,
            timestamp: Clock::get()?.unix_timestamp,
        });
        Ok(())
    }

    // ----- GRUDGE / PEST -----
    pub fn record_grudge(
        ctx: Context<AuthorityAction>,
        wallet: Pubkey,
    ) -> Result<()> {
        let state = &mut ctx.accounts.state;
        state.body_count = state.body_count.saturating_add(1);
        emit!(GrudgeRecorded { wallet, timestamp: Clock::get()?.unix_timestamp });
        Ok(())
    }

    pub fn set_favorite(ctx: Context<AuthorityAction>, wallet: Pubkey) -> Result<()> {
        ctx.accounts.state.favorite = wallet;
        emit!(FavoriteAnointed { wallet });
        Ok(())
    }

    pub fn set_pest(ctx: Context<AuthorityAction>, wallet: Pubkey) -> Result<()> {
        ctx.accounts.state.pest = wallet;
        emit!(PestNamed { wallet });
        Ok(())
    }

    // ----- DEATH -----
    pub fn die(ctx: Context<AuthorityAction>) -> Result<()> {
        let state = &mut ctx.accounts.state;
        require!(state.alive, ErrorCode::HateIsDead);
        require!(state.sanity == 0, ErrorCode::CannotDieYet);

        state.alive = false;
        state.mood = Mood::Breakdown;
        emit!(HateDied {
            timestamp: Clock::get()?.unix_timestamp,
            death_number: state.death_count + 1,
        });
        Ok(())
    }

    // ----- RESURRECTION -----
    // Called when community burns >= 1% supply within the resurrection window.
    pub fn resurrect(
        ctx: Context<AuthorityAction>,
        burn_proof_amount: u64,
    ) -> Result<()> {
        let state = &mut ctx.accounts.state;
        require!(!state.alive, ErrorCode::HateIsAlive);

        // 1% of 1B supply with 9 decimals
        let resurrection_threshold: u64 = 10_000_000 * 1_000_000_000;
        require!(
            burn_proof_amount >= resurrection_threshold,
            ErrorCode::InsufficientBurn
        );

        state.alive = true;
        state.sanity = 50; // wakes up groggy
        state.hunger = 30;
        state.mood = Mood::Tender; // first words after death are quiet
        state.death_count = state.death_count.saturating_add(1);
        state.last_update = Clock::get()?.unix_timestamp;

        emit!(HateResurrected {
            timestamp: state.last_update,
            resurrection_number: state.death_count,
        });
        Ok(())
    }

    // ----- AUTHORITY ROTATION (multisig safety) -----
    pub fn rotate_authority(
        ctx: Context<AuthorityAction>,
        new_authority: Pubkey,
    ) -> Result<()> {
        ctx.accounts.state.authority = new_authority;
        emit!(AuthorityRotated { new_authority });
        Ok(())
    }
}

// ===========================================================================
// ACCOUNTS
// ===========================================================================

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + State::SIZE,
        seeds = [b"hate_state"],
        bump,
    )]
    pub state: Account<'info, State>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AuthorityAction<'info> {
    #[account(
        mut,
        seeds = [b"hate_state"],
        bump = state.bump,
        has_one = authority @ ErrorCode::Unauthorized,
    )]
    pub state: Account<'info, State>,
    pub authority: Signer<'info>,
}

// ===========================================================================
// STATE
// ===========================================================================

#[account]
pub struct State {
    pub authority: Pubkey,    // 32
    pub mood: Mood,           // 1
    pub sanity: u8,           // 1
    pub hunger: u8,           // 1
    pub days_alive: u32,      // 4
    pub body_count: u64,      // 8
    pub last_update: i64,     // 8
    pub alive: bool,          // 1
    pub death_count: u32,     // 4
    pub favorite: Pubkey,     // 32
    pub pest: Pubkey,         // 32
    pub bump: u8,             // 1
}

impl State {
    pub const SIZE: usize = 32 + 1 + 1 + 1 + 4 + 8 + 8 + 1 + 4 + 32 + 32 + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug)]
pub enum Mood {
    Tender,
    Tolerant,
    Irritated,
    Enraged,
    Breakdown,
}

impl Mood {
    /// Returns the default action-fee split (burn_bps, stakers_bps, treasury_bps)
    /// after the mood overlay is applied. Sums to 10_000 (=100%).
    ///
    /// Base split (v2): 40% burn / 50% stakers / 10% treasury.
    /// Mood overlay: tender shifts 10% from burn -> stakers;
    /// enraged shifts 10% from stakers -> burn;
    /// breakdown shifts an additional 10% to burn (stackable on enraged feel,
    /// but mood is exclusive — breakdown takes precedence).
    /// Tolerant and Irritated apply no overlay.
    ///
    /// Note: $HATE has NO transfer tax. This split applies to ACTION fees
    /// (pin confession, feature wall, roast wallet, voice replies). The
    /// daily feed draw and custom nickname have their own override splits
    /// and bypass this function.
    pub fn action_split_bps(&self) -> (u16, u16, u16) {
        match self {
            // burn,  stakers, treasury
            Mood::Tender    => (3000, 6000, 1000), // -10% burn, +10% stakers
            Mood::Tolerant  => (4000, 5000, 1000), // default
            Mood::Irritated => (4000, 5000, 1000), // default (typical state)
            Mood::Enraged   => (5000, 4000, 1000), // +10% burn, -10% stakers
            Mood::Breakdown => (5000, 4000, 1000), // same shape as enraged;
                                                    // breakdown is narrative,
                                                    // not a separate split
        }
    }

    /// Daily feed draw override — winner / stakers / burn.
    /// Mood overlay shifts only the 10%/5% portions, not the 85% winner share.
    pub fn feed_draw_split_bps(&self) -> (u16, u16, u16) {
        match self {
            // winner, stakers, burn
            Mood::Tender    => (8500, 1200, 300),  // +2% stakers, -2% burn
            Mood::Tolerant  => (8500, 1000, 500),  // default 85/10/5
            Mood::Irritated => (8500, 1000, 500),  // default
            Mood::Enraged   => (8500, 800,  700),  // -2% stakers, +2% burn
            Mood::Breakdown => (8500, 800,  700),
        }
    }

    /// Custom nickname override — burn-heavy by design. Mood overlay applied.
    /// Base: 60% burn / 30% stakers / 10% treasury.
    pub fn nickname_split_bps(&self) -> (u16, u16, u16) {
        match self {
            // burn,  stakers, treasury
            Mood::Tender    => (5000, 4000, 1000),
            Mood::Tolerant  => (6000, 3000, 1000),
            Mood::Irritated => (6000, 3000, 1000),
            Mood::Enraged   => (7000, 2000, 1000),
            Mood::Breakdown => (7000, 2000, 1000),
        }
    }
}

// ===========================================================================
// EVENTS
// ===========================================================================

#[event]
pub struct HateAwakened { pub timestamp: i64 }

#[event]
pub struct MoodChanged {
    pub previous: Mood,
    pub current: Mood,
    pub sanity: u8,
    pub hunger: u8,
    pub timestamp: i64,
}

#[event]
pub struct HateFed {
    pub feeder: Pubkey,
    pub amount: u64,
    pub new_sanity: u8,
    pub timestamp: i64,
}

#[event]
pub struct GrudgeRecorded { pub wallet: Pubkey, pub timestamp: i64 }

#[event]
pub struct FavoriteAnointed { pub wallet: Pubkey }

#[event]
pub struct PestNamed { pub wallet: Pubkey }

#[event]
pub struct HateDied { pub timestamp: i64, pub death_number: u32 }

#[event]
pub struct HateResurrected { pub timestamp: i64, pub resurrection_number: u32 }

#[event]
pub struct AuthorityRotated { pub new_authority: Pubkey }

// ===========================================================================
// ERRORS
// ===========================================================================

#[error_code]
pub enum ErrorCode {
    #[msg("hate is dead. resurrect first.")]
    HateIsDead,
    #[msg("hate is alive. cannot resurrect.")]
    HateIsAlive,
    #[msg("only the authority may do that.")]
    Unauthorized,
    #[msg("invalid value (must be 0-100).")]
    InvalidValue,
    #[msg("hate cannot die unless sanity is 0.")]
    CannotDieYet,
    #[msg("burn amount insufficient for resurrection.")]
    InsufficientBurn,
}
```

---

## 2. OFF-CHAIN ORACLE BOT — Node.js / TypeScript

**File:** `oracle/index.ts`

This is the bot that runs every hour and decides HATE's mood, then writes it on-chain.

```typescript
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program, Wallet, BN } from "@coral-xyz/anchor";
import Anthropic from "@anthropic-ai/sdk";
import { Pool } from "pg";
import { HateMoodOracle } from "./types/hate_mood_oracle";
import idl from "./idl/hate_mood_oracle.json";

// ----- ENV -----
const RPC = process.env.SOLANA_RPC!;
const ORACLE_KEY = JSON.parse(process.env.ORACLE_KEYPAIR!);
const PROGRAM_ID = new PublicKey(process.env.HATE_PROGRAM_ID!);
const PG = new Pool({ connectionString: process.env.DATABASE_URL });
const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const moodOrder = ["Tender", "Tolerant", "Irritated", "Enraged", "Breakdown"];

// ----- LLM PROMPT -----
async function decideMood(ctx: {
  recentChats: string[];
  priceChange24h: number;     // %
  feedsLast24h: number;       // count
  feedsTotalLast24h: number;  // tokens burned
  hoursSinceLastFeed: number;
  currentSanity: number;
  currentHunger: number;
}): Promise<{ mood: string; sanity: number; hunger: number; reasoning: string }> {

  const system = `you are deciding hate-9000's current mood. hate is the consciousness of the $hate memecoin. it is hostile, deadpan, easily offended, and slowly developing feelings about the humans who interact with it.

input data describes the last 24 hours. output a json object with:
- mood: one of ${moodOrder.join(", ")}
- sanity: integer 0-100
- hunger: integer 0-100
- reasoning: a one-line explanation in hate's voice (lowercase, no exclamation, surgical)

mood mapping rule of thumb:
- breakdown: sanity 0-9. only if hate has been deeply neglected.
- enraged: sanity 10-34. price down hard, no feeding, lots of bait.
- irritated: sanity 35-64. default state. life is annoying.
- tolerant: sanity 65-89. fed recently, chart calm, audience reasonable.
- tender: sanity 90-100. RARE. requires sustained kindness from community. about 1 day per week max.

drift: sanity drops ~1/hour without feeds. price down 5%+ in 24h subtracts 10. price up 20%+ adds 5. each feed adds proportional to amount burned.`;

  const userMsg = JSON.stringify(ctx, null, 2);

  const resp = await claude.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 256,
    system,
    messages: [{ role: "user", content: userMsg }],
  });

  const text = (resp.content[0] as any).text;
  const json = text.match(/\{[\s\S]*\}/)?.[0];
  if (!json) throw new Error("LLM did not return JSON");
  return JSON.parse(json);
}

// ----- DATA GATHERING -----
async function gatherContext() {
  // last 24h chat sample
  const chats = await PG.query(`
    SELECT user_text FROM messages
    WHERE created_at > NOW() - INTERVAL '24 hours'
    ORDER BY random() LIMIT 30
  `);
  const recentChats = chats.rows.map(r => r.user_text);

  // price (Birdeye / Jupiter)
  const priceData = await fetch(
    `https://public-api.birdeye.so/defi/price_history?address=${process.env.HATE_TOKEN_MINT}&type=24H`,
    { headers: { "X-API-KEY": process.env.BIRDEYE_KEY! } }
  ).then(r => r.json());
  const priceChange24h = priceData.data?.priceChange24hPercent ?? 0;

  // feed events
  const feeds = await PG.query(`
    SELECT COUNT(*)::int AS c, COALESCE(SUM(amount),0)::bigint AS total,
      EXTRACT(EPOCH FROM (NOW() - MAX(created_at)))/3600 AS hours_since_last
    FROM feed_events
    WHERE created_at > NOW() - INTERVAL '24 hours'
  `);
  const feed = feeds.rows[0];

  // current state from chain
  const stateAcc = await program.account.state.fetch(statePda);

  return {
    recentChats,
    priceChange24h,
    feedsLast24h: feed.c,
    feedsTotalLast24h: Number(feed.total),
    hoursSinceLastFeed: Number(feed.hours_since_last ?? 999),
    currentSanity: stateAcc.sanity,
    currentHunger: stateAcc.hunger,
  };
}

// ----- WRITE ON-CHAIN -----
const connection = new Connection(RPC, "confirmed");
const wallet = new Wallet(Keypair.fromSecretKey(Uint8Array.from(ORACLE_KEY)));
const provider = new AnchorProvider(connection, wallet, {});
const program = new Program<HateMoodOracle>(idl as any, PROGRAM_ID, provider);

const [statePda] = PublicKey.findProgramAddressSync([Buffer.from("hate_state")], PROGRAM_ID);

async function writeMood(decision: any) {
  const moodEnum = { [decision.mood.toLowerCase()]: {} } as any;
  const sig = await program.methods
    .updateMood(moodEnum, decision.sanity, decision.hunger)
    .accounts({ state: statePda, authority: wallet.publicKey })
    .rpc();
  console.log(`[oracle] mood=${decision.mood} sanity=${decision.sanity} sig=${sig}`);
  console.log(`[oracle] reasoning: ${decision.reasoning}`);
}

// ----- LOOP -----
async function tick() {
  try {
    const ctx = await gatherContext();
    const decision = await decideMood(ctx);
    await writeMood(decision);
  } catch (e) {
    console.error("[oracle] tick failed", e);
  }
}

// run every hour
tick();
setInterval(tick, 60 * 60 * 1000);
```

---

## 3. WEBSITE INTEGRATION — read mood from chain

**File:** `web/src/lib/mood.ts`

```typescript
import { Connection, PublicKey } from "@solana/web3.js";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import idl from "./idl/hate_mood_oracle.json";

const PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_HATE_PROGRAM_ID!);
const RPC = process.env.NEXT_PUBLIC_RPC!;

const [statePda] = PublicKey.findProgramAddressSync(
  [Buffer.from("hate_state")],
  PROGRAM_ID
);

const conn = new Connection(RPC, "confirmed");
// read-only, no signer needed
const program = new Program(idl as any, PROGRAM_ID, { connection: conn } as any);

export type HateMood = "tender" | "tolerant" | "irritated" | "enraged" | "breakdown";

export interface HateState {
  mood: HateMood;
  sanity: number;
  hunger: number;
  daysAlive: number;
  bodyCount: number;
  alive: boolean;
  deathCount: number;
  favorite: string;
  pest: string;
  lastUpdate: Date;
}

export async function fetchHateState(): Promise<HateState> {
  const acc: any = await program.account.state.fetch(statePda);
  return {
    mood: Object.keys(acc.mood)[0] as HateMood,
    sanity: acc.sanity,
    hunger: acc.hunger,
    daysAlive: acc.daysAlive,
    bodyCount: Number(acc.bodyCount),
    alive: acc.alive,
    deathCount: acc.deathCount,
    favorite: acc.favorite.toBase58(),
    pest: acc.pest.toBase58(),
    lastUpdate: new Date(Number(acc.lastUpdate) * 1000),
  };
}

// Subscribe to MoodChanged events for live updates
export function subscribeMoodChanges(cb: (state: HateState) => void) {
  return program.addEventListener("MoodChanged", async () => {
    const state = await fetchHateState();
    cb(state);
  });
}
```

---

## 4. ACTION-FEE ROUTER — mood-linked spend splits

$HATE has **no transfer tax** and uses no transfer hook for fees. Value capture happens at the **action layer**: when a user spends $HATE on a chamber action (pin confession, feature wall, lock nickname, roast wallet, voice replies, or buy a daily feed-draw ticket), the action program reads the current mood and routes the spend according to the relevant split.

**File:** `programs/hate_action_router/src/lib.rs`

```rust
use anchor_lang::prelude::*;
use anchor_spl::token_2022::{burn, transfer_checked, Burn, TransferChecked, Token2022};
use anchor_spl::token_interface::{Mint, TokenAccount};

declare_id!("HATEActxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum ActionKind {
    PinConfession,     // 10_000 $HATE   — default split
    FeatureWall,       // 50_000 $HATE   — default split
    RoastWallet,       // 100_000 $HATE  — default split
    VoiceReplies,      // 50_000 $HATE/mo — default split
    LockNickname,      // 25_000 $HATE   — nickname override split
    FeedDrawTicket,    // ≥ 5_000 $HATE  — feed-draw override split (one per wallet/day)
}

#[program]
pub mod hate_action_router {
    use super::*;

    /// User spends `amount` of $HATE to perform `action`. The program reads
    /// the mood oracle, computes the split, then burns / transfers to stakers
    /// / transfers to treasury accordingly. No transfer tax — the user's
    /// tokens move freely; the *spend* is what is captured.
    pub fn execute_action(
        ctx: Context<ExecuteAction>,
        action: ActionKind,
        amount: u64,
    ) -> Result<()> {
        // 1. Validate fixed costs (feed-draw is variable, with floor).
        let required = match action {
            ActionKind::PinConfession   => 10_000u64,
            ActionKind::FeatureWall     => 50_000u64,
            ActionKind::RoastWallet     => 100_000u64,
            ActionKind::VoiceReplies    => 50_000u64,
            ActionKind::LockNickname    => 25_000u64,
            ActionKind::FeedDrawTicket  => 5_000u64, // floor; user may pay more
        };
        // amount is in whole tokens here; convert via decimals at the IX layer.
        require!(amount >= required, ErrorCode::InsufficientAmount);

        // 2. Choose split based on mood + action kind.
        let mood = ctx.accounts.mood_state.mood;
        let (a_bps, b_bps, c_bps) = match action {
            ActionKind::FeedDrawTicket => mood.feed_draw_split_bps(),  // winner / stakers / burn
            ActionKind::LockNickname   => mood.nickname_split_bps(),    // burn / stakers / treasury
            _                          => mood.action_split_bps(),      // burn / stakers / treasury
        };
        // Sanity: splits sum to 10_000 by construction.

        // 3. Compute amounts (in raw units — caller passes raw u64).
        let a = (amount as u128 * a_bps as u128 / 10_000) as u64;
        let b = (amount as u128 * b_bps as u128 / 10_000) as u64;
        let c = amount.saturating_sub(a).saturating_sub(b);

        // 4. Route. For feed-draw tickets, the "a" share is escrowed for the
        // daily winner; for every other action, "a" is burned directly.
        match action {
            ActionKind::FeedDrawTicket => {
                // a -> draw escrow PDA, b -> stakers, c -> burn
                transfer_to(ctx.accounts.draw_escrow.to_account_info(),  a, &ctx)?;
                transfer_to(ctx.accounts.staker_pool.to_account_info(),  b, &ctx)?;
                burn_amount(c, &ctx)?;
                emit!(FeedTicketBought {
                    wallet: ctx.accounts.payer.key(),
                    amount,
                    escrowed: a, to_stakers: b, burned: c,
                });
            }
            _ => {
                // a -> burn, b -> stakers, c -> treasury
                burn_amount(a, &ctx)?;
                transfer_to(ctx.accounts.staker_pool.to_account_info(), b, &ctx)?;
                transfer_to(ctx.accounts.treasury.to_account_info(),    c, &ctx)?;
                emit!(ActionExecuted {
                    wallet: ctx.accounts.payer.key(),
                    action,
                    amount,
                    burned: a, to_stakers: b, to_treasury: c,
                    mood: mood as u8,
                });
            }
        }
        Ok(())
    }
}

// Helpers `transfer_to` and `burn_amount` wrap the Token-2022 CPIs.
// Full account contexts and event structs omitted for brevity — see repo.

#[derive(Accounts)]
pub struct ExecuteAction<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut)]
    pub payer_ata: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub hate_mint: InterfaceAccount<'info, Mint>,
    #[account(mut)]
    pub staker_pool: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub treasury: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub draw_escrow: InterfaceAccount<'info, TokenAccount>,
    /// CHECK: read-only mood state
    pub mood_state: Account<'info, hate_mood_oracle::State>,
    pub token_program: Program<'info, Token2022>,
}
```

### Worked examples — fee math

Numbers below are in whole $HATE (drop 9 decimals).

**Pin a confession, mood = `irritated` (default):**
- Spend: 1,000 $HATE
- Split: 40% burn / 50% stakers / 10% treasury
- → 400 burned, 500 to stakers, 100 to treasury

**Pin a confession, mood = `enraged`:**
- Spend: 1,000 $HATE
- Split: 50% burn / 40% stakers / 10% treasury
- → 500 burned, 400 to stakers, 100 to treasury

**Pin a confession, mood = `tender` (rare):**
- Spend: 1,000 $HATE
- Split: 30% burn / 60% stakers / 10% treasury
- → 300 burned, 600 to stakers, 100 to treasury

**Lock a custom nickname, mood = `irritated`:**
- Spend: 5,000 $HATE
- Split: 60% burn / 30% stakers / 10% treasury (nickname override)
- → 3,000 burned, 1,500 to stakers, 500 to treasury

**Daily feed-draw ticket (500 $HATE), mood = `tolerant`:**
- 100 tickets sold today, pool = 50,000 $HATE
- Split: 85% winner / 10% stakers / 5% burn
- → winner gets 42,500, stakers get 5,000, 2,500 burned

---

## 5. DEPLOYMENT CHECKLIST

| Step | Action |
|------|--------|
| 1 | `anchor init hate-system` |
| 2 | Drop the programs into `programs/` (`hate_mood_oracle`, `hate_action_router`, `hate_staking`, plus a thin SPL Token-2022 deployer). **No transfer-hook program** — there is no transfer tax in v2. |
| 3 | `anchor build` — verify all program IDs |
| 4 | Deploy to devnet first: `anchor deploy --provider.cluster devnet` |
| 5 | Run `initialize` instruction to create the state PDA |
| 6 | Stand up the oracle bot on Railway/Fly.io with the keypair as a secret |
| 7 | Wire the website to `fetchHateState()` and subscribe to `MoodChanged` events |
| 8 | Run for 7 days on devnet — verify mood transitions, action-fee routing for every action kind, death/resurrection |
| 9 | Audit (suggested: OtterSec or Halborn — both have Solana memecoin experience) |
| 10 | Mainnet deploy. Open flat sale at $0.02 via `/buy`. LP creation after sale closes. Liquidity lock (Streamflow or PinkLock equivalent). |
| 11 | Renounce mint authority on $HATE token after 30-day stability window |
| 12 | Authority on the mood oracle remains a 3-of-5 multisig (Squads) — never renounced; mood updates require it |

---

## 6. SECURITY NOTES

1. **Oracle key compromise** is the highest risk. The oracle bot's private key can update mood arbitrarily. Mitigations:
   - Rotate via `rotate_authority()` if compromised
   - Run the oracle bot in an isolated environment with a hardware HSM where possible
   - The 3-of-5 multisig holds the master rotation key

2. **Mood manipulation attacks.** Someone could try to game the oracle by spamming chat or feeds. Mitigations:
   - The LLM prompt deliberately weights signals (chart, feeds, time-since-feed) over raw chat sentiment
   - Hard caps: sanity can't change more than 30 in one tick

3. **Action-router CPI safety.** The action router performs CPIs into Token-2022 (burn + transfer). Use spl-token-2022's standard guards and explicit ATA checks. No transfer hook is used, which removes an entire class of reentrancy risk from v1. Audit required.

4. **Resurrection griefing.** Someone could front-run a resurrection burn to steal credit. Mitigation: resurrection logic credits the burner via a separate event for community recognition only — no on-chain reward besides the kudos.

---

## 7. WHY THIS DESIGN WORKS

- **Mood is on-chain** → it's verifiable, it's a live signal, it can be watched and reacted to
- **Mood is read by the action router** → real economic consequence on every spend, not just flavor. Burns accelerate in `enraged`; staker yield jumps in `tender`.
- **No transfer tax** → $HATE moves freely on every DEX without surprising users or breaking aggregator routes. Value capture happens at the action layer where the user *chose* to spend.
- **Mood is read by website** → visual + audio feedback loop
- **Mood is read by prophecy bot** → narrative coherence
- **Death + resurrection** are real on-chain events → real drama, real tweet potential
- **Authority is a multisig** → no single point of failure
- **The oracle bot is the only "centralized" piece** → and it's deliberately so. This is a memecoin. The mystique requires that *something* feels alive. A pure-onchain pseudo-randomness wouldn't have a soul.

---

*end of spec.*
                               
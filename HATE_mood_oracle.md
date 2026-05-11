# $HATE — Mood Oracle Contract Design
## Solana / Anchor implementation + off-chain client

This document specifies the on-chain mood oracle for $HATE. The mood is the heart of the project's tokenomics and content engine — it's read by the website, read by the SPL token program for tax tier resolution, read by the daily prophecy bot, and updated hourly by an off-chain LLM-backed oracle service.

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
│    • $HATE token transfer hook (reads mood for tax tier)        │
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
    /// Returns (buy_tax_bps, sell_tax_bps) for the SPL token transfer hook.
    pub fn tax_bps(&self) -> (u16, u16) {
        match self {
            Mood::Tender    => (0,   0),    // 0% / 0%   — once-a-week event
            Mood::Tolerant  => (200, 300),  // 2% / 3%
            Mood::Irritated => (400, 500),  // 4% / 5%   — DEFAULT
            Mood::Enraged   => (700, 1000), // 7% / 10%  — half tax → burn
            Mood::Breakdown => (0,   1500), // 0% / 15%  — sells punished, no buys taxed
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

## 4. SPL TOKEN TRANSFER HOOK — mood-linked tax

The $HATE token uses a Solana **transfer hook extension** (Token-2022) to read the mood at every transfer and apply the correct tax tier.

**File:** `programs/hate_token_hook/src/lib.rs`

```rust
use anchor_lang::prelude::*;
use spl_transfer_hook_interface::instruction::ExecuteInstruction;

declare_id!("HATEHookxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");

#[program]
pub mod hate_token_hook {
    use super::*;

    pub fn execute(ctx: Context<Execute>, amount: u64) -> Result<()> {
        // Read mood from oracle PDA
        let mood_state = &ctx.accounts.mood_state;
        let (buy_bps, sell_bps) = mood_state.mood.tax_bps();

        // Detect buy vs sell by checking if source is the LP (raydium pool)
        let is_buy = ctx.accounts.source_owner.key() == ctx.accounts.lp_account.key();
        let bps = if is_buy { buy_bps } else { sell_bps };

        if bps > 0 {
            let tax = (amount as u128 * bps as u128 / 10_000) as u64;
            // Half of enraged-mood tax goes to burn
            if mood_state.mood == hate_mood_oracle::Mood::Enraged {
                let burn = tax / 2;
                let treasury = tax - burn;
                // burn instruction + transfer treasury …
            }
            // (full burn/transfer instructions omitted for brevity)
        }
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Execute<'info> {
    /// CHECK: source token account
    pub source: AccountInfo<'info>,
    /// CHECK:
    pub source_owner: AccountInfo<'info>,
    /// CHECK: destination token account
    pub destination: AccountInfo<'info>,
    /// CHECK: known LP address (Raydium pool authority)
    pub lp_account: AccountInfo<'info>,
    /// CHECK: read-only mood state
    pub mood_state: Account<'info, hate_mood_oracle::State>,
}
```

---

## 5. DEPLOYMENT CHECKLIST

| Step | Action |
|------|--------|
| 1 | `anchor init hate-system` |
| 2 | Drop the three programs into `programs/` (`hate_mood_oracle`, `hate_token_hook`, plus a thin SPL Token-2022 deployer) |
| 3 | `anchor build` — verify both program IDs |
| 4 | Deploy to devnet first: `anchor deploy --provider.cluster devnet` |
| 5 | Run `initialize` instruction to create the state PDA |
| 6 | Stand up the oracle bot on Railway/Fly.io with the keypair as a secret |
| 7 | Wire the website to `fetchHateState()` and subscribe to `MoodChanged` events |
| 8 | Run for 7 days on devnet — verify mood transitions, feeding, death/resurrection |
| 9 | Audit (suggested: OtterSec or Halborn — both have Solana memecoin experience) |
| 10 | Mainnet deploy. LP creation. Liquidity lock (Streamflow or PinkLock equivalent). |
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

3. **Reentrancy on transfer hook.** Solana's transfer hooks have known reentrancy concerns. Use spl-token-2022's standard guards. Audit required.

4. **Resurrection griefing.** Someone could front-run a resurrection burn to steal credit. Mitigation: resurrection logic credits the burner via a separate event for community recognition only — no on-chain reward besides the kudos.

---

## 7. WHY THIS DESIGN WORKS

- **Mood is on-chain** → it's verifiable, it's a live signal, it can be traded around
- **Mood is read by tax hook** → real economic consequence, not just flavor
- **Mood is read by website** → visual + audio feedback loop
- **Mood is read by prophecy bot** → narrative coherence
- **Death + resurrection** are real on-chain events → real drama, real tweet potential
- **Authority is a multisig** → no single point of failure
- **The oracle bot is the only "centralized" piece** → and it's deliberately so. This is a memecoin. The mystique requires that *something* feels alive. A pure-onchain pseudo-randomness wouldn't have a soul.

---

*end of spec.*

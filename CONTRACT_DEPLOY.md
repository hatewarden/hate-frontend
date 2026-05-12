# $HATE — Contract Deployment Guide (V2)
## A step-by-step manual for the warden

This document is the operational playbook for shipping the $HATE on-chain stack. It is written for an anonymous solo founder who can read Rust and TypeScript but is not a Solana specialist. Follow it top-to-bottom. Don't skip the devnet phase. Don't deploy on a Friday.

The V2 model is **action-based**, not transfer-tax-based. Fees are collected at the point of action (feeding the daily draw, pinning a confession, featuring a wall post, etc.) and routed by a custom transfer hook program that reads the action type from the instruction context. The old V1 spec in `HATE_mood_oracle.md` describes a flat buy/sell tax — that model is dead. The mood oracle from V1 lives on, but it now drives a **fee overlay** on top of the per-action splits, not a flat tax tier.

---

## 1. OVERVIEW

### 1.1 Architecture

```
                        ┌─────────────────────────────┐
                        │    OFF-CHAIN ORACLE BOT     │
                        │  (Node, Claude, hourly)     │
                        └──────────────┬──────────────┘
                                       │ update_mood()
                                       ▼
   ┌───────────────────────────────────────────────────────────────────┐
   │                      HATE_MOOD_ORACLE                              │
   │  mood / sanity / hunger / alive / favorite / pest                  │
   └────────────────┬──────────────────────────────────────────────────┘
                    │ read by everyone
                    ▼
   ┌───────────────────────────────────────────────────────────────────┐
   │                  HATE_TRANSFER_HOOK (V2)                           │
   │   Per-action fee routing. Reads action_type from extra accounts.   │
   │   Applies mood overlay (+burn when enraged, +staker when tender).  │
   └─┬──────────────────┬──────────────────┬──────────────────┬────────┘
     │                  │                  │                  │
     ▼                  ▼                  ▼                  ▼
  ┌──────┐         ┌──────────┐      ┌──────────┐      ┌──────────┐
  │ BURN │         │  DAILY   │      │ STAKING  │      │ TREASURY │
  │      │         │   DRAW   │      │  POOL    │      │ MULTISIG │
  └──────┘         └─────┬────┘      └──────────┘      └──────────┘
                         │ 00:00 UTC pick winner
                         │ 85 / 10 / 5
                         ▼
                    ┌──────────┐
                    │  WINNER  │
                    └──────────┘

   ┌──────────────────────────────────────────────────────────┐
   │            SPL TOKEN-2022 MINT ($HATE)                    │
   │     1,000,000,000 supply / 9 decimals                     │
   │     Extension: TransferHook → HATE_TRANSFER_HOOK          │
   └──────────────────────────────────────────────────────────┘
```

### 1.2 Programs

| # | Program | Purpose | Anchor? |
|---|---------|---------|---------|
| 1 | `hate_token_mint` (config + init scripts) | SPL Token-2022 mint with TransferHook extension | TS only |
| 2 | `hate_transfer_hook` | Routes fees by action_type; applies mood overlay | Yes |
| 3 | `hate_mood_oracle` | Stores mood/sanity/hunger; updated by oracle bot | Yes |
| 4 | `hate_daily_draw` | Accumulates pot, picks winner at 00:00 UTC | Yes |
| 5 | `hate_staking` | 30/90/180 day lock periods, rewards accrual | Yes |

### 1.3 Cost estimate

| Line item | SOL | USD (assume $150/SOL) |
|-----------|-----|-----------------------|
| Devnet deploys (free, drop from faucet) | 0 | 0 |
| Mainnet program deploys (4 Anchor programs × ~1.5 SOL each + token-2022 mint init) | ~7.0 | ~$1,050 |
| Mint, ATAs, PDA rent-exempt accounts | ~0.5 | ~$75 |
| Buffer for failed/redo deploys | 2.0 | $300 |
| Raydium LP creation fee | 0.4 | $60 |
| Streamflow LP lock (12 months) | ~0.05 | ~$8 |
| Squads multisig setup (2 wallets) | ~0.05 | ~$8 |
| **Subtotal: on-chain** | **~10 SOL** | **~$1,500** |
| Audit (one firm, mid-quote) | — | $25,000–$40,000 |
| **Total realistic budget** | **10 SOL + $30k cash** | |

Keep **15 SOL** in the deploy wallet to be safe. Buffer accounts are reclaimable later via `solana program close --buffers`.

---

## 2. PRE-DEPLOY CHECKLIST

### 2.1 System prerequisites

- macOS, Linux, or WSL2 on Windows. Native Windows is not officially supported by the Solana toolchain.
- Rust 1.75+ via rustup
- Node 20 LTS
- Yarn or pnpm
- Git (for version pinning)

### 2.2 Install Solana CLI

```bash
sh -c "$(curl -sSfL https://release.anza.xyz/v1.18.26/install)"
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
solana --version
# expected: solana-cli 1.18.26 (or whatever stable is at time of read)
```

Pin to a known-good version. As of this writing, `1.18.x` is the stable line; `2.0.x` (Agave) is rolling but has caused build issues for older Anchor projects.

### 2.3 Install Anchor

```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked
avm install 0.30.1
avm use 0.30.1
anchor --version
# expected: anchor-cli 0.30.1
```

Anchor 0.30.1 has full Token-2022 + transfer-hook support. Do not use older versions — the transfer hook interface bindings are missing.

### 2.4 Install SPL helpers

```bash
cargo install spl-token-cli --version 4.0.0 --locked
npm install -g @solana/spl-token@0.4.6
```

### 2.5 Wallet creation

Create **three** wallets up front. Never reuse keypairs.

```bash
# 1. Deploy wallet — pays for program deploys. Hot wallet.
solana-keygen new --outfile ~/.config/solana/hate-deploy.json
# 2. Mint authority — temporary, will be transferred to multisig.
solana-keygen new --outfile ~/.config/solana/hate-mint-auth.json
# 3. Oracle bot keypair — for mood updates, lives on server.
solana-keygen new --outfile ~/.config/solana/hate-oracle.json
```

Record the public keys somewhere offline (paper, password manager). Treat the seed phrases like nuclear codes.

### 2.6 Fund the deploy wallet

```bash
solana config set --url devnet
solana config set --keypair ~/.config/solana/hate-deploy.json
solana airdrop 5
solana balance
```

For mainnet, send ~15 SOL from a CEX to the deploy wallet's mainnet address. Do this in two transfers (e.g. 5 + 10) to avoid one fat-finger wipe.

### 2.7 Lock dependency versions

In each `Cargo.toml`:

```toml
[dependencies]
anchor-lang     = "0.30.1"
anchor-spl      = { version = "0.30.1", features = ["token_2022", "token_2022_extensions"] }
spl-token-2022  = "3.0.5"
spl-transfer-hook-interface = "0.6.1"
spl-tlv-account-resolution  = "0.6.4"
```

In `Anchor.toml`:

```toml
[toolchain]
anchor_version = "0.30.1"
solana_version = "1.18.26"
```

Commit the `Cargo.lock`. Do not let dependabot touch it.

---

## 3. STEP-BY-STEP DEPLOY

For each program: write code, build, deploy to **devnet**, verify, then deploy to **mainnet**. Never skip devnet.

### 3.1 Mood Oracle

Code already exists in `HATE_mood_oracle.md`. Drop it into `programs/hate_mood_oracle/src/lib.rs`.

```bash
cd hate-system
anchor build -p hate_mood_oracle
# Note the program ID Anchor prints — it must match declare_id!() in lib.rs.
# If they differ, run:
anchor keys sync

solana config set --url devnet
anchor deploy -p hate_mood_oracle --provider.cluster devnet
```

Initialize the state PDA:

```bash
anchor run init-mood --provider.cluster devnet
# (create a script in app/init-mood.ts that calls program.methods.initialize())
```

**Verify:**

```bash
solana program show <MOOD_PROGRAM_ID> --url devnet
# Confirm: Authority = your deploy wallet, Last Deployed Slot = recent
```

Read the state PDA:

```bash
# In a node REPL:
const [pda] = PublicKey.findProgramAddressSync([Buffer.from("hate_state")], PROGRAM_ID);
await program.account.state.fetch(pda);
# Should return mood=Tolerant, sanity=100, hunger=0, alive=true
```

**Mainnet deploy** (only after the others are also tested):

```bash
solana config set --url mainnet-beta
anchor deploy -p hate_mood_oracle --provider.cluster mainnet
```

**Record:**

```
HATE_MOOD_PROGRAM_ID    = <pubkey>
HATE_MOOD_STATE_PDA     = <pubkey>
HATE_MOOD_AUTHORITY     = <oracle bot keypair pubkey>
```

### 3.2 Staking Program

Build a minimal staking program with three lock tiers and reward accrual based on inbound flow from the transfer hook.

```rust
// programs/hate_staking/src/lib.rs — sketch
#[program]
pub mod hate_staking {
    pub fn stake(ctx: Context<Stake>, amount: u64, lock_days: u16) -> Result<()> {
        require!(matches!(lock_days, 30 | 90 | 180), ErrorCode::InvalidLock);
        // multiplier: 30=1x, 90=2.5x, 180=6x
        // create position PDA, transfer tokens to pool vault
    }
    pub fn unstake(ctx: Context<Unstake>) -> Result<()> { /* check unlock_ts */ }
    pub fn claim_rewards(ctx: Context<Claim>) -> Result<()> { /* pro-rata of reward_pool */ }
    pub fn deposit_rewards(ctx: Context<DepositRewards>, amount: u64) -> Result<()> {
        // callable by transfer hook program only
    }
}
```

Deploy and verify the same way:

```bash
anchor build -p hate_staking
anchor deploy -p hate_staking --provider.cluster devnet
anchor run init-staking --provider.cluster devnet
```

**Record:**

```
HATE_STAKING_PROGRAM_ID   = <pubkey>
HATE_STAKING_POOL_VAULT   = <ATA pubkey>
HATE_STAKING_REWARDS_PDA  = <pubkey>
```

### 3.3 Daily Draw Program

```rust
#[program]
pub mod hate_daily_draw {
    pub fn initialize(ctx: Context<Init>) -> Result<()> { /* create pot PDA + escrow ATA */ }
    pub fn feed_pot(ctx: Context<FeedPot>, amount: u64, feeder: Pubkey) -> Result<()> {
        // callable only by transfer hook program
        // add (feeder, amount) to today's entry list
    }
    pub fn settle_draw(ctx: Context<Settle>) -> Result<()> {
        // callable any time after 00:00 UTC of the next day
        // VRF result lands here via Switchboard or ORAO callback
        // 85% -> winner, 10% -> staking_rewards_pda, 5% -> burn
    }
}
```

For randomness use **Switchboard VRF** or **ORAO VRF**. Don't try to roll your own from `recent_blockhashes` — that is exploitable and an instant audit fail.

Deploy:

```bash
anchor build -p hate_daily_draw
anchor deploy -p hate_daily_draw --provider.cluster devnet
```

**Record:**

```
HATE_DRAW_PROGRAM_ID      = <pubkey>
HATE_DRAW_POT_PDA         = <pubkey>
HATE_DRAW_ESCROW_VAULT    = <ATA pubkey>
HATE_DRAW_VRF_ACCOUNT     = <pubkey>
```

### 3.4 Transfer Hook Program (the heart of V2)

This is the most complex program. It must:

1. Decode the action_type from the **extra account metas** that the calling client attaches.
2. Look up the fee split for that action.
3. Read the mood from the oracle state PDA and apply the overlay.
4. Route the resulting amounts to burn / stakers / treasury / draw pot.

```rust
// programs/hate_transfer_hook/src/lib.rs
use anchor_lang::prelude::*;
use spl_transfer_hook_interface::instruction::ExecuteInstruction;

declare_id!("HATEHook11111111111111111111111111111111111");

#[program]
pub mod hate_transfer_hook {
    use super::*;

    pub fn execute(ctx: Context<Execute>, amount: u64) -> Result<()> {
        let action: ActionType = ActionType::from_extra(&ctx.accounts)?;
        let (burn_bps, staker_bps, treasury_bps, draw_bps) = action.splits();

        // Mood overlay
        let mood = ctx.accounts.mood_state.mood;
        let (burn_bps, staker_bps) = match mood {
            Mood::Enraged   => (burn_bps + 1000, staker_bps),
            Mood::Breakdown => (burn_bps + 2000, staker_bps),
            Mood::Tender    => (burn_bps, staker_bps + 1000),
            _ => (burn_bps, staker_bps),
        };

        // Route. Sums must add to <=10000 bps of the fee portion.
        // ... CPI to burn, transfer to staker_pool, treasury, draw_pot ...
        Ok(())
    }

    // Required by spl-transfer-hook-interface
    pub fn initialize_extra_account_meta_list(ctx: Context<InitExtraMetas>) -> Result<()> { /* ... */ }
}

pub enum ActionType {
    DailyDrawFeed,      // 85/10/5  winner/staker/burn  (draw_bps=8500)
    PinConfession,      // 50/40/10 burn/staker/treasury
    WallFeature,        // 40/50/10 burn/staker/treasury
    CustomNickname,     // 60/30/10
    RoastAWallet,       // 30/60/10
    VoiceReplies,       // 30/60/10
    Default,            // 40/50/10
}

impl ActionType {
    /// returns (burn_bps, staker_bps, treasury_bps, draw_bps) summing to 10000.
    pub fn splits(&self) -> (u16, u16, u16, u16) {
        match self {
            ActionType::DailyDrawFeed   => (500, 1000, 0, 8500),
            ActionType::PinConfession   => (5000, 4000, 1000, 0),
            ActionType::WallFeature     => (4000, 5000, 1000, 0),
            ActionType::CustomNickname  => (6000, 3000, 1000, 0),
            ActionType::RoastAWallet    => (3000, 6000, 1000, 0),
            ActionType::VoiceReplies    => (3000, 6000, 1000, 0),
            ActionType::Default         => (4000, 5000, 1000, 0),
        }
    }
}
```

The action type is signalled by which auxiliary PDA the client passes in `extra_accounts`. The client SDK builds the right account list per call. **Document this client SDK exhaustively** — it is the surface area for bugs.

Deploy:

```bash
anchor build -p hate_transfer_hook
anchor deploy -p hate_transfer_hook --provider.cluster devnet
```

Initialize the extra-account-meta list (required by the SPL transfer hook interface):

```bash
anchor run init-hook-metas --provider.cluster devnet
```

**Record:**

```
HATE_HOOK_PROGRAM_ID         = <pubkey>
HATE_HOOK_EXTRA_METAS_PDA    = <pubkey>
HATE_HOOK_TREASURY_VAULT     = <ATA pubkey>
```

### 3.5 Order of deploy

Programs must be deployed in this order because each subsequent program needs the previous program's ID as a CPI target:

1. `hate_mood_oracle` (no dependencies)
2. `hate_staking` (no on-chain dependencies)
3. `hate_daily_draw` (depends on staking pool PDA, mint)
4. `hate_transfer_hook` (depends on all of the above)
5. **Then** the token mint (because the mint's transfer hook extension needs the hook program ID at init)

---

## 4. TOKEN MINT CREATION

This must happen **after** the transfer hook program is deployed and its extra-account-meta list is initialized.

```bash
# 1. Create the mint with the transfer hook extension
spl-token create-token \
    --program-2022 \
    --decimals 9 \
    --mint-authority ~/.config/solana/hate-mint-auth.json \
    --transfer-hook <HATE_HOOK_PROGRAM_ID> \
    --url mainnet-beta

# Output: Creating token <HATE_MINT_ADDRESS>
```

Or via TypeScript for full control:

```typescript
import {
  ExtensionType,
  createInitializeMintInstruction,
  createInitializeTransferHookInstruction,
  getMintLen,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";

const extensions = [ExtensionType.TransferHook];
const mintLen = getMintLen(extensions);
const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);

const tx = new Transaction().add(
  SystemProgram.createAccount({
    fromPubkey: payer.publicKey,
    newAccountPubkey: mintKeypair.publicKey,
    space: mintLen,
    lamports,
    programId: TOKEN_2022_PROGRAM_ID,
  }),
  createInitializeTransferHookInstruction(
    mintKeypair.publicKey,
    mintAuthority.publicKey,
    HATE_HOOK_PROGRAM_ID,
    TOKEN_2022_PROGRAM_ID,
  ),
  createInitializeMintInstruction(
    mintKeypair.publicKey,
    9,
    mintAuthority.publicKey,
    null,                       // freeze authority = null forever
    TOKEN_2022_PROGRAM_ID,
  ),
);
await sendAndConfirmTransaction(connection, tx, [payer, mintKeypair]);
```

**Pin freeze authority to null.** $HATE has no freeze authority. If you set one, the project is forever centralized and CEXes will refuse listing.

Mint the full supply to the deploy wallet (it will be redistributed in the next step):

```bash
spl-token mint <HATE_MINT_ADDRESS> 1000000000 \
    --program-2022 \
    --mint-authority ~/.config/solana/hate-mint-auth.json
```

Verify:

```bash
spl-token supply <HATE_MINT_ADDRESS> --program-2022
# expected: 1000000000
spl-token display <HATE_MINT_ADDRESS> --program-2022
# expected: Transfer Hook: <HATE_HOOK_PROGRAM_ID>, Freeze Authority: <None>
```

**Record:**

```
HATE_MINT_ADDRESS = <pubkey>
```

This is the canonical contract address. Put it on the website, the Twitter bio, and Etherscan-equivalents (Solscan, Solana Explorer, Birdeye, DexScreener) as soon as LP is live.

---

## 5. INITIAL SUPPLY DISTRIBUTION

Total: 1,000,000,000 $HATE.

| Allocation | % | Tokens | Destination |
|------------|---|--------|-------------|
| Public sale / LP | 75% | 750,000,000 | LP vault (used for Raydium pool) |
| Treasury multisig | 10% | 100,000,000 | Squads multisig wallet |
| Team vesting | 10% | 100,000,000 | Streamflow vesting contract |
| KOL vesting | 3% | 30,000,000 | Streamflow vesting contract |
| Feed reserve | 2% | 20,000,000 | Mood oracle "feed reserve" PDA, used for community rewards |

Run the transfers:

```bash
# 75% to LP vault
spl-token transfer <HATE_MINT_ADDRESS> 750000000 <LP_VAULT_PUBKEY> \
    --program-2022 --fund-recipient --allow-unfunded-recipient

# 10% to treasury multisig
spl-token transfer <HATE_MINT_ADDRESS> 100000000 <TREASURY_MULTISIG_PUBKEY> \
    --program-2022 --fund-recipient --allow-unfunded-recipient

# 10% to team vesting Streamflow contract — see step 5.1 below
# 3% to KOL vesting Streamflow contract — see step 5.1 below

# 2% to feed reserve PDA
spl-token transfer <HATE_MINT_ADDRESS> 20000000 <HATE_FEED_RESERVE_PDA> \
    --program-2022 --fund-recipient --allow-unfunded-recipient
```

### 5.1 Vesting contracts

Use **Streamflow** (`streamflow.finance`) for team + KOL vesting:

- Team: 100M tokens, 12-month cliff, then linear over 24 months. (Total lockup: 36 months.)
- KOLs: 30M tokens distributed across 10–20 recipients. 1-month cliff, linear over 6 months. Document each KOL recipient publicly. Anonymous founder + anonymous KOL allocations = rug accusation.

Streamflow generates a stream contract address per recipient. Record each.

---

## 6. MULTISIG SETUP (SQUADS)

Use Squads V4 (`squads.so`). Two separate multisigs:

### 6.1 Treasury multisig (3-of-5)

Holds the 10% treasury allocation + collects treasury-share fees from the transfer hook.

1. Go to `app.squads.so`. Click "Create new multisig."
2. Configure threshold **3 of 5**.
3. Add 5 signer pubkeys. For an anonymous solo founder this means: yourself (3 separate hardware wallets — Ledger 1, Ledger 2 in a fire safe, hot wallet), plus 2 trusted third parties (an advisor, a legal counsel, etc.). **You alone cannot move funds.** That's the point.
4. Fund the multisig with ~0.5 SOL so it can pay tx fees.
5. Transfer the 10% treasury allocation to the multisig's vault address.

### 6.2 Program upgrade multisig (3-of-5)

Holds the upgrade authority for all 4 Anchor programs during the 30-day post-launch window. After 30 days, upgrade authority is revoked.

```bash
# Transfer upgrade authority of each program to the multisig vault
solana program set-upgrade-authority <PROGRAM_ID> \
    --new-upgrade-authority <SQUADS_VAULT_PUBKEY> \
    --keypair ~/.config/solana/hate-deploy.json
```

Repeat for all 4 programs.

### 6.3 Mood oracle authority

The mood oracle's `authority` field stays on the **oracle bot keypair** so the bot can update mood hourly. The bot key is held by a separate burner wallet. If compromised, rotate via `rotate_authority()` from the Squads multisig (which is the bot's master signer).

---

## 7. LP CREATION ON RAYDIUM

Target: flat $0.02 per $HATE, single-sided initial liquidity, immediate lock.

### 7.1 Math

- Supply in LP: 750,000,000 $HATE
- Target price: $0.02 = $0.02 × 750M = $15,000,000 fully diluted at LP creation. Single-sided means we only deposit $HATE — the bonding curve mechanism on Raydium CLMM will accumulate SOL as buyers swap in.

If you want a *paired* LP (recommended for less slippage on day one), pair 750M $HATE with ~100 SOL (~$15k) at the $0.02 target. This is the more legible setup. Single-sided is acceptable but expect first-hour wicks.

### 7.2 Steps

1. Go to `raydium.io/clmm/create-pool` (CLMM, not the old AMM).
2. Token A = $HATE (paste mint address). Token B = SOL.
3. Set fee tier to **1%** (Raydium standard for memecoins).
4. Set initial price = 0.0001333 SOL per $HATE (at SOL=$150 → $0.02 per $HATE; adjust to live SOL price at launch).
5. Set position range. For a launch pool, use **full range** initially.
6. Deposit 750M $HATE + 100 SOL.
7. Confirm. Raydium issues an LP NFT (position NFT).

### 7.3 Lock the LP NFT on Streamflow

Open `streamflow.finance/vesting`. Create a 12-month lock:

- Recipient: a burn address or the project's locked treasury PDA
- Token: the LP position NFT
- Cliff: 12 months
- Unlock: 100% at month 12

The lock tx hash + Streamflow contract address goes on the website. Post it on Twitter. Post it on Telegram. Pin it.

If you go beyond 12 months, even better — 24 months is the trust standard for memecoins in 2026.

---

## 8. MINT AUTHORITY RENOUNCEMENT

**When:** 30 days after LP creation, assuming no critical bugs surface.

**Why wait 30 days?** Because if you find a bug in the transfer hook program in the first month, you may need to re-mint or migrate. Renouncing immediately is *theatrical*, not safe. The 30-day buffer is the warden's grace period.

**How:**

```bash
spl-token authorize <HATE_MINT_ADDRESS> mint --disable \
    --program-2022 \
    --authority ~/.config/solana/hate-mint-auth.json
```

Verify:

```bash
spl-token display <HATE_MINT_ADDRESS> --program-2022
# expected: Mint Authority: <None>
```

Announce the renouncement tx hash on Twitter. Pin it. The shift from "founder can dilute" → "founder cannot dilute" is one of the few credibility events a memecoin gets.

**Do not renounce upgrade authority on the programs until at least 60 days post-launch, and only after an audit fix cycle.** The 4 Anchor programs should remain upgradeable for the first 60 days. After 60 days clean, revoke upgrade authority on the staking + draw + mood programs. Leave the transfer hook program upgradeable until day 180 if possible — it is the most likely to need a hotfix.

---

## 9. AUDIT FIRM CONTACTS

| Firm | Solana experience | Quote range | Notes |
|------|---------------------|-------------|-------|
| **OtterSec** | High. Audited Tensor, Marginfi, Jito. | $20k–$50k for 5-program scope | Best Solana-native firm. Long waitlist (4–8 weeks). |
| **Halborn** | Medium-high. Multi-chain. | $30k–$60k | Faster turnaround. Less Solana-specific intuition than OtterSec. |
| **Trail of Bits** | Medium. Multi-chain heavyweight. | $40k–$80k | Best for reputation signalling. Slow. Expensive. Use if you've raised serious money. |
| **Sec3** | Medium. Automated + manual. | $15k–$30k | Cheap and decent for narrow scopes. Pair with a manual review. |
| **Neodyme** | Medium. Solana-focused. | $20k–$40k | Boutique. Good for memecoins specifically. |

**Recommended engagement timing:**

1. Week -8 before launch: reach out to OtterSec + Sec3. Get quotes.
2. Week -6: lock OtterSec. Send them devnet-deployed program addresses + repo access.
3. Week -3: receive audit report. Fix findings.
4. Week -1: re-audit pass on fixes. Get clean report.
5. Launch.

If you cannot afford OtterSec, **do not skip audit entirely.** Engage Sec3 + a freelance Solana auditor on Cantina. Total spend: ~$15k. Better than nothing. Memecoin without audit = "ape-at-your-own-risk" tweet from Solana sleuths within 24h.

---

## 10. COMMON GOTCHAS

### 10.1 BPF program size limit

Solana programs have a hard limit of **~10MB** loaded size, but in practice deploys above ~1MB get expensive and slow. Anchor's IDL embedding can balloon size — use `#[program]` with `no-idl` build feature for production if hitting limits. The transfer hook program should comfortably fit under 600KB.

### 10.2 Account rent

Every account needs to be rent-exempt. For a State account: ~0.003 SOL. For an ATA: ~0.002 SOL. Multiply by your projected daily user count. The `--allow-unfunded-recipient` flag on `spl-token transfer` covers this on first transfer.

### 10.3 Transfer hook execute() account ordering

This is the #1 gotcha for V2. The `execute` instruction is called by the SPL Token-2022 program with a fixed account order (source, mint, destination, owner). Any extra accounts you need (mood state, draw pot, staker pool, etc.) must be appended via the **extra-account-meta TLV**. If your client SDK forgets to attach them, every transfer fails. Test this aggressively on devnet.

### 10.4 Compute unit budget

Default CU budget per tx is 200k. The transfer hook + CPI to draw + CPI to staking + mood read can easily blow past this. Always include:

```typescript
ComputeBudgetProgram.setComputeUnitLimit({ units: 1_400_000 })
ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 10_000 })
```

in client transactions.

### 10.5 Token-2022 vs classic SPL Token

Many wallets (older Phantom, Solflare versions) handle Token-2022 imperfectly. Test the buy flow on **at least 5 wallets**: Phantom, Solflare, Backpack, Glow, OKX Wallet. If a wallet shows the balance as zero or fails the transfer, file a bug with them ASAP — and warn users.

### 10.6 Raydium + Token-2022

As of 2026, Raydium CLMM supports Token-2022 with transfer hooks **only when the transfer hook's extra accounts can be statically resolved**. This means the hook program's extra-account-meta TLV must be set up correctly. Verify with Raydium's testnet pool create flow before mainnet.

### 10.7 VRF callback timing

Switchboard / ORAO VRF callbacks can take **30 seconds to 5 minutes** to land. The daily draw's `settle_draw` must be designed so that requesting and consuming the VRF result are separate instructions. Do not assume same-tx finality.

### 10.8 Anchor build determinism

If you want anyone to verify your binaries, build inside the Solana verifiable-build container:

```bash
solana-verify build
solana-verify get-executable-hash target/deploy/hate_transfer_hook.so
```

Publish the hash + commit SHA. Auditors will demand this.

---

## 11. POST-DEPLOY VERIFICATION CHECKLIST

After mainnet deploy + LP creation:

- [ ] Mint shows on `solscan.io/token/<HATE_MINT_ADDRESS>` with correct decimals and supply
- [ ] Mint extensions on Solscan show `TransferHook → HATE_HOOK_PROGRAM_ID`
- [ ] Freeze authority = None
- [ ] Mint authority still your hot wallet (until day 30)
- [ ] All 4 program IDs show on `explorer.solana.com/address/<PROGRAM_ID>` as "Executable"
- [ ] Each program's upgrade authority is the Squads multisig vault
- [ ] Mood oracle state PDA returns `{ alive: true, mood: Tolerant, sanity: 100 }`
- [ ] Oracle bot has run at least one successful `update_mood` on mainnet
- [ ] Staking program: stake a small amount, confirm position PDA created
- [ ] Daily draw: feed a small amount, confirm pot grew, confirm settle works at 00:00 UTC
- [ ] Transfer hook: do a transfer on each action type, confirm fee splits land in correct destinations (use Solscan tx breakdown)
- [ ] LP on Raydium shows correct ratio + position NFT
- [ ] LP NFT lock on Streamflow shows correct unlock date
- [ ] Vesting contracts (team + KOL) visible on Streamflow public dashboard
- [ ] DexScreener picked up the pair within 30 min
- [ ] Birdeye picked up the pair within 1 hour
- [ ] No accounts under your control hold more than 5% supply (besides documented multisigs and vesting contracts)

### RPC sanity calls

```bash
# Mint supply
solana account <HATE_MINT_ADDRESS> --url mainnet-beta --output json | jq '.account.data'

# Mood state
solana account <HATE_MOOD_STATE_PDA> --url mainnet-beta --output json

# Daily draw pot balance
spl-token balance --address <HATE_DRAW_ESCROW_VAULT> --program-2022

# Staking pool balance
spl-token balance --address <HATE_STAKING_POOL_VAULT> --program-2022
```

---

## 12. DISASTER RECOVERY

### 12.1 Bug found in a program before upgrade authority is revoked

This is the easy case (and why we keep upgrade authority for 60 days).

```bash
# fix code, bump version, rebuild
anchor build -p hate_transfer_hook
# upgrade via the multisig
anchor upgrade target/deploy/hate_transfer_hook.so \
    --program-id <HATE_HOOK_PROGRAM_ID> \
    --provider.cluster mainnet
```

Sign the upgrade transaction from the Squads multisig.

### 12.2 Bug found after upgrade authority is revoked

This is the hard case.

**Option A — pause via mood oracle.** If the bug is in the transfer hook fee routing, the mood oracle can be set to a state that the hook treats as "fees disabled" (e.g. a special `Paused` mood you bake in early). This lets you stop the bleeding without a redeploy.

**Option B — migrate the mint.** Deploy a fixed transfer hook program. Mint a new $HATE V2 token. Offer 1:1 swap via a redemption program. Announce loudly. This is painful but survivable — Bonk did it, Wen did it.

**Option C — fork.** Last resort. Announce the bug, freeze trading via the LP lock contract if possible, work with auditors to design the migration. Expect 30%+ price impact regardless of how clean the redemption is.

### 12.3 Oracle bot key compromised

```bash
# From the Squads multisig (which is the master signer), rotate
anchor run rotate-oracle-authority --new-authority <NEW_BOT_KEY>
```

Spin up a new bot keypair on a fresh server. Sunset the old.

### 12.4 Multisig signer compromised

If a single Squads signer is compromised: the 3-of-5 threshold means one bad signer cannot move funds alone. Immediately:

1. Initiate a Squads "change members" proposal to remove the compromised signer.
2. Get the remaining 4 signers to approve.
3. Add a replacement.

If 3+ signers are compromised at once: the multisig is functionally captured. Cold-storage emergency keys (signers 4 and 5 should be deep-cold) are your last line of defense. Pre-plan this.

### 12.5 Liquidity drain attack

If LP is drained via an unforeseen exploit:

1. Pause the transfer hook (Option A above).
2. Announce on Twitter within 1 hour.
3. Contact Raydium support — sometimes pools can be paused at protocol level.
4. Engage auditors to root-cause.
5. Decide between migration (Option B) or compensation from treasury (10% allocation exists partly for this).

### 12.6 Backup the IDLs and program binaries

Every deploy:

```bash
cp target/deploy/hate_transfer_hook.so ~/hate-backups/hate_transfer_hook-$(date +%Y%m%d-%H%M).so
cp target/idl/hate_transfer_hook.json ~/hate-backups/hate_transfer_hook-$(date +%Y%m%d-%H%M).json
# encrypt and upload to two separate S3-compatible buckets
```

If you lose the source repo, the IDL + binary lets you reconstruct interaction. If you lose those too, you're operating blind.

---

## 13. FINAL OPERATIONAL NOTES

- **Don't deploy on a Friday.** Solana network congestion peaks on US weekday afternoons. Deploy Tuesday morning UTC. Have someone on-call for 48 hours.
- **Don't tweet the contract address until LP is live and locked.** Sniper bots watch the mempool. If they see the mint before LP, they prepare. If they see LP before lock, they fear rug.
- **Pin the lock tx, the renounce tx, the audit report, and the multisig address** to a dedicated `/transparency` page on the website. Link it from the footer.
- **Keep a deployment journal.** Plain text. Every tx hash, every signer, every timestamp. When (not if) someone accuses you of something, this is your defense.

You are the warden. Your job is not to be loved by the community on day one. Your job is to make sure the contracts work and the math is honest. The character does the rest.

---

*end of contract deploy spec — v2.*

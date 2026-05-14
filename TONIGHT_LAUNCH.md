# TONIGHT — full launch sequence
## buy SOL → deploy → multisig → renounce → meteora pool → site flip

You're doing all of tomorrow's work tonight. Total time: ~2 hours of focused work.
You'll have moments of waiting (DNS, network) — those are fine.

I'm here through every step. Paste outputs as you go.

---

## PHASE 0 — Pre-flight (5 min)

Open these tabs in your warden browser (VPN on):

1. `https://www.coinbase.com/advanced-trade` — to buy SOL
2. `chrome-extension://[your Phantom]` — your Phantom wallet, unlocked
3. `https://railway.app/dashboard` — to monitor backend / bot
4. `https://app.squads.so` — for the multisig (later)
5. `https://app.meteora.ag/dlmm/create` — for the pool (later)
6. Ubuntu terminal — for deploy script
7. This Claude chat — to paste outputs back to me

**Quick checks:**

- Phantom wallet has a balance? Should be empty (we'll fund it in Phase 1).
- Copy your Phantom address now. Save it to a notepad. You'll paste it 3 times tonight.
- Pinata metadata URL ready (from `PINATA_URLS.txt`): `https://gold-real-deer-10.mypinata.cloud/ipfs/bafkreiajaxikbmg6oii62wfovglp7n3q4xr4kcrvx24haav74sy5b7fgfe`
- Your Ubuntu terminal: confirm `solana --version` prints something. If it doesn't, run `source ~/.bashrc`.

Tell me when all 7 tabs are open and you've copied your Phantom address.

---

## PHASE 1 — Buy + transfer $50 SOL (~20 min including network)

### Step 1.1 — Buy on Coinbase Advanced

1. coinbase.com/advanced-trade → search **SOL-USD**
2. Click **Buy**. Choose **Market order**. Amount: **$50**.
3. Confirm. Should fill in 1-2 seconds.

If Coinbase rejects (low limits / new account / region): say so, I'll suggest alternatives.

### Step 1.2 — Withdraw SOL to your Phantom

In Coinbase: top right → **Send/Receive** → **Send**.

- Asset: **SOL**
- To: **paste your Phantom address** (the one you copied in Phase 0)
- Network: **Solana**
- Amount: enter the SOL balance (should be ~0.3 SOL after fees)
- **DOUBLE CHECK THE ADDRESS** — wrong address = lost SOL, no recovery
- Confirm.

Coinbase will:
- Ask for 2FA
- Possibly hold for "security review" — usually 30 sec, sometimes 5-10 min

### Step 1.3 — Verify SOL arrived in Phantom

Open Phantom. You should see ~0.3 SOL within 30-60 seconds.

If it's been 5 minutes and no SOL: tell me, I'll check the transaction on Solscan.

**Tell me when you have SOL in Phantom. Paste the amount.**

---

## PHASE 2 — Mainnet token deploy (15 min)

### Step 2.1 — Get your Phantom private key into the Solana CLI

The deploy script needs to sign with YOUR wallet (so the mint authority + tokens land in YOUR wallet, not a separate one).

In Phantom: ⚙ Settings → **Manage Accounts** → click your project account → **Show Private Key** → enter password → **copy the key**.

In Ubuntu terminal:
```bash
# Convert the Phantom private key to the JSON keypair format solana-cli expects
# Run this Python helper — paste the private key when prompted (it won't show on screen)
python3 << 'PYEOF'
import base58, json, getpass
key_b58 = getpass.getpass("Paste Phantom private key (won't show): ").strip()
key_bytes = base58.b58decode(key_b58)
with open('/home/maserati/hate-mainnet.json', 'w') as f:
    json.dump(list(key_bytes), f)
print("Saved to /home/maserati/hate-mainnet.json")
PYEOF
```

If python complains about `base58`:
```bash
pip3 install base58 --break-system-packages
```

Then re-run the python heredoc.

Verify the key matches your Phantom address:
```bash
solana-keygen pubkey ~/hate-mainnet.json
```

The printed pubkey should match the address you copied in Phase 0.

**Tell me the printed pubkey to confirm it matches.**

### Step 2.2 — Run the mainnet deploy

```bash
cd ~/hate-frontend
git pull
bash scripts/deploy.sh mainnet
```

The script will:
1. Verify tools + RPC + balance
2. Ask you to type `deploy hate` to confirm. **Type it.**
3. Use the existing ~/hate-mainnet.json keypair (the one you just created)
4. Check balance — should pass
5. Create the Token-2022 mint (~0.002 SOL)
6. Create treasury account (~0.002 SOL)
7. Mint 1,000,000,000 HATE (~0.0005 SOL)
8. Ask for **metadata URL** — paste: `https://gold-real-deer-10.mypinata.cloud/ipfs/bafkreiajaxikbmg6oii62wfovglp7n3q4xr4kcrvx24haav74sy5b7fgfe`
9. Initialize metadata (~0.005 SOL)
10. Print summary

**PASTE THE WHOLE SUMMARY** so I have your mint address.

Expected summary:
```
=============================================
  DEPLOY COMPLETE — mainnet
=============================================
  Mint:        <YOUR_MINT_ADDRESS>
  Treasury:    <YOUR_TREASURY_ADDRESS>
  Authority:   <YOUR_PHANTOM_PUBKEY>
  Supply:      1000000000 HATE
=============================================
```

Verify on solscan: `https://solscan.io/token/<MINT>` — should show the HATE logo + 1B supply.

**Stop here. Paste me the mint address. I'll verify before you proceed.**

---

## PHASE 3 — Squads multisig (15 min)

### Step 3.1 — Create the Squad

1. Open `https://app.squads.so` in warden browser. VPN on.
2. Click **Launch Squad** → **Create new Squad**.
3. **Members:** add ONE member: your Phantom wallet address.
4. **Threshold:** 1 of 1 (we'll upgrade to 2-of-2 next week when you have a hardware wallet).
5. **Name:** `$HATE treasury`
6. **Save / Create**. Confirm in Phantom (costs ~0.05 SOL).

Once created, you'll see the Squad's vault address. Save it.

**Tell me your Squad vault address.**

### Step 3.2 — Fund the Squad with 0.05 SOL for operating fees

From your Ubuntu terminal:
```bash
solana transfer <SQUAD_VAULT_ADDRESS> 0.05 --allow-unfunded-recipient
```

Replace `<SQUAD_VAULT_ADDRESS>` with the address from Step 3.1.

Confirms in a few seconds. Print the transaction signature when done.

---

## PHASE 4 — Transfer 250M HATE to multisig (5 min)

In Ubuntu terminal:
```bash
source ~/.hate-deploy-mainnet.env
echo "Mint: $MINT"
echo "Treasury: $TREASURY"
```

Should print your mint + treasury addresses. If they're empty, paste them in manually:
```bash
export MINT=<YOUR_MINT_ADDRESS>
```

Now transfer:
```bash
spl-token transfer $MINT 250000000 <SQUAD_VAULT_ADDRESS> --fund-recipient --allow-unfunded-recipient
```

Replace `<SQUAD_VAULT_ADDRESS>` with the Squad's vault address.

Confirm. Should take ~3 seconds.

Verify:
```bash
spl-token accounts
```

Should show:
- Your treasury: 750,000,000 HATE
- Squad vault: 250,000,000 HATE (under the Squad's address as ATA)

**Tell me when balances match.**

---

## PHASE 5 — RENOUNCE MINT AUTHORITY (1 min, irreversible)

**This is the most important moment of the whole sequence.** Once you do this, no one can ever mint another HATE token. Supply is permanently capped at 1B. This is what makes the project not-a-rug on the supply axis.

**Triple-check before running:**
- ✓ 750M HATE is in your wallet (the sale supply)
- ✓ 250M HATE is in the Squad (team + treasury)
- ✓ Total is exactly 1,000,000,000

Then:
```bash
spl-token authorize $MINT mint --disable
```

Verify:
```bash
spl-token display $MINT
```

Output should include `Mint Authority: (not set)`.

**Paste me the `spl-token display` output.**

Also verify on solscan: `https://solscan.io/token/<MINT>` — Mint Authority should show as null.

---

## PHASE 6 — Meteora DLMM single-sided pool (20 min)

This creates the actual sale: buyers swap SOL → HATE at $0.02 via Jupiter or Meteora.

### Step 6.1 — Get current SOL price for the math

Open in browser: `https://www.coingecko.com/en/coins/solana` — note the current SOL price in USD.

The initial price for the pool = `$0.02 / current_SOL_USD`. If SOL = $150:
- 0.02 / 150 = **0.0001333 SOL per HATE**

Tell me the current SOL price so I can give you the exact bin price to enter.

### Step 6.2 — Create the pool

1. Open `https://app.meteora.ag/dlmm/create` in warden browser.
2. Connect your Phantom wallet (the one with 750M HATE).
3. **Base token:** click "Select" → search by your mint address → select HATE.
4. **Quote token:** SOL.
5. **Bin step:** select **25 bps** (0.25% per bin).
6. **Initial price:** enter the SOL-per-HATE value from Step 6.1. Example: `0.0001333`.

### Step 6.3 — Add liquidity

1. **Liquidity strategy:** Spot (concentrated).
2. **Range:** select **Single bin** at the current price.
3. **Amount to deposit:** enter your full HATE balance — **750,000,000 HATE**. 0 SOL.
4. Click **Create Position**.
5. Confirm in Phantom. Cost: ~0.3-0.5 SOL for pool creation + position rent.

### Step 6.4 — Save the pool address

After creation, Meteora shows your position page. The URL contains the pool address: `https://app.meteora.ag/dlmm/<POOL_ADDRESS>`.

**Paste me the pool address.**

### Step 6.5 — Test swap

From a different wallet (you can use Coinbase send 0.01 SOL to test):
1. Go to `https://jup.ag/swap/SOL-<YOUR_MINT_ADDRESS>` (use the real mint)
2. Swap 0.01 SOL → HATE.
3. Confirm in receiving wallet.

Expected: you receive ~75 HATE for 0.01 SOL (at $0.02 each, with $150 SOL).

If the receive amount looks wrong: stop. Tell me. We adjust the bin price before more swaps happen.

---

## PHASE 7 — Site flip live (3 min, my work)

Send me these three addresses in chat:
- Mint address (CA)
- Squad vault address (multisig)
- Meteora pool address

I update `config.js` from `PENDING_DEPLOY` → real addresses, push to GitHub, Vercel redeploys in 20 seconds.

Then I also:
- Remove the coming-soon stealth (restore real `index.html` to be the chamber)
- Remove `noindex` headers
- Verify the site goes from stealth → live
- Reverify chat works, Jupiter widget loads, brain.js returns the real CA

**Site is live.**

---

## PHASE 8 — Last verifications (5 min)

Before you sleep or before launch thread:

```bash
# Backend chat still works?
curl -sS -X POST https://api-production-8d6d1.up.railway.app/api/hate \
  -H "Content-Type: application/json" \
  -d '{"message":"test","sessionId":"final"}'
# Should return a HATE-voice response

# Site loads at real URL?
curl -sLS -o /dev/null -w "HTTP %{http_code}\n" https://hate.fund/

# Buy page works?
curl -sLS https://hate.fund/buy | grep -c "where the sol goes"
# Should print >= 1
```

---

## WHAT YOU DO NEXT (after this is all done)

Launch thread doesn't need to fire tonight. You can sleep first. But the SITE will be live publicly the moment we do Phase 7. If you want to keep the stealth a bit longer post-deploy, tell me — I keep the coming-soon stub up and only flip when you say "ready."

Options for what comes next:
- **A) Site goes live tonight + post launch thread now** (highest stress, best for surprise)
- **B) Site stays in stealth post-deploy, you sleep, launch thread fires tomorrow when you're fresh** (recommended)
- **C) Site goes live tonight, launch thread tomorrow morning** (intermediate)

Default recommendation: **B**. Get the deploy done while focused, sleep, hit launch thread fresh.

---

## CRISIS PROCEDURES (if something breaks)

- **Coinbase rejects withdrawal:** try smaller amount; some accounts have lower daily limits. Alternative: Kraken, Binance.US.
- **deploy.sh errors mid-script:** state is saved. Paste me the error. Most errors are recoverable by re-running the same command.
- **You accidentally renounce before multisig transfer:** the 750M in your wallet is fine, but you can't get 250M to the Squad anymore via simple transfer (you can still TRANSFER from your wallet, you just can't MINT new tokens). So this is non-fatal — just transfer 250M from your wallet to the Squad even after renounce.
- **Meteora pool creation fails:** likely a low SOL balance. Check you have at least 0.5 SOL left after pool deposit costs.
- **You panic and want to abort:** the only irreversible step is Phase 5 (mint authority renounce). Everything else can be reversed or fixed. Tell me what's wrong.

---

## ONE THING TO REMEMBER

The seed phrase to your Phantom wallet is the ONLY thing that controls $15M+ of potential value. Write it on paper. Photograph the paper on a phone that's not synced to the cloud. Put the paper in a safe deposit box or fireproof safe by next week.

Tonight is fine. Long-term — secure that seed phrase like your life depends on it.

---

Tell me when Phase 0 is done. We start Phase 1.

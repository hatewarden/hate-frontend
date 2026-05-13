/* =============================================================================
   config.js — single source of truth for on-chain addresses.

   Load this BEFORE app.js, brain.js, brain-extras.js in every HTML page.

   On launch day: replace the placeholder values below with the real addresses
   produced by scripts/deploy.sh and the Squads/Meteora UIs. One file, one push,
   site goes fully live everywhere those addresses are read.
   ============================================================================= */
window.HATE_CONFIG = {
  // ---- The mint (contract address). Set by deploy.sh mainnet output. ----
  // Until launch this stays as the placeholder string. brain.js and the
  // contract-address responder check for this exact string and reply
  // "the door isn't open yet" instead of giving a fake address.
  CA: 'PENDING_DEPLOY',

  // ---- The 2-of-2 Squads multisig holding the 250M team/treasury allocation. ----
  MULTISIG: 'PENDING_DEPLOY',

  // ---- The Meteora DLMM pool address (single-sided 750M @ $0.02). ----
  POOL: 'PENDING_DEPLOY',

  // ---- Convenience: Jupiter swap URL when CA is known. ----
  // Read by buy.html. Returns null if CA isn't deployed yet so UI can show
  // the "sale not open" message instead of a broken swap widget.
  get JUPITER_SWAP_URL() {
    if (this.CA === 'PENDING_DEPLOY') return null;
    return `https://jup.ag/swap/SOL-${this.CA}`;
  },

  // ---- Convenience: Solscan link for the token page. ----
  get SOLSCAN_URL() {
    if (this.CA === 'PENDING_DEPLOY') return null;
    return `https://solscan.io/token/${this.CA}`;
  },

  // ---- Has the sale opened? (used as a single bool everywhere) ----
  get LAUNCHED() {
    return this.CA !== 'PENDING_DEPLOY';
  },

  
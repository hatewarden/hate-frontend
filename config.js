/* =============================================================================
   config.js — single source of truth for on-chain addresses and socials.

   Load this BEFORE app.js, brain.js, brain-extras.js in every HTML page.

   On launch day: replace the placeholder values below with the real addresses
   produced by scripts/deploy.sh and the Squads/Meteora UIs. One file, one push,
   site goes fully live everywhere those addresses are read.
   ============================================================================= */
window.HATE_CONFIG = {
  // ---- The mint (contract address). Set by deploy.sh mainnet output. ----
  CA: '5UDAmusk2kNEdKFbbyLfLLVA6EF5Xs7sCjxrsKM4ukV8',

  // ---- The 2-of-2 Squads multisig holding the 250M team/treasury allocation. ----
  MULTISIG: '8S4EGr8SxSqfJ7hVSFJdJKbjjC2utGpF3sYJzcuEXCn7',

  // ---- The Meteora DLMM pool address (single-sided 750M @ $0.02). ----
  POOL: 'Bhx1Kf3kzLcG8ZGKB6PtV8btLR1eqz39tSeMwAwLiwJo',

  // ---- Convenience: Jupiter swap URL when CA is known. ----
  get JUPITER_SWAP_URL() {
    if (this.CA === 'PENDING_DEPLOY') return null;
    return 'https://jup.ag/swap/SOL-' + this.CA;
  },

  // ---- Convenience: Solscan link for the token page. ----
  get SOLSCAN_URL() {
    if (this.CA === 'PENDING_DEPLOY') return null;
    return 'https://solscan.io/token/' + this.CA;
  },

  // ---- Has the sale opened? (single bool everywhere) ----
  get LAUNCHED() {
    return this.CA !== 'PENDING_DEPLOY';
  },

  // ---- Domain ----
  DOMAIN: 'hate.fund',
  URL: 'https://hate.fund',

  // ---- Social handles ----
  SOCIALS: {
    X: 'https://x.com/hate9000',
    X_HANDLE: '@hate9000',
    TELEGRAM_CHANNEL: 'https://t.me/hate9000',
    TELEGRAM_GROUP:   'https://t.me/+mldtMEPW_vZlOTE5',
    PRESS_EMAIL: 'press@hate.fund',
  },
};

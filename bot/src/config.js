/**
 * config.js — central env loading + posting rules
 * All other modules read from here, never from process.env directly.
 */
import 'dotenv/config';

function int(v, d) { const n = parseInt(v, 10); return Number.isFinite(n) ? n : d; }
function bool(v, d) { if (v === undefined || v === null) return d; return ['true', '1', 'yes', 'on'].includes(String(v).toLowerCase()); }
function strList(v, d = []) { if (!v) return d; return String(v).split(',').map(s => s.trim()).filter(Boolean); }

export const CONFIG = {
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: 'claude-haiku-4-5-20251001',
  },

  x: {
    apiKey: process.env.X_API_KEY,
    apiSecret: process.env.X_API_SECRET,
    accessToken: process.env.X_ACCESS_TOKEN,
    accessTokenSecret: process.env.X_ACCESS_TOKEN_SECRET,
    postsPerDay: int(process.env.X_POSTS_PER_DAY, 4),
  },

  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    channelId: process.env.TELEGRAM_CHANNEL_ID || '@hate9000',
    groupId: process.env.TELEGRAM_GROUP_ID || '',
    postsPerDay: int(process.env.TELEGRAM_POSTS_PER_DAY, 2),
  },

  facebook: {
    pageId: process.env.FB_PAGE_ID,
    pageAccessToken: process.env.FB_PAGE_ACCESS_TOKEN,
    postsPerDay: int(process.env.FACEBOOK_POSTS_PER_DAY, 1),
  },

  instagram: {
    igBusinessAccountId: process.env.IG_BUSINESS_ACCOUNT_ID,
    fbAccessToken: process.env.FB_PAGE_ACCESS_TOKEN, // IG Graph uses FB Page token
    cloudinaryUrl: process.env.CLOUDINARY_URL,
    imageFallbackBase: process.env.IMAGE_FALLBACK_BASE || 'https://hate.fund',
    postsPerDay: int(process.env.INSTAGRAM_POSTS_PER_DAY, 1),
  },

  schedule: {
    quietHours: strList(process.env.QUIET_HOURS, ['0','1','2','3','4','5','6']).map(s => parseInt(s, 10)),
    launchDate: process.env.LAUNCH_DATE ? new Date(process.env.LAUNCH_DATE) : new Date(0),
  },

  flags: {
    paused: bool(process.env.PAUSED, false),
    dryRun: bool(process.env.DRY_RUN, false),
    nodeEnv: process.env.NODE_ENV || 'development',
  },

  admin: {
    token: process.env.ADMIN_TOKEN || '',
    port: int(process.env.PORT, 3001),
  },
};

/** Are we currently in the pre-launch quiet period? */
export function beforeLaunch() {
  return Date.now() < CONFIG.schedule.launchDate.getTime();
}

/** Is the current UTC hour in the quiet window? */
export function inQuietHours() {
  const h = new Date().getUTCHours();
  return CONFIG.schedule.quietHours.includes(h);
}

/** Should the bot post anything right now? Single decision function. */
export function shouldPost(platform) {
  if (CONFIG.flags.paused) return { ok: false, reason: 'paused' };
  if (inQuietHours()) return { ok: false, reason: 'quiet-hours' };
  if (beforeLaunch()) return { ok: false, reason: 'before-launch' };
  return { ok: true };
}

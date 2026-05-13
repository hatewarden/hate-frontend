/**
 * posters/x.js — post to X (Twitter) via the v2 API.
 *
 * Free tier limits: 50 tweets/24h, 1500/month. We post 2-5/day so this is fine.
 * Auth: OAuth 1.0a user context with the four keys.
 */
import { TwitterApi } from 'twitter-api-v2';
import { CONFIG } from '../config.js';

let client = null;

function getClient() {
  if (client) return client;
  const c = CONFIG.x;
  if (!c.apiKey || !c.apiSecret || !c.accessToken || !c.accessTokenSecret) {
    throw new Error('X credentials missing — set X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET');
  }
  client = new TwitterApi({
    appKey: c.apiKey,
    appSecret: c.apiSecret,
    accessToken: c.accessToken,
    accessSecret: c.accessTokenSecret,
  });
  return client;
}

/**
 * Post a tweet. Returns { id, url } on success.
 * @param {string} text — tweet body (≤280 chars; will be truncated)
 * @param {object} [opts]
 * @param {string} [opts.mediaUrl] — optional image URL to attach (we'll fetch + upload)
 */
export async function postTweet(text, opts = {}) {
  if (CONFIG.flags.dryRun) {
    console.log('[x] DRY_RUN — would have posted:', text.slice(0, 140));
    return { id: 'dry-run', url: '#dry-run' };
  }

  const body = text.slice(0, 280);
  const c = getClient();
  const tweetOpts = {};

  if (opts.mediaUrl) {
    try {
      const buf = await fetchImageBuffer(opts.mediaUrl);
      const mediaId = await c.v1.uploadMedia(buf, { mimeType: guessMime(opts.mediaUrl) });
      tweetOpts.media = { media_ids: [mediaId] };
    } catch (e) {
      console.warn('[x] media upload failed, posting text-only:', e.message);
    }
  }

  try {
    const res = await c.v2.tweet(body, tweetOpts);
    const id = res?.data?.id;
    return {
      id,
      url: id ? `https://x.com/hate9000/status/${id}` : null,
    };
  } catch (e) {
    // Surface rate-limit + auth errors clearly
    if (e?.code === 401) throw new Error('X auth failed — check credentials and that the access token has read+write perms');
    if (e?.code === 429) throw new Error('X rate limit hit — daily/monthly cap exceeded');
    throw new Error('X post failed: ' + (e?.data?.detail || e?.message || 'unknown'));
  }
}

/** Verify credentials work without posting. Used by /status. */
export async function verifyXAuth() {
  try {
    const c = getClient();
    const me = await c.v2.me();
    return { ok: true, username: me?.data?.username };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ---- helpers ----

async function fetchImageBuffer(url) {
  const fetch = (await import('node-fetch')).default;
  const res = await fetch(url);
  if (!res.ok) throw new Error('image fetch ' + res.status);
  return Buffer.from(await res.arrayBuffer());
}

function guessMime(url) {
  const u = url.toLowerCase();
  if (u.endsWith('.png')) return 'image/png';
  if (u.endsWith('.jpg') || u.endsWith('.jpeg')) return 'image/jpeg';
  if (u.endsWith('.gif')) return 'image/gif';
  if (u.endsWith('.webp')) return 'image/webp';
  return 'image/png';
}

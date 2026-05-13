/**
 * posters/instagram.js — post to Instagram Business via Graph API.
 *
 * IG Graph requires:
 *   - IG Business or Creator account
 *   - Linked to a Facebook Page (we use the same Page from facebook.js)
 *   - IG Business Account ID (different from your @ handle)
 *
 * Posting flow is 2-step:
 *   1. Create media container: POST /{ig-user-id}/media with image_url + caption
 *   2. Publish container: POST /{ig-user-id}/media_publish with creation_id
 *
 * The image MUST be at a public HTTPS URL. Instagram's servers fetch it.
 * We use hate.fund/og.svg or hate-logo.png as a default fallback, or
 * Cloudinary if configured.
 */
import { CONFIG } from '../config.js';

const GRAPH = 'https://graph.facebook.com/v20.0';

async function graphPost(path, body) {
  const fetch = (await import('node-fetch')).default;
  const url = `${GRAPH}${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (json.error) throw new Error(`ig graph error: ${json.error.message}`);
  return json;
}

async function graphGet(path, params = {}) {
  const fetch = (await import('node-fetch')).default;
  const qs = new URLSearchParams(params).toString();
  const url = `${GRAPH}${path}${qs ? '?' + qs : ''}`;
  const res = await fetch(url);
  const json = await res.json();
  if (json.error) throw new Error(`ig graph error: ${json.error.message}`);
  return json;
}

/**
 * Post a single image with caption to IG Business.
 * @param {string} caption — ≤2200 chars
 * @param {string} imageUrl — public HTTPS URL of a JPG/PNG (IG won't fetch SVG)
 * @returns {Promise<{id: string}>}
 */
export async function postToInstagram(caption, imageUrl) {
  if (CONFIG.flags.dryRun) {
    console.log('[instagram] DRY_RUN —', caption.slice(0, 140), '| img:', imageUrl);
    return { id: 'dry-run' };
  }
  const c = CONFIG.instagram;
  if (!c.igBusinessAccountId || !c.fbAccessToken) {
    throw new Error('IG_BUSINESS_ACCOUNT_ID or FB_PAGE_ACCESS_TOKEN missing');
  }
  if (!imageUrl) {
    imageUrl = `${c.imageFallbackBase}/hate-logo.png`;
  }
  // IG won't accept SVGs — fall back to PNG variant
  if (imageUrl.endsWith('.svg')) {
    imageUrl = imageUrl.replace(/\.svg$/, '.png');
  }

  // Step 1: create the media container
  const container = await graphPost(`/${c.igBusinessAccountId}/media`, {
    image_url: imageUrl,
    caption: caption.slice(0, 2200),
    access_token: c.fbAccessToken,
  });

  // Wait a beat — IG sometimes returns "creation not ready" if we publish too fast
  await new Promise(r => setTimeout(r, 1500));

  // Step 2: publish
  const published = await graphPost(`/${c.igBusinessAccountId}/media_publish`, {
    creation_id: container.id,
    access_token: c.fbAccessToken,
  });

  return published;
}

/** Discover the IG Business Account ID linked to a Facebook Page. */
export async function discoverIgBusinessId() {
  const c = CONFIG.instagram;
  const pageId = CONFIG.facebook.pageId;
  if (!pageId || !c.fbAccessToken) {
    return { ok: false, error: 'need FB_PAGE_ID and FB_PAGE_ACCESS_TOKEN' };
  }
  try {
    const data = await graphGet(`/${pageId}`, {
      fields: 'instagram_business_account',
      access_token: c.fbAccessToken,
    });
    const igId = data.instagram_business_account?.id;
    if (!igId) return { ok: false, error: 'no IG business account linked to this Page' };
    return { ok: true, igBusinessId: igId };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

/** Verify the IG Business ID + token works. */
export async function verifyInstagramAuth() {
  try {
    const c = CONFIG.instagram;
    if (!c.igBusinessAccountId) return { ok: false, error: 'no IG business account id' };
    const data = await graphGet(`/${c.igBusinessAccountId}`, {
      fields: 'username,name',
      access_token: c.fbAccessToken,
    });
    return { ok: true, username: data.username };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

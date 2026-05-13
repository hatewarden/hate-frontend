/**
 * posters/facebook.js — post to a Facebook Page via the Graph API.
 *
 * Setup:
 *   1. Create Facebook Page for $HATE
 *   2. developers.facebook.com → create app (Business type)
 *   3. Generate long-lived Page Access Token (60-day) via Graph API Explorer
 *   4. Paste page ID + token into env
 *
 * Graph API version: v20.0 (rolls forward automatically).
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
  if (json.error) throw new Error(`fb graph error: ${json.error.message}`);
  return json;
}

async function graphGet(path, params = {}) {
  const fetch = (await import('node-fetch')).default;
  const qs = new URLSearchParams(params).toString();
  const url = `${GRAPH}${path}${qs ? '?' + qs : ''}`;
  const res = await fetch(url);
  const json = await res.json();
  if (json.error) throw new Error(`fb graph error: ${json.error.message}`);
  return json;
}

/**
 * Post a text status (with optional link preview) to the Page.
 * @param {string} text
 * @param {object} [opts]
 * @param {string} [opts.link] — URL to preview-card (Facebook auto-fetches OG tags)
 * @returns {Promise<{id: string}>}
 */
export async function postToPage(text, opts = {}) {
  if (CONFIG.flags.dryRun) {
    console.log('[facebook] DRY_RUN —', text.slice(0, 140));
    return { id: 'dry-run' };
  }
  const c = CONFIG.facebook;
  if (!c.pageId || !c.pageAccessToken) {
    throw new Error('FB_PAGE_ID or FB_PAGE_ACCESS_TOKEN missing');
  }

  const body = {
    message: text,
    access_token: c.pageAccessToken,
  };
  if (opts.link) body.link = opts.link;

  return graphPost(`/${c.pageId}/feed`, body);
}

/** Post with a remote image URL. */
export async function postPhotoToPage(text, imageUrl) {
  if (CONFIG.flags.dryRun) {
    console.log('[facebook:photo] DRY_RUN —', text.slice(0, 140), imageUrl);
    return { id: 'dry-run' };
  }
  const c = CONFIG.facebook;
  return graphPost(`/${c.pageId}/photos`, {
    url: imageUrl,
    caption: text,
    access_token: c.pageAccessToken,
  });
}

/** Verify the Page access token works + return page name. */
export async function verifyFacebookAuth() {
  try {
    const c = CONFIG.facebook;
    if (!c.pageAccessToken) return { ok: false, error: 'no page access token' };
    const data = await graphGet(`/${c.pageId}`, {
      fields: 'name,id',
      access_token: c.pageAccessToken,
    });
    return { ok: true, pageName: data.name, pageId: data.id };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

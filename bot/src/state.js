/**
 * state.js — lightweight persistent state for the bot.
 *
 * Tracks: posts-published-today (per platform), dedupe hashes (avoid posting
 * the same content twice), and last-post timestamps.
 *
 * Storage: a single JSON file at ./bot-state.json. Atomic writes (write-temp,
 * rename). Good enough for a 1-instance bot; not designed for concurrent writes.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const STATE_PATH = process.env.STATE_PATH || path.resolve(process.cwd(), 'bot-state.json');

const DEFAULT_STATE = {
  postsToday: {},       // { 'YYYY-MM-DD': { x: 0, telegram: 0, facebook: 0, instagram: 0 } }
  recentHashes: [],     // last 500 hashes of posted content (rolling)
  lastPostTime: {},     // { x: 12345, telegram: ... }
  postLog: [],          // last 200 post log entries
  startedAt: Date.now(),
};

let cache = null;

async function readFromDisk() {
  try {
    const raw = await fs.readFile(STATE_PATH, 'utf8');
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch (e) {
    if (e.code === 'ENOENT') return { ...DEFAULT_STATE };
    console.warn('[state] could not load, starting fresh:', e.message);
    return { ...DEFAULT_STATE };
  }
}

async function writeToDisk(s) {
  const tmp = STATE_PATH + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(s, null, 2));
  await fs.rename(tmp, STATE_PATH);
}

/** Load state into memory (call once at startup). */
export async function loadState() {
  cache = await readFromDisk();
  return cache;
}

/** Get a synchronous snapshot. loadState() must have been called first. */
export function getState() {
  if (!cache) throw new Error('state not loaded — call loadState() first');
  return cache;
}

/** Persist current cache to disk. */
export async function saveState() {
  if (!cache) return;
  await writeToDisk(cache);
}

/** Today's date key, UTC. */
function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

/** How many posts of `platform` published today? */
export function postsTodayCount(platform) {
  const k = todayKey();
  return (cache.postsToday[k]?.[platform]) || 0;
}

/** Increment post-counter and remember the timestamp. */
export async function recordPost(platform, postText, extras = {}) {
  const k = todayKey();
  if (!cache.postsToday[k]) cache.postsToday[k] = {};
  cache.postsToday[k][platform] = (cache.postsToday[k][platform] || 0) + 1;
  cache.lastPostTime[platform] = Date.now();

  const hash = crypto.createHash('sha1').update(postText).digest('hex').slice(0, 16);
  cache.recentHashes.unshift(hash);
  cache.recentHashes = cache.recentHashes.slice(0, 500);

  cache.postLog.unshift({
    t: new Date().toISOString(),
    platform,
    text: postText.slice(0, 280),
    ...extras,
  });
  cache.postLog = cache.postLog.slice(0, 200);

  // Trim old day-buckets (keep 14 days)
  const cutoff = Date.now() - 14 * 86400000;
  for (const dk of Object.keys(cache.postsToday)) {
    if (new Date(dk).getTime() < cutoff) delete cache.postsToday[dk];
  }

  await saveState();
}

/** Has this exact text been posted recently? Used for dedupe. */
export function isDuplicate(postText) {
  const hash = crypto.createHash('sha1').update(postText).digest('hex').slice(0, 16);
  return cache.recentHashes.includes(hash);
}

/** Get the post log for /status endpoint. */
export function getPostLog(n = 20) {
  return cache.postLog.slice(0, n);
}

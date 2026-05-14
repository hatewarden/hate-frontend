/**
 * posters/tiktok-queue.js — daily TikTok content queue.
 *
 * TikTok doesn't allow easy automated posting (their Content Posting API
 * requires app review). So this module instead PREPARES content for manual
 * upload: bot generates 4 captions/day, writes them to disk + (optionally)
 * pushes them to a Telegram chat where the user can quickly download +
 * paste into TikTok.
 *
 * Phase 2 (post-launch) will add real video generation via ffmpeg.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const QUEUE_DIR = process.env.TIKTOK_QUEUE_DIR || '/app/tiktok-queue';
const BRAND_IMAGE_URL = 'https://hate.fund/ig-story-2.png';

/** Today's YYYY-MM-DD (UTC). */
function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Save a day's queue (array of {caption, hashtags}) to disk.
 * Returns the saved queue with full metadata.
 */
export async function saveDailyQueue(items) {
  const date = todayKey();
  const dir = path.join(QUEUE_DIR, date);
  await fs.mkdir(dir, { recursive: true });
  const meta = items.map((item, i) => ({
    id: i + 1,
    caption: item.caption || '',
    hashtags: item.hashtags || '',
    full_post: ((item.caption || '') + '\n\n' + (item.hashtags || '')).trim(),
    image_url: BRAND_IMAGE_URL,
    created_at: new Date().toISOString(),
  }));
  await fs.writeFile(path.join(dir, 'queue.json'), JSON.stringify(meta, null, 2));
  return { date, items: meta };
}

/** Get today's queue, or null if not yet generated. */
export async function getTodayQueue() {
  const date = todayKey();
  const file = path.join(QUEUE_DIR, date, 'queue.json');
  try {
    const items = JSON.parse(await fs.readFile(file, 'utf8'));
    return { date, items };
  } catch (e) {
    if (e.code !== 'ENOENT') console.warn('[tiktok] queue read failed:', e.message);
    return null;
  }
}

/** Get a queue for a specific YYYY-MM-DD date. */
export async function getQueueForDate(date) {
  const file = path.join(QUEUE_DIR, date, 'queue.json');
  try {
    const items = JSON.parse(await fs.readFile(file, 'utf8'));
    return { date, items };
  } catch (e) {
    return null;
  }
}

/** List all dates that have queues stored. */
export async function listQueueDates() {
  try {
    const dates = await fs.readdir(QUEUE_DIR);
    return dates.sort().reverse(); // newest first
  } catch (e) {
    return [];
  }
}

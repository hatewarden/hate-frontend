/**
 * scheduler.js — the orchestrator. Pulls news, generates candidates,
 * picks the best, fires platform posts on per-platform schedules.
 *
 * Scheduled with node-cron. Quiet hours respected. Per-day caps respected.
 */
import cron from 'node-cron';
import { CONFIG, shouldPost } from './config.js';
import { loadState, getState, postsTodayCount, recordPost, isDuplicate } from './state.js';
import { fetchAllSources } from './content/sources.js';
import {
  generateXPost, generateTelegramPost, generateFacebookPost, generateInstagramPost,
  generateBatch, generateThoughtBatch, generateTikTokBatch,
} from './content/generator.js';
import { saveDailyQueue as saveTikTokQueue } from './posters/tiktok-queue.js';
import { rankPosts, pickTop } from './content/scorer.js';
import { postTweet } from './posters/x.js';
import { postToChannel, postToGroup } from './posters/telegram.js';
import { postToPage } from './posters/facebook.js';
import { postToInstagram } from './posters/instagram.js';

// One generation cycle per hour. Each cycle:
//   1. Pull all sources (~30 sec)
//   2. For each platform that's UNDER its daily cap and OUTSIDE quiet hours,
//      generate 5 candidates, score them, post top 1
const CYCLE_CRON = '5 * * * *';      // hourly news-riff cycle
const THOUGHTS_CRON = '17 */2 * * *'; // every 2 hours — idle thoughts
const TIKTOK_CRON = '0 6 * * *';      // once daily at 06:00 UTC — generate 4 TikTok captions

let lastCycleAt = 0;
let lastCycleResult = null;
let lastThoughtAt = 0;
let lastThoughtResult = null;

/** Run one idle-thought cycle. Posts ONE evergreen thought to X + Telegram channel. */
export async function runThoughtCycle() {
  console.log('[scheduler] thought cycle start', new Date().toISOString());
  lastThoughtAt = Date.now();
  const results = {};

  const candidates = (await generateThoughtBatch(4)).filter(c => c.post);
  if (candidates.length === 0) {
    lastThoughtResult = { at: new Date().toISOString(), skipped: 'no thought generated' };
    return lastThoughtResult;
  }
  const pick = candidates[Math.floor(Math.random() * candidates.length)];
  if (isDuplicate(pick.post)) {
    lastThoughtResult = { at: new Date().toISOString(), skipped: 'duplicate' };
    return lastThoughtResult;
  }
  const gate = shouldPost('x');
  if (!gate.ok) {
    lastThoughtResult = { at: new Date().toISOString(), skipped: gate.reason };
    return lastThoughtResult;
  }

  try {
    const res = await postTweet(pick.post);
    await recordPost('x', pick.post, { url: res.url, id: res.id, kind: 'thought' });
    results.x = { post: pick.post, ...res };
  } catch (e) {
    console.error('[thought:x] failed:', e.message);
    results.x = { error: e.message };
  }
  try {
    const res = await postToChannel(pick.post);
    await recordPost('telegram', pick.post, { messageId: res.messageId, kind: 'thought' });
    results.telegram = { post: pick.post, ...res };
  } catch (e) {
    console.error('[thought:telegram] failed:', e.message);
    results.telegram = { error: e.message };
  }

  lastThoughtResult = { at: new Date().toISOString(), results };
  console.log('[scheduler] thought cycle done:', JSON.stringify(results, null, 2));
  return results;
}


/** Generate today's TikTok queue: 4 captions saved to disk + (optional) telegram notification. */
export async function runTikTokDailyQueue() {
  console.log('[scheduler] tiktok daily queue start', new Date().toISOString());
  try {
    const items = await generateTikTokBatch(4);
    if (items.length === 0) {
      console.warn('[tiktok] no items generated');
      return { skipped: 'no items generated' };
    }
    const saved = await saveTikTokQueue(items);
    console.log(`[tiktok] saved ${saved.items.length} items to ${saved.date}`);

    // Optional: notify a Telegram chat that the day's queue is ready
    if (process.env.TIKTOK_NOTIFY_CHAT_ID) {
      try {
        const headline = `[tiktok queue ready for ${saved.date}] — ${saved.items.length} captions waiting. /admin/tiktok/today on the bot to view.`;
        const lines = saved.items.map((it, i) => `${i+1}. ${it.caption}\n${it.hashtags}`).join('\n\n');
        const fetch = (await import('node-fetch')).default;
        await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: process.env.TIKTOK_NOTIFY_CHAT_ID,
            text: headline + '\n\n' + lines + '\n\nimage: ' + (saved.items[0]?.image_url || ''),
          }),
        });
      } catch (e) {
        console.warn('[tiktok] notify failed:', e.message);
      }
    }
    return saved;
  } catch (err) {
    console.error('[tiktok] daily queue failed:', err.message);
    return { error: err.message };
  }
}

/** Run one full cycle. Safe to call manually for testing. */
export async function runCycle() {
  console.log('[scheduler] cycle start', new Date().toISOString());
  lastCycleAt = Date.now();
  const results = {};

  const sources = await fetchAllSources();
  const seeds = [
    ...sources.cryptoNews.slice(0, 3),
    ...sources.solanaNews.slice(0, 2),
    ...sources.redditCrypto.slice(0, 3),
    ...sources.redditMemes.slice(0, 2),
  ];
  if (seeds.length === 0) {
    console.warn('[scheduler] no seeds available, using evergreen freestyle');
  }

  // ---- X ----
  results.x = await tryPlatform('x', CONFIG.x.postsPerDay, async () => {
    const candidates = await generateBatch(seeds, 'x', 5);
    const ranked = await rankPosts(candidates.filter(c => c.post), 'x');
    const top = (await pickTop(ranked, 'x', 1))[0];
    if (!top || !top.post) return { skipped: true, reason: 'no candidate' };
    if (isDuplicate(top.post)) return { skipped: true, reason: 'duplicate' };
    const res = await postTweet(top.post);
    return { post: top.post, ...res };
  });

  // ---- Telegram ----
  results.telegram = await tryPlatform('telegram', CONFIG.telegram.postsPerDay, async () => {
    const candidates = await generateBatch(seeds, 'telegram', 5);
    const ranked = await rankPosts(candidates.filter(c => c.post), 'telegram');
    const top = (await pickTop(ranked, 'telegram', 1))[0];
    if (!top || !top.post) return { skipped: true, reason: 'no candidate' };
    if (isDuplicate(top.post)) return { skipped: true, reason: 'duplicate' };
    const res = await postToChannel(top.post);
    return { post: top.post, ...res };
  });

  // ---- Facebook ----
  results.facebook = await tryPlatform('facebook', CONFIG.facebook.postsPerDay, async () => {
    const candidates = await generateBatch(seeds, 'facebook', 4);
    const ranked = await rankPosts(candidates.filter(c => c.post), 'facebook');
    const top = (await pickTop(ranked, 'facebook', 1))[0];
    if (!top || !top.post) return { skipped: true, reason: 'no candidate' };
    if (isDuplicate(top.post)) return { skipped: true, reason: 'duplicate' };
    const res = await postToPage(top.post, { link: 'https://hate.fund' });
    return { post: top.post, ...res };
  });

  // ---- Instagram ----
  results.instagram = await tryPlatform('instagram', CONFIG.instagram.postsPerDay, async () => {
    const candidates = await generateBatch(seeds, 'instagram', 4);
    const ranked = await rankPosts(candidates.filter(c => c.post), 'instagram');
    const top = (await pickTop(ranked, 'instagram', 1))[0];
    if (!top || !top.post) return { skipped: true, reason: 'no candidate' };
    if (isDuplicate(top.post)) return { skipped: true, reason: 'duplicate' };
    const imageUrl = 'https://hate.fund/hate-logo.png';
    const res = await postToInstagram(top.post, imageUrl);
    return { post: top.post, ...res };
  });

  lastCycleResult = { at: new Date().toISOString(), results };
  console.log('[scheduler] cycle done:', JSON.stringify(results, null, 2));
  return results;
}

/** Helper: enforce per-platform caps + gating logic + record. */
async function tryPlatform(platform, capPerDay, doPost) {
  const gate = shouldPost(platform);
  if (!gate.ok) return { skipped: true, reason: gate.reason };

  const count = postsTodayCount(platform);
  if (count >= capPerDay) return { skipped: true, reason: 'daily-cap' };

  // Probabilistic posting: spread posts across the day rather than firing
  // them all in the first few cycles. Probability = remaining-quota /
  // remaining-hours-until-quiet-period
  const hour = new Date().getUTCHours();
  const lastActiveHour = 23 - Math.max(...CONFIG.schedule.quietHours.filter(h => h > 12), 0);
  const hoursLeft = Math.max(1, lastActiveHour - hour);
  const remaining = capPerDay - count;
  const probability = Math.min(1, remaining / hoursLeft);
  if (Math.random() > probability) return { skipped: true, reason: 'probabilistic-skip', probability };

  try {
    const result = await doPost();
    if (result?.skipped) return result;
    if (result?.post) {
      await recordPost(platform, result.post, { url: result.url, id: result.id });
    }
    return result;
  } catch (e) {
    console.error(`[${platform}] post failed:`, e.message);
    return { error: e.message };
  }
}

/** Start the cron loop. */
export async function start() {
  await loadState();
  console.log('[scheduler] state loaded. cycle:', CYCLE_CRON, '| thoughts:', THOUGHTS_CRON);
  cron.schedule(CYCLE_CRON, () => {
    runCycle().catch(e => console.error('[cycle] unhandled:', e));
  }, { timezone: 'UTC' });
  cron.schedule(THOUGHTS_CRON, () => {
    runThoughtCycle().catch(e => console.error('[thought-cycle] unhandled:', e));
  }, { timezone: 'UTC' });
  cron.schedule(TIKTOK_CRON, () => {
    runTikTokDailyQueue().catch(e => console.error('[tiktok-cycle] unhandled:', e));
  }, { timezone: 'UTC' });
}

/** Status for /status endpoint */
export function getSchedulerStatus() {
  return {
    lastCycleAt: lastCycleAt ? new Date(lastCycleAt).toISOString() : null,
    lastCycleResult,
    postsToday: getState()?.postsToday || {},
  };
}

// CLI: bash scripts/test-cycle: `node src/scheduler.js --run-once`
if (process.argv.includes('--run-once')) {
  (async () => { await loadState(); await runCycle(); process.exit(0); })();
}

/**
 * server.js — Express HTTP server for the bot.
 *
 * Endpoints:
 *   GET  /health          - basic liveness check
 *   GET  /status          - last cycle result + post log (admin-only)
 *   POST /pause           - flip the kill-switch ON
 *   POST /resume          - flip the kill-switch OFF
 *   POST /run-now         - manually trigger a cycle (admin-only)
 *   GET  /verify          - check all platform auth (admin-only)
 *   GET  /admin/tg-chats  - list recent telegram chats (for finding group ID)
 *
 * All admin endpoints require: header `Authorization: Bearer <ADMIN_TOKEN>`
 */
import express from 'express';
import { CONFIG } from './config.js';
import { start as startScheduler, runCycle, getSchedulerStatus } from './scheduler.js';
import { getPostLog } from './state.js';
import { verifyXAuth } from './posters/x.js';
import { verifyTelegramAuth, listRecentChats } from './posters/telegram.js';
import { verifyFacebookAuth } from './posters/facebook.js';
import { verifyInstagramAuth, discoverIgBusinessId } from './posters/instagram.js';

const app = express();
app.use(express.json());

// ---- admin auth middleware ----
function requireAdmin(req, res, next) {
  const tok = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!CONFIG.admin.token) return res.status(500).json({ error: 'ADMIN_TOKEN not set' });
  if (tok !== CONFIG.admin.token) return res.status(401).json({ error: 'unauthorized' });
  next();
}

// ---- public ----
app.get('/health', (req, res) => {
  res.json({
    ok: true,
    paused: CONFIG.flags.paused,
    dryRun: CONFIG.flags.dryRun,
    env: CONFIG.flags.nodeEnv,
    uptime: process.uptime(),
  });
});

// ---- admin ----
app.get('/status', requireAdmin, (req, res) => {
  res.json({
    scheduler: getSchedulerStatus(),
    log: getPostLog(50),
    config: {
      x: { postsPerDay: CONFIG.x.postsPerDay, hasCreds: !!CONFIG.x.apiKey },
      telegram: { postsPerDay: CONFIG.telegram.postsPerDay, hasCreds: !!CONFIG.telegram.botToken },
      facebook: { postsPerDay: CONFIG.facebook.postsPerDay, hasCreds: !!CONFIG.facebook.pageAccessToken },
      instagram: { postsPerDay: CONFIG.instagram.postsPerDay, hasCreds: !!CONFIG.instagram.fbAccessToken },
    },
  });
});

app.post('/pause', requireAdmin, (req, res) => {
  CONFIG.flags.paused = true;
  console.log('[admin] PAUSED at', new Date().toISOString());
  res.json({ paused: true });
});

app.post('/resume', requireAdmin, (req, res) => {
  CONFIG.flags.paused = false;
  console.log('[admin] RESUMED at', new Date().toISOString());
  res.json({ paused: false });
});

app.post('/run-now', requireAdmin, async (req, res) => {
  try {
    const result = await runCycle();
    res.json({ ok: true, result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/verify', requireAdmin, async (req, res) => {
  const [x, tg, fb, ig] = await Promise.all([
    verifyXAuth(),
    verifyTelegramAuth(),
    verifyFacebookAuth(),
    verifyInstagramAuth(),
  ]);
  res.json({ x, telegram: tg, facebook: fb, instagram: ig });
});

app.get('/admin/tg-chats', requireAdmin, async (req, res) => {
  try {
    const chats = await listRecentChats();
    res.json({ chats });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/admin/ig-discover', requireAdmin, async (req, res) => {
  const result = await discoverIgBusinessId();
  res.json(result);
});

// ---- Manually run a thought cycle ----
app.post('/run-thought', requireAdmin, async (req, res) => {
  try {
    const { runThoughtCycle } = await import('./scheduler.js');
    const result = await runThoughtCycle();
    res.json({ ok: true, result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---- Diagnostic endpoints — gated to non-production ----
function devOnly(req, res, next) {
  if (CONFIG.flags.nodeEnv === 'production') {
    return res.status(404).json({ error: 'not found' });
  }
  next();
}

// ---- Diagnostic: generate sample thoughts (no posting) ----
app.get('/admin/test-thought', requireAdmin, devOnly, async (req, res) => {
  try {
    const { generateThoughtBatch } = await import('./content/generator.js');
    const thoughts = await generateThoughtBatch(5);
    res.json({ ok: true, count: thoughts.length, thoughts: thoughts.map(t => t.post) });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

// ---- Diagnostic: directly call the X-post generator and return raw result + error ----
app.get('/admin/test-gen', requireAdmin, devOnly, async (req, res) => {
  try {
    const { generateXPost } = await import('./content/generator.js');
    const seed = { title: 'bitcoin hit 100k today', summary: 'BTC crossed the 100k mark today, retail crowd celebrates.', source: 'test' };
    const r = await generateXPost(seed);
    res.json({
      ok: true,
      hasApiKey: !!process.env.ANTHROPIC_API_KEY,
      apiKeyLen: (process.env.ANTHROPIC_API_KEY || '').length,
      result: r,
      postLength: (r?.post || '').length,
    });
  } catch (e) {
    res.json({
      ok: false,
      error: e.message,
      stack: e.stack,
      status: e.status,
      errorObj: e.error,
    });
  }
});

// ---- TikTok queue endpoints ----
app.get('/admin/tiktok/today', requireAdmin, async (req, res) => {
  try {
    const { getTodayQueue } = await import('./posters/tiktok-queue.js');
    const queue = await getTodayQueue();
    if (!queue) {
      return res.json({ date: new Date().toISOString().slice(0,10), items: [], note: 'no queue yet — wait for 06:00 UTC cron or hit POST /run-tiktok' });
    }
    res.json(queue);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/admin/tiktok/list', requireAdmin, async (req, res) => {
  try {
    const { listQueueDates } = await import('./posters/tiktok-queue.js');
    res.json({ dates: await listQueueDates() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/admin/tiktok/date/:date', requireAdmin, async (req, res) => {
  try {
    const { getQueueForDate } = await import('./posters/tiktok-queue.js');
    const q = await getQueueForDate(req.params.date);
    if (!q) return res.status(404).json({ error: 'no queue for date' });
    res.json(q);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/run-tiktok', requireAdmin, async (req, res) => {
  try {
    const { runTikTokDailyQueue } = await import('./scheduler.js');
    const result = await runTikTokDailyQueue();
    res.json({ ok: true, result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---- start ----
const PORT = CONFIG.admin.port;
app.listen(PORT, () => {
  console.log(`[bot] listening on :${PORT}`);
  startScheduler().catch(e => console.error('[bot] scheduler failed to start:', e));
});

process.on('unhandledRejection', (e) => console.error('[bot] unhandled rejection:', e));
process.on('uncaughtException', (e) => console.error('[bot] uncaught exception:', e));

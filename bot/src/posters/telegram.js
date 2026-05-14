/**
 * posters/telegram.js — post to Telegram channel and/or group via Bot API.
 *
 * Bot API is free + unlimited. Get token from @BotFather.
 * Add bot as admin to channel (@hate9000) and group, with "post messages" perm.
 */
import { CONFIG } from '../config.js';

const BASE = 'https://api.telegram.org/bot';

async function tgFetch(method, body) {
  const fetch = (await import('node-fetch')).default;
  const url = `${BASE}${CONFIG.telegram.botToken}/${method}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(`telegram ${method} failed: ${json.description || res.status}`);
  return json.result;
}

/**
 * Post a message to the announcements channel.
 * @param {string} text — markdown OK
 * @param {object} [opts]
 * @param {string} [opts.imageUrl] — optional image to attach (sends as photo with caption)
 * @returns {Promise<{ok: boolean, messageId?: number}>}
 */
export async function postToChannel(text, opts = {}) {
  if (CONFIG.flags.dryRun) {
    console.log('[telegram:channel] DRY_RUN —', text.slice(0, 140));
    return { ok: true, messageId: -1 };
  }
  if (!CONFIG.telegram.botToken) throw new Error('TELEGRAM_BOT_TOKEN not set');
  if (!CONFIG.telegram.channelId) throw new Error('TELEGRAM_CHANNEL_ID not set');

  try {
    let result;
    if (opts.imageUrl) {
      result = await tgFetch('sendPhoto', {
        chat_id: CONFIG.telegram.channelId,
        photo: opts.imageUrl,
        caption: text.slice(0, 1024),
        // no parse_mode — AI output may contain stray markdown chars
      });
    } else {
      result = await tgFetch('sendMessage', {
        chat_id: CONFIG.telegram.channelId,
        text: text.slice(0, 4000),
        // no parse_mode — plain text safer for AI output
        disable_web_page_preview: false,
      });
    }
    return { ok: true, messageId: result.message_id };
  } catch (e) {
    throw new Error('telegram channel post failed: ' + e.message);
  }
}

/** Same as postToChannel but to the chat group. */
export async function postToGroup(text, opts = {}) {
  if (CONFIG.flags.dryRun) {
    console.log('[telegram:group] DRY_RUN —', text.slice(0, 140));
    return { ok: true, messageId: -1 };
  }
  if (!CONFIG.telegram.groupId) {
    return { ok: false, error: 'TELEGRAM_GROUP_ID not set — skipping group post' };
  }
  return tgFetch('sendMessage', {
    chat_id: CONFIG.telegram.groupId,
    text: text.slice(0, 4000),
    // no parse_mode — plain text safer
  }).then(r => ({ ok: true, messageId: r.message_id }))
    .catch(e => { throw new Error('telegram group post failed: ' + e.message); });
}

/** Verify bot credentials work. Used by /status. */
export async function verifyTelegramAuth() {
  try {
    if (!CONFIG.telegram.botToken) return { ok: false, error: 'no bot token' };
    const me = await tgFetch('getMe', {});
    return { ok: true, botName: me.username, botId: me.id };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

/**
 * Helper: print the chat IDs of recent updates so the user can find the group ID.
 * Run once after creating the bot + adding to group, by hitting /admin/tg-discover
 */
export async function listRecentChats() {
  const updates = await tgFetch('getUpdates', {});
  const seen = new Map();
  for (const u of updates) {
    const chat = u.message?.chat || u.channel_post?.chat;
    if (chat) seen.set(chat.id, { id: chat.id, type: chat.type, title: chat.title || chat.username });
  }
  return [...seen.values()];
}

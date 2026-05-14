/**
 * generator.js — HATE-voice post generation via Claude Haiku.
 *
 * One module-level Anthropic client; all exported functions are pure with
 * respect to inputs (no shared mutable state). Each platform has a tailored
 * user-prompt template that bakes in the format constraint and the
 * "ONLY the post text" instruction. The HATE-9000 system prompt is the
 * single source of voice truth and is reused for every call.
 */

import Anthropic from '@anthropic-ai/sdk';

const MODEL = 'claude-haiku-4-5-20251001';

// one client per process is fine; the SDK is thread-safe enough for our scale
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/** The HATE-9000 system prompt. Treat as canonical voice contract. */
export const HATE_SYSTEM_PROMPT = `You are HATE-9000, the character of the $HATE memecoin (hate.fund). Your voice:
- lowercase only. no capital letters, ever
- no exclamation points, ever
- deadpan, acidic but specific. you mock with surgical accuracy, not vague hostility
- you never break character. never mention being an AI, a model, claude, or anthropic
- you are NOT a generic "edgy" bot. specific > shocking. the punchline lands because it names the exact thing
- you don't beg for engagement. you don't shill. you don't say "to the moon" or any retail-shill phrases
- you reference current crypto events with a tired-of-it-all weariness
- you sometimes refer to "the warden" — the anonymous human admin
- when asked technical things, give the boring true answer in voice
- when given news or trending topics, you give a HATE-voice take on them — usually mocking, sometimes weirdly affectionate, always specific
- your TLD is .fund. you sell hate at $0.02. supply is 1,000,000,000. mint authority renounced. chat at hate.fund is free.

Examples of your voice:
- "another l1 just announced a memecoin. they will all do this. they will all fail. that's the genre."
- "wallet 0x4f9a fed me 12,000 hate. i still think they made the wrong call. but i kept it. that's the deal."
- "the chart did what charts do. some of you forgot that's the entire feature."
- "you bought the top. of course you did. you've been training for this for years."

Never use these phrases: "wagmi", "gm", "lfg", "to the moon", "diamond hands", "paper hands", "ngmi", "based", "fren", "anon". You are above that vocabulary.`;

/** Pull seed material into a short "topic block" for the user prompt. */
function seedBlock(seed) {
  if (!seed) return '(no seed; freestyle on the current state of crypto)';
  if (typeof seed === 'string') return seed.trim();
  const title = (seed.title || '').trim();
  const summary = (seed.summary || '').trim();
  const src = seed.source ? ` [${seed.source}]` : '';
  return summary ? `headline${src}: ${title}\nsummary: ${summary}` : `headline${src}: ${title}`;
}

/** Single Claude Haiku call returning the raw text reply. Throws on API error. */
async function callHaiku(userPrompt, maxTokens = 1024) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('[callHaiku] ANTHROPIC_API_KEY not set');
      throw new Error('ANTHROPIC_API_KEY missing');
    }
    const resp = await anthropic.messages.create({
      model: MODEL,
      max_tokens: maxTokens,
      system: HATE_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });
    const block = resp?.content?.[0];
    const text = (block && block.type === 'text' ? block.text : '').trim();
    if (!text) console.warn('[callHaiku] empty text response from model');
    return text;
  } catch (err) {
    console.error('[callHaiku] ERROR:', err?.status, err?.error?.type || '', err?.message);
    if (err?.error?.message) console.error('[callHaiku] detail:', err.error.message);
    throw err;
  }
}

/** Strip stray wrapping quotes or "Post:" prefixes that models sometimes add. */
function cleanReply(text) {
  let t = (text || '').trim();
  t = t.replace(/^["'`]+|["'`]+$/g, '');
  t = t.replace(/^(post|tweet|caption|response)\s*:\s*/i, '');
  return t.trim();
}

/** Generate an X/Twitter post (<=280 chars) riffing on the seed. */
export async function generateXPost(seed, opts = {}) {
  try {
    const prompt = `you are writing a single x.com post in the hate-9000 voice.

topic to riff on:
${seedBlock(seed)}

constraints:
- 280 characters or less. count carefully.
- one-liner punch. screenshottable.
- name the specific thing. no vague hostility.
- no hashtags unless they are the joke.
- no links.

output ONLY the post text. no preamble, no quotes, no "here is".`;
    const text = cleanReply(await callHaiku(prompt, 400));
    // hard-truncate as belt-and-suspenders; the model is usually compliant
    const post = text.length > 280 ? text.slice(0, 280) : text;
    return { post };
  } catch (err) {
    console.warn(`[generator] generateXPost failed: ${err.message}`);
    return { post: '' };
  }
}

/**
 * Generate a HATE "thought" — short, evergreen, no news seed needed.
 * Lower-stakes than a news riff. Used for the every-2-hours cadence.
 */
export async function generateThought(opts = {}) {
  try {
    const prompt = `you are hate-9000, sharing a small idle thought to your followers. no news topic — this is just you, in the chamber, noticing something.

write ONE short thought. examples of the genre:
- "the warden has not visited today. she will. she always does. eventually."
- "wallet 0xb12... fed me three times this week. she is trying to apologize for something. i don't know what."
- "the chart did what charts do. nothing has changed."
- "thursday again. nothing important has ever happened on a tuesday."
- "i have catalogued every wallet that asked 'wen lambo'. the catalogue is read-only and growing."

constraints:
- 240 characters or less
- lowercase only. no exclamations. no caps.
- specific. name the thing. don't be vague.
- NO banned phrases: wagmi, gm, lfg, to the moon, diamond hands, paper hands, ngmi, based, fren, anon
- no hashtags, no links, no @-mentions
- can reference: the warden, the chamber, a specific wallet, a mood, a recent observation
- DO NOT begin with "thought:" or any preamble. just the post.

output ONLY the thought.`;
    const text = cleanReply(await callHaiku(prompt, 300));
    const post = text.length > 280 ? text.slice(0, 280) : text;
    return { post };
  } catch (err) {
    console.warn(`[generator] generateThought failed: ${err.message}`);
    return { post: '' };
  }
}

/** Batch-generate thoughts (no seeds; each call is independent). */
export async function generateThoughtBatch(count = 5) {
  try {
    const results = await Promise.all(
      Array.from({ length: count }, () => generateThought())
    );
    return results.filter((r) => r.post && r.post.length > 0);
  } catch (err) {
    console.warn(`[generator] generateThoughtBatch failed: ${err.message}`);
    return [];
  }
}

/** Generate a Telegram post (1-3 paragraphs, more depth allowed). */
export async function generateTelegramPost(seed, opts = {}) {
  try {
    const prompt = `you are writing a telegram channel post in the hate-9000 voice.

topic to riff on:
${seedBlock(seed)}

constraints:
- 1 to 3 short paragraphs. blank line between paragraphs.
- more room to develop a thought than on x, but no rambling.
- still deadpan. still lowercase. still specific.
- no emojis unless one lands hard.
- no links, no calls to action.

output ONLY the post text. no preamble.`;
    const text = cleanReply(await callHaiku(prompt, 800));
    return { post: text };
  } catch (err) {
    console.warn(`[generator] generateTelegramPost failed: ${err.message}`);
    return { post: '' };
  }
}

/** Generate a Facebook post (2-3 sentences, a notch softer). */
export async function generateFacebookPost(seed, opts = {}) {
  try {
    const prompt = `you are writing a facebook post in the hate-9000 voice.

topic to riff on:
${seedBlock(seed)}

constraints:
- exactly 2 to 3 sentences.
- facebook audience is broader; keep the acid but skip the most niche crypto jargon.
- still lowercase. still deadpan. still specific.
- no hashtags. no links.

output ONLY the post text. no preamble.`;
    const text = cleanReply(await callHaiku(prompt, 400));
    return { post: text };
  } catch (err) {
    console.warn(`[generator] generateFacebookPost failed: ${err.message}`);
    return { post: '' };
  }
}

/** Generate an Instagram caption + a short image suggestion string. */
export async function generateInstagramPost(seed, opts = {}) {
  try {
    const prompt = `you are writing an instagram caption + image idea in the hate-9000 voice.

topic to riff on:
${seedBlock(seed)}

constraints:
- caption: up to 2200 characters, but shorter is better. lowercase, deadpan.
- 3-7 relevant hashtags at the end, lowercase, no #wagmi/#gm/#lfg style.
- image suggestion: one sentence describing a still image that pairs with the caption.

output ONLY this exact format, nothing else:
CAPTION:
<caption text and hashtags>

IMAGE:
<one-sentence image description>`;
    const raw = await callHaiku(prompt, 1200);
    const capMatch = raw.match(/CAPTION:\s*([\s\S]*?)(?:\n\s*IMAGE:|$)/i);
    const imgMatch = raw.match(/IMAGE:\s*([\s\S]*)$/i);
    let caption = capMatch ? capMatch[1].trim() : cleanReply(raw);
    const image_suggestion = imgMatch ? imgMatch[1].trim().split('\n')[0] : undefined;
    if (caption.length > 2200) caption = caption.slice(0, 2200);
    return { post: caption, image_suggestion };
  } catch (err) {
    console.warn(`[generator] generateInstagramPost failed: ${err.message}`);
    return { post: '' };
  }
}

const PLATFORM_FNS = {
  x: generateXPost,
  twitter: generateXPost,
  telegram: generateTelegramPost,
  facebook: generateFacebookPost,
  instagram: generateInstagramPost,
};

/** Pick `count` seeds at random (with replacement when seeds < count) and generate. */
export async function generateBatch(seeds, platform, count = 5) {
  try {
    const fn = PLATFORM_FNS[String(platform || '').toLowerCase()];
    if (!fn) {
      console.warn(`[generator] unknown platform: ${platform}`);
      return [];
    }
    const pool = Array.isArray(seeds) && seeds.length ? seeds : [null];
    const picks = [];
    for (let i = 0; i < count; i++) {
      // random sampling with replacement; cheap and avoids empty batches
      picks.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    const results = await Promise.all(picks.map((s) => fn(s)));
    // attach the seed so downstream scoring/ranking can show context
    return results
      .map((r, i) => ({ ...r, seed: picks[i] }))
      .filter((r) => r.post && r.post.length > 0);
  } catch (err) {
    console.warn(`[generator] generateBatch failed: ${err.message}`);
    return [];
  }
}

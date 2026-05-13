/**
 * scorer.js — quality scoring + ranking for HATE-voice posts.
 *
 * Uses Claude Haiku as a judge with a rubric tuned for the HATE-9000 voice:
 * voice-coherence, specificity (vs generic edgy), punchline strength,
 * and screenshot-ability. Returns 0-100 + one-sentence reasoning.
 *
 * No global state. Each call is independent. Parse failures default to 50
 * so a flaky judge response never erases an entire batch.
 */

import Anthropic from '@anthropic-ai/sdk';

const MODEL = 'claude-haiku-4-5-20251001';
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PLATFORM_LIMITS = {
  x: 280,
  twitter: 280,
  telegram: 4096,
  facebook: 2000,
  instagram: 2200,
};

/** The scoring rubric used to grade a post. */
export const SCORING_PROMPT = `You are evaluating tweets/posts written in a specific character voice for the $HATE memecoin. The voice is HATE-9000: lowercase only, no exclamations, deadpan, acidic but SPECIFIC (not generic).

A post scores high (80-100) if:
- it's screenshottable — makes you want to share it
- voice-coherent (lowercase, no exclamations, no banned phrases)
- specific (names exact thing, not vague hostility)
- has a punchline or precise observation
- riffs on the current/relevant topic
- ≤ the platform's char limit

A post scores mid (40-79) if:
- voice is right but specificity is weak
- punchline lands but is generic
- relevant but not memorable

A post scores low (0-39) if:
- breaks voice (caps, exclamations, banned phrases like wagmi/gm/lfg)
- is generic ("crypto is volatile lol")
- begs for engagement
- mentions being an AI or claude
- exceeds char limit
- preaches/lectures

Output ONLY this JSON shape:
{"score": NUMBER, "reasoning": "ONE SENTENCE"}`;

/** Extract the first JSON object from a model reply. Returns null on no match. */
function extractJson(text) {
  if (!text) return null;
  // try fenced block first, then a loose first-{ ... last-} grab
  const fenced = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/i);
  const candidate = fenced ? fenced[1] : null;
  if (candidate) {
    try { return JSON.parse(candidate); } catch (_) { /* fall through */ }
  }
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch (_) {
    return null;
  }
}

/** Clamp a score to 0-100 ints; coerce strings; fall back to 50 if NaN. */
function clampScore(n) {
  const v = Math.round(Number(n));
  if (!Number.isFinite(v)) return 50;
  return Math.max(0, Math.min(100, v));
}

/** Score a single post against the HATE rubric. Returns {score, reasoning}. */
export async function scorePost(post, platform) {
  try {
    if (!post || typeof post !== 'string' || !post.trim()) {
      return { score: 0, reasoning: 'empty post' };
    }
    const limit = PLATFORM_LIMITS[String(platform || '').toLowerCase()] || 280;
    const userPrompt = `platform: ${platform || 'x'}
char limit: ${limit}
post length: ${post.length}

post to evaluate:
"""
${post}
"""

evaluate using the rubric. output ONLY the JSON object.`;
    const resp = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 300,
      system: SCORING_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });
    const block = resp?.content?.[0];
    const text = block && block.type === 'text' ? block.text : '';
    const parsed = extractJson(text);
    if (!parsed) {
      console.warn('[scorer] could not parse judge JSON; defaulting to 50');
      return { score: 50, reasoning: 'parse failure; default score' };
    }
    return {
      score: clampScore(parsed.score),
      reasoning: String(parsed.reasoning || '').trim() || 'no reasoning provided',
    };
  } catch (err) {
    console.warn(`[scorer] scorePost failed: ${err.message}`);
    return { score: 50, reasoning: `scoring error: ${err.message}` };
  }
}

/** Score every post in `posts` and return a new array sorted by score desc. */
export async function rankPosts(posts, platform) {
  try {
    if (!Array.isArray(posts) || posts.length === 0) return [];
    const scored = await Promise.all(
      posts.map(async (p) => {
        const text = typeof p === 'string' ? p : (p?.post || '');
        const judge = await scorePost(text, platform);
        return { ...(typeof p === 'object' ? p : { post: text }), ...judge };
      })
    );
    scored.sort((a, b) => b.score - a.score);
    return scored;
  } catch (err) {
    console.warn(`[scorer] rankPosts failed: ${err.message}`);
    return [];
  }
}

/**
 * Pick top N posts but add small jitter so we don't always crown identical patterns.
 * Jitter is +/- 5 points, applied to a copy of the score for sorting only.
 */
export async function pickTop(posts, platform, n = 3) {
  try {
    const ranked = await rankPosts(posts, platform);
    if (ranked.length === 0) return [];
    const jittered = ranked.map((p) => ({
      ...p,
      _sortScore: p.score + (Math.random() * 10 - 5),
    }));
    jittered.sort((a, b) => b._sortScore - a._sortScore);
    // strip internal field before returning
    return jittered.slice(0, Math.max(1, n)).map(({ _sortScore, ...rest }) => rest);
  } catch (err) {
    console.warn(`[scorer] pickTop failed: ${err.message}`);
    return [];
  }
}

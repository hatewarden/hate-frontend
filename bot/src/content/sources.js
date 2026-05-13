/**
 * sources.js — content seed pullers for the $HATE social bot.
 *
 * Pulls news + community chatter from a handful of free sources:
 *  - RSS: CoinDesk, Decrypt, TheBlock, solana.com, SolanaFloor
 *  - Reddit JSON: r/CryptoCurrency, r/solana, r/CryptoMoonShots, r/SatoshiStreetBets
 *
 * Each fetcher is wrapped in try/catch and degrades to [] on failure so
 * one dead feed never crashes a generation cycle. All functions are pure
 * (no module-level state) and return plain objects safe to serialize.
 */

import Parser from 'rss-parser';
import fetch from 'node-fetch';

const UA = 'hate-bot/1.0';
const REDDIT_HEADERS = { 'User-Agent': UA, 'Accept': 'application/json' };
const RSS_TIMEOUT_MS = 10000;

// shared parser; rss-parser instances are stateless across parseURL calls
const parser = new Parser({
  timeout: RSS_TIMEOUT_MS,
  headers: { 'User-Agent': UA },
});

/** Normalize an RSS item into our common seed shape. */
function normalizeRssItem(item, source) {
  return {
    title: (item.title || '').trim(),
    summary: (item.contentSnippet || item.content || item.summary || '').trim().slice(0, 400),
    url: item.link || item.guid || '',
    source,
    fetched_at: new Date().toISOString(),
  };
}

/** Very cheap title-similarity dedup: collapse whitespace, lowercase, compare prefix. */
function dedupeByTitle(items) {
  const seen = new Set();
  const out = [];
  for (const it of items) {
    const key = (it.title || '').toLowerCase().replace(/\s+/g, ' ').slice(0, 60);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(it);
  }
  return out;
}

/** Pull one RSS feed, never throw. */
async function safeParseFeed(url, source) {
  try {
    const feed = await parser.parseURL(url);
    return (feed.items || []).map((it) => normalizeRssItem(it, source));
  } catch (err) {
    console.warn(`[sources] RSS fetch failed for ${source}: ${err.message}`);
    return [];
  }
}

/** Pull top crypto headlines from CoinDesk, Decrypt, TheBlock; merged + deduped. */
export async function fetchCryptoNews() {
  try {
    const feeds = [
      ['https://www.coindesk.com/arc/outboundfeeds/rss/', 'coindesk'],
      ['https://decrypt.co/feed', 'decrypt'],
      ['https://www.theblock.co/rss.xml', 'theblock'],
    ];
    const results = await Promise.all(feeds.map(([u, s]) => safeParseFeed(u, s)));
    const merged = results.flat();
    // sort by isoDate desc when available, else preserve insertion order
    merged.sort((a, b) => {
      const da = Date.parse(a.fetched_at) || 0;
      const db = Date.parse(b.fetched_at) || 0;
      return db - da;
    });
    return dedupeByTitle(merged).slice(0, 5);
  } catch (err) {
    console.warn(`[sources] fetchCryptoNews failed: ${err.message}`);
    return [];
  }
}

/** Pull Solana-ecosystem headlines from solana.com + SolanaFloor. */
export async function fetchSolanaNews() {
  try {
    const feeds = [
      ['https://solana.com/news/rss.xml', 'solana.com'],
      ['https://solanafloor.com/feed.xml', 'solanafloor'],
    ];
    const results = await Promise.all(feeds.map(([u, s]) => safeParseFeed(u, s)));
    return dedupeByTitle(results.flat()).slice(0, 3);
  } catch (err) {
    console.warn(`[sources] fetchSolanaNews failed: ${err.message}`);
    return [];
  }
}

/** Fetch + normalize a Reddit "hot" listing for one subreddit. */
async function fetchSubredditHot(sub, minScore = 50) {
  try {
    const url = `https://www.reddit.com/r/${sub}/hot.json?limit=10`;
    const res = await fetch(url, { headers: REDDIT_HEADERS });
    if (!res.ok) {
      console.warn(`[sources] reddit ${sub} HTTP ${res.status}`);
      return [];
    }
    const data = await res.json();
    const children = data?.data?.children || [];
    return children
      .map((c) => c.data)
      .filter((p) => p && !p.stickied && typeof p.score === 'number' && p.score >= minScore)
      .map((p) => ({
        title: (p.title || '').trim(),
        summary: (p.selftext || '').trim().slice(0, 400),
        url: p.url_overridden_by_dest || `https://www.reddit.com${p.permalink}`,
        score: p.score,
        source: `reddit/${sub}`,
        fetched_at: new Date().toISOString(),
      }));
  } catch (err) {
    console.warn(`[sources] reddit ${sub} fetch failed: ${err.message}`);
    return [];
  }
}

/** Pull hot posts from r/CryptoCurrency + r/solana, filter score>=50, dedupe. */
export async function fetchRedditMemecoins() {
  try {
    const results = await Promise.all([
      fetchSubredditHot('CryptoCurrency', 50),
      fetchSubredditHot('solana', 50),
    ]);
    return dedupeByTitle(results.flat());
  } catch (err) {
    console.warn(`[sources] fetchRedditMemecoins failed: ${err.message}`);
    return [];
  }
}

/** Pull hot posts from the degen subs — lower bar, these are the meme firehoses. */
export async function fetchTrendingMemes() {
  try {
    const results = await Promise.all([
      fetchSubredditHot('CryptoMoonShots', 50),
      fetchSubredditHot('SatoshiStreetBets', 50),
    ]);
    return dedupeByTitle(results.flat());
  } catch (err) {
    console.warn(`[sources] fetchTrendingMemes failed: ${err.message}`);
    return [];
  }
}

/** Run all four pullers in parallel; returns object with named buckets. */
export async function fetchAllSources() {
  try {
    const [cryptoNews, solanaNews, redditCrypto, redditMemes] = await Promise.all([
      fetchCryptoNews(),
      fetchSolanaNews(),
      fetchRedditMemecoins(),
      fetchTrendingMemes(),
    ]);
    return { cryptoNews, solanaNews, redditCrypto, redditMemes };
  } catch (err) {
    console.warn(`[sources] fetchAllSources failed: ${err.message}`);
    return { cryptoNews: [], solanaNews: [], redditCrypto: [], redditMemes: [] };
  }
}

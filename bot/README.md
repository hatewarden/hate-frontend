# hate-bot

4-platform auto-poster for $HATE. Pulls news from RSS + Reddit, generates HATE-voice posts via Claude Haiku, posts to X / Telegram / Facebook / Instagram on a per-platform schedule.

## What it does

Every hour at `:05`:
1. Pull recent items from CoinDesk, Decrypt, TheBlock, Solana RSS, r/CryptoCurrency, r/solana, r/CryptoMoonShots, r/SatoshiStreetBets
2. Generate 4-5 candidate posts per platform via Claude Haiku, voice-locked to HATE-9000
3. Score each candidate via Claude (voice coherence, specificity, screenshottability)
4. Probabilistically fire the top one to its platform (rate-limited per-day, quiet hours respected)

Daily caps (configurable per platform):
- X: 4 posts/day
- Telegram: 2 posts/day
- Facebook: 1 post/day
- Instagram: 1 post/day

## Quick start

1. Get all the credentials (see `CREDENTIALS_CHECKLIST.md`)
2. `cp .env.example .env`, fill in
3. `npm install`
4. `npm run test:once` — runs one cycle in dry-run mode (set `DRY_RUN=true` in .env first to be safe)
5. Once happy, deploy to Railway: connect this directory as a service, paste env vars from `.env`, set `DRY_RUN=false`
6. Hit `https://<railway-url>/verify` with `Authorization: Bearer <ADMIN_TOKEN>` to confirm all platforms auth correctly
7. Set `LAUNCH_DATE` to your actual launch moment. Bot will quietly wait until that timestamp passes, then start posting.

## Operating the bot

All admin endpoints require header `Authorization: Bearer <ADMIN_TOKEN>`.

```bash
# Liveness (public)
curl https://<bot>/health

# Full status: last cycle, post log, config
curl -H "Authorization: Bearer $T" https://<bot>/status

# Kill switch
curl -X POST -H "Authorization: Bearer $T" https://<bot>/pause
curl -X POST -H "Authorization: Bearer $T" https://<bot>/resume

# Manually trigger a cycle now
curl -X POST -H "Authorization: Bearer $T" https://<bot>/run-now

# Verify all four platforms authenticate
curl -H "Authorization: Bearer $T" https://<bot>/verify

# Discover Telegram group ID (after bot is added to group + group has activity)
curl -H "Authorization: Bearer $T" https://<bot>/admin/tg-chats

# Discover IG Business Account ID
curl -H "Authorization: Bearer $T" https://<bot>/admin/ig-discover
```

## Architecture

```
src/
  config.js          - env loading + posting rules
  state.js           - persistent state (posts-today, dedupe hashes, log)
  content/
    sources.js       - RSS + Reddit fetchers
    generator.js     - Claude Haiku post generation (per-platform format)
    scorer.js        - Claude scoring (voice + quality)
  posters/
    x.js             - twitter-api-v2 wrapper
    telegram.js      - Bot API wrapper
    facebook.js      - Graph API wrapper
    instagram.js     - Graph API wrapper (via FB Business)
  scheduler.js       - orchestrator (cron, throttling, dedupe)
  server.js          - Express HTTP server + admin endpoints
```

## Cost

- Claude Haiku for gen + scoring: ~$3-8/month at default settings
- Railway hosting: free tier covers it
- All four platform APIs: free
- Total: under $10/month

## Safety notes

- The kill-switch (`/pause`) is the single most important feature. Bookmark a phone shortcut for it.
- `DRY_RUN=true` runs everything except actual posting. Use during testing.
- The post log is in `bot-state.json` and surfaced via `/status` — review periodically to catch off-brand posts.
- Bot won't post during `QUIET_HOURS` (default: 0-6 UTC, midnight-6am).
- Bot won't post before `LAUNCH_DATE`.
- Dedupe: bot remembers the last 500 posts' hashes and won't repeat.

## Troubleshooting

- **Posts not appearing on X**: hit `/verify` first. If X reports `ok: false`, regenerate the access token after confirming Read+Write app permissions.
- **Telegram silent**: bot must be admin in the channel/group with Post Messages perm. Use `/admin/tg-chats` to confirm bot can see the chat.
- **Instagram "media creation failed"**: image URL must be HTTPS, JPG/PNG (not SVG), publicly accessible without auth. The default is `https://hate.fund/hate-logo.png`.
- **Facebook "(#10) requires permission"**: the Page Access Token needs `pages_manage_posts` AND `pages_read_engagement`. Re-grant in Graph API Explorer.

## License

private — don't redistribute the voice prompts; the character is the project's IP.

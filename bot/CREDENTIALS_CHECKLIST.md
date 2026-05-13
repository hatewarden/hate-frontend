# bot — credentials checklist

Wednesday morning, ~30 minutes. Do these in order. Save every value to a single text file as you go. When you have them all, paste them in chat. I plug them into Railway environment variables. Bot starts.

---

## 1. X (Twitter) — 10 min

1. Go to **https://developer.twitter.com** while signed in as @hate9000
2. Click **Sign up** (or Apply if not prompted). Choose **Free** tier. Fill in:
   - Use case: "I'm building a social media bot for a project I run"
   - Will not analyze X data: yes
   - Will not allow other users to access: yes
3. Approval is instant for Free tier.
4. Once in the dev portal: **Projects & Apps → Default project → Add new app**
   - App name: `hate-9000-bot` (or any unique name)
5. After creating: **User authentication settings → Set up**
   - App permissions: **Read and write** (CRITICAL — default is read-only)
   - Type of App: **Web App, Automated App or Bot**
   - Callback URL: `https://hate.fund/oauth-callback` (placeholder, not used)
   - Website URL: `https://hate.fund`
   - Save.
6. Go to **Keys and tokens** tab. Generate / copy these four:

```
X_API_KEY=                      (called "API Key")
X_API_SECRET=                   (called "API Key Secret")
X_ACCESS_TOKEN=                 (called "Access Token")
X_ACCESS_TOKEN_SECRET=          (called "Access Token Secret")
```

**Important:** if you regenerated keys after changing permissions, USE THE NEW ONES. Old tokens won't have write perms.

---

## 2. Telegram — 5 min

1. Open Telegram. Search for **@BotFather** (the official Telegram bot — has a blue checkmark).
2. Send `/newbot`. Follow prompts:
   - Bot name: `HATE 9000` (display name)
   - Bot username: `hate9000_news_bot` (must end in `_bot`; try variations if taken)
3. BotFather replies with a token like `8123456789:AAExxxxxxxxxxxxxxx`. **Save this:**

```
TELEGRAM_BOT_TOKEN=
```

4. Now add the bot to your channel @hate9000:
   - Open the channel → settings (3 dots) → Administrators → Add Admin → search `hate9000_news_bot`
   - Permissions: enable **Post Messages**. Disable everything else. Save.
5. Add the bot to your group too (https://t.me/+mldtMEPW_vZlOTE5):
   - Open the group → settings → Administrators → Add Admin → search `hate9000_news_bot`
   - Permissions: **Send Messages, Send Media** (everything else off). Save.

You don't need group ID right now — after deploy, I'll hit `/admin/tg-chats` to discover it.

```
TELEGRAM_CHANNEL_ID=@hate9000
TELEGRAM_GROUP_ID=                  (leave blank, we discover after deploy)
```

---

## 3. Facebook Page — 5 min

1. Go to **https://facebook.com/pages/create**
2. Page name: `$HATE` (or `HATE 9000` — your call)
3. Category: **Brand** or **Product/Service**
4. Description: paste the one from `hate-metadata.json` description field
5. Click **Create Page**.
6. Once on the Page: copy the **Page ID** from the About section, or check the URL: `facebook.com/profile.php?id=XXXXXXXXXXXXXX` — the number after `id=` is the Page ID.

```
FB_PAGE_ID=
```

---

## 4. Instagram Business — 3 min

1. Open Instagram mobile app, signed in as @hate9000 (or whatever your IG handle is)
2. Profile → ☰ → Settings and Privacy → Account type and tools → Switch account type → **Business**
3. Category: **Brand** or **Product/Service**
4. Connect to Facebook Page → choose the `$HATE` Page from step 3
5. Done. No env var to capture here — we discover the IG Business Account ID after deploy using the bot's `/admin/ig-discover` endpoint.

```
IG_BUSINESS_ACCOUNT_ID=             (we discover this after deploy)
```

---

## 5. Facebook Developer App + Long-Lived Token — 10 min (the tricky one)

This gets you `FB_PAGE_ACCESS_TOKEN`. Steps:

1. Go to **https://developers.facebook.com/apps** → **Create App**
2. App use case: **Other** → **Business**
3. App name: `hate-9000-poster`
4. Once created, in the left sidebar: **App Settings → Basic**. Save the **App ID** and **App Secret** (we don't need them in env, but keep them safe).
5. Add products: click **Add Product** in left sidebar
   - **Facebook Login for Business** → Set up
   - **Instagram → Instagram Graph API** → Set up
6. Now generate the token:
   - Go to **https://developers.facebook.com/tools/explorer**
   - Top right: select your app `hate-9000-poster`
   - Click **Generate Access Token** (small button under app selector)
   - In the permissions popup, add ALL of these:
     - `pages_show_list`
     - `pages_read_engagement`
     - `pages_manage_posts`
     - `pages_manage_metadata`
     - `instagram_basic`
     - `instagram_content_publishing`
     - `business_management`
   - You'll be redirected to Facebook to grant permissions → continue
7. You now have a **short-lived user token** in Graph API Explorer. We need the long-lived **Page** token:
   - In the request URL field at the top, paste: `me/accounts`
   - Click **Submit**
   - Find your `$HATE` page in the response. Copy its `access_token` value. This is your long-lived (60-day) Page Access Token.

```
FB_PAGE_ACCESS_TOKEN=
```

**Important:** Page tokens auto-refresh as long as the bot uses them. You only need to regenerate if you go 60 days without posting.

---

## 6. ADMIN_TOKEN (for /pause endpoint) — 30 seconds

Generate a random string. Use a password manager, or run in any terminal:
```bash
openssl rand -hex 32
```

```
ADMIN_TOKEN=
```

Save this. You'll need it when you want to pause the bot from your phone (sending a POST to `/pause` with `Authorization: Bearer <ADMIN_TOKEN>`).

---

## Send me back, all in one paste:

```
ANTHROPIC_API_KEY=
X_API_KEY=
X_API_SECRET=
X_ACCESS_TOKEN=
X_ACCESS_TOKEN_SECRET=
TELEGRAM_BOT_TOKEN=
FB_PAGE_ID=
FB_PAGE_ACCESS_TOKEN=
ADMIN_TOKEN=
```

(IG_BUSINESS_ACCOUNT_ID and TELEGRAM_GROUP_ID will be discovered automatically after first deploy.)

I'll deploy to Railway, run `/verify` to confirm all four platforms authenticate, then we set `LAUNCH_DATE` to Thursday's actual go-time and the bot takes over.

---

## Common pitfalls (read this so we don't waste time debugging)

- **X "Read-only" 403 errors** → you forgot to set app permissions to "Read and write" BEFORE generating the access token. Solution: change perms, regenerate token.
- **Facebook "Invalid OAuth access token"** → you're using a User token instead of a Page token. Always grab the Page token from the `/me/accounts` response.
- **Instagram "Application does not have permission"** → the `instagram_content_publishing` permission requires App Review for production use. For the first 50 posts you get a "Development Mode" pass; after that we need to submit the app for review (free, takes ~3-7 days). Plenty of runway for launch week.
- **Telegram bot says "Forbidden: bot was kicked"** → you removed the bot from the channel. Re-add as admin with Post Messages perm.

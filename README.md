# ano

**Personalized feed algorithm as a service.**  
Drop ano into any platform — news apps, social networks, content aggregators — and your users get a feed that learns what they care about.

---

## What ano does

ano sits between your content database and your frontend. You send it posts + a user ID, it returns the same posts ranked by relevance to that specific user. No ML pipeline to maintain, no model to train, no infra to scale yourself.

```
Your platform                ano                    Your frontend
─────────────────    ──────────────────────    ──────────────────────
POST /feed        →  NLP topic extraction  →  Ranked, personalized feed
POST /event       →  Implicit learning     →  Feed improves over time
POST /onboard     →  Explicit preferences  →  Good feed from day one
```

---

## How it works

1. **Topic extraction** — ano parses every post title and body, strips noise (named entities, model codes, prices), and extracts weighted topic signals from a built-in taxonomy (military, aviation, politics, economy, technology, health, sports, food, science, entertainment, crime, business).

2. **User profiles** — each of your users gets a profile that stores:
   - **Explicit** preferences (topics they said they like or dislike during onboarding)
   - **Implicit** signals learned from engagement (share, like, click, view, skip, hide)

3. **Feed scoring** — every post gets a score: `topic_match × recency_boost × diversity_penalty`. Full breakdown returned per post so you can show users *why* they're seeing something.

4. **Persistence** — profiles live in Firestore. ano handles all reads and writes.

---

## Quickstart

### 1. Clone and install

```bash
git clone https://github.com/your-org/ano
cd ano
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Fill in your Firebase project credentials
# Add your ANO_MASTER_KEY (any strong random string — used for admin routes)
```

### 3. Start the server

```bash
npm start          # production
npm run dev        # development (auto-restart on changes)
```

### 4. Create your first API key

```bash
curl -X POST http://localhost:3000/admin/keys \
  -H "x-ano-master-key: YOUR_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{"tenantId": "acme-news", "label": "Acme News App"}'
```

Response:
```json
{ "apiKey": "ano_live_xxxxxxxxxxxxxxxx", "tenantId": "acme-news" }
```

### 5. Rank a feed

```bash
curl -X POST http://localhost:3000/feed \
  -H "x-ano-api-key: ano_live_xxxxxxxxxxxxxxxx" \
  -H "x-ano-user-id: user_abc123" \
  -H "Content-Type: application/json" \
  -d '{
    "posts": [
      {
        "id": "post_1",
        "title": "Army conducts anti-terror operation in border region",
        "body": "Military forces launched a combat operation near the border...",
        "timestamp": "2026-03-13T10:00:00Z",
        "platform": "news"
      }
    ]
  }'
```

---

## Integration guide

### Authentication

Every request requires two headers:

| Header | Value |
|--------|-------|
| `x-ano-api-key` | Your tenant API key (`ano_live_...`) |
| `x-ano-user-id` | The end-user's ID in your system |

`x-ano-user-id` is typically your platform's user ID (Clerk user ID, Firebase UID, Supabase UUID — anything stable and unique per user).

### Typical integration flow

```
User signs up on your platform
  → POST /profile/{userId}/onboard    (ask 3-5 topic preferences)

User opens feed
  → POST /feed                        (send your posts, get ranked feed back)

User interacts with a post
  → POST /event                       (send the interaction — like, share, skip...)

Repeat. Profile improves over time automatically.
```

### Rate limits

| Plan | Requests / min | Profiles |
|------|---------------|----------|
| Free | 60 | 1,000 users |
| Pro | 600 | Unlimited |
| Enterprise | Custom | Custom |

Rate limit headers are returned on every response:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 58
X-RateLimit-Reset: 1710324120
```

---

## API reference

See [API.md](./API.md) for full endpoint documentation.

---

## Self-hosting vs managed

**Self-hosted** (this repo): you run ano on your own infrastructure, connect your own Firebase project. Full control, zero usage fees.

**Managed** (coming soon): ano hosted for you with a usage-based pricing model. No infra to manage.

---

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `FIREBASE_API_KEY` | ✓ | Firebase project API key |
| `FIREBASE_AUTH_DOMAIN` | ✓ | Firebase auth domain |
| `FIREBASE_PROJECT_ID` | ✓ | Firebase project ID |
| `FIREBASE_STORAGE_BUCKET` | ✓ | Firebase storage bucket |
| `FIREBASE_MESSAGING_SENDER_ID` | ✓ | Firebase messaging sender ID |
| `FIREBASE_APP_ID` | ✓ | Firebase app ID |
| `ANO_MASTER_KEY` | ✓ | Admin key for creating/revoking API keys |
| `PORT` | | Server port (default: 3000) |
| `NODE_ENV` | | `development` or `production` |
| `FEED_LIMIT` | | Max posts returned per feed call (default: 50) |
| `DECAY_ON_FETCH` | | Decay implicit scores on every feed fetch (default: true) |

---

## License

MIT

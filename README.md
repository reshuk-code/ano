# ano

<p align="center">
  <strong>Personalized feed ranking — as an API.</strong><br>
  Send posts. Get them ranked. Your users see what they actually care about.
</p>

<p align="center">
  <a href="https://ano-ochre.vercel.app"><img src="https://img.shields.io/badge/demo-live-brightgreen?style=flat-square" alt="Demo"></a>
  <a href="https://github.com/reshuk-code/ano/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT License"></a>
  <a href="https://github.com/reshuk-code/ano/blob/main/API.md"><img src="https://img.shields.io/badge/docs-API%20reference-orange?style=flat-square" alt="API Docs"></a>
  <img src="https://img.shields.io/badge/node-%3E%3D18-339933?style=flat-square&logo=node.js" alt="Node 18+">
  <img src="https://img.shields.io/badge/deployed%20on-Vercel-black?style=flat-square&logo=vercel" alt="Vercel">
</p>

---

## The problem

Every developer building a content app eventually hits this wall:

> "Our feed is just chronological. Users churn because they're not seeing what they care about. But building a recommendation system takes months and an ML team we don't have."

**ano is the shortcut.** Two API calls. No ML pipeline. No model to train. No infra to manage.

```
Your app                     ano                       Your users
────────────────    ─────────────────────────    ───────────────────────
POST /feed       →  topic extraction + scoring →  ranked, personal feed
POST /event      →  implicit learning          →  feed improves over time
```

---

## Quickstart — 5 minutes to a personalized feed

### 1. Use the managed API (no setup)

Get a free API key at **[ano-ochre.vercel.app](https://ano-ochre.vercel.app)** → Dashboard.

### 2. Rank your first feed

```bash
curl -X POST https://ano-ochre.vercel.app/feed \
  -H "x-ano-api-key: ano_live_YOUR_KEY" \
  -H "x-ano-user-id: user_123" \
  -H "Content-Type: application/json" \
  -d '{
    "posts": [
      { "id": "p1", "title": "SpaceX launches Starship", "body": "...", "timestamp": "2026-03-13T10:00:00Z" },
      { "id": "p2", "title": "Champions League final results", "body": "...", "timestamp": "2026-03-13T09:00:00Z" },
      { "id": "p3", "title": "Fed holds interest rates steady", "body": "...", "timestamp": "2026-03-13T08:00:00Z" }
    ]
  }'
```

Response — posts ranked for *this specific user*:

```json
{
  "feed": [
    {
      "id": "p1",
      "_score": {
        "final": 0.91,
        "primaryTopic": "science",
        "breakdown": [{ "topic": "science", "postWeight": 1.0, "userScore": 0.95, "contribution": 0.95 }]
      }
    }
  ]
}
```

### 3. Record engagement so the feed learns

```bash
curl -X POST https://ano-ochre.vercel.app/event \
  -H "x-ano-api-key: ano_live_YOUR_KEY" \
  -H "x-ano-user-id: user_123" \
  -H "Content-Type: application/json" \
  -d '{ "eventType": "like", "post": { "id": "p1", "title": "SpaceX launches Starship" } }'
```

That's it. Every like, share, skip, and hide improves the ranking automatically.

---

## How it works

**1. Topic extraction**
Every post title and body is parsed through a built-in NLP layer. Noise (named entities, prices, model numbers) is stripped. Weighted topic signals are extracted from a 12-topic taxonomy: `military · aviation · politics · economy · technology · health · sports · food · science · entertainment · crime · business`.

**2. User profiles**
Each user gets a profile with two signal types:
- **Explicit** — topics they selected during onboarding (`like` / `dislike`)
- **Implicit** — learned from engagement events over time

**3. Scoring formula**
```
rawScore     = Σ (postTopicWeight[t] × userScore[t])
finalScore   = rawScore × recencyBoost × diversityPenalty
```
Every scored post includes a full `breakdown` array — use it to build a *"why am I seeing this?"* transparency feature.

**4. Cold-start solved**
New users with no history start with a neutral profile. Call `POST /profile/:userId/onboard` once at signup with 3–5 topic preferences and the first feed is already personalized.

---

## API reference

| Endpoint | Method | Description |
|---|---|---|
| `/feed` | POST | Rank a list of posts for a user |
| `/event` | POST | Record engagement (like, share, skip, hide…) |
| `/profile/:userId/onboard` | POST | Set initial topic preferences |
| `/profile/:userId` | GET | Fetch a user's profile |
| `/profile/:userId` | POST | Update explicit topic preferences |
| `/profile/:userId` | DELETE | Delete a profile (GDPR) |
| `/admin/keys` | POST | Issue a new API key |
| `/admin/keys` | DELETE | Revoke an API key |
| `/health` | GET | Health check |

**→ Full docs in [API.md](./API.md)**

### Event types and their weights

| Event | Weight | When to fire |
|---|---|---|
| `share` | +0.15 | User shares the post |
| `like` | +0.10 | User likes / upvotes |
| `click` | +0.06 | User clicks to read |
| `view` | +0.03 | Post visible for 3+ seconds |
| `skip` | -0.08 | User scrolled past |
| `hide` | -0.15 | User explicitly hides |

---

## Self-hosting

### Prerequisites
- Node.js 18+
- A Firebase project (Firestore enabled)

### Setup

```bash
git clone https://github.com/reshuk-code/ano
cd ano
npm install
cp .env.example .env
# Fill in your Firebase credentials and set ANO_MASTER_KEY
npm run dev
```

### Create your first API key

```bash
curl -X POST http://localhost:3000/admin/keys \
  -H "x-ano-master-key: YOUR_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{"tenantId": "my-app", "label": "My App — Production"}'
```

> ⚠️ The raw API key is returned **once only**. Store it immediately.

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `FIREBASE_API_KEY` | ✓ | Firebase project API key |
| `FIREBASE_AUTH_DOMAIN` | ✓ | Firebase auth domain |
| `FIREBASE_PROJECT_ID` | ✓ | Firebase project ID |
| `FIREBASE_STORAGE_BUCKET` | ✓ | Firebase storage bucket |
| `FIREBASE_MESSAGING_SENDER_ID` | ✓ | Firebase messaging sender ID |
| `FIREBASE_APP_ID` | ✓ | Firebase app ID |
| `ANO_MASTER_KEY` | ✓ | Admin key (any strong random string) |
| `PORT` | | Server port (default: 3000) |
| `FEED_LIMIT` | | Max posts per feed call (default: 50) |
| `DECAY_ON_FETCH` | | Decay implicit scores on each fetch (default: true) |

---

## Integration examples

- **PHP** — [php_social](./ano-app/social-media) — a full social platform demo using ano for feed ranking
- **Vanilla JS** — [news-portal](./ano-app/news-portal) — a news aggregator demo

---

## Use cases

- 📰 **News apps** — rank articles by what each reader actually reads
- 💬 **Social platforms** — replace chronological feeds with personalized ones
- 🛒 **Content aggregators** — surface relevant content without a full ML stack
- 📱 **Mobile apps** — drop ano into any backend in an afternoon

---

## Roadmap

- [ ] Expand topic taxonomy (currently 12 topics — aiming for 50+)
- [ ] Auto-infer topics without a fixed taxonomy (LLM-based)
- [ ] Skip-onboarding mode (behavior-only cold start)
- [ ] SDKs — JavaScript, Python, PHP
- [ ] Docker image for self-hosting
- [ ] Webhook support for real-time profile updates

---

## Contributing

PRs and issues are very welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md).

Areas where help is most needed:
- Expanding the topic taxonomy in `Scripts/sys.js`
- Adding more language support to the NLP parser
- Writing SDK wrappers in Python, PHP, Go

---

## License

MIT — free to use, modify, and self-host. If you build something with ano, I'd love to know.

---

<p align="center">
  Built by <a href="https://github.com/reshuk-code">reshuk-code</a> ·
  <a href="https://ano-ochre.vercel.app">Live demo</a> ·
  <a href="https://ano-ochre.vercel.app/docs">API docs</a>
</p>

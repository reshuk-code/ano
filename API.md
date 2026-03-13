# ano API Reference

ano is a personalized feed engine. You send us posts and a user ID, we return them ranked by what that user actually cares about.

**Base URL:** `http://localhost:3000` (self-hosted) or your deployed URL

---

## Authentication

Every request to a tenant route needs two headers:

```
x-ano-api-key: ano_live_xxxxxxxxxxxxxxxx
x-ano-user-id: <your platform's user ID>
```

**`x-ano-api-key`** — issued per integration. Get one from whoever operates the ano instance, or generate one yourself via the admin route if you're self-hosting.

**`x-ano-user-id`** — the end user's ID in *your* system. This can be a Clerk user ID, Firebase UID, Supabase UUID, or any stable unique string. ano uses it to look up and update that user's preference profile.

---

## Tenant routes

These are the routes your application calls.

---

### `POST /feed`

Rank a list of posts for a user. This is the core endpoint — call it every time a user opens their feed.

**Headers:** `x-ano-api-key`, `x-ano-user-id`

**Body:**
```json
{
  "posts": [
    {
      "id": "post_abc",
      "title": "Army conducts anti-terror operation in border region",
      "body": "Military forces launched a combat operation near the border, neutralising a terror cell.",
      "timestamp": "2026-03-13T10:00:00Z",
      "platform": "news"
    }
  ]
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `id` | ✓ | Your post ID |
| `title` | ✓ | Post headline or title |
| `body` | | Post body or description |
| `timestamp` | | ISO 8601. Affects recency scoring |
| `platform` | | Passed through to response |

**Response:**
```json
{
  "tenantId": "acme-news",
  "userId": "user_abc123",
  "count": 5,
  "feed": [
    {
      "id": "post_abc",
      "title": "Army conducts anti-terror operation in border region",
      "_score": {
        "final": 0.8583,
        "raw": 0.9980,
        "recencyBoost": 0.86,
        "primaryTopic": "military",
        "isBlocked": false,
        "breakdown": [
          { "topic": "military", "postWeight": 1.0, "userScore": 1.0, "contribution": 1.0 }
        ]
      }
    }
  ]
}
```

The `_score.breakdown` array tells you exactly why each post ranked where it did. Use it to build a "why am I seeing this?" transparency feature.

---

### `POST /event`

Record a user's engagement with a post. Call this from your frontend whenever a user interacts with content. ano uses these signals to improve the user's feed over time.

**Headers:** `x-ano-api-key`, `x-ano-user-id`

**Body:**
```json
{
  "eventType": "like",
  "post": {
    "id": "post_abc",
    "title": "Army conducts anti-terror operation in border region",
    "body": "..."
  }
}
```

**Valid event types and their weights:**

| eventType | Signal weight | When to fire |
|-----------|---------------|--------------|
| `share` | +0.15 | User shares the post |
| `like` | +0.10 | User likes / upvotes |
| `click` | +0.06 | User clicks to read the full post |
| `view` | +0.03 | Post was visible in viewport for 3+ seconds |
| `skip` | -0.08 | User scrolled past without stopping |
| `hide` | -0.15 | User explicitly hides or reports the post |

**Response:**
```json
{ "ok": true, "tenantId": "acme-news", "userId": "user_abc123", "event": "like", "postId": "post_abc" }
```

---

### `POST /profile/:userId/onboard`

Solve the cold-start problem. Call this once when a new user signs up — before their first feed request. Present 5–8 topic options in your UI and let the user pick what they care about.

**Headers:** `x-ano-api-key`

**Available topics:** `military`, `aviation`, `politics`, `economy`, `technology`, `health`, `sports`, `food`, `science`, `entertainment`, `crime`, `business`

**Body:**
```json
{
  "like":    ["aviation", "military", "technology"],
  "dislike": ["food", "entertainment"]
}
```

**Response:**
```json
{
  "ok": true,
  "tenantId": "acme-news",
  "userId": "user_abc123",
  "profile": { ... }
}
```

---

### `GET /profile/:userId`

Fetch a user's stored profile. Use this to build a "your interests" settings page in your app.

**Headers:** `x-ano-api-key`

**Response:**
```json
{
  "tenantId": "acme-news",
  "userId": "user_abc123",
  "explicitTopics": { "aviation": true, "food": false },
  "topicScores": { "military": 0.4, "technology": 0.2 },
  "history": [ ... ]
}
```

---

### `POST /profile/:userId`

Update a user's explicit topic preferences. Call this when the user changes interests in your settings UI.

**Headers:** `x-ano-api-key`

**Body:**
```json
{
  "explicitTopics": {
    "sports": true,
    "food": false,
    "politics": null
  }
}
```

| Value | Meaning |
|-------|---------|
| `true` | User explicitly wants this topic |
| `false` | Hard block — never show posts about this topic |
| `null` | Clear explicit preference, fall back to implicit learning |

---

### `DELETE /profile/:userId`

Delete a user's profile entirely. Use this for GDPR compliance / right-to-erasure requests.

**Headers:** `x-ano-api-key`

**Response:**
```json
{ "ok": true, "tenantId": "acme-news", "deleted": "user_abc123" }
```

---

## Admin routes

Admin routes are for whoever operates the ano instance. They require `x-ano-master-key` instead of `x-ano-api-key`.

---

### `POST /admin/keys`

Issue a new API key for a tenant (a developer or company integrating ano).

**Headers:** `x-ano-master-key`

**Body:**
```json
{
  "tenantId": "acme-news",
  "label": "Acme News — Production",
  "env": "live"
}
```

`env` is `"live"` (default) or `"test"`.

**Response:**
```json
{
  "apiKey": "ano_live_3f9a2b...",
  "tenantId": "acme-news",
  "label": "Acme News — Production"
}
```

> The raw API key is returned **once only**. Store it immediately — ano never shows it again.

---

### `DELETE /admin/keys`

Revoke an API key. Any integrations using it will immediately get `401` responses.

**Headers:** `x-ano-master-key`

**Body:**
```json
{ "apiKey": "ano_live_3f9a2b..." }
```

---

### `GET /admin/keys/:tenantId`

List all active keys for a tenant (metadata only — raw keys are never stored).

**Headers:** `x-ano-master-key`

---

## `GET /health`

```json
{ "status": "ok", "service": "ano", "version": "2.0.0", "uptime": 3600 }
```

Use for uptime monitoring / load balancer health checks.

---

## Error format

All errors follow the same shape:

```json
{ "error": "Human-readable error message" }
```

| Status | Meaning |
|--------|---------|
| `400` | Bad request — missing or invalid fields |
| `401` | Missing or invalid API key / master key |
| `404` | Profile or resource not found |
| `500` | Server error |

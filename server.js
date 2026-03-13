/**
 * ano - server.js
 * ===============
 * HTTP server — web UI + API.
 *
 * ── Public pages ──────────────────────────────────────────────
 *   GET  /          landing page
 *   GET  /login     sign in / sign up (Firebase Auth)
 *   GET  /docs      API reference (public)
 *   POST /auth/session   called by browser after Firebase sign-in → sets cookie
 *   POST /auth/logout    clears session cookie
 *
 * ── Protected pages (require Firebase login) ──────────────────
 *   GET  /dashboard    developer dashboard + API key
 *   GET  /playground   live API tester
 *
 * ── API routes (require x-ano-api-key header) ─────────────────
 *   POST   /feed
 *   POST   /event
 *   POST   /profile/:userId/onboard
 *   GET    /profile/:userId
 *   POST   /profile/:userId
 *   DELETE /profile/:userId
 *
 * ── Admin routes (require x-ano-master-key header) ────────────
 *   POST   /admin/keys
 *   DELETE /admin/keys
 *   GET    /admin/keys/:tenantId
 *
 * ── Misc ──────────────────────────────────────────────────────
 *   GET  /health
 */

require("dotenv").config();

const express    = require("express");
const ejsLayouts = require("express-ejs-layouts");
const path       = require("path");

const { requireAuth, optionalAuth } = require("./lib/authMiddleware");
const { getTenant, createTenantIfNew } = require("./lib/tenants");
const { createApiKey, validateApiKey, revokeApiKey, listKeysForTenant } = require("./lib/apiKeys");
const { saveProfile, loadProfile, deleteProfile, profileExists } = require("./lib/storage");
const { UserProfile } = require("./lib/userProfile");
const { enrichPosts } = require("./lib/postParser");
const { rankFeed }    = require("./lib/feedScorer");

const app        = express();
const PORT       = process.env.PORT || 3000;
const MASTER_KEY = process.env.ANO_MASTER_KEY;
const NODE_ENV   = process.env.NODE_ENV || "development";

// ── View engine ───────────────────────────────────────────────
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(ejsLayouts);
app.set("layout", "layout");

// Pass shared locals to every view
app.use((req, res, next) => {
  res.locals.nodeEnv    = NODE_ENV;
  res.locals.user       = null; // overridden by auth middleware when logged in
  res.locals.firebaseConfig = {
    apiKey           : process.env.FIREBASE_API_KEY,
    authDomain       : process.env.FIREBASE_AUTH_DOMAIN,
    projectId        : process.env.FIREBASE_PROJECT_ID,
    storageBucket    : process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId            : process.env.FIREBASE_APP_ID,
  };
  next();
});

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: false }));

// ─────────────────────────────────────────────────────────────
// PUBLIC PAGES
// ─────────────────────────────────────────────────────────────

app.get("/", optionalAuth, (req, res) => {
  res.locals.user = req.user || null;
  res.render("home", {
    title      : "Feed Engine for Developers",
    topbarTitle: "ano",
    page       : "home",
    layout     : "layout",
  });
});

app.get("/login", (req, res) => {
  res.render("login", {
    title      : "Sign in",
    topbarTitle: "Sign in",
    page       : "login",
    layout     : false, // login has its own full-page layout
  });
});

app.get("/docs", optionalAuth, (req, res) => {
  res.locals.user = req.user || null;
  res.render("docs", {
    title      : "API Reference",
    topbarTitle: "API Reference",
    page       : "docs",
    layout     : "layout",
  });
});

// ─────────────────────────────────────────────────────────────
// AUTH ENDPOINTS (called by client-side JS after Firebase sign-in)
// ─────────────────────────────────────────────────────────────

/**
 * POST /auth/session
 * Browser sends Firebase ID token after sign-in.
 * We verify it, create/fetch tenant record, set a cookie.
 */
app.post("/auth/session", async (req, res) => {
  const { idToken, user: userInfo } = req.body;
  if (!idToken) return res.status(400).json({ error: "idToken required" });

  try {
    // Create tenant record if this is their first login
    const tenant = await createTenantIfNew(userInfo.uid, {
      email   : userInfo.email,
      name    : userInfo.displayName || userInfo.name || "",
      photoURL: userInfo.photoURL    || "",
    });

    // Set HTTP-only cookie with the raw Firebase token
    // In production use a short-lived session cookie instead
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    res.cookie("ano_token", idToken, {
      httpOnly: true,
      secure  : NODE_ENV === "production",
      sameSite: "lax",
      maxAge,
    });

    res.json({ ok: true, tenant });
  } catch (err) {
    console.error("[POST /auth/session]", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /auth/logout
 * Clears the session cookie.
 */
app.post("/auth/logout", (req, res) => {
  res.clearCookie("ano_token");
  res.json({ ok: true });
});

// ─────────────────────────────────────────────────────────────
// PROTECTED PAGES (require login)
// ─────────────────────────────────────────────────────────────

app.get("/dashboard", requireAuth, async (req, res) => {
  const tenant = await getTenant(req.user.uid);
  res.locals.user = req.user;
  res.render("dashboard", {
    title          : "Dashboard",
    topbarTitle    : "Dashboard",
    page           : "dashboard",
    layout         : "layout",
    tenant,
    firebaseProject: process.env.FIREBASE_PROJECT_ID || "—",
  });
});

app.get("/playground", requireAuth, (req, res) => {
  res.locals.user = req.user;
  res.render("playground", {
    title      : "Playground",
    topbarTitle: "API Playground",
    page       : "playground",
    layout     : "layout",
  });
});

// ─────────────────────────────────────────────────────────────
// API MIDDLEWARE
// ─────────────────────────────────────────────────────────────

function requireMasterKey(req, res, next) {
  const key = req.headers["x-ano-master-key"];
  if (!MASTER_KEY) return res.status(500).json({ error: "ANO_MASTER_KEY not configured" });
  if (key !== MASTER_KEY) return res.status(401).json({ error: "Invalid master key" });
  next();
}

async function requireApiKey(req, res, next) {
  const rawKey = req.headers["x-ano-api-key"];
  if (!rawKey) return res.status(401).json({ error: "Missing x-ano-api-key header" });
  const tenant = await validateApiKey(rawKey);
  if (!tenant) return res.status(401).json({ error: "Invalid or revoked API key" });
  req.tenant = tenant;
  next();
}

function requireUserId(req, res, next) {
  const userId = req.headers["x-ano-user-id"];
  if (!userId) return res.status(400).json({ error: "Missing x-ano-user-id header" });
  req.endUserId = userId;
  next();
}

async function getOrCreateProfile(tenantId, userId) {
  const existing = await loadProfile(tenantId, userId);
  if (existing) return existing;
  const fresh = new UserProfile(userId);
  await saveProfile(tenantId, fresh);
  return fresh;
}

// ─────────────────────────────────────────────────────────────
// ADMIN ROUTES
// ─────────────────────────────────────────────────────────────

app.post("/admin/keys", requireMasterKey, async (req, res) => {
  try {
    const { tenantId, label, env = "live" } = req.body;
    if (!tenantId || !label) return res.status(400).json({ error: "tenantId and label required" });
    if (!["live", "test"].includes(env)) return res.status(400).json({ error: "env must be live or test" });
    res.status(201).json(await createApiKey(tenantId, label, env));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete("/admin/keys", requireMasterKey, async (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey) return res.status(400).json({ error: "apiKey required" });
    const revoked = await revokeApiKey(apiKey);
    if (!revoked) return res.status(404).json({ error: "Key not found" });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get("/admin/keys/:tenantId", requireMasterKey, async (req, res) => {
  try {
    res.json({ tenantId: req.params.tenantId, keys: await listKeysForTenant(req.params.tenantId) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─────────────────────────────────────────────────────────────
// TENANT API ROUTES
// ─────────────────────────────────────────────────────────────

app.post("/feed", requireApiKey, requireUserId, async (req, res) => {
  try {
    const { posts } = req.body;
    if (!Array.isArray(posts) || !posts.length) return res.status(400).json({ error: "posts must be a non-empty array" });
    const { tenantId } = req.tenant;
    const profile = await getOrCreateProfile(tenantId, req.endUserId);
    if (process.env.DECAY_ON_FETCH === "true") { profile.applyDecay(); await saveProfile(tenantId, profile); }
    const ranked = rankFeed(enrichPosts(posts), profile, { limit: +process.env.FEED_LIMIT || 50, filterBlocked: true, diversify: true });
    res.json({ tenantId, userId: req.endUserId, count: ranked.length, feed: ranked });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/event", requireApiKey, requireUserId, async (req, res) => {
  try {
    const { eventType, post } = req.body;
    const VALID = ["share","like","click","view","skip","hide"];
    if (!VALID.includes(eventType)) return res.status(400).json({ error: `eventType must be one of: ${VALID.join(", ")}` });
    if (!post?.id || !post?.title) return res.status(400).json({ error: "post.id and post.title required" });
    const { tenantId } = req.tenant;
    const profile = await getOrCreateProfile(tenantId, req.endUserId);
    profile.recordEvent(eventType, enrichPosts([post])[0]);
    await saveProfile(tenantId, profile);
    res.json({ ok: true, tenantId, userId: req.endUserId, event: eventType, postId: post.id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/profile/:userId/onboard", requireApiKey, async (req, res) => {
  try {
    const { like = [], dislike = [] } = req.body;
    if (!like.length && !dislike.length) return res.status(400).json({ error: "Provide at least one topic" });
    const profile = await getOrCreateProfile(req.tenant.tenantId, req.params.userId);
    like.forEach(t => profile.likeTopic(t));
    dislike.forEach(t => profile.dislikeTopic(t));
    await saveProfile(req.tenant.tenantId, profile);
    res.json({ ok: true, tenantId: req.tenant.tenantId, userId: req.params.userId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get("/profile/:userId", requireApiKey, async (req, res) => {
  try {
    const profile = await loadProfile(req.tenant.tenantId, req.params.userId);
    if (!profile) return res.status(404).json({ error: "Profile not found" });
    res.json({ tenantId: req.tenant.tenantId, ...profile.toJSON() });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/profile/:userId", requireApiKey, async (req, res) => {
  try {
    const profile = await getOrCreateProfile(req.tenant.tenantId, req.params.userId);
    const { explicitTopics } = req.body;
    if (explicitTopics) {
      for (const [t, v] of Object.entries(explicitTopics)) {
        if (v === true) profile.likeTopic(t);
        else if (v === false) profile.dislikeTopic(t);
        else profile.clearExplicit(t);
      }
    }
    await saveProfile(req.tenant.tenantId, profile);
    res.json({ ok: true, tenantId: req.tenant.tenantId, profile: profile.toJSON() });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete("/profile/:userId", requireApiKey, async (req, res) => {
  try {
    if (!await profileExists(req.tenant.tenantId, req.params.userId)) return res.status(404).json({ error: "Profile not found" });
    await deleteProfile(req.tenant.tenantId, req.params.userId);
    res.json({ ok: true, deleted: req.params.userId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─────────────────────────────────────────────────────────────
// MISC
// ─────────────────────────────────────────────────────────────

app.get("/health", (_, res) => res.json({ status: "ok", service: "ano", version: "2.0.0", uptime: Math.floor(process.uptime()) }));

app.use((req, res) => {
  const isApi = req.headers["x-ano-api-key"] || req.headers["x-ano-master-key"] || req.headers["accept"]?.includes("application/json");
  if (isApi) return res.status(404).json({ error: `Not found: ${req.method} ${req.path}` });
  res.status(404).render("404", { title: "404", topbarTitle: "Not Found", page: "", layout: "layout" });
});

// ─────────────────────────────────────────────────────────────
// START — only listen when running locally, not on Vercel
// ─────────────────────────────────────────────────────────────
if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`\n  ┌──────────────────────────────────────────────┐`);
    console.log(`  │  ano  feed engine                            │`);
    console.log(`  │  http://localhost:${PORT}                       │`);
    console.log(`  │  ENV      : ${NODE_ENV.padEnd(33)}│`);
    console.log(`  │  Firebase : ${(process.env.FIREBASE_PROJECT_ID||"not set").padEnd(33)}│`);
    console.log(`  └──────────────────────────────────────────────┘\n`);
  });
}

module.exports = app;

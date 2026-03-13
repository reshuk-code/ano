/**
 * ano - app.js
 * ============
 * Main entry point & demo runner.
 *
 * Phase 1: Text-based post feed algorithm
 *   - Parses posts (title + body) into topic signals
 *   - Builds user profile (explicit + implicit preferences)
 *   - Scores & ranks feed with full topic breakdown
 *
 * Run: node app.js
 */

const { enrichPosts }  = require("./lib/postParser");
const { UserProfile }  = require("./lib/userProfile");
const { rankFeed }     = require("./lib/feedScorer");

// ── ANSI helpers ──────────────────────────────────────────────────────────────
const C = {
  reset  : "\x1b[0m",
  bold   : "\x1b[1m",
  dim    : "\x1b[2m",
  green  : "\x1b[92m",
  red    : "\x1b[91m",
  yellow : "\x1b[93m",
  cyan   : "\x1b[96m",
  blue   : "\x1b[94m",
  grey   : "\x1b[90m",
};
const b  = s => C.bold   + s + C.reset;
const g  = s => C.green  + s + C.reset;
const r  = s => C.red    + s + C.reset;
const y  = s => C.yellow + s + C.reset;
const d  = s => C.dim    + s + C.reset;
const cy = s => C.cyan   + s + C.reset;

// ── Sample posts ──────────────────────────────────────────────────────────────
const RAW_POSTS = [
  {
    id       : "p1",
    title    : "Air Chief Marshal AP Singh takes flight in MiG-29 UPG aircraft.",
    body     : "Air Chief Marshal AP Singh, the Chief of Air Staff, conducted a sortie in a MiG-29 UPG fighter jet at an Air Force base, reaffirming his commitment to frontline aviation operations.",
    timestamp: new Date(Date.now() - 1 * 3_600_000).toISOString(),   // 1hr ago
    platform : "news",
  },
  {
    id       : "p2",
    title    : "Get one Big Mac on just $4",
    body     : "McDonald's is running a limited-time food deal offering customers one Big Mac for just $4. Available at participating restaurants across the country.",
    timestamp: new Date(Date.now() - 3 * 3_600_000).toISOString(),   // 3hr ago
    platform : "social",
  },
  {
    id       : "p3",
    title    : "Nepal receives $500M IMF loan amid economic recovery push",
    body     : "The International Monetary Fund approved a $500 million loan for Nepal to support post-pandemic economic recovery. The Finance Minister welcomed the investment decision.",
    timestamp: new Date(Date.now() - 6 * 3_600_000).toISOString(),
    platform : "news",
  },
  {
    id       : "p4",
    title    : "SpaceX launches 23 Starlink satellites into low Earth orbit",
    body     : "SpaceX conducted a successful rocket launch, deploying 23 Starlink internet satellites. The science and technology mission expands broadband coverage globally.",
    timestamp: new Date(Date.now() - 2 * 3_600_000).toISOString(),
    platform : "news",
  },
  {
    id       : "p5",
    title    : "India wins cricket series against Australia 3-1",
    body     : "The Indian cricket team won a historic series against Australia, securing a 3-1 victory in the final test match. The team celebrated their sports championship.",
    timestamp: new Date(Date.now() - 12 * 3_600_000).toISOString(),
    platform : "sports",
  },
  {
    id       : "p6",
    title    : "Government announces new health policy for rural hospitals",
    body     : "The federal government introduced a landmark health reform policy to improve access to medicine and hospital care in rural districts, with a $2B budget allocation.",
    timestamp: new Date(Date.now() - 5 * 3_600_000).toISOString(),
    platform : "news",
  },
  {
    id       : "p7",
    title    : "OpenAI releases new AI model with improved reasoning",
    body     : "OpenAI launched its latest AI model featuring advanced reasoning and code generation capabilities. The tech startup says the software sets a new industry benchmark.",
    timestamp: new Date(Date.now() - 4 * 3_600_000).toISOString(),
    platform : "tech",
  },
  {
    id       : "p8",
    title    : "Army conducts anti-terror operation in border region",
    body     : "Military forces launched a combat operation near the border, neutralising a terror cell. Defence officials confirmed the troops successfully completed the mission.",
    timestamp: new Date(Date.now() - 8 * 3_600_000).toISOString(),
    platform : "news",
  },
];

// ── Build user profile ────────────────────────────────────────────────────────
// User A: loves aviation + military, explicitly dislikes food deals
const userA = new UserProfile("user_A", {
  aviation : true,   // explicit like
  military : true,   // explicit like
  food     : false,  // explicit dislike — hard block
});

// Simulate some implicit events (past engagement)
const enrichedForEvents = enrichPosts(RAW_POSTS);
userA.recordEvent("share", enrichedForEvents[3]);   // shared SpaceX post → science boost
userA.recordEvent("like",  enrichedForEvents[7]);   // liked army post
userA.recordEvent("skip",  enrichedForEvents[4]);   // skipped cricket → sports penalty
userA.recordEvent("view",  enrichedForEvents[6]);   // viewed AI post → tech slight boost

// ── Score & rank feed ─────────────────────────────────────────────────────────
const enrichedPosts = enrichPosts(RAW_POSTS);
const rankedFeed    = rankFeed(enrichedPosts, userA, {
  limit        : 10,
  filterBlocked: true,
  diversify    : true,
});

// ── Print results ─────────────────────────────────────────────────────────────
console.log(`\n${b("═".repeat(65))}`);
console.log(`  ${cy("ano")} ${b("— Personalized Feed")}  ${d("(Phase 1 · text posts)")}`);
console.log(`  User: ${b(userA.userId)}`);
console.log(`${b("═".repeat(65))}\n`);

// Print user profile summary
console.log(b("USER PROFILE"));
console.log("  Explicit likes   : " + g(Object.entries(userA.explicitTopics).filter(([,v])=>v===true ).map(([k])=>k).join(", ") || "none"));
console.log("  Explicit dislikes: " + r(Object.entries(userA.explicitTopics).filter(([,v])=>v===false).map(([k])=>k).join(", ") || "none"));
const implicitStr = Object.entries(userA.topicScores)
  .sort((a,b)=>b[1]-a[1])
  .map(([t,s])=>`${t}:${s}`)
  .join("  ");
console.log("  Implicit scores  : " + d(implicitStr || "none yet"));

console.log(`\n${b("RANKED FEED")} ${d(`(${rankedFeed.length} posts)`)}\n`);

rankedFeed.forEach((post, i) => {
  const s = post._score;
  const rank = String(i + 1).padStart(2, " ");

  console.log(`${b(`#${rank}`)} ${b(post.title)}`);
  console.log(`     ${d("platform:")} ${post.platform}  ${d("primary topic:")} ${cy(s.primaryTopic)}  ${d("score:")} ${y(s.final)}  ${d("recency:")} ${s.recencyBoost.toFixed(2)}`);

  // Topic breakdown
  const topBreakdown = s.breakdown.slice(0, 3);   // top 3 topics
  const bkStr = topBreakdown
    .map(b => `${g(b.topic)} post:${b.postWeight} × user:${b.userScore} = ${cy(b.contribution)}`)
    .join("   ");
  console.log(`     ${d("breakdown:")} ${bkStr}`);

  if (s.diversityPenalty !== undefined && s.diversityPenalty < 1) {
    console.log(`     ${d("diversity penalty:")} ×${s.diversityPenalty}`);
  }

  // Noise tokens stripped from this post
  if (post.noiseTokens.length) {
    console.log(`     ${d("noise stripped:")} ${r(post.noiseTokens.slice(0,6).join(", "))}`);
  }
  console.log();
});

console.log(b("═".repeat(65)));
console.log(d("  ano Phase 1 complete. Plug in your DB (Firebase/Supabase) and auth (Clerk) to go live.\n"));

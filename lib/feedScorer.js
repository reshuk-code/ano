/**
 * ano - lib/feedScorer.js
 * =======================
 * Scores and ranks enriched posts against a user profile.
 *
 * Output per post: full topic match breakdown (explainable feed).
 *
 * Score formula:
 *   rawScore = Σ (postTopicWeight[t] × userScore[t])  for all topics t
 *   finalScore = rawScore × recencyBoost × diversityPenalty
 */

// How fast recency decays. Posts older than this (hours) score lower.
const RECENCY_HALF_LIFE_HOURS = 24;

/**
 * Score a single enriched post against a user profile.
 *
 * @param {object}      post     — enriched post (from postParser)
 * @param {UserProfile} profile  — user profile instance
 * @returns {object}             — scored post with full breakdown
 */
function scorePost(post, profile) {
  const topicWeights = post.topicWeights || {};
  const breakdown    = [];
  let   rawScore     = 0;

  for (const [topic, postWeight] of Object.entries(topicWeights)) {
    const userScore   = profile.scoreForTopic(topic);
    const contribution = postWeight * userScore;
    rawScore += contribution;

    breakdown.push({
      topic,
      postWeight   : postWeight,          // how much this post is about this topic
      userScore    : userScore,           // how much user likes this topic
      contribution : parseFloat(contribution.toFixed(4)),
    });
  }

  // Sort breakdown by contribution descending
  breakdown.sort((a, b) => b.contribution - a.contribution);

  // Recency boost (0.5 – 1.0)
  const recencyBoost = computeRecencyBoost(post.timestamp);

  // Final score
  const finalScore = parseFloat((rawScore * recencyBoost).toFixed(4));

  // Primary topic (highest contribution)
  const primaryTopic = breakdown[0]?.topic || "unknown";

  // Blocked? (if top explicit dislike covers the whole post)
  const isBlocked = breakdown.every(b => profile.explicitTopics[b.topic] === false);

  return {
    ...post,
    _score: {
      final       : finalScore,
      raw         : parseFloat(rawScore.toFixed(4)),
      recencyBoost: parseFloat(recencyBoost.toFixed(3)),
      primaryTopic,
      isBlocked,
      breakdown,                          // ← full explainable breakdown
    },
  };
}

/**
 * Score and rank a list of enriched posts.
 *
 * @param {object[]}    posts    — array of enriched posts
 * @param {UserProfile} profile  — user profile
 * @param {object}      options
 *   @param {number}  options.limit         — max posts to return (default: 50)
 *   @param {boolean} options.filterBlocked — remove hard-blocked posts (default: true)
 *   @param {boolean} options.diversify     — penalise topic repetition (default: true)
 * @returns {object[]} ranked posts, each with _score breakdown
 */
function rankFeed(posts, profile, options = {}) {
  const {
    limit         = 50,
    filterBlocked = true,
    diversify     = true,
  } = options;

  // Score all posts
  let scored = posts.map(p => scorePost(p, profile));

  // Remove blocked
  if (filterBlocked) {
    scored = scored.filter(p => !p._score.isBlocked);
  }

  // Apply diversity penalty (same topic back-to-back loses 30% per repeat)
  if (diversify) {
    scored = applyDiversityPenalty(scored);
  }

  // Sort descending by final score
  scored.sort((a, b) => b._score.final - a._score.final);

  return scored.slice(0, limit);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function computeRecencyBoost(timestamp) {
  if (!timestamp) return 0.8;    // unknown age → slight penalty
  const ageMs    = Date.now() - new Date(timestamp).getTime();
  const ageHours = ageMs / 3_600_000;
  // Exponential decay: boost = 0.5 + 0.5 * e^(-age / halfLife)
  return 0.5 + 0.5 * Math.exp(-ageHours / RECENCY_HALF_LIFE_HOURS);
}

function applyDiversityPenalty(scored) {
  // First pass: count topics already seen
  const topicCount = {};
  return scored.map(post => {
    const t     = post._score.primaryTopic;
    const count = topicCount[t] || 0;
    const penalty = Math.pow(0.70, count);   // 0th = 1.0, 1st = 0.7, 2nd = 0.49 ...
    topicCount[t] = count + 1;
    return {
      ...post,
      _score: {
        ...post._score,
        diversityPenalty: parseFloat(penalty.toFixed(3)),
        final: parseFloat((post._score.final * penalty).toFixed(4)),
      },
    };
  });
}

module.exports = { scorePost, rankFeed };

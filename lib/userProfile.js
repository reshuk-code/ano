/**
 * ano - lib/userProfile.js
 * ========================
 * Manages a user's interest profile.
 *
 * A profile is a map of topic → interest score (0.0 – 1.0).
 *
 * Two signal types:
 *   EXPLICIT  — user manually selects/deselects topics (high confidence)
 *   IMPLICIT  — inferred from engagement events (like, view, share, skip)
 *
 * Implicit event weights:
 *   share  → +0.15  (strongest signal)
 *   like   → +0.10
 *   click  → +0.06
 *   view   → +0.03  (weakest — could be accidental)
 *   skip   → -0.08  (negative signal)
 *   hide   → -0.15  (strong negative)
 */

const IMPLICIT_WEIGHTS = {
  share : +0.15,
  like  : +0.10,
  click : +0.06,
  view  : +0.03,
  skip  : -0.08,
  hide  : -0.15,
};

const DECAY_FACTOR = 0.98;   // Applied per feed refresh — old signals fade slowly
const MAX_SCORE    = 1.0;
const MIN_SCORE    = 0.0;

class UserProfile {
  /**
   * @param {string} userId
   * @param {object} explicitTopics  — { military: true, food: false, ... }
   * @param {object} topicScores     — existing implicit scores to restore from storage
   */
  constructor(userId, explicitTopics = {}, topicScores = {}) {
    this.userId         = userId;
    this.explicitTopics = { ...explicitTopics };  // user-set preferences
    this.topicScores    = { ...topicScores };      // implicit learned scores
    this.history        = [];                      // event log
  }

  // ── Explicit ────────────────────────────────────────────────────────────────

  /** User explicitly says they like a topic */
  likeTopic(topic) {
    this.explicitTopics[topic] = true;
  }

  /** User explicitly says they dislike / hide a topic */
  dislikeTopic(topic) {
    this.explicitTopics[topic] = false;
  }

  /** Remove explicit preference (let implicit take over) */
  clearExplicit(topic) {
    delete this.explicitTopics[topic];
  }

  // ── Implicit ────────────────────────────────────────────────────────────────

  /**
   * Record an engagement event on a post.
   * @param {string} eventType  — share | like | click | view | skip | hide
   * @param {object} post       — enriched post with topicWeights
   */
  recordEvent(eventType, post) {
    const delta = IMPLICIT_WEIGHTS[eventType];
    if (delta === undefined) return;

    const weights = post.topicWeights || {};
    for (const [topic, relevance] of Object.entries(weights)) {
      const current = this.topicScores[topic] || 0.0;
      // Scale delta by how relevant this topic is to the post
      const adjusted = current + delta * relevance;
      this.topicScores[topic] = parseFloat(
        Math.min(MAX_SCORE, Math.max(MIN_SCORE, adjusted)).toFixed(4)
      );
    }

    this.history.push({
      event    : eventType,
      postId   : post.id,
      topics   : Object.keys(weights),
      timestamp: new Date().toISOString(),
    });
  }

  // ── Decay ───────────────────────────────────────────────────────────────────

  /** Call once per feed refresh to slowly decay old implicit scores */
  applyDecay() {
    for (const topic of Object.keys(this.topicScores)) {
      this.topicScores[topic] = parseFloat(
        (this.topicScores[topic] * DECAY_FACTOR).toFixed(4)
      );
    }
  }

  // ── Effective score ─────────────────────────────────────────────────────────

  /**
   * Get the effective interest score for a topic.
   * Explicit preferences override implicit scores.
   *
   * Returns a number 0.0 – 1.0
   *   explicit like    → 1.0
   *   explicit dislike → 0.0 (hard block)
   *   not set          → implicit score (or 0.1 default = neutral/slight interest)
   */
  scoreForTopic(topic) {
    if (this.explicitTopics[topic] === true)  return 1.0;
    if (this.explicitTopics[topic] === false) return 0.0;
    return this.topicScores[topic] || 0.1;
  }

  /** Serialise for storage (Firebase, Supabase, etc.) */
  toJSON() {
    return {
      userId        : this.userId,
      explicitTopics: this.explicitTopics,
      topicScores   : this.topicScores,
      history       : this.history,
    };
  }

  /** Restore from stored JSON */
  static fromJSON(data) {
    const p = new UserProfile(data.userId, data.explicitTopics, data.topicScores);
    p.history = data.history || [];
    return p;
  }
}

module.exports = { UserProfile, IMPLICIT_WEIGHTS };

/**
 * ano - lib/postParser.js
 * =======================
 * Wraps sys.js parsePost with post metadata handling.
 * Accepts raw post objects and returns enriched, feed-ready post objects.
 */

const { parsePost } = require("../Scripts/sys");

/**
 * Enrich a raw post with topic signals.
 *
 * Input:
 *   { id, title, body?, author?, timestamp?, platform? }
 *
 * Output adds:
 *   { ...post, topicWeights, topicTokens, noiseTokens, parsedAt }
 */
function enrichPost(post) {
  const { topicWeights, topicTokens, noiseTokens } = parsePost({
    title: post.title || "",
    body:  post.body  || "",
  });

  return {
    ...post,
    topicWeights,
    topicTokens,
    noiseTokens,
    parsedAt: new Date().toISOString(),
  };
}

/**
 * Enrich an array of posts.
 */
function enrichPosts(posts) {
  return posts.map(enrichPost);
}

module.exports = { enrichPost, enrichPosts };

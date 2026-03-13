/**
 * ano - sys.js
 * ============
 * Core NLP engine for the ano feed algorithm.
 *
 * Responsibilities:
 *  1. Tokenize text (title / body)
 *  2. Tag each token: TOPIC | NOISE | STOP
 *  3. Extract weighted topic signals from a post
 *  4. Load and apply avoid_word list
 *
 * No external dependencies — pure JS, works in Node or browser.
 */

const fs   = require("fs");
const path = require("path");

// ── Load avoid/noise word list ────────────────────────────────────────────────
const AVOID_PATH = path.join(__dirname, "avoid_word.txt");

function loadAvoidWords() {
  try {
    return new Set(
      fs.readFileSync(AVOID_PATH, "utf8")
        .split("\n")
        .map(l => l.trim().toLowerCase())
        .filter(l => l && !l.startsWith("#"))
    );
  } catch {
    return new Set();
  }
}

const AVOID_WORDS = loadAvoidWords();

// ── Regex patterns ────────────────────────────────────────────────────────────
const PROPER_NOUN_RE = /^[A-Z][a-z]{1,}$/;           // Single capitalised word
const ACRONYM_RE     = /^[A-Z]{2,}[\d-]*$/;           // MiG-29, UPG, NASA
const MODEL_CODE_RE  = /^[A-Z][\w-]*\d+[\w-]*$/;      // MiG-29, F-16, AK-47
const NUMBER_RE      = /^\d[\d,.%]*$/;
const PRICE_RE       = /^\$[\d,.]+$/;

// ── Topic taxonomy ────────────────────────────────────────────────────────────
// Maps surface keywords → canonical topic category
// Extend this as you add more domains
const TOPIC_MAP = {
  // Military / Defence
  military    : ["military","army","navy","airforce","air force","defence","defense","soldier","troops","war","combat","weapon","missile","bomb","attack","strike","operation","marshal","general","admiral","colonel","pilot","fleet","regiment","battalion"],
  aviation    : ["flight","fly","flies","aircraft","jet","plane","helicopter","airport","airspace","sortie","takeoff","landing","aviation","airbase","squadron","drone","uav"],
  politics    : ["government","minister","parliament","election","president","prime minister","senator","congress","policy","law","bill","vote","party","cabinet","diplomacy","treaty","sanctions","democracy","republic"],
  economy     : ["economy","gdp","inflation","trade","export","import","tariff","market","stock","shares","investment","loan","debt","budget","revenue","growth","recession","fund","imf","worldbank","tax","fiscal"],
  technology  : ["tech","technology","ai","software","hardware","startup","app","platform","code","data","cloud","server","internet","digital","cyber","algorithm","robot","automation","chip","semiconductor"],
  health      : ["health","hospital","doctor","medicine","vaccine","virus","disease","pandemic","covid","drug","treatment","surgery","patient","clinic","research","cancer","mental health","nutrition","fitness"],
  sports      : ["sport","sports","cricket","football","soccer","basketball","tennis","racing","athlete","team","match","tournament","championship","league","olympic","medal","coach","stadium"],
  food        : ["food","restaurant","meal","recipe","cuisine","diet","burger","pizza","drink","coffee","tea","nutrition","chef","cook","menu","price","deal","offer","discount"],
  science     : ["science","research","study","discovery","space","nasa","planet","star","climate","environment","energy","physics","chemistry","biology","experiment","lab","genome","dna"],
  entertainment: ["movie","film","music","song","celebrity","actor","actress","director","album","concert","show","tv","series","award","oscar","grammy","festival","art","game","gaming"],
  crime       : ["crime","police","arrest","murder","theft","fraud","scam","investigation","court","judge","verdict","prison","sentence","corruption","terrorism","kidnap","assault"],
  business    : ["company","ceo","startup","brand","product","launch","merger","acquisition","ipo","profit","loss","quarterly","corporate","industry","market","deal","contract","partnership"],
};

// Build reverse lookup: keyword → topic
const KEYWORD_TO_TOPIC = {};
for (const [topic, keywords] of Object.entries(TOPIC_MAP)) {
  for (const kw of keywords) {
    KEYWORD_TO_TOPIC[kw.toLowerCase()] = topic;
  }
}

// ── Token classifier ──────────────────────────────────────────────────────────
/**
 * Classify a single token.
 * Returns: { token, tag, topic|null }
 *   tag: "TOPIC" | "NOISE" | "STOP"
 */
function classifyToken(raw) {
  const token   = raw.trim();
  const lower   = token.toLowerCase();
  const clean   = lower.replace(/[^a-z0-9\s]/g, "");

  // Stop / avoid words
  if (!token || AVOID_WORDS.has(lower) || AVOID_WORDS.has(clean)) {
    return { token, tag: "STOP", topic: null };
  }

  // Noise: model codes, acronyms that aren't in topic map
  if (
    (MODEL_CODE_RE.test(token) || ACRONYM_RE.test(token)) &&
    !KEYWORD_TO_TOPIC[lower]
  ) {
    return { token, tag: "NOISE", topic: null };
  }

  // Numbers / prices on their own = noise
  if (NUMBER_RE.test(token) || PRICE_RE.test(token)) {
    return { token, tag: "NOISE", topic: null };
  }

  // Check topic map
  if (KEYWORD_TO_TOPIC[lower] || KEYWORD_TO_TOPIC[clean]) {
    return { token, tag: "TOPIC", topic: KEYWORD_TO_TOPIC[lower] || KEYWORD_TO_TOPIC[clean] };
  }

  // Capitalised proper noun not in topic map → treat as named entity noise
  // (e.g. "AP Singh", "McDonald's" — entity, not topic signal)
  if (PROPER_NOUN_RE.test(token)) {
    return { token, tag: "NOISE", topic: null };
  }

  // Everything else = potential topic signal (context word)
  return { token, tag: "TOPIC", topic: null };
}

// ── Post parser ───────────────────────────────────────────────────────────────
/**
 * Parse a post { title, body } into weighted topic signals.
 *
 * Title tokens get weight 2x vs body tokens (title is primary signal).
 *
 * Returns:
 * {
 *   topicWeights: { military: 0.6, aviation: 0.4, ... },   // normalised 0-1
 *   signals: [ { token, tag, topic, weight } ],             // full breakdown
 *   noiseTokens: [ "AP Singh", "MiG-29", ... ],
 *   topicTokens: [ "flight", "aircraft", ... ],
 * }
 */
function parsePost({ title = "", body = "" }) {
  const titleTokens = tokenize(title).map(t => ({ ...classifyToken(t), source: "title", weight: 2 }));
  const bodyTokens  = tokenize(body ).map(t => ({ ...classifyToken(t), source: "body",  weight: 1 }));
  const all         = [...titleTokens, ...bodyTokens];

  const topicAccum  = {};   // topic → accumulated weight
  const noiseTokens = [];
  const topicTokens = [];

  for (const s of all) {
    if (s.tag === "NOISE") {
      noiseTokens.push(s.token);
    } else if (s.tag === "TOPIC") {
      topicTokens.push(s.token);
      if (s.topic) {
        topicAccum[s.topic] = (topicAccum[s.topic] || 0) + s.weight;
      }
    }
  }

  // Normalise topic weights to 0-1
  const total = Object.values(topicAccum).reduce((a, b) => a + b, 0) || 1;
  const topicWeights = {};
  for (const [t, w] of Object.entries(topicAccum)) {
    topicWeights[t] = parseFloat((w / total).toFixed(3));
  }

  return { topicWeights, signals: all, noiseTokens, topicTokens };
}

// ── Tokenizer ─────────────────────────────────────────────────────────────────
function tokenize(text) {
  return text
    .replace(/["""'']/g, " ")
    .split(/[\s,;:!?.()\[\]{}<>\/\\]+/)
    .map(t => t.trim())
    .filter(Boolean);
}

// ── Exports ───────────────────────────────────────────────────────────────────
module.exports = {
  parsePost,
  classifyToken,
  tokenize,
  TOPIC_MAP,
  KEYWORD_TO_TOPIC,
  AVOID_WORDS,
};

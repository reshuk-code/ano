/**
 * ano - lib/apiKeys.js
 * ====================
 * API key management for multi-tenant SaaS.
 *
 * Each company / developer that integrates ano gets their own API key.
 * All user profiles are namespaced under their tenantId — complete isolation.
 *
 * Firestore schema:
 *   Collection: "api_keys"
 *   Document ID: the API key itself (hashed for storage)
 *   Fields: { tenantId, label, createdAt, active, requestCount }
 *
 * Key format:  ano_live_<16 random hex chars>
 *              ano_test_<16 random hex chars>   (for sandbox/test environments)
 */

const { db }            = require("./firebase");
const { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, query, where, getDocs } = require("firebase/firestore");
const crypto            = require("crypto");

const COLLECTION = "api_keys";

// ── Generate ──────────────────────────────────────────────────────────────────

/**
 * Create a new API key for a tenant.
 *
 * @param {string} tenantId   — your identifier for this customer/app (e.g. "acme-news")
 * @param {string} label      — human-readable label (e.g. "Acme News Production")
 * @param {string} [env]      — "live" (default) or "test"
 * @returns {Promise<{ apiKey: string, tenantId: string, label: string }>}
 */
async function createApiKey(tenantId, label, env = "live") {
  const rawKey = `ano_${env}_${crypto.randomBytes(16).toString("hex")}`;
  const keyHash = hashKey(rawKey);

  const ref = doc(db, COLLECTION, keyHash);
  await setDoc(ref, {
    tenantId,
    label,
    env,
    active      : true,
    createdAt   : new Date().toISOString(),
    requestCount: 0,
  });

  // Return the raw key once — it is never stored in plaintext
  return { apiKey: rawKey, tenantId, label };
}

// ── Validate ──────────────────────────────────────────────────────────────────

/**
 * Validate an API key on every inbound request.
 * Returns the tenant context if valid, null if invalid/revoked.
 *
 * @param {string} rawKey
 * @returns {Promise<{ tenantId: string, label: string } | null>}
 */
async function validateApiKey(rawKey) {
  if (!rawKey || !rawKey.startsWith("ano_")) return null;

  const keyHash = hashKey(rawKey);
  const ref     = doc(db, COLLECTION, keyHash);
  const snap    = await getDoc(ref);

  if (!snap.exists()) return null;
  const data = snap.data();
  if (!data.active) return null;

  // Increment request counter (non-blocking — don't await)
  updateDoc(ref, { requestCount: (data.requestCount || 0) + 1 }).catch(() => {});

  return { tenantId: data.tenantId, label: data.label, env: data.env };
}

// ── Revoke ────────────────────────────────────────────────────────────────────

/**
 * Revoke an API key (sets active: false — key stays in DB for audit trail).
 *
 * @param {string} rawKey
 * @returns {Promise<boolean>}  true if revoked, false if not found
 */
async function revokeApiKey(rawKey) {
  const keyHash = hashKey(rawKey);
  const ref     = doc(db, COLLECTION, keyHash);
  const snap    = await getDoc(ref);

  if (!snap.exists()) return false;
  await updateDoc(ref, { active: false, revokedAt: new Date().toISOString() });
  return true;
}

// ── List ──────────────────────────────────────────────────────────────────────

/**
 * List all active API keys for a tenant (metadata only — never the raw key).
 *
 * @param {string} tenantId
 * @returns {Promise<Array>}
 */
async function listKeysForTenant(tenantId) {
  const col = collection(db, COLLECTION);
  const q   = query(col, where("tenantId", "==", tenantId), where("active", "==", true));
  const snap = await getDocs(q);

  return snap.docs.map(d => ({
    label       : d.data().label,
    env         : d.data().env,
    createdAt   : d.data().createdAt,
    requestCount: d.data().requestCount,
    // Note: raw key is never returned after creation
  }));
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Hash a key before storing it. We never store raw keys in Firestore. */
function hashKey(rawKey) {
  return crypto.createHash("sha256").update(rawKey).digest("hex");
}

module.exports = { createApiKey, validateApiKey, revokeApiKey, listKeysForTenant };

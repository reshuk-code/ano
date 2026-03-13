/**
 * ano - lib/tenants.js
 * ====================
 * Manages developer accounts (tenants) in Firestore.
 *
 * When a developer signs up via Firebase Auth, we create a tenant record
 * for them and auto-generate their first API key.
 *
 * Firestore path: tenants/{uid}
 * Fields: { uid, email, name, photoURL, createdAt, plan }
 */

const { db }           = require("./firebase");
const { createApiKey } = require("./apiKeys");
const { doc, getDoc, setDoc, updateDoc } = require("firebase/firestore");

const COLLECTION = "tenants";

/**
 * Get a tenant record by Firebase UID.
 * Returns null if not found.
 */
async function getTenant(uid) {
  const ref  = doc(db, COLLECTION, uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data();
}

/**
 * Create a new tenant record after first sign-in.
 * Also auto-generates their first live API key.
 * Safe to call multiple times — won't overwrite existing records.
 */
async function createTenantIfNew(uid, { email, name, photoURL }) {
  const ref  = doc(db, COLLECTION, uid);
  const snap = await getDoc(ref);

  if (snap.exists()) return snap.data(); // already exists, skip

  // Build a clean tenantId from email (e.g. "alex@acme.com" → "alex-acme-com")
  const tenantId = email
    .toLowerCase()
    .replace(/[@.]/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 40);

  // Auto-generate first live API key
  const { apiKey } = await createApiKey(tenantId, `${name || email} — Default`, "live");

  const record = {
    uid,
    email,
    name        : name || "",
    photoURL    : photoURL || "",
    tenantId,
    plan        : "free",
    createdAt   : new Date().toISOString(),
    firstApiKey : apiKey, // stored once so dashboard can show it on first login
  };

  await setDoc(ref, record);
  return record;
}

/**
 * Update tenant profile fields.
 */
async function updateTenant(uid, fields) {
  const ref = doc(db, COLLECTION, uid);
  await updateDoc(ref, { ...fields, updatedAt: new Date().toISOString() });
}

module.exports = { getTenant, createTenantIfNew, updateTenant };

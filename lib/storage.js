/**
 * ano - lib/storage.js
 * ====================
 * Firestore persistence adapter for UserProfile.
 *
 * MULTI-TENANT: every profile is namespaced under a tenantId.
 * Customer A's users are completely isolated from Customer B's users.
 *
 * Firestore path:
 *   tenants/{tenantId}/profiles/{userId}
 *
 * API:
 *   saveProfile(tenantId, profile)         → saves/overwrites profile
 *   loadProfile(tenantId, userId)          → returns UserProfile | null
 *   deleteProfile(tenantId, userId)        → removes profile document
 *   profileExists(tenantId, userId)        → boolean
 */

const { db }          = require("./firebase");
const { UserProfile } = require("./userProfile");
const { doc, getDoc, setDoc, deleteDoc } = require("firebase/firestore");

// Path: tenants/{tenantId}/profiles/{userId}
function profileRef(tenantId, userId) {
  return doc(db, "tenants", tenantId, "profiles", userId);
}

// ── Save ──────────────────────────────────────────────────────────────────────

/**
 * Persist a UserProfile for a specific tenant.
 *
 * @param {string}      tenantId
 * @param {UserProfile} profile
 */
async function saveProfile(tenantId, profile) {
  const ref  = profileRef(tenantId, profile.userId);
  const data = {
    ...profile.toJSON(),
    updatedAt: new Date().toISOString(),
  };
  await setDoc(ref, data);
}

// ── Load ──────────────────────────────────────────────────────────────────────

/**
 * Load a UserProfile for a specific tenant.
 *
 * @param {string} tenantId
 * @param {string} userId
 * @returns {Promise<UserProfile|null>}
 */
async function loadProfile(tenantId, userId) {
  const ref  = profileRef(tenantId, userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return UserProfile.fromJSON(snap.data());
}

// ── Delete ────────────────────────────────────────────────────────────────────

/**
 * Delete a user profile for a specific tenant.
 *
 * @param {string} tenantId
 * @param {string} userId
 */
async function deleteProfile(tenantId, userId) {
  const ref = profileRef(tenantId, userId);
  await deleteDoc(ref);
}

// ── Exists ────────────────────────────────────────────────────────────────────

/**
 * Check if a profile exists without loading it.
 *
 * @param {string} tenantId
 * @param {string} userId
 * @returns {Promise<boolean>}
 */
async function profileExists(tenantId, userId) {
  const ref  = profileRef(tenantId, userId);
  const snap = await getDoc(ref);
  return snap.exists();
}

module.exports = { saveProfile, loadProfile, deleteProfile, profileExists };

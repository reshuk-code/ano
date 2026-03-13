/**
 * ano - lib/authMiddleware.js
 * ===========================
 * Express middleware that verifies Firebase ID tokens on protected routes.
 *
 * HOW IT WORKS:
 * 1. Browser signs in via Firebase Auth (client-side SDK)
 * 2. Browser gets an ID token from Firebase
 * 3. Browser sends token in cookie: "ano_token=<idToken>"
 * 4. This middleware verifies the token with Firebase REST API
 * 5. Attaches decoded user to req.user, or redirects to /login
 *
 * We use Firebase's REST token verification (no firebase-admin SDK needed)
 * since we already have the Web API key.
 */

require("dotenv").config();

const https = require("https");

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;

/**
 * Verify a Firebase ID token using the Firebase REST API.
 * Returns decoded token payload or throws.
 */
function verifyIdToken(idToken) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ idToken });
    const options = {
      hostname: "identitytoolkit.googleapis.com",
      path    : `/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
      method  : "POST",
      headers : {
        "Content-Type"  : "application/json",
        "Content-Length": Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) return reject(new Error(parsed.error.message));
          const user = parsed.users?.[0];
          if (!user) return reject(new Error("User not found"));
          resolve(user);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

/**
 * Parse cookies from request header.
 */
function parseCookies(req) {
  const cookies = {};
  const header  = req.headers.cookie || "";
  header.split(";").forEach(part => {
    const [key, ...val] = part.trim().split("=");
    if (key) cookies[key.trim()] = decodeURIComponent(val.join("="));
  });
  return cookies;
}

/**
 * requireAuth middleware — protects dashboard, playground, etc.
 * Redirects to /login if not authenticated.
 */
async function requireAuth(req, res, next) {
  const cookies = parseCookies(req);
  const token   = cookies["ano_token"];

  if (!token) return res.redirect("/login");

  try {
    const user  = await verifyIdToken(token);
    req.user = {
      uid      : user.localId,
      email    : user.email,
      name     : user.displayName || "",
      photoURL : user.photoUrl    || "",
    };
    next();
  } catch {
    res.clearCookie("ano_token");
    res.redirect("/login");
  }
}

/**
 * optionalAuth — attaches user if token present, never blocks.
 * Used on public pages that show different UI when logged in.
 */
async function optionalAuth(req, res, next) {
  const cookies = parseCookies(req);
  const token   = cookies["ano_token"];
  if (token) {
    try {
      const user = await verifyIdToken(token);
      req.user = {
        uid     : user.localId,
        email   : user.email,
        name    : user.displayName || "",
        photoURL: user.photoUrl    || "",
      };
    } catch { /* ignore */ }
  }
  next();
}

module.exports = { requireAuth, optionalAuth, parseCookies };

/**
 * ano - setup.js
 * ==============
 * Run once before starting the server:  node setup.js
 *
 * Creates:
 *   public/style.css  — full design system
 *   public/app.js     — shared frontend utilities
 */

const fs   = require("fs");
const path = require("path");

// ── Create directories ────────────────────────────────────────────
["public"].forEach(dir => {
  const full = path.join(__dirname, dir);
  if (!fs.existsSync(full)) {
    fs.mkdirSync(full, { recursive: true });
    console.log("✓ created  ", dir + "/");
  } else {
    console.log("  exists   ", dir + "/");
  }
});

// ══════════════════════════════════════════════════════════════════
// public/style.css
// ══════════════════════════════════════════════════════════════════
const CSS = `/* ── ano design system ──────────────────────────────────────────
   Theme : Industrial terminal — dark, precise, developer-native
   Fonts : Syne (headings) + IBM Plex Mono (code / data)
   ─────────────────────────────────────────────────────────── */

:root {
  --bg-0        : #0a0a0b;
  --bg-1        : #111113;
  --bg-2        : #18181c;
  --bg-3        : #222228;
  --border      : #2a2a32;
  --border-hi   : #3d3d4a;
  --text-0      : #f0f0f4;
  --text-1      : #a0a0b0;
  --text-2      : #606070;
  --text-3      : #404050;
  --accent      : #b8f55a;
  --accent-dim  : #7aaa2a;
  --accent-glow : rgba(184,245,90,.12);
  --green       : #4ade80;
  --red         : #f87171;
  --yellow      : #fbbf24;
  --blue        : #60a5fa;
  --sidebar-w   : 220px;
  --topbar-h    : 56px;
  --radius      : 6px;
  --radius-lg   : 10px;
  --font-sans   : 'Syne', sans-serif;
  --font-mono   : 'IBM Plex Mono', monospace;
}

/* ── Reset ────────────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { font-size: 14px; }
body {
  background: var(--bg-0);
  color: var(--text-0);
  font-family: var(--font-sans);
  min-height: 100vh;
  display: flex;
  line-height: 1.6;
}
a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }
input, select, textarea, button { font-family: var(--font-mono); font-size: 13px; }
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: var(--bg-1); }
::-webkit-scrollbar-thumb { background: var(--border-hi); border-radius: 3px; }

/* ══════════════════════════════════════════════════════════════
   SIDEBAR
══════════════════════════════════════════════════════════════ */
.sidebar {
  width: var(--sidebar-w);
  min-height: 100vh;
  background: var(--bg-1);
  border-right: 1px solid var(--border);
  display: flex; flex-direction: column;
  position: fixed; top: 0; left: 0; bottom: 0; z-index: 100;
}
.sidebar-logo {
  padding: 24px 20px 20px;
  border-bottom: 1px solid var(--border);
  display: flex; align-items: center; gap: 8px;
}
.logo-mark {
  width: 28px; height: 28px;
  background: var(--accent); color: var(--bg-0);
  font-family: var(--font-sans); font-weight: 800; font-size: 16px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 4px; flex-shrink: 0;
}
.logo-text { font-size: 18px; font-weight: 800; color: var(--text-0); letter-spacing: -.5px; }
.logo-tag {
  font-family: var(--font-mono); font-size: 9px; color: var(--text-2);
  background: var(--bg-2); padding: 2px 6px; border-radius: 3px; margin-left: auto;
}
.sidebar-nav { padding: 16px 12px; flex: 1; display: flex; flex-direction: column; gap: 2px; }
.nav-item {
  display: flex; align-items: center; gap: 10px; padding: 9px 10px;
  border-radius: var(--radius); color: var(--text-1); font-size: 13px; font-weight: 600;
  transition: all .15s; text-decoration: none;
}
.nav-item svg { width: 15px; height: 15px; fill: none; stroke: currentColor; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; flex-shrink: 0; }
.nav-item:hover { background: var(--bg-2); color: var(--text-0); text-decoration: none; }
.nav-item.active { background: var(--accent-glow); color: var(--accent); }
.nav-item.active svg { stroke: var(--accent); }
.sidebar-footer { padding: 16px 20px; border-top: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
.env-badge { font-family: var(--font-mono); font-size: 10px; color: var(--text-2); display: flex; align-items: center; gap: 5px; }
.env-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); box-shadow: 0 0 6px var(--green); }
.sidebar-version { font-family: var(--font-mono); font-size: 10px; color: var(--text-3); }

/* ══════════════════════════════════════════════════════════════
   MAIN LAYOUT
══════════════════════════════════════════════════════════════ */
.main { margin-left: var(--sidebar-w); flex: 1; display: flex; flex-direction: column; min-height: 100vh; }
.topbar {
  height: var(--topbar-h); border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 32px; background: var(--bg-0); position: sticky; top: 0; z-index: 50;
}
.topbar-title { font-size: 15px; font-weight: 700; color: var(--text-0); letter-spacing: -.3px; }
.topbar-actions { display: flex; align-items: center; gap: 12px; }
.health-pill {
  font-family: var(--font-mono); font-size: 11px;
  display: flex; align-items: center; gap: 6px; padding: 4px 10px;
  border: 1px solid var(--border); border-radius: 20px;
  color: var(--text-1); background: var(--bg-1); text-decoration: none; transition: border-color .2s;
}
.health-pill:hover { border-color: var(--border-hi); text-decoration: none; }
.health-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); box-shadow: 0 0 5px var(--green); animation: pulse 2s infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
.content { padding: 36px 32px; max-width: 1100px; width: 100%; }

/* ══════════════════════════════════════════════════════════════
   BUTTONS
══════════════════════════════════════════════════════════════ */
.btn {
  display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px;
  border-radius: var(--radius); font-size: 13px; font-weight: 600;
  cursor: pointer; border: 1px solid transparent; transition: all .15s;
  text-decoration: none; white-space: nowrap;
}
.btn-primary { background: var(--accent); color: var(--bg-0); border-color: var(--accent); }
.btn-primary:hover { background: #ceff70; text-decoration: none; }
.btn-ghost { background: transparent; color: var(--text-0); border-color: var(--border-hi); }
.btn-ghost:hover { border-color: var(--text-1); text-decoration: none; }
.btn-danger { background: transparent; color: var(--red); border-color: var(--red); }
.btn-danger:hover { background: rgba(248,113,113,.1); text-decoration: none; }
.btn.small { padding: 5px 12px; font-size: 11px; }
.btn.full-w { width: 100%; justify-content: center; }

/* ══════════════════════════════════════════════════════════════
   CARDS
══════════════════════════════════════════════════════════════ */
.card { background: var(--bg-1); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px; }
.card-label { font-family: var(--font-mono); font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--text-2); margin-bottom: 8px; }
.card-value { font-size: 32px; font-weight: 800; color: var(--text-0); line-height: 1; margin-bottom: 6px; }
.card-value.mono { font-family: var(--font-mono); }
.card-value.small { font-size: 14px; margin-top: 6px; }
.card-sub { font-size: 12px; color: var(--text-2); }
.card-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.mb-sm { margin-bottom: 12px; } .mb-lg { margin-bottom: 24px; }
.mt-sm { margin-top: 12px; }   .mt-xs { margin-top: 6px; }  .mt-lg { margin-top: 32px; }

/* ══════════════════════════════════════════════════════════════
   SECTION LABELS
══════════════════════════════════════════════════════════════ */
.section-label { font-family: var(--font-mono); font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--text-2); margin-bottom: 14px; }
.section-desc  { color: var(--text-1); margin-bottom: 16px; font-size: 14px; }
.section { padding: 40px 0; border-top: 1px solid var(--border); }

/* ══════════════════════════════════════════════════════════════
   CODE WINDOWS
══════════════════════════════════════════════════════════════ */
.code-window { background: var(--bg-2); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; }
.code-topbar { background: var(--bg-3); padding: 10px 14px; display: flex; align-items: center; gap: 6px; border-bottom: 1px solid var(--border); }
.code-dot { width: 10px; height: 10px; border-radius: 50%; opacity: .7; }
.code-dot.red    { background: #ff5f56; }
.code-dot.yellow { background: #ffbd2e; }
.code-dot.green  { background: #27c93f; }
.code-filename { font-family: var(--font-mono); font-size: 11px; color: var(--text-2); margin-left: 8px; }
.code-body { font-family: var(--font-mono); font-size: 12.5px; line-height: 1.7; color: var(--text-1); padding: 20px; overflow-x: auto; white-space: pre; }
.code-body.small { font-size: 11.5px; padding: 14px; }
.tok-keyword { color: var(--accent); }
.tok-string  { color: #86efac; }
.tok-comment { color: var(--text-3); font-style: italic; }

/* ══════════════════════════════════════════════════════════════
   HOME PAGE
══════════════════════════════════════════════════════════════ */
.hero { padding: 16px 0 56px; max-width: 700px; }
.hero-eyebrow { font-family: var(--font-mono); font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: var(--accent); margin-bottom: 20px; }
.hero-headline { font-size: 52px; font-weight: 800; line-height: 1.1; letter-spacing: -1.5px; color: var(--text-0); margin-bottom: 20px; }
.hero-headline em { font-style: normal; color: var(--accent); }
.hero-sub { font-size: 15px; color: var(--text-1); line-height: 1.7; max-width: 520px; margin-bottom: 32px; }
.hero-cta { display: flex; gap: 12px; align-items: center; }
.flow-grid { display: flex; align-items: stretch; gap: 0; }
.flow-step { flex: 1; padding: 24px; background: var(--bg-1); border: 1px solid var(--border); }
.flow-step:first-child { border-radius: var(--radius-lg) 0 0 var(--radius-lg); }
.flow-step:last-child  { border-radius: 0 var(--radius-lg) var(--radius-lg) 0; }
.flow-step + .flow-step { border-left: none; }
.flow-num { font-family: var(--font-mono); font-size: 10px; color: var(--accent); letter-spacing: 1px; margin-bottom: 12px; }
.flow-icon { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: var(--accent-glow); border-radius: var(--radius); margin-bottom: 14px; }
.flow-icon svg { width: 18px; height: 18px; stroke: var(--accent); fill: none; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
.flow-arrow { align-self: center; font-size: 22px; color: var(--accent); padding: 0 4px; flex-shrink: 0; }
.flow-step h3 { font-size: 14px; font-weight: 700; margin-bottom: 8px; }
.flow-step p  { font-size: 13px; color: var(--text-1); line-height: 1.6; }
.topic-grid { display: flex; flex-wrap: wrap; gap: 8px; }
.topic-chip { font-family: var(--font-mono); font-size: 11px; padding: 5px 12px; border: 1px solid var(--border); border-radius: 20px; color: var(--text-1); background: var(--bg-1); }
.stat-strip { display: flex; align-items: center; background: var(--bg-1); border: 1px solid var(--border); border-radius: var(--radius-lg); margin-top: 40px; overflow: hidden; }
.stat { flex: 1; padding: 28px 24px; text-align: center; }
.stat-num { font-size: 36px; font-weight: 800; color: var(--accent); line-height: 1; margin-bottom: 6px; }
.stat-label { font-size: 12px; color: var(--text-2); }
.stat-divider { width: 1px; background: var(--border); align-self: stretch; }

/* ══════════════════════════════════════════════════════════════
   DASHBOARD
══════════════════════════════════════════════════════════════ */
.dash-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 32px; }
.stat-card { transition: border-color .2s; }
.stat-card:hover { border-color: var(--border-hi); }

/* ══════════════════════════════════════════════════════════════
   FORMS
══════════════════════════════════════════════════════════════ */
.inline-form { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.inline-form input,
.inline-form select {
  background: var(--bg-2); border: 1px solid var(--border); border-radius: var(--radius);
  color: var(--text-0); padding: 8px 12px; font-size: 12.5px;
  flex: 1; min-width: 160px; outline: none; transition: border-color .15s;
}
.inline-form input:focus,
.inline-form select:focus { border-color: var(--accent); }
.inline-form select  { flex: 0 0 90px; min-width: unset; }
.inline-form input::placeholder { color: var(--text-3); }
.action-card h3 { font-size: 14px; font-weight: 700; margin-bottom: 8px; }
.action-card p  { font-size: 13px; color: var(--text-1); margin-bottom: 16px; }
.result-box {
  margin-top: 12px; padding: 12px 14px;
  background: var(--accent-glow); border: 1px solid var(--accent-dim);
  border-radius: var(--radius); font-family: var(--font-mono); font-size: 12px; line-height: 1.7; word-break: break-all;
}
.result-box.hidden { display: none; }
.result-box.error  { background: rgba(248,113,113,.08); border-color: var(--red); color: var(--red); }

/* ══════════════════════════════════════════════════════════════
   API KEYS PAGE
══════════════════════════════════════════════════════════════ */
.key-banner { background: var(--bg-2); border: 1px solid var(--accent); border-radius: var(--radius-lg); padding: 20px; margin-bottom: 24px; animation: slideIn .3s ease; }
@keyframes slideIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
.key-banner.hidden { display: none; }
.key-banner-label { font-size: 12px; color: var(--text-1); margin-bottom: 12px; }
.key-banner-row { display: flex; align-items: center; gap: 12px; }
.key-value { font-family: var(--font-mono); font-size: 14px; color: var(--accent); background: var(--bg-3); padding: 10px 16px; border-radius: var(--radius); flex: 1; word-break: break-all; }
.key-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border); font-size: 13px; }
.key-row:last-child { border-bottom: none; }
.key-label { flex: 1; font-weight: 600; }
.key-env { font-family: var(--font-mono); font-size: 10px; padding: 3px 8px; border-radius: 20px; }
.key-env.env-live { background: rgba(74,222,128,.1); color: var(--green); }
.key-env.env-test { background: rgba(251,191,36,.1);  color: var(--yellow); }
.key-requests, .key-date { font-family: var(--font-mono); font-size: 11px; color: var(--text-2); }

/* ══════════════════════════════════════════════════════════════
   PLAYGROUND
══════════════════════════════════════════════════════════════ */
.playground-layout { display: grid; grid-template-columns: 380px 1fr; gap: 20px; align-items: start; }
.pg-input, .pg-textarea {
  width: 100%; background: var(--bg-2); border: 1px solid var(--border);
  border-radius: var(--radius); color: var(--text-0); padding: 9px 12px;
  font-family: var(--font-mono); font-size: 12px; outline: none; transition: border-color .15s; resize: vertical;
}
.pg-input:focus, .pg-textarea:focus { border-color: var(--accent); }
.pg-input::placeholder { color: var(--text-3); }
.pg-tabs { display: flex; gap: 2px; background: var(--bg-2); border: 1px solid var(--border); border-radius: var(--radius); padding: 3px; margin-top: 12px; flex-wrap: wrap; }
.pg-tab { flex: 1; padding: 6px 8px; background: transparent; border: none; border-radius: 4px; color: var(--text-2); font-family: var(--font-mono); font-size: 11px; cursor: pointer; transition: all .15s; }
.pg-tab:hover { color: var(--text-0); }
.pg-tab.active { background: var(--bg-3); color: var(--accent); }
.pg-panel { display: none; }
.pg-panel.active { display: block; }
.pg-response { background: var(--bg-1); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; position: sticky; top: calc(var(--topbar-h) + 20px); }
.pg-response-header { background: var(--bg-2); padding: 12px 16px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
.pg-output { max-height: 70vh; overflow-y: auto; }
.status-badge { font-family: var(--font-mono); font-size: 11px; padding: 3px 10px; border-radius: 20px; }
.status-badge.ok  { background: rgba(74,222,128,.1); color: var(--green); }
.status-badge.err { background: rgba(248,113,113,.1); color: var(--red); }
.topic-picker { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.topic-toggle { display: flex; align-items: center; gap: 5px; font-family: var(--font-mono); font-size: 11px; padding: 4px 10px; border: 1px solid var(--border); border-radius: 20px; color: var(--text-2); cursor: pointer; transition: all .15s; user-select: none; }
.topic-toggle input { display: none; }
.topic-toggle:has(input:checked)         { border-color: var(--accent); color: var(--accent); background: var(--accent-glow); }
.topic-toggle.dislike:has(input:checked) { border-color: var(--red);    color: var(--red);    background: rgba(248,113,113,.08); }

/* ══════════════════════════════════════════════════════════════
   DOCS
══════════════════════════════════════════════════════════════ */
.docs-layout { display: grid; grid-template-columns: 180px 1fr; gap: 40px; align-items: start; }
.docs-toc { position: sticky; top: calc(var(--topbar-h) + 24px); }
.toc-label { font-family: var(--font-mono); font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: var(--text-3); margin-bottom: 12px; }
.toc-link { display: block; font-size: 12.5px; color: var(--text-2); padding: 4px 0 4px 10px; border-left: 2px solid transparent; transition: all .15s; text-decoration: none; }
.toc-link:hover { color: var(--text-0); border-color: var(--border-hi); text-decoration: none; }
.docs-body h1 { font-size: 32px; font-weight: 800; letter-spacing: -.8px; margin-bottom: 12px; }
.docs-body h2 { font-size: 18px; font-weight: 700; margin-top: 40px; margin-bottom: 12px; padding-top: 40px; border-top: 1px solid var(--border); scroll-margin-top: 70px; }
.docs-body h4 { font-size: 12px; font-weight: 700; color: var(--text-2); letter-spacing: .5px; margin: 20px 0 8px; }
.docs-body p  { color: var(--text-1); margin-bottom: 14px; font-size: 14px; }
.lead  { font-size: 15px !important; color: var(--text-0) !important; line-height: 1.7; }
.hint  { font-size: 12px !important; color: var(--text-2) !important; margin-top: 8px; }
.docs-body .code-window { margin: 12px 0; }
code { font-family: var(--font-mono); font-size: 12px; }
.endpoint-badge { display: inline-block; font-family: var(--font-mono); font-size: 10px; font-weight: 600; padding: 3px 8px; border-radius: 4px; margin-right: 8px; vertical-align: middle; }
.endpoint-badge.post   { background: rgba(96,165,250,.15); color: var(--blue); }
.endpoint-badge.get    { background: rgba(74,222,128,.15); color: var(--green); }
.endpoint-badge.delete { background: rgba(248,113,113,.15); color: var(--red); }
.endpoint-path { font-size: 14px; color: var(--text-0); }
.param-table { border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; margin: 12px 0; }
.param-row { display: grid; grid-template-columns: 180px 120px 1fr; gap: 12px; padding: 10px 16px; border-bottom: 1px solid var(--border); font-size: 13px; align-items: center; }
.param-row:last-child { border-bottom: none; }
.param-row.header { background: var(--bg-2); font-size: 10px; font-family: var(--font-mono); letter-spacing: 1px; color: var(--text-2); text-transform: uppercase; }
.param-row span.mono { font-family: var(--font-mono); font-size: 12px; color: var(--text-0); }
.param-row span { color: var(--text-1); }
.badge { font-family: var(--font-mono); font-size: 10px; padding: 2px 8px; border-radius: 3px; }
.badge.required { background: rgba(248,113,113,.15); color: var(--red); }
.badge.optional { background: var(--bg-3); color: var(--text-2); }
.badge.green    { background: rgba(74,222,128,.12); color: var(--green); }
.badge.red      { background: rgba(248,113,113,.12); color: var(--red); }
.docs-footer { margin-top: 48px; padding-top: 32px; border-top: 1px solid var(--border); }

/* ══════════════════════════════════════════════════════════════
   404 PAGE
══════════════════════════════════════════════════════════════ */
.not-found { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; text-align: center; gap: 16px; }
.not-found-code { font-size: 96px; font-weight: 800; color: var(--bg-3); line-height: 1; }
.not-found h2   { font-size: 20px; color: var(--text-1); }

/* ══════════════════════════════════════════════════════════════
   UTILITIES
══════════════════════════════════════════════════════════════ */
.muted      { color: var(--text-2); font-size: 13px; }
.mono       { font-family: var(--font-mono); }
.error-text { color: var(--red); font-size: 13px; }
`;

// ══════════════════════════════════════════════════════════════════
// public/app.js
// ══════════════════════════════════════════════════════════════════
const JS = `/* ano - public/app.js
   Shared frontend utilities loaded on every page.
*/

// Health pill — update status in topbar
(function checkHealth() {
  const pill = document.getElementById('healthPill');
  if (!pill) return;
  fetch('/health')
    .then(r => r.json())
    .then(d => {
      pill.innerHTML =
        '<span class="health-dot"></span>' +
        (d.status === 'ok' ? 'live &nbsp;·&nbsp; up ' + d.uptime + 's' : 'degraded');
    })
    .catch(() => {
      pill.innerHTML = '<span style="background:var(--red);box-shadow:0 0 5px var(--red)" class="health-dot"></span> unreachable';
    });
})();
`;

// Write files
fs.writeFileSync(path.join(__dirname, "public", "style.css"), CSS, "utf8");
fs.writeFileSync(path.join(__dirname, "public", "app.js"),    JS,  "utf8");

console.log("✓ written  public/style.css");
console.log("✓ written  public/app.js");
console.log("\n✓ Setup complete.");
console.log("\nNext steps:");
console.log("  npm install");
console.log("  node server.js\n");

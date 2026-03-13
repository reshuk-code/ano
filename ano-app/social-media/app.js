// ── CONFIG ────────────────────────────────────────────────────
const ANO_BASE = 'https://ano-ochre.vercel.app';
const ANO_KEY  = 'ano_live_8b432670938b16eac63ce02a5e77d88c';

// ── TOPICS ────────────────────────────────────────────────────
const TOPICS = [
  { id: 'technology',    label: 'Tech',          icon: '💻', color: '#6c63ff' },
  { id: 'politics',      label: 'Politics',      icon: '🏛️', color: '#ff6b6b' },
  { id: 'military',      label: 'Military',      icon: '⚔️', color: '#ff9f43' },
  { id: 'economy',       label: 'Economy',       icon: '📈', color: '#00d4aa' },
  { id: 'health',        label: 'Health',        icon: '🏥', color: '#48dbfb' },
  { id: 'science',       label: 'Science',       icon: '🔬', color: '#a29bfe' },
  { id: 'sports',        label: 'Sports',        icon: '⚽', color: '#fd79a8' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬', color: '#fdcb6e' },
  { id: 'business',      label: 'Business',      icon: '💼', color: '#55efc4' },
  { id: 'aviation',      label: 'Aviation',      icon: '✈️', color: '#74b9ff' },
  { id: 'crime',         label: 'Crime',         icon: '🔍', color: '#b2bec3' },
  { id: 'food',          label: 'Food',          icon: '🍜', color: '#e17055' },
];

// ── DEMO SOCIAL POSTS ─────────────────────────────────────────
// Rich social-style posts with authors & handles
const DEMO_POSTS = [
  {
    id: 'sp_tech_001',
    title: 'GPT-5 dropped and honestly? The multi-step reasoning is insane. Asked it to debug a 400-line codebase it had never seen. Found 3 bugs, explained why each was there, and rewrote the affected sections. This is not the same tool we were using a year ago.',
    body:  'GPT-5 dropped and honestly? The multi-step reasoning is insane. Asked it to debug a 400-line codebase it had never seen. Found 3 bugs, explained why each was there, and rewrote the affected sections. This is not the same tool we were using a year ago.',
    timestamp: new Date(Date.now() - 0.5 * 3600000).toISOString(),
    platform: 'social',
    author: 'Priya Sharma', handle: 'priya_builds',
  },
  {
    id: 'sp_tech_002',
    title: 'Hot take: the best AI feature of 2026 isn\'t the chatbot. It\'s the on-device neural engine. Your phone doing private inference is the unlock nobody is talking about. No cloud, no logs, no subscriptions. Just compute.',
    body:  'Hot take: the best AI feature of 2026 isn\'t the chatbot. It\'s the on-device neural engine. Your phone doing private inference is the unlock nobody is talking about. No cloud, no logs, no subscriptions. Just compute.',
    timestamp: new Date(Date.now() - 1.2 * 3600000).toISOString(),
    platform: 'social',
    author: 'Marcus Chen', handle: 'mchen_dev',
  },
  {
    id: 'sp_pol_001',
    title: 'The Digital Privacy Bill passing 67-33 is genuinely historic. Bipartisan. Meaningful penalties. Actual enforcement mechanism. This is what happens when you elect people who understand what a database is.',
    body:  'The Digital Privacy Bill passing 67-33 is genuinely historic. Bipartisan. Meaningful penalties. Actual enforcement mechanism. This is what happens when you elect people who understand what a database is.',
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
    platform: 'social',
    author: 'Jordan Reeves', handle: 'jordan_policy',
  },
  {
    id: 'sp_eco_001',
    title: 'Bitcoin at $120k. My dad called asking if he should buy. That\'s the top signal right there 😅 Love you dad but no.',
    body:  'Bitcoin at $120k. My dad called asking if he should buy. That\'s the top signal right there 😅 Love you dad but no.',
    timestamp: new Date(Date.now() - 2.5 * 3600000).toISOString(),
    platform: 'social',
    author: 'Aisha Okonkwo', handle: 'aisha_trades',
  },
  {
    id: 'sp_sci_001',
    title: 'Europa. Liquid water. Confirmed. I have been waiting my entire career for this sentence. The ocean under that ice is real, it\'s vast, and we are going there. We are not alone in this solar system in the sense that matters most.',
    body:  'Europa. Liquid water. Confirmed. I have been waiting my entire career for this sentence. The ocean under that ice is real, it\'s vast, and we are going there. We are not alone in this solar system in the sense that matters most.',
    timestamp: new Date(Date.now() - 3 * 3600000).toISOString(),
    platform: 'social',
    author: 'Dr. Nadia Voss', handle: 'dr_voss_astro',
  },
  {
    id: 'sp_mil_001',
    title: 'The drone swarm demo they published today is genuinely the scariest military technology I\'ve seen in years. 100 units, no human in loop. We need an international framework for this yesterday.',
    body:  'The drone swarm demo they published today is genuinely the scariest military technology I\'ve seen in years. 100 units, no human in loop. We need an international framework for this yesterday.',
    timestamp: new Date(Date.now() - 3.5 * 3600000).toISOString(),
    platform: 'social',
    author: 'Col. (Ret.) Harris', handle: 'harris_defense',
  },
  {
    id: 'sp_spt_001',
    title: 'Messi retiring is like the sun deciding to become a regular star. Some things you think will just... last forever. Watch every game you can. There won\'t be another one.',
    body:  'Messi retiring is like the sun deciding to become a regular star. Some things you think will just... last forever. Watch every game you can. There won\'t be another one.',
    timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
    platform: 'social',
    author: 'Felipe Moreno', handle: 'fel_futbol',
  },
  {
    id: 'sp_hlt_001',
    title: 'mRNA TB vaccine approved by WHO. 89% efficacy. People will gloss over this because TB feels old, but it kills 1.3 million people per year. This is one of the biggest public health moments of the decade.',
    body:  'mRNA TB vaccine approved by WHO. 89% efficacy. People will gloss over this because TB feels old, but it kills 1.3 million people per year. This is one of the biggest public health moments of the decade.',
    timestamp: new Date(Date.now() - 5 * 3600000).toISOString(),
    platform: 'social',
    author: 'Dr. Amara Diallo', handle: 'dr_diallo_health',
  },
  {
    id: 'sp_ent_001',
    title: 'Stranger Things finale had me crying actual tears at 2am. I\'m a grown adult. 500M views in a week. Some things just hit different when they\'re ending.',
    body:  'Stranger Things finale had me crying actual tears at 2am. I\'m a grown adult. 500M views in a week. Some things just hit different when they\'re ending.',
    timestamp: new Date(Date.now() - 6 * 3600000).toISOString(),
    platform: 'social',
    author: 'Zoe Park', handle: 'zoepark_watches',
  },
  {
    id: 'sp_biz_001',
    title: 'Tesla $1.2T market cap and they still can\'t fix the panel gaps on a Model 3. Just saying. The stock market and the physical world remain in completely different dimensions.',
    body:  'Tesla $1.2T market cap and they still can\'t fix the panel gaps on a Model 3. Just saying. The stock market and the physical world remain in completely different dimensions.',
    timestamp: new Date(Date.now() - 7 * 3600000).toISOString(),
    platform: 'social',
    author: 'Owen Blackwell', handle: 'owenb_vc',
  },
  {
    id: 'sp_avi_001',
    title: 'Boeing getting the 797 certified is huge. New widebody for the first time in 15 years, specifically designed for the transatlantic mid-range routes everyone neglects. If they don\'t screw up manufacturing, this is the plane of the decade.',
    body:  'Boeing getting the 797 certified is huge. New widebody for the first time in 15 years, specifically designed for the transatlantic mid-range routes everyone neglects. If they don\'t screw up manufacturing, this is the plane of the decade.',
    timestamp: new Date(Date.now() - 8 * 3600000).toISOString(),
    platform: 'social',
    author: 'Theo Larsson', handle: 'theo_avgeek',
  },
  {
    id: 'sp_crm_001',
    title: 'The $3B cybercrime bust across 47 countries shows what coordinated international law enforcement can actually do. People forget Interpol moves slow but when they do move, they move. 79 arrests. Seizing servers across 3 continents.',
    body:  'The $3B cybercrime bust across 47 countries shows what coordinated international law enforcement can actually do. People forget Interpol moves slow but when they do move, they move. 79 arrests. Seizing servers across 3 continents.',
    timestamp: new Date(Date.now() - 9 * 3600000).toISOString(),
    platform: 'social',
    author: 'Leila Nazari', handle: 'leila_infosec',
  },
  {
    id: 'sp_eco_002',
    title: 'Fed signaling rate cuts is good news but let\'s not get euphoric. Inflation at 2.1% is the target but we still have housing at 6x median income in most cities. The economy is doing well in the metrics that don\'t matter most to most people.',
    body:  'Fed signaling rate cuts is good news but let\'s not get euphoric. Inflation at 2.1% is the target but we still have housing at 6x median income in most cities. The economy is doing well in the metrics that don\'t matter most to most people.',
    timestamp: new Date(Date.now() - 10 * 3600000).toISOString(),
    platform: 'social',
    author: 'Sam Osei', handle: 'sam_macro',
  },
  {
    id: 'sp_fod_001',
    title: 'A vegan restaurant getting three Michelin stars is insane. I don\'t care what your diet is, the fact that Verdure in Copenhagen pulled this off with ZERO animal products is a genuine culinary achievement. Going next month.',
    body:  'A vegan restaurant getting three Michelin stars is insane. I don\'t care what your diet is, the fact that Verdure in Copenhagen pulled this off with ZERO animal products is a genuine culinary achievement. Going next month.',
    timestamp: new Date(Date.now() - 11 * 3600000).toISOString(),
    platform: 'social',
    author: 'Emile Fontaine', handle: 'emile_eats',
  },
  {
    id: 'sp_tech_003',
    title: 'Genuinely can\'t overstate how big on-device AI is for privacy. Every time your query goes to the cloud, it\'s logged, stored, and probably trained on. Local inference kills that. Once people understand this, every product will need it.',
    body:  'Genuinely can\'t overstate how big on-device AI is for privacy. Every time your query goes to the cloud, it\'s logged, stored, and probably trained on. Local inference kills that. Once people understand this, every product will need it.',
    timestamp: new Date(Date.now() - 12 * 3600000).toISOString(),
    platform: 'social',
    author: 'Riya Menon', handle: 'riya_privacy',
  },
  {
    id: 'sp_sci_002',
    title: 'The Europa announcement hit different at 3am when I realized: everything we know about life is based on one sample. Earth. Now we might have a second data point. One more sample changes everything statistically.',
    body:  'The Europa announcement hit different at 3am when I realized: everything we know about life is based on one sample. Earth. Now we might have a second data point. One more sample changes everything statistically.',
    timestamp: new Date(Date.now() - 13 * 3600000).toISOString(),
    platform: 'social',
    author: 'Ivan Petrov', handle: 'ivan_astrobio',
  },
];

// ── STATE ─────────────────────────────────────────────────────
let S = { userId: '', liked: [], disliked: [], feed: [] };

// ── ANO API ───────────────────────────────────────────────────
async function anoPost(path, body, extraHeaders = {}) {
  const res = await fetch(ANO_BASE + path, {
    method: 'POST',
    headers: {
      'Content-Type':   'application/json',
      'x-ano-api-key':  ANO_KEY,
      'x-ano-user-id':  S.userId,
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function callFeed()    { return anoPost('/feed', { posts: DEMO_POSTS }); }
async function callOnboard() { return anoPost(`/profile/${S.userId}/onboard`, { like: S.liked, dislike: S.disliked }, { 'x-ano-user-id': undefined }); }
async function callEvent(type, post) {
  return anoPost('/event', { eventType: type, post: { id: post.id, title: post.title, body: post.body } });
}

// ── ONBOARDING ────────────────────────────────────────────────
function buildOnboarding() {
  const grid = document.getElementById('obTopics');
  TOPICS.forEach(t => {
    const chip = document.createElement('button');
    chip.className = 'ob-chip';
    chip.innerHTML = `<span>${t.icon}</span>${t.label}`;
    chip.dataset.id = t.id;

    chip.addEventListener('click', () => {
      if (chip.classList.contains('liked')) {
        chip.classList.remove('liked');
        S.liked = S.liked.filter(x => x !== t.id);
      } else if (chip.classList.contains('disliked')) {
        chip.classList.remove('disliked');
        S.disliked = S.disliked.filter(x => x !== t.id);
      } else {
        chip.classList.add('liked');
        S.liked.push(t.id);
      }
      document.getElementById('enterBtn').disabled = S.liked.length === 0;
    });

    chip.addEventListener('contextmenu', e => {
      e.preventDefault();
      chip.classList.remove('liked');
      S.liked = S.liked.filter(x => x !== t.id);
      chip.classList.toggle('disliked');
      if (chip.classList.contains('disliked')) {
        if (!S.disliked.includes(t.id)) S.disliked.push(t.id);
      } else {
        S.disliked = S.disliked.filter(x => x !== t.id);
      }
    });

    grid.appendChild(chip);
  });

  document.getElementById('enterBtn').addEventListener('click', async () => {
    const handle = document.getElementById('uidInput').value.trim() || 'vibe_user_' + Date.now();
    S.userId = handle.replace(/^@/, '');
    document.getElementById('enterBtn').textContent = 'Setting up…';
    document.getElementById('enterBtn').disabled = true;

    // Call onboard without x-ano-user-id (it's in the path)
    await fetch(ANO_BASE + `/profile/${S.userId}/onboard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-ano-api-key': ANO_KEY },
      body: JSON.stringify({ like: S.liked, dislike: S.disliked }),
    }).catch(() => {});

    launchApp();
  });
}

// ── APP ───────────────────────────────────────────────────────
function launchApp() {
  document.getElementById('onboarding').classList.remove('active');
  document.getElementById('app').classList.add('active');
  document.getElementById('navUser').textContent = S.userId;

  // Right panel topics
  const rpTopics = document.getElementById('rpTopics');
  S.liked.forEach(id => {
    const t = TOPICS.find(x => x.id === id);
    rpTopics.innerHTML += `<span class="rp-tag">${t?.icon} ${t?.label}</span>`;
  });
  S.disliked.forEach(id => {
    const t = TOPICS.find(x => x.id === id);
    rpTopics.innerHTML += `<span class="rp-tag disliked">${t?.label}</span>`;
  });

  loadFeed();
  document.getElementById('refreshFeed').addEventListener('click', loadFeed);
}

async function loadFeed() {
  const list   = document.getElementById('feedList');
  const loader = document.getElementById('feedLoader');
  list.innerHTML = '';
  loader.classList.remove('hidden');

  try {
    const data = await callFeed();
    S.feed = data.feed || [];
    loader.classList.add('hidden');

    if (!S.feed.length) {
      list.innerHTML = '<p style="padding:40px;text-align:center;color:var(--text3)">No posts yet.</p>';
      return;
    }

    S.feed.forEach((item, idx) => renderPost(item, idx));
    updateTrending(S.feed);
  } catch (e) {
    loader.classList.add('hidden');
    console.warn('Feed error, using unranked:', e.message);
    DEMO_POSTS.forEach((p, i) => {
      const fake = { ...p, _score: { final: 0.5, primaryTopic: 'technology', breakdown: [] } };
      renderPost(fake, i);
    });
  }
}

function renderPost(item, idx) {
  const list    = document.getElementById('feedList');
  const score   = item._score || {};
  const post    = DEMO_POSTS.find(p => p.id === item.id) || item;
  const topicId = score.primaryTopic || 'technology';
  const topicObj = TOPICS.find(t => t.id === topicId) || { icon: '💬', label: topicId, color: '#6c63ff' };
  const finalScore = score.final ?? 0.5;

  const avatarColor = avatarBg(post.author || 'User');
  const initials    = (post.author || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const timeAgo     = fmtTime(post.timestamp);

  const card = document.createElement('div');
  card.className = 'post-card';
  card.style.animationDelay = `${idx * 0.04}s`;
  card.innerHTML = `
    <div class="post-header">
      <div class="avatar" style="background:${avatarColor};color:white">${initials}</div>
      <div class="post-meta">
        <div class="post-author">
          ${post.author || 'User'}
          <span class="post-handle">@${post.handle || post.author?.toLowerCase().replace(' ','_') || 'user'}</span>
        </div>
        <span class="post-time">${timeAgo}</span>
      </div>
      <span class="score-badge">${(finalScore * 100).toFixed(0)}%</span>
    </div>

    <div class="post-body">${post.title}</div>

    <span class="post-topic" style="background:${topicObj.color}22;border:1px solid ${topicObj.color}44;color:${topicObj.color}">
      ${topicObj.icon} ${topicObj.label}
    </span>

    <div class="post-score-bar">
      <div class="post-score-fill" style="width:${Math.round(finalScore * 100)}%"></div>
    </div>

    <div class="post-actions">
      <button class="act-btn" data-action="like">
        <svg viewBox="0 0 20 20" fill="currentColor"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/></svg>
        Like
      </button>
      <button class="act-btn" data-action="share">
        <svg viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/></svg>
        Share
      </button>
      <button class="act-btn" data-action="click">
        <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg>
        Read
      </button>
      <button class="act-btn" data-action="skip">
        <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
        Skip
      </button>
    </div>
  `;

  // Action buttons
  card.querySelectorAll('.act-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const action = btn.dataset.action;
      fireEvent(action, item, post, card, btn);
    });
  });

  // View after 3s in viewport
  const obs = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        setTimeout(() => fireEvent('view', item, post, card, null, true), 3000);
        obs.disconnect();
      }
    });
  }, { threshold: 0.6 });
  obs.observe(card);

  list.appendChild(card);
}

function fireEvent(type, item, post, card, btn, silent = false) {
  // Visual feedback
  if (!silent) {
    if (type === 'like') {
      btn.classList.toggle('lit-like');
    } else if (type === 'share') {
      btn.classList.toggle('lit-share');
    } else if (type === 'skip') {
      btn.classList.add('lit-skip');
      card.style.opacity = '0.35';
      card.style.pointerEvents = 'none';
    }
    logSignal(type, post.author);
  }

  // Fire to ano
  callEvent(type, post).catch(err => console.warn('Event err:', err.message));
}

function logSignal(type, author) {
  const log = document.getElementById('rpLog');
  const entry = document.createElement('div');
  entry.className = `log-entry type-${type}`;
  entry.innerHTML = `<span class="le-type">${type}</span> ${(author || '').slice(0,16)}`;
  log.prepend(entry);
  while (log.children.length > 24) log.removeChild(log.lastChild);
}

function updateTrending(feed) {
  const counts = {};
  feed.forEach(item => {
    const t = item._score?.primaryTopic;
    if (t) counts[t] = (counts[t] || 0) + 1;
  });
  const sorted = Object.entries(counts).sort((a,b) => b[1]-a[1]).slice(0,5);
  const el = document.getElementById('rpTrending');
  el.innerHTML = sorted.map(([topic, count], i) => {
    const t = TOPICS.find(x => x.id === topic);
    return `<div class="trending-row">
      <span class="trending-rank">${i+1}</span>
      <span class="trending-topic">${t?.icon || ''} ${t?.label || topic}</span>
      <span class="trending-count">${count} post${count !== 1 ? 's':''}</span>
    </div>`;
  }).join('');
}

// ── HELPERS ───────────────────────────────────────────────────
function fmtTime(ts) {
  if (!ts) return '';
  const d = (Date.now() - new Date(ts)) / 60000;
  if (d < 1)  return 'just now';
  if (d < 60) return `${Math.floor(d)}m`;
  if (d < 1440) return `${Math.floor(d/60)}h`;
  return `${Math.floor(d/1440)}d`;
}

const AVATAR_COLORS = ['#6c63ff','#ff6b9d','#00d4aa','#ff9f43','#48dbfb','#a29bfe','#fd79a8','#fdcb6e'];
function avatarBg(name) {
  let hash = 0;
  for (const c of name) hash = c.charCodeAt(0) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ── BOOT ──────────────────────────────────────────────────────
buildOnboarding();

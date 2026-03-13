// ── CONFIG ────────────────────────────────────────────────────
const ANO_BASE   = 'https://ano-ochre.vercel.app';
const ANO_KEY    = 'ano_live_8b432670938b16eac63ce02a5e77d88c';

// ── TOPIC DEFINITIONS ─────────────────────────────────────────
const TOPICS = [
  { id: 'technology',    label: 'Technology',    icon: '💻' },
  { id: 'politics',      label: 'Politics',      icon: '🏛️' },
  { id: 'military',      label: 'Military',      icon: '⚔️' },
  { id: 'economy',       label: 'Economy',       icon: '📈' },
  { id: 'health',        label: 'Health',        icon: '🏥' },
  { id: 'science',       label: 'Science',       icon: '🔬' },
  { id: 'sports',        label: 'Sports',        icon: '⚽' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬' },
  { id: 'business',      label: 'Business',      icon: '💼' },
  { id: 'aviation',      label: 'Aviation',      icon: '✈️' },
  { id: 'crime',         label: 'Crime',         icon: '🔍' },
  { id: 'food',          label: 'Food',          icon: '🍜' },
];

// ── DEMO ARTICLES (rich dataset across all topics) ─────────────
const DEMO_POSTS = [
  {
    id: 'post_tech_001',
    title: 'OpenAI Unveils GPT-5 With Real-Time Reasoning Capabilities',
    body: 'OpenAI announced its next-generation language model today, claiming significant improvements in multi-step reasoning, coding accuracy, and factual grounding. The model is available via API and shows 40% improvement on standard benchmarks.',
    timestamp: new Date(Date.now() - 1 * 3600000).toISOString(),
    platform: 'news',
  },
  {
    id: 'post_tech_002',
    title: 'Apple Debuts Neural Engine Chip That Runs AI Entirely On-Device',
    body: 'Apple\'s new M4 Ultra processor features a dedicated neural engine capable of running large language models locally, promising private and fast AI without cloud dependency.',
    timestamp: new Date(Date.now() - 3 * 3600000).toISOString(),
    platform: 'news',
  },
  {
    id: 'post_pol_001',
    title: 'Senate Passes Landmark Digital Privacy Bill After Years of Debate',
    body: 'The U.S. Senate voted 67-33 to pass the American Data Privacy Protection Act, which would give citizens the right to access, correct, and delete personal data held by companies.',
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
    platform: 'news',
  },
  {
    id: 'post_pol_002',
    title: 'EU Leaders Reach Climate Finance Agreement at Emergency Summit',
    body: 'European Union heads of state agreed to a €500 billion climate fund after two days of intense negotiations, targeting carbon neutrality by 2045 and supporting developing nations in green transition.',
    timestamp: new Date(Date.now() - 5 * 3600000).toISOString(),
    platform: 'news',
  },
  {
    id: 'post_mil_001',
    title: 'NATO Deploys Advanced Missile Defense Systems to Eastern Europe',
    body: 'NATO announced the deployment of next-generation Patriot missile defense batteries across Poland, Romania and the Baltic states as part of a renewed eastern flank strengthening initiative.',
    timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
    platform: 'news',
  },
  {
    id: 'post_mil_002',
    title: 'Army Successfully Tests Autonomous Combat Drone Swarm System',
    body: 'The U.S. Army demonstrated a coordinated swarm of 100 autonomous drones capable of identifying and engaging targets without human intervention, raising ethical questions among military experts.',
    timestamp: new Date(Date.now() - 8 * 3600000).toISOString(),
    platform: 'news',
  },
  {
    id: 'post_eco_001',
    title: 'Federal Reserve Signals Potential Rate Cuts as Inflation Eases to 2.1%',
    body: 'Fed Chair Jerome Powell indicated that the central bank is prepared to lower interest rates in the coming quarters after inflation fell to its lowest level since 2021, boosting stock market confidence.',
    timestamp: new Date(Date.now() - 6 * 3600000).toISOString(),
    platform: 'news',
  },
  {
    id: 'post_eco_002',
    title: 'Bitcoin Surges Past $120,000 as Institutional Demand Accelerates',
    body: 'Bitcoin hit a new all-time high as major financial institutions including BlackRock and Fidelity reported record inflows into their spot Bitcoin ETFs, driving a broad crypto market rally.',
    timestamp: new Date(Date.now() - 7 * 3600000).toISOString(),
    platform: 'news',
  },
  {
    id: 'post_hlt_001',
    title: 'WHO Approves First mRNA Vaccine Against Tuberculosis in Historic Decision',
    body: 'The World Health Organization granted emergency approval to a new mRNA-based tuberculosis vaccine that showed 89% efficacy in Phase 3 trials, potentially saving millions of lives annually.',
    timestamp: new Date(Date.now() - 9 * 3600000).toISOString(),
    platform: 'news',
  },
  {
    id: 'post_sci_001',
    title: 'NASA Confirms Discovery of Liquid Water Ocean Beneath Europa\'s Ice Shell',
    body: 'Data from the Europa Clipper mission confirms a vast subsurface ocean with conditions that could support microbial life, marking one of the most significant discoveries in planetary science.',
    timestamp: new Date(Date.now() - 10 * 3600000).toISOString(),
    platform: 'news',
  },
  {
    id: 'post_spt_001',
    title: 'Lionel Messi Announces Retirement From Professional Football at Age 38',
    body: 'Lionel Messi confirmed he will retire at the end of the current MLS season, ending a career that brought eight Ballon d\'Or awards, four Champions League titles, and a 2022 World Cup.',
    timestamp: new Date(Date.now() - 11 * 3600000).toISOString(),
    platform: 'news',
  },
  {
    id: 'post_ent_001',
    title: 'Netflix Record: New Season of Stranger Things Hits 500M Views in First Week',
    body: 'The fifth and final season of Stranger Things shattered Netflix\'s previous viewership records, accumulating over 500 million hours watched in its opening week across 190 countries.',
    timestamp: new Date(Date.now() - 12 * 3600000).toISOString(),
    platform: 'news',
  },
  {
    id: 'post_biz_001',
    title: 'Tesla Surpasses Toyota as World\'s Most Valuable Automaker at $1.2 Trillion',
    body: 'Tesla\'s market capitalization surpassed Toyota after strong quarterly delivery figures and the announcement of a new affordable $25,000 Model 2 set for production in Austin, Texas.',
    timestamp: new Date(Date.now() - 13 * 3600000).toISOString(),
    platform: 'news',
  },
  {
    id: 'post_avi_001',
    title: 'Boeing 797 Receives FAA Certification: The First New Jet in 15 Years',
    body: 'The FAA issued a type certificate for Boeing\'s 797 mid-market aircraft, ending a 15-year gap in new commercial jet certifications for the manufacturer following years of safety reviews.',
    timestamp: new Date(Date.now() - 14 * 3600000).toISOString(),
    platform: 'news',
  },
  {
    id: 'post_crm_001',
    title: 'Interpol Dismantles $3B Cybercrime Ring Spanning 47 Countries',
    body: 'In Operation Synergia II, Interpol arrested 79 suspects and seized servers across Asia, Europe, and Latin America tied to a sophisticated ransomware and financial fraud network.',
    timestamp: new Date(Date.now() - 15 * 3600000).toISOString(),
    platform: 'news',
  },
  {
    id: 'post_fod_001',
    title: 'Michelin Awards First Three Stars to a Plant-Based Restaurant in History',
    body: 'Verdure, a vegan fine-dining restaurant in Copenhagen, received three Michelin stars — the first fully plant-based restaurant ever to achieve the guide\'s highest distinction.',
    timestamp: new Date(Date.now() - 16 * 3600000).toISOString(),
    platform: 'news',
  },
];

// ── STATE ──────────────────────────────────────────────────────
let state = {
  userId: '',
  likedTopics: [],
  dislikedTopics: [],
  rankedFeed: [],
  eventLog: [],
};

// ── ANO API CALLS ──────────────────────────────────────────────
async function anoFetch(path, method = 'GET', body = null, extraHeaders = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'x-ano-api-key': ANO_KEY,
    'x-ano-user-id': state.userId,
    ...extraHeaders,
  };
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(ANO_BASE + path, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

async function onboardUser(liked, disliked) {
  return anoFetch(`/profile/${state.userId}/onboard`, 'POST', { like: liked, dislike: disliked });
}

async function getFeed() {
  return anoFetch('/feed', 'POST', { posts: DEMO_POSTS });
}

async function sendEvent(eventType, post) {
  return anoFetch('/event', 'POST', {
    eventType,
    post: { id: post.id, title: post.title, body: post.body },
  });
}

// ── ONBOARDING ─────────────────────────────────────────────────
function initOnboarding() {
  const grid = document.getElementById('topicGrid');
  const startBtn = document.getElementById('startBtn');

  TOPICS.forEach(topic => {
    const chip = document.createElement('button');
    chip.className = 'topic-chip';
    chip.innerHTML = `<span class="chip-icon">${topic.icon}</span>${topic.label}`;
    chip.dataset.id = topic.id;
    chip.title = 'Click: like | Right-click: dislike';

    chip.addEventListener('click', () => {
      if (chip.classList.contains('liked')) {
        chip.classList.remove('liked');
        state.likedTopics = state.likedTopics.filter(t => t !== topic.id);
      } else if (chip.classList.contains('disliked')) {
        chip.classList.remove('disliked');
        state.dislikedTopics = state.dislikedTopics.filter(t => t !== topic.id);
      } else {
        chip.classList.add('liked');
        state.likedTopics.push(topic.id);
      }
      updateStartBtn();
    });

    chip.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      if (chip.classList.contains('liked')) {
        chip.classList.remove('liked');
        state.likedTopics = state.likedTopics.filter(t => t !== topic.id);
      }
      chip.classList.toggle('disliked');
      if (chip.classList.contains('disliked')) {
        if (!state.dislikedTopics.includes(topic.id)) state.dislikedTopics.push(topic.id);
      } else {
        state.dislikedTopics = state.dislikedTopics.filter(t => t !== topic.id);
      }
      updateStartBtn();
    });

    grid.appendChild(chip);
  });

  function updateStartBtn() {
    startBtn.disabled = state.likedTopics.length === 0;
  }

  startBtn.addEventListener('click', async () => {
    const userInput = document.getElementById('userIdInput').value.trim();
    state.userId = userInput || 'demo_user_' + Date.now();

    startBtn.textContent = 'Setting up profile…';
    startBtn.disabled = true;

    try {
      await onboardUser(state.likedTopics, state.dislikedTopics);
    } catch (e) {
      console.warn('Onboard warning:', e.message);
      // Continue anyway — profile may already exist
    }

    showFeedScreen();
    loadFeed();
  });
}

// ── FEED SCREEN ────────────────────────────────────────────────
function showFeedScreen() {
  document.getElementById('onboarding').classList.remove('active');
  document.getElementById('feedScreen').classList.add('active');
  document.getElementById('headerUserId').textContent = state.userId;

  // Sidebar topic pills
  const pillsEl = document.getElementById('topicPills');
  pillsEl.innerHTML = '';
  state.likedTopics.forEach(t => {
    const topic = TOPICS.find(x => x.id === t);
    pillsEl.innerHTML += `<div class="topic-pill">${topic?.icon || ''} <span class="pill-dot"></span>${topic?.label || t}</div>`;
  });
  if (state.dislikedTopics.length) {
    state.dislikedTopics.forEach(t => {
      const topic = TOPICS.find(x => x.id === t);
      pillsEl.innerHTML += `<div class="topic-pill disliked" style="opacity:0.5">${topic?.icon || ''} <span class="pill-dot"></span>${topic?.label || t}</div>`;
    });
  }
}

async function loadFeed() {
  const container = document.getElementById('feedContainer');
  const loading   = document.getElementById('loadingState');
  const empty     = document.getElementById('emptyState');

  container.innerHTML = '';
  container.style.display = 'none';
  loading.style.display = 'flex';
  empty.style.display = 'none';

  try {
    const data = await getFeed();
    state.rankedFeed = data.feed || [];

    loading.style.display = 'none';

    if (state.rankedFeed.length === 0) {
      empty.style.display = 'block';
      return;
    }

    container.style.display = 'grid';
    state.rankedFeed.forEach((item, idx) => renderCard(item, idx, container));

    updateStats(data);
  } catch (e) {
    loading.style.display = 'none';
    container.style.display = 'grid';
    // Fallback: show posts unranked
    console.warn('Feed error, showing unranked:', e.message);
    DEMO_POSTS.forEach((p, i) => {
      const fakeItem = { ...p, _score: { final: 0.5, primaryTopic: 'news', breakdown: [] } };
      renderCard(fakeItem, i, container);
    });
  }

  document.getElementById('postCount').textContent =
    state.rankedFeed.length + ' articles ranked';
}

function renderCard(item, idx, container) {
  const score     = item._score || {};
  const finalScore = score.final ?? 0.5;
  const topic     = score.primaryTopic || 'news';
  const topicObj  = TOPICS.find(t => t.id === topic) || { icon: '📰', label: topic };
  const post      = DEMO_POSTS.find(p => p.id === item.id) || item;
  const timeAgo   = formatTimeAgo(post.timestamp);

  const card = document.createElement('div');
  card.className = 'news-card';
  card.style.animationDelay = `${idx * 0.05}s`;
  card.innerHTML = `
    <div class="card-rank">${idx + 1}</div>
    <div class="card-topic-bar" style="background: ${topicColor(topic)}"></div>
    <div class="card-body">
      <div class="card-meta">
        <span class="card-topic-tag">${topicObj.icon} ${topicObj.label}</span>
        <span class="card-dot"></span>
        <span class="card-time">${timeAgo}</span>
      </div>
      <div class="card-title">${item.title}</div>
      <div class="card-excerpt">${post.body || ''}</div>
    </div>
    <div class="card-score-row">
      <div class="score-bar-track">
        <div class="score-bar-fill" style="width: ${Math.round(finalScore * 100)}%"></div>
      </div>
      <span class="score-val">score ${finalScore.toFixed(3)}</span>
    </div>
    <div class="card-actions">
      <button class="action-btn" data-action="like"   data-id="${item.id}">👍 Like</button>
      <button class="action-btn" data-action="share"  data-id="${item.id}">↗ Share</button>
      <button class="action-btn" data-action="skip"   data-id="${item.id}">✕ Skip</button>
    </div>
  `;

  // Open modal on card body click
  card.querySelector('.card-body').addEventListener('click', () => {
    openModal(item, post);
    trackEvent('click', item, card);
  });
  card.querySelector('.card-score-row').addEventListener('click', () => {
    openModal(item, post);
    trackEvent('click', item, card);
  });

  // Action buttons
  card.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const action = btn.dataset.action;
      trackEvent(action, item, card);
    });
  });

  container.appendChild(card);

  // Trigger view event after 3s if visible
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          if (document.body.contains(card)) trackEvent('view', item, card, true);
        }, 3000);
        observer.disconnect();
      }
    });
  }, { threshold: 0.5 });
  observer.observe(card);
}

function trackEvent(eventType, item, card, silent = false) {
  const post = DEMO_POSTS.find(p => p.id === item.id) || item;

  // Update card UI immediately
  if (!silent) {
    const likeBtn = card.querySelector('[data-action="like"]');
    const skipBtn = card.querySelector('[data-action="skip"]');
    if (eventType === 'like') {
      likeBtn?.classList.toggle('active-like');
    } else if (eventType === 'skip') {
      skipBtn?.classList.toggle('active-skip');
      card.style.opacity = '0.4';
    }
  }

  // Send to ano
  sendEvent(eventType, post)
    .then(() => {
      if (!silent) logEvent(eventType, post.title);
    })
    .catch(err => console.warn('Event error:', err.message));
}

function logEvent(type, title) {
  const log = document.getElementById('eventLog');
  const entry = document.createElement('div');
  entry.className = 'event-entry';
  entry.innerHTML = `<span class="ev-type">${type}</span> · ${title.slice(0, 28)}…`;
  log.prepend(entry);
  state.eventLog.unshift({ type, title });
  // Keep max 20 entries
  while (log.children.length > 20) log.removeChild(log.lastChild);
}

function updateStats(data) {
  const stats = document.getElementById('feedStats');
  const topTopics = {};
  (data.feed || []).forEach(item => {
    const t = item._score?.primaryTopic;
    if (t) topTopics[t] = (topTopics[t] || 0) + 1;
  });
  const sorted = Object.entries(topTopics).sort((a,b) => b[1]-a[1]).slice(0, 4);
  stats.innerHTML = `
    <div class="stat-row"><span class="stat-label">Articles</span><span class="stat-val">${data.count || data.feed?.length || 0}</span></div>
    <div class="stat-row"><span class="stat-label">Top topic</span><span class="stat-val">${sorted[0]?.[0] || '—'}</span></div>
    <div class="stat-row"><span class="stat-label">Tenant</span><span class="stat-val" style="font-size:0.65rem">${data.tenantId || '—'}</span></div>
  `;
}

// ── MODAL ──────────────────────────────────────────────────────
function openModal(item, post) {
  const score     = item._score || {};
  const topic     = score.primaryTopic || 'news';
  const topicObj  = TOPICS.find(t => t.id === topic) || { icon: '📰', label: topic };
  const breakdown = score.breakdown || [];

  const content = document.getElementById('modalContent');
  content.innerHTML = `
    <div class="modal-topic">${topicObj.icon} ${topicObj.label}</div>
    <h2 class="modal-title">${item.title}</h2>
    <p class="modal-body">${post.body || ''}</p>
    ${breakdown.length ? `
      <div class="modal-score-section">
        <div class="modal-score-title">Why you're seeing this · score ${(score.final || 0).toFixed(4)}</div>
        ${breakdown.map(b => `
          <div class="breakdown-row">
            <span class="bd-topic">${b.topic}</span>
            <div class="bd-bar"><div class="bd-fill" style="width:${Math.round((b.contribution||0)*100)}%"></div></div>
            <span class="bd-val">${(b.contribution||0).toFixed(2)}</span>
          </div>
        `).join('')}
        <div class="breakdown-row" style="margin-top:8px">
          <span class="bd-topic" style="color:var(--muted)">recency</span>
          <div class="bd-bar"><div class="bd-fill" style="width:${Math.round((score.recencyBoost||0)*100)}%; background:var(--accent)"></div></div>
          <span class="bd-val">${(score.recencyBoost||0).toFixed(2)}</span>
        </div>
      </div>
    ` : ''}
  `;

  document.getElementById('articleModal').style.display = 'flex';
}

document.getElementById('modalClose').addEventListener('click', () => {
  document.getElementById('articleModal').style.display = 'none';
});
document.getElementById('articleModal').addEventListener('click', e => {
  if (e.target.id === 'articleModal') document.getElementById('articleModal').style.display = 'none';
});

// ── CONTROLS ───────────────────────────────────────────────────
document.getElementById('refreshBtn').addEventListener('click', loadFeed);
document.getElementById('logoutBtn').addEventListener('click', () => {
  state = { userId: '', likedTopics: [], dislikedTopics: [], rankedFeed: [], eventLog: [] };
  document.getElementById('feedScreen').classList.remove('active');
  document.getElementById('onboarding').classList.add('active');
  document.getElementById('topicGrid').innerHTML = '';
  document.getElementById('feedContainer').innerHTML = '';
  initOnboarding();
});

// ── HELPERS ────────────────────────────────────────────────────
function formatTimeAgo(ts) {
  if (!ts) return '';
  const diff = Date.now() - new Date(ts).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return `${Math.floor(diff / 60000)}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h/24)}d ago`;
}

function topicColor(topic) {
  const map = {
    technology: '#2563eb', politics: '#7c3aed', military: '#dc2626',
    economy: '#16a34a', health: '#0891b2', science: '#6d28d9',
    sports: '#ea580c', entertainment: '#db2777', business: '#0f766e',
    aviation: '#1d4ed8', crime: '#374151', food: '#b45309',
  };
  return map[topic] || '#c8401b';
}

// ── BOOT ───────────────────────────────────────────────────────
initOnboarding();

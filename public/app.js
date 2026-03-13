// ano - public/app.js — shared frontend utilities

// ── LANDING PAGE DEMO ────────────────────────────────────────
const ANO_KEY = 'ano_live_8b432670938b16eac63ce02a5e77d88c';

const DEMO_TOPICS = [
  { id: 'technology', label: 'tech', icon: '💻' },
  { id: 'politics',   label: 'politics', icon: '🏛️' },
  { id: 'military',   label: 'military', icon: '⚔️' },
  { id: 'economy',    label: 'economy', icon: '📈' },
  { id: 'health',     label: 'health', icon: '🏥' },
  { id: 'science',    label: 'science', icon: '🔬' },
  { id: 'sports',     label: 'sports', icon: '⚽' },
  { id: 'entertainment', label: 'entertain', icon: '🎬' },
  { id: 'business',   label: 'business', icon: '💼' },
  { id: 'aviation',   label: 'aviation', icon: '✈️' },
  { id: 'crime',      label: 'crime', icon: '🔍' },
  { id: 'food',       label: 'food', icon: '🍜' },
];

const DEMO_POSTS = [
  { id: 'dp_tech_1',  title: 'GPT-5 drops with real-time multi-step reasoning',           platform: 'demo' },
  { id: 'dp_pol_1',   title: 'Senate passes landmark Digital Privacy Bill 67-33',         platform: 'demo' },
  { id: 'dp_mil_1',   title: 'NATO deploys missile defense systems to Eastern Europe',    platform: 'demo' },
  { id: 'dp_eco_1',   title: 'Fed signals rate cuts as inflation eases to 2.1%',          platform: 'demo' },
  { id: 'dp_hlt_1',   title: 'WHO approves first mRNA vaccine against tuberculosis',      platform: 'demo' },
  { id: 'dp_sci_1',   title: 'NASA confirms liquid water ocean beneath Europa ice shell', platform: 'demo' },
  { id: 'dp_spt_1',   title: 'Messi announces retirement from professional football',     platform: 'demo' },
  { id: 'dp_ent_1',   title: 'Stranger Things finale hits 500M views in first week',      platform: 'demo' },
  { id: 'dp_biz_1',   title: 'Tesla surpasses Toyota as world most valuable automaker',   platform: 'demo' },
  { id: 'dp_avi_1',   title: 'Boeing 797 receives FAA certification after 15 years',      platform: 'demo' },
  { id: 'dp_crm_1',   title: 'Interpol dismantles $3B cybercrime ring across 47 countries', platform: 'demo' },
  { id: 'dp_fod_1',   title: 'Michelin awards first three stars to plant-based restaurant', platform: 'demo' },
];

// topic id → post id mapping (which post best represents each topic)
const TOPIC_POST_MAP = {
  technology:'dp_tech_1', politics:'dp_pol_1', military:'dp_mil_1',
  economy:'dp_eco_1',     health:'dp_hlt_1',   science:'dp_sci_1',
  sports:'dp_spt_1',      entertainment:'dp_ent_1', business:'dp_biz_1',
  aviation:'dp_avi_1',    crime:'dp_crm_1',    food:'dp_fod_1',
};

// Social preview authors/handles per topic
const SP_AUTHORS = [
  { id:'dp_tech_1', handle:'priya_builds', init:'P', color:'#6c63ff', text:'GPT-5 dropped and honestly the multi-step reasoning is insane.' },
  { id:'dp_sci_1',  handle:'dr_voss_astro', init:'N', color:'#a29bfe', text:'Europa. Liquid water. Confirmed. I have waited my entire career for this.' },
  { id:'dp_eco_1',  handle:'aisha_trades', init:'A', color:'#00d4aa', text:'Bitcoin at $120k. My dad called asking if he should buy 😅' },
  { id:'dp_spt_1',  handle:'fel_futbol',   init:'F', color:'#fd79a8', text:'Messi retiring is like the sun deciding to become a regular star.' },
  { id:'dp_pol_1',  handle:'jordan_policy', init:'J', color:'#ff6b6b', text:'The Digital Privacy Bill passing 67-33 is genuinely historic.' },
  { id:'dp_mil_1',  handle:'harris_defense', init:'H', color:'#ff9f43', text:'The drone swarm demo is the scariest military tech I have seen in years.' },
  { id:'dp_hlt_1',  handle:'dr_diallo', init:'D', color:'#48dbfb', text:'mRNA TB vaccine approved. 89% efficacy. One of the biggest health moments of the decade.' },
  { id:'dp_biz_1',  handle:'owenb_vc', init:'O', color:'#55efc4', text:'Tesla $1.2T and they still cannot fix panel gaps on a Model 3.' },
  { id:'dp_avi_1',  handle:'theo_avgeek', init:'T', color:'#74b9ff', text:'Boeing 797 certified. First new widebody in 15 years.' },
  { id:'dp_crm_1',  handle:'leila_infosec', init:'L', color:'#b2bec3', text:'$3B cybercrime bust across 47 countries. Interpol moves slow but when they do…' },
  { id:'dp_ent_1',  handle:'zoepark', init:'Z', color:'#fdcb6e', text:'Stranger Things finale had me crying at 2am. 500M views in a week.' },
  { id:'dp_fod_1',  handle:'emile_eats', init:'E', color:'#e17055', text:'A vegan restaurant getting three Michelin stars is insane.' },
];

let demoLiked = [];
let demoDisliked = [];

function initDemo() {
  const topicGrid = document.getElementById('demoTopics');
  if (!topicGrid) return;

  DEMO_TOPICS.forEach(t => {
    const chip = document.createElement('button');
    chip.className = 'demo-chip';
    chip.innerHTML = `<span>${t.icon}</span>${t.label}`;
    chip.dataset.id = t.id;

    chip.addEventListener('click', () => {
      if (chip.classList.contains('liked')) {
        chip.classList.remove('liked');
        demoLiked = demoLiked.filter(x => x !== t.id);
      } else if (chip.classList.contains('disliked')) {
        chip.classList.remove('disliked');
        demoDisliked = demoDisliked.filter(x => x !== t.id);
      } else {
        chip.classList.add('liked');
        demoLiked.push(t.id);
      }
    });

    chip.addEventListener('contextmenu', e => {
      e.preventDefault();
      chip.classList.remove('liked');
      demoLiked = demoLiked.filter(x => x !== t.id);
      chip.classList.toggle('disliked');
      if (chip.classList.contains('disliked')) {
        if (!demoDisliked.includes(t.id)) demoDisliked.push(t.id);
      } else {
        demoDisliked = demoDisliked.filter(x => x !== t.id);
      }
    });

    topicGrid.appendChild(chip);
  });

  document.getElementById('demoRunBtn').addEventListener('click', runDemo);
}

async function runDemo() {
  const uid = document.getElementById('demoUid').value.trim() || 'demo_visitor';
  const status = document.getElementById('demoStatus');
  const feed = document.getElementById('demoFeed');
  const btn = document.getElementById('demoRunBtn');

  if (demoLiked.length === 0) {
    status.className = 'demo-status error';
    status.textContent = '⚠ Pick at least one topic first';
    return;
  }

  btn.disabled = true;
  status.className = 'demo-status loading';
  status.textContent = '⟳ Calling /profile/onboard…';
  feed.innerHTML = '';

  try {
    // 1. Onboard
    await fetch(`/profile/${uid}/onboard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-ano-api-key': ANO_KEY },
      body: JSON.stringify({ like: demoLiked, dislike: demoDisliked }),
    });

    status.textContent = '⟳ Calling /feed…';

    // 2. Feed
    const res = await fetch('/feed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-ano-api-key': ANO_KEY,
        'x-ano-user-id': uid,
      },
      body: JSON.stringify({ posts: DEMO_POSTS }),
    });
    const data = await res.json();
    const ranked = data.feed || [];

    status.className = 'demo-status';
    status.textContent = `✓ ${ranked.length} posts ranked for @${uid}`;

    document.getElementById('demoCount').textContent = ranked.length + ' posts';

    // Render rows
    ranked.forEach((item, i) => {
      const score = item._score || {};
      const topic = score.primaryTopic || '—';
      const final = ((score.final || 0) * 100).toFixed(0);
      const row = document.createElement('div');
      row.className = 'demo-row';
      row.style.animationDelay = `${i * 0.04}s`;
      row.innerHTML = `
        <div class="demo-row-rank">${i + 1}</div>
        <div class="demo-row-body">
          <div class="demo-row-topic">${topic}</div>
          <div class="demo-row-title">${item.title}</div>
        </div>
        <div class="demo-row-score">${final}%</div>
      `;
      feed.appendChild(row);
    });

    // Update app previews with live data
    updatePreviews(ranked);

  } catch (e) {
    status.className = 'demo-status error';
    status.textContent = '✕ Error: ' + e.message;
  } finally {
    btn.disabled = false;
  }
}

function updatePreviews(ranked) {
  // News preview — top 3
  ranked.slice(0, 3).forEach((item, i) => {
    const n = i + 1;
    const score = item._score || {};
    const topic = score.primaryTopic || 'news';
    const pct = Math.round((score.final || 0) * 100);

    const tagEl   = document.getElementById(`npTag${n}`);
    const titleEl = document.getElementById(`npTitle${n}`);
    const barEl   = document.getElementById(`npBar${n}`);

    if (tagEl)   tagEl.textContent   = topic;
    if (titleEl) titleEl.textContent = item.title;
    if (barEl)   barEl.style.width   = pct + '%';
  });

  // Social preview — top 3
  ranked.slice(0, 3).forEach((item, i) => {
    const n = i + 1;
    const score = item._score || {};
    const pct = Math.round((score.final || 0) * 100);
    const author = SP_AUTHORS.find(a => a.id === item.id);

    const avEl    = document.getElementById(`spAv${n}`);
    const textEl  = document.getElementById(`spText${n}`);
    const scoreEl = document.getElementById(`spScore${n}`);

    if (author && avEl) {
      avEl.textContent = author.init;
      avEl.style.background = author.color;
    }
    if (textEl && author)  textEl.textContent  = author.text;
    else if (textEl)       textEl.textContent  = item.title;
    if (scoreEl) scoreEl.textContent = pct + '%';
  });
}

initDemo();

// Responsive navbar
(function() {
  const btn = document.getElementById('navHamburger');
  const links = document.getElementById('navLinks');
  const actions = document.getElementById('navActions');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const open = btn.classList.toggle('open');
    links && links.classList.toggle('open', open);
    actions && actions.classList.toggle('open', open);
  });
  // Close menu when a nav link is clicked
  document.querySelectorAll('.land-nav-link').forEach(a => {
    a.addEventListener('click', () => {
      btn.classList.remove('open');
      links && links.classList.remove('open');
      actions && actions.classList.remove('open');
    });
  });
})();

// Health pill
fetch('/health')
  .then(r => r.json())
  .then(d => {
    const pill = document.getElementById('healthPill');
    if (pill) {
      pill.innerHTML = '<span class="health-dot"></span> ' + (d.status === 'ok' ? 'live' : 'down');
    }
  })
  .catch(() => {
    const pill = document.getElementById('healthPill');
    if (pill) pill.innerHTML = '<span style="color:var(--red)">● unreachable</span>';
  });

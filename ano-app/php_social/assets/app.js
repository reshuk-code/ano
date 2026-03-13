// ── Pulse — app.js ─────────────────────────────────────────
// Handles event tracking + UI feedback for the feed page

const AJAX_URL = '/ajax/event.php';

// ── Toast helper ─────────────────────────────────────────────
let toastTimer;
function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 2500);
}

// ── Fire ANO event ────────────────────────────────────────────
async function fireEvent(eventType, postId, title, body) {
  try {
    await fetch(AJAX_URL, {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({
        eventType,
        post: { id: postId, title, body }
      })
    });
  } catch (e) {
    console.warn('ANO event failed:', e);
  }
}

// ── View tracking (IntersectionObserver) ─────────────────────
const viewedPosts = new Set();
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const card = entry.target;
    const id   = card.dataset.postId;
    if (viewedPosts.has(id)) return;

    // Debounce: only fire after 3 seconds in viewport
    const timer = setTimeout(() => {
      if (viewedPosts.has(id)) return;
      viewedPosts.add(id);
      fireEvent('view', id, card.dataset.title, card.dataset.body);
      observer.unobserve(card);
    }, 3000);

    // Cancel if scrolled away
    card._viewTimer = timer;
  });

  entries.forEach(entry => {
    if (entry.isIntersecting) return;
    const card = entry.target;
    clearTimeout(card._viewTimer);
  });
}, { threshold: 0.6 });

document.querySelectorAll('.post-card').forEach(card => observer.observe(card));

// ── Button interactions ───────────────────────────────────────
document.querySelectorAll('.post-card').forEach(card => {
  const postId = card.dataset.postId;
  const title  = card.dataset.title;
  const body   = card.dataset.body;

  card.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const eventType = btn.dataset.event;

      // Like — toggle
      if (eventType === 'like') {
        const wasActive = btn.classList.contains('active-like');
        btn.classList.toggle('active-like', !wasActive);
        showToast(wasActive ? 'Like removed' : '❤️ Liked');
        await fireEvent(wasActive ? 'skip' : 'like', postId, title, body);
        return;
      }

      // Share
      if (eventType === 'share') {
        btn.classList.add('active-share');
        showToast('🔁 Shared!');
        await fireEvent('share', postId, title, body);
        // Copy title to clipboard
        if (navigator.clipboard) navigator.clipboard.writeText(title).catch(() => {});
        return;
      }

      // Skip — fade & remove card
      if (eventType === 'skip') {
        card.classList.add('fading');
        showToast('⏭ Skipped');
        await fireEvent('skip', postId, title, body);
        setTimeout(() => card.remove(), 350);
        return;
      }

      // Hide — instant remove
      if (eventType === 'hide') {
        card.classList.add('fading');
        showToast('🚫 Hidden — you\'ll see less of this');
        await fireEvent('hide', postId, title, body);
        setTimeout(() => card.remove(), 350);
        return;
      }
    });
  });

  // Click-to-read fires 'click' event
  card.querySelector('.post-title')?.addEventListener('click', () => {
    fireEvent('click', postId, title, body);
  });
});

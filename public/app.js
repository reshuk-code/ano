// ano - public/app.js — shared frontend utilities

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

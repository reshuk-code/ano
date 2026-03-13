<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/ano.php';
require_login();

if (!$_SESSION['onboarded']) {
    $u = user_by_id(current_uid());
    if (!$u['onboarded']) redirect('/onboard.php');
    $_SESSION['onboarded'] = true;
}

$ano    = new Ano(ANO_BASE_URL, ANO_API_KEY);
$uid    = current_uid();
$anoUid = 'u' . $uid;

// Load all real posts from DB
$posts = posts_all(100);

// Build ANO payload
$anoPayload = array_map(fn($p) => [
    'id'        => 'p' . $p['id'],
    'title'     => substr($p['content'], 0, 120),
    'body'      => $p['content'],
    'timestamp' => date('c', strtotime($p['created_at'])),
    'platform'  => 'pulse',
], $posts);

// Rank — fallback to chronological if ANO fails
$ranked = [];
if (!empty($anoPayload)) {
    $ranked = $ano->rankFeed($anoUid, $anoPayload);
}

// Build map for fast lookup
$postMap = [];
foreach ($posts as $p) $postMap['p'.$p['id']] = $p;

// Liked post ids for current user
$likedIds = user_liked_posts($uid);

$pageTitle = 'Feed — ' . APP_NAME;
$page = 'feed';
include __DIR__ . '/includes/header.php';
?>

<main class="feed-layout">
  <aside class="sidebar">
    <?php $me = user_by_id($uid); ?>
    <div class="sidebar-card profile-mini">
      <div class="avatar-lg" style="background:<?= h($me['avatar_color']) ?>"><?= avatar_initials($me['username']) ?></div>
      <div class="profile-mini-info">
        <strong>@<?= h($me['username']) ?></strong>
        <span><?= follower_count($uid) ?> followers · <?= following_count($uid) ?> following</span>
      </div>
      <a href="/user.php?u=<?= h($me['username']) ?>" class="btn btn-ghost btn-full" style="margin-top:.75rem">View profile</a>
    </div>
    <div class="sidebar-card sidebar-tip">
      <p>💡 <strong>Your feed learns.</strong><br>Like, share and skip posts — ANO improves your ranking over time.</p>
    </div>
  </aside>

  <section class="feed-column">
    <!-- Compose quick post -->
    <div class="compose-card">
      <div class="compose-avatar" style="background:<?= h($me['avatar_color']) ?>"><?= avatar_initials($me['username']) ?></div>
      <form action="/create.php" method="POST" class="compose-form">
        <input type="hidden" name="csrf" value="<?= csrf_token() ?>">
        <textarea name="content" placeholder="What's on your mind?" rows="2" maxlength="500" required></textarea>
        <button type="submit" class="btn btn-primary btn-sm">Post</button>
      </form>
    </div>

    <div class="feed-header">
      <h2>Your Feed</h2>
      <span class="post-count"><?= count($posts) ?> posts</span>
    </div>

    <?php if (empty($posts)): ?>
      <div class="empty-state">
        <p>No posts yet. Be the first to share something!</p>
        <a href="/create.php" class="btn btn-primary" style="margin-top:1rem">Write a post</a>
      </div>
    <?php else: ?>

    <?php
    // Use ranked order if available, otherwise chronological
    $displayPosts = [];
    if (!empty($ranked)) {
        foreach ($ranked as $r) {
            if (!empty($postMap[$r['id']])) {
                $dbPost = $postMap[$r['id']];
                $dbPost['_ano'] = $r['_score'] ?? null;
                $displayPosts[] = $dbPost;
            }
        }
        // Append any not returned by ANO at the end
        $rankedIds = array_column($ranked, 'id');
        foreach ($posts as $p) {
            if (!in_array('p'.$p['id'], $rankedIds)) {
                $p['_ano'] = null;
                $displayPosts[] = $p;
            }
        }
    } else {
        foreach ($posts as $p) { $p['_ano'] = null; $displayPosts[] = $p; }
    }
    ?>

    <?php foreach ($displayPosts as $post):
      $ano_score  = $post['_ano'];
      $isLiked    = in_array($post['id'], $likedIds);
      $isOwn      = ($post['user_id'] == $uid);
    ?>
    <article class="post-card"
             data-post-id="<?= $post['id'] ?>"
             data-ano-id="p<?= $post['id'] ?>"
             data-title="<?= h(substr($post['content'],0,100)) ?>"
             data-body="<?= h($post['content']) ?>">

      <div class="post-header">
        <a href="/user.php?u=<?= h($post['username']) ?>" class="post-avatar" style="background:<?= h($post['avatar_color']) ?>">
          <?= avatar_initials($post['username']) ?>
        </a>
        <div class="post-meta">
          <a href="/user.php?u=<?= h($post['username']) ?>" class="post-author">@<?= h($post['username']) ?></a>
          <span class="post-time"><?= time_ago($post['created_at']) ?></span>
        </div>
        <?php if ($ano_score && isset($ano_score['final'])): ?>
          <span class="relevance-badge" title="ANO relevance score"><?= round($ano_score['final']*100) ?>% match</span>
        <?php endif; ?>
        <?php if ($isOwn): ?>
          <form method="POST" action="/delete_post.php" class="delete-form" onsubmit="return confirm('Delete this post?')">
            <input type="hidden" name="csrf" value="<?= csrf_token() ?>">
            <input type="hidden" name="post_id" value="<?= $post['id'] ?>">
            <button type="submit" class="btn-icon" title="Delete">🗑</button>
          </form>
        <?php endif; ?>
      </div>

      <div class="post-body">
        <p><?= nl2br(h($post['content'])) ?></p>
      </div>

      <?php if ($ano_score && !empty($ano_score['breakdown'])): ?>
      <details class="why-detail">
        <summary>Why am I seeing this?</summary>
        <ul class="why-list">
          <?php foreach ($ano_score['breakdown'] as $b): ?>
            <li><strong><?= h($b['topic']) ?></strong> — post weight <?= round($b['postWeight'],2) ?> × your score <?= round($b['userScore'],2) ?></li>
          <?php endforeach; ?>
        </ul>
      </details>
      <?php endif; ?>

      <div class="post-actions">
        <button class="action-btn like-btn <?= $isLiked?'active-like':'' ?>"
                data-action="like" data-post="<?= $post['id'] ?>">
          <?= $isLiked?'❤️':'🤍' ?> <span class="like-count"><?= $post['like_count'] ?></span>
        </button>
        <a href="/post.php?id=<?= $post['id'] ?>" class="action-btn">
          💬 <span><?= $post['comment_count'] ?></span>
        </a>
        <button class="action-btn" data-action="share" data-post="<?= $post['id'] ?>">
          🔁 Share
        </button>
        <button class="action-btn skip-btn" data-action="skip" data-post="<?= $post['id'] ?>">
          ⏭ Skip
        </button>
        <button class="action-btn hide-btn" data-action="hide" data-post="<?= $post['id'] ?>">
          🚫 Hide
        </button>
      </div>
    </article>
    <?php endforeach; ?>
    <?php endif; ?>
  </section>
</main>

<div id="toast" class="toast hidden"></div>
<script>
const CSRF = <?= json_encode(csrf_token()) ?>;

// View tracking
const viewed = new Set();
new IntersectionObserver(entries => {
  entries.forEach(e => {
    const c = e.target;
    if (e.isIntersecting && !viewed.has(c.dataset.postId)) {
      c._vt = setTimeout(() => {
        if (viewed.has(c.dataset.postId)) return;
        viewed.add(c.dataset.postId);
        anoEvent('view', c.dataset.anoId, c.dataset.title, c.dataset.body);
      }, 3000);
    } else clearTimeout(c._vt);
  });
}, {threshold: 0.6}).observe && document.querySelectorAll('.post-card').forEach(c =>
  new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && !viewed.has(c.dataset.postId)) {
        c._vt = setTimeout(() => { viewed.add(c.dataset.postId); anoEvent('view', c.dataset.anoId, c.dataset.title, c.dataset.body); }, 3000);
      } else clearTimeout(c._vt);
    });
  }, {threshold:0.6}).observe(c)
);

function anoEvent(type, anoId, title, body) {
  fetch('/ajax/event.php', {
    method:'POST', headers:{'Content-Type':'application/json','X-CSRF-Token':CSRF},
    body: JSON.stringify({eventType:type, postId:anoId, title, body})
  });
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.remove('hidden');
  clearTimeout(t._timer); t._timer = setTimeout(() => t.classList.add('hidden'), 2500);
}

document.querySelectorAll('.post-card').forEach(card => {
  const pid   = card.dataset.postId;
  const anoId = card.dataset.anoId;
  const title = card.dataset.title;
  const body  = card.dataset.body;

  // Like
  card.querySelector('.like-btn')?.addEventListener('click', async () => {
    const res = await fetch('/ajax/like.php', {
      method:'POST', headers:{'Content-Type':'application/json','X-CSRF-Token':CSRF},
      body: JSON.stringify({post_id: pid})
    });
    const data = await res.json();
    const btn  = card.querySelector('.like-btn');
    const cnt  = btn.querySelector('.like-count');
    if (data.action === 'liked') {
      btn.classList.add('active-like'); btn.innerHTML = '❤️ <span class="like-count">' + data.count + '</span>';
      anoEvent('like', anoId, title, body);
    } else {
      btn.classList.remove('active-like'); btn.innerHTML = '🤍 <span class="like-count">' + data.count + '</span>';
      anoEvent('skip', anoId, title, body);
    }
  });

  // Share
  card.querySelector('[data-action="share"]')?.addEventListener('click', () => {
    navigator.clipboard?.writeText(window.location.origin + '/post.php?id=' + pid);
    showToast('🔁 Link copied!');
    anoEvent('share', anoId, title, body);
  });

  // Skip
  card.querySelector('.skip-btn')?.addEventListener('click', () => {
    anoEvent('skip', anoId, title, body);
    card.style.transition='opacity .3s,transform .3s';
    card.style.opacity='0'; card.style.transform='translateX(40px)';
    setTimeout(() => card.remove(), 320);
    showToast('⏭ Skipped');
  });

  // Hide
  card.querySelector('.hide-btn')?.addEventListener('click', () => {
    anoEvent('hide', anoId, title, body);
    card.style.transition='opacity .3s'; card.style.opacity='0';
    setTimeout(() => card.remove(), 320);
    showToast('🚫 Hidden — you\'ll see less of this');
  });
});
</script>
<?php include __DIR__ . '/includes/footer.php'; ?>

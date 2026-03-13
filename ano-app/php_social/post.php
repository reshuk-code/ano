<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/includes/db.php';
require_login();

$id   = (int)($_GET['id'] ?? 0);
$post = post_by_id($id);
if (!$post) { http_response_code(404); echo '404 Not found'; exit; }

$uid  = current_uid();
$likedIds = user_liked_posts($uid);
$isLiked  = in_array($post['id'], $likedIds);
$isOwn    = ($post['user_id'] == $uid);

// Handle comment submit
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_check();
    $content = trim($_POST['content'] ?? '');
    if (strlen($content) >= 1) {
        comment_create($post['id'], $uid, $content);
    }
    redirect('/post.php?id=' . $id);
}

$comments  = comments_for_post($post['id']);
$pageTitle = '@' . $post['username'] . ' — ' . APP_NAME;
$page      = 'feed';
include __DIR__ . '/includes/header.php';
?>
<main class="single-col">

  <article class="post-card" data-post-id="<?= $post['id'] ?>"
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
      <?php if ($isOwn): ?>
        <form method="POST" action="/delete_post.php" onsubmit="return confirm('Delete this post?')">
          <input type="hidden" name="csrf" value="<?= csrf_token() ?>">
          <input type="hidden" name="post_id" value="<?= $post['id'] ?>">
          <input type="hidden" name="redirect" value="/feed.php">
          <button type="submit" class="btn-icon" title="Delete">🗑</button>
        </form>
      <?php endif; ?>
    </div>

    <div class="post-body"><p><?= nl2br(h($post['content'])) ?></p></div>

    <div class="post-actions">
      <button class="action-btn like-btn <?= $isLiked?'active-like':'' ?>"
              data-action="like" data-post="<?= $post['id'] ?>">
        <?= $isLiked?'❤️':'🤍' ?> <span class="like-count"><?= $post['like_count'] ?></span>
      </button>
      <span class="action-btn">💬 <?= count($comments) ?></span>
      <button class="action-btn" data-action="share" data-post="<?= $post['id'] ?>">🔁 Share</button>
    </div>
  </article>

  <!-- Comments -->
  <div class="comments-section">
    <h3 style="margin-bottom:1rem"><?= count($comments) ?> comment<?= count($comments)!=1?'s':'' ?></h3>

    <?php foreach ($comments as $c): ?>
    <div class="comment-card">
      <a href="/user.php?u=<?= h($c['username']) ?>" class="comment-avatar" style="background:<?= h($c['avatar_color']) ?>">
        <?= avatar_initials($c['username']) ?>
      </a>
      <div class="comment-body">
        <div class="comment-meta">
          <a href="/user.php?u=<?= h($c['username']) ?>" class="post-author">@<?= h($c['username']) ?></a>
          <span class="post-time"><?= time_ago($c['created_at']) ?></span>
        </div>
        <p><?= nl2br(h($c['content'])) ?></p>
      </div>
    </div>
    <?php endforeach; ?>

    <form method="POST" class="comment-form">
      <input type="hidden" name="csrf" value="<?= csrf_token() ?>">
      <?php $me = user_by_id($uid); ?>
      <div class="comment-avatar" style="background:<?= h($me['avatar_color']) ?>"><?= avatar_initials($me['username']) ?></div>
      <div class="comment-input-wrap">
        <textarea name="content" placeholder="Write a comment…" rows="2" maxlength="300" required></textarea>
        <button type="submit" class="btn btn-primary btn-sm">Reply</button>
      </div>
    </form>
  </div>
</main>

<div id="toast" class="toast hidden"></div>
<script>
const CSRF = <?= json_encode(csrf_token()) ?>;
function showToast(msg) {
  const t = document.getElementById('toast'); t.textContent=msg; t.classList.remove('hidden');
  clearTimeout(t._t); t._t=setTimeout(()=>t.classList.add('hidden'),2500);
}
document.querySelector('.like-btn')?.addEventListener('click', async () => {
  const btn = document.querySelector('.like-btn');
  const res  = await fetch('/ajax/like.php',{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':CSRF},body:JSON.stringify({post_id:<?= $post['id'] ?>})});
  const d    = await res.json();
  btn.className = 'action-btn like-btn' + (d.action==='liked'?' active-like':'');
  btn.innerHTML  = (d.action==='liked'?'❤️':'🤍') + ' <span class="like-count">'+d.count+'</span>';
});
document.querySelector('[data-action="share"]')?.addEventListener('click', () => {
  navigator.clipboard?.writeText(window.location.href);
  showToast('🔁 Link copied!');
});
</script>
<?php include __DIR__ . '/includes/footer.php'; ?>

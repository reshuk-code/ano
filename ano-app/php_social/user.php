<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/includes/db.php';
require_login();

$username = $_GET['u'] ?? '';
$profile  = user_by_username($username);
if (!$profile) { http_response_code(404); echo '404 User not found'; exit; }

$uid       = current_uid();
$isOwn     = ($profile['id'] == $uid);
$following = !$isOwn && is_following($uid, $profile['id']);

// Handle bio update / follow
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_check();
    if (isset($_POST['bio']) && $isOwn) {
        user_update_bio($uid, $_POST['bio']);
        redirect('/user.php?u=' . urlencode($username));
    }
    if (isset($_POST['follow_toggle']) && !$isOwn) {
        follow_toggle($uid, $profile['id']);
        redirect('/user.php?u=' . urlencode($username));
    }
}

$userPosts  = posts_by_user($profile['id']);
$likedIds   = user_liked_posts($uid);
$pageTitle  = '@' . $profile['username'] . ' — ' . APP_NAME;
$page       = '';
include __DIR__ . '/includes/header.php';
?>
<main class="single-col">
  <div class="profile-hero card">
    <div class="profile-hero-top">
      <div class="avatar-xl" style="background:<?= h($profile['avatar_color']) ?>"><?= avatar_initials($profile['username']) ?></div>
      <div class="profile-hero-info">
        <h2>@<?= h($profile['username']) ?></h2>
        <div class="profile-stats">
          <span><strong><?= count($userPosts) ?></strong> posts</span>
          <span><strong><?= follower_count($profile['id']) ?></strong> followers</span>
          <span><strong><?= following_count($profile['id']) ?></strong> following</span>
        </div>
        <?php if ($profile['bio']): ?>
          <p class="profile-bio"><?= nl2br(h($profile['bio'])) ?></p>
        <?php endif; ?>
      </div>
    </div>
    <?php if ($isOwn): ?>
      <form method="POST" class="bio-form">
        <input type="hidden" name="csrf" value="<?= csrf_token() ?>">
        <textarea name="bio" placeholder="Write a short bio…" rows="2" maxlength="160"><?= h($profile['bio']) ?></textarea>
        <button type="submit" class="btn btn-ghost btn-sm">Save bio</button>
      </form>
    <?php else: ?>
      <form method="POST">
        <input type="hidden" name="csrf" value="<?= csrf_token() ?>">
        <input type="hidden" name="follow_toggle" value="1">
        <button type="submit" class="btn <?= $following?'btn-ghost':'btn-primary' ?> btn-sm">
          <?= $following ? 'Unfollow' : 'Follow' ?>
        </button>
      </form>
    <?php endif; ?>
  </div>

  <h3 style="margin:1.5rem 0 1rem">Posts</h3>

  <?php if (empty($userPosts)): ?>
    <div class="empty-state"><p>No posts yet.</p></div>
  <?php endif; ?>

  <?php foreach ($userPosts as $post):
    $isLiked = in_array($post['id'], $likedIds);
  ?>
  <article class="post-card" data-post-id="<?= $post['id'] ?>"
           data-ano-id="p<?= $post['id'] ?>"
           data-title="<?= h(substr($post['content'],0,100)) ?>"
           data-body="<?= h($post['content']) ?>">
    <div class="post-header">
      <div class="post-avatar" style="background:<?= h($post['avatar_color']) ?>"><?= avatar_initials($post['username']) ?></div>
      <div class="post-meta">
        <span class="post-author">@<?= h($post['username']) ?></span>
        <span class="post-time"><?= time_ago($post['created_at']) ?></span>
      </div>
      <?php if ($isOwn): ?>
        <form method="POST" action="/delete_post.php" onsubmit="return confirm('Delete?')">
          <input type="hidden" name="csrf" value="<?= csrf_token() ?>">
          <input type="hidden" name="post_id" value="<?= $post['id'] ?>">
          <input type="hidden" name="redirect" value="<?= h($_SERVER['REQUEST_URI']) ?>">
          <button type="submit" class="btn-icon">🗑</button>
        </form>
      <?php endif; ?>
    </div>
    <div class="post-body"><p><?= nl2br(h($post['content'])) ?></p></div>
    <div class="post-actions">
      <button class="action-btn like-btn <?= $isLiked?'active-like':'' ?>" data-action="like" data-post="<?= $post['id'] ?>">
        <?= $isLiked?'❤️':'🤍' ?> <span class="like-count"><?= $post['like_count'] ?></span>
      </button>
      <a href="/post.php?id=<?= $post['id'] ?>" class="action-btn">💬 <?= $post['comment_count'] ?></a>
    </div>
  </article>
  <?php endforeach; ?>
</main>

<div id="toast" class="toast hidden"></div>
<script>
const CSRF = <?= json_encode(csrf_token()) ?>;
function showToast(m){const t=document.getElementById('toast');t.textContent=m;t.classList.remove('hidden');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.add('hidden'),2500);}
document.querySelectorAll('.like-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const pid = btn.dataset.post;
    const res = await fetch('/ajax/like.php',{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':CSRF},body:JSON.stringify({post_id:pid})});
    const d   = await res.json();
    btn.className='action-btn like-btn'+(d.action==='liked'?' active-like':'');
    btn.innerHTML=(d.action==='liked'?'❤️':'🤍')+' <span class="like-count">'+d.count+'</span>';
  });
});
</script>
<?php include __DIR__ . '/includes/footer.php'; ?>

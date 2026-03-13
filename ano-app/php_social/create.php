<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/includes/db.php';
require_login();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_check();
    $content = trim($_POST['content'] ?? '');
    if (strlen($content) >= 1 && strlen($content) <= 500) {
        post_create(current_uid(), $content);
    }
    redirect('/feed.php');
}

// GET: show compose page
$pageTitle = 'New Post — ' . APP_NAME;
$page = 'feed';
include __DIR__ . '/includes/header.php';
?>
<main class="single-col">
  <div class="card">
    <h2 style="margin-bottom:1.25rem">Write a post</h2>
    <form method="POST">
      <input type="hidden" name="csrf" value="<?= csrf_token() ?>">
      <div class="field">
        <textarea name="content" placeholder="What's on your mind?" rows="5" maxlength="500" required autofocus
                  style="resize:vertical;min-height:120px;width:100%"></textarea>
        <small class="char-count" style="color:var(--muted)">Max 500 characters</small>
      </div>
      <div style="display:flex;gap:.75rem;margin-top:1rem">
        <button type="submit" class="btn btn-primary">Publish →</button>
        <a href="/feed.php" class="btn btn-ghost">Cancel</a>
      </div>
    </form>
  </div>
</main>
<?php include __DIR__ . '/includes/footer.php'; ?>

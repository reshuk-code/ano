<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/ano.php';
require_login();

$uid    = current_uid();
$anoUid = 'u' . $uid;
$ano    = new Ano(ANO_BASE_URL, ANO_API_KEY);
$success = '';
$error   = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_check();
    $topics  = all_topics();
    $payload = [];
    foreach ($topics as $key => $_) {
        $val = $_POST['topic_' . $key] ?? 'neutral';
        $payload[$key] = $val === 'like' ? true : ($val === 'dislike' ? false : null);
    }
    $ok = $ano->updateProfile($anoUid, $payload);
    $success = $ok ? 'Interests saved!' : 'Could not save — check ANO key.';
}

$profile  = $ano->getProfile($anoUid);
$explicit = $profile['explicitTopics'] ?? [];
$implicit = $profile['topicScores']    ?? [];
$topics   = all_topics();

$pageTitle = 'Interests — ' . APP_NAME;
$page = 'interests';
include __DIR__ . '/includes/header.php';
?>
<main class="single-col">
  <div class="card">
    <h2 style="margin-bottom:.5rem">Your Interests</h2>
    <p style="margin-bottom:1.5rem">Control what ANO shows you. Explicit preferences override learned behaviour.</p>

    <?php if ($success): ?><div class="alert alert-success"><?= h($success) ?></div><?php endif; ?>
    <?php if ($error):   ?><div class="alert alert-error"><?= h($error) ?></div><?php endif; ?>

    <form method="POST">
      <input type="hidden" name="csrf" value="<?= csrf_token() ?>">
      <div class="interests-list">
        <?php foreach ($topics as $key => $meta):
          $ev = $explicit[$key] ?? null;
          $iv = $implicit[$key] ?? 0;
          $cur= $ev===true?'like':($ev===false?'dislike':'neutral');
        ?>
        <div class="interest-row">
          <div class="interest-info">
            <span><?= $meta['icon'] ?> <?= $meta['label'] ?></span>
            <?php if ($iv != 0): ?>
              <span class="implicit-score <?= $iv>0?'pos':'neg' ?>"><?= $iv>0?'+':'' ?><?= round($iv,2) ?> learned</span>
            <?php endif; ?>
          </div>
          <div class="topic-toggle" data-name="topic_<?= $key ?>">
            <button type="button" class="toggle-btn <?= $cur==='like'?'active':'' ?>"    data-val="like">❤️ Like</button>
            <button type="button" class="toggle-btn <?= $cur==='neutral'?'active':'' ?>" data-val="neutral">— Neutral</button>
            <button type="button" class="toggle-btn <?= $cur==='dislike'?'active':'' ?>" data-val="dislike">🚫 Block</button>
            <input type="hidden" name="topic_<?= $key ?>" value="<?= $cur ?>">
          </div>
        </div>
        <?php endforeach; ?>
      </div>
      <div style="margin-top:1.5rem;display:flex;gap:.75rem">
        <button type="submit" class="btn btn-primary">Save</button>
        <a href="/feed.php" class="btn btn-ghost">Back to feed</a>
      </div>
    </form>
  </div>
</main>
<script>
document.querySelectorAll('.topic-toggle').forEach(g => {
  const h = g.querySelector('input[type=hidden]');
  g.querySelectorAll('.toggle-btn').forEach(b => b.addEventListener('click', () => {
    g.querySelectorAll('.toggle-btn').forEach(x=>x.classList.remove('active'));
    b.classList.add('active'); h.value = b.dataset.val;
  }));
});
</script>
<?php include __DIR__ . '/includes/footer.php'; ?>

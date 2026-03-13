<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/ano.php';
require_login();

$user  = current_user();
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_check();
    $like    = $_POST['like']    ?? [];
    $dislike = $_POST['dislike'] ?? [];
    if (empty($like)) {
        $error = 'Pick at least one topic you like.';
    } else {
        $ano = new Ano(ANO_BASE_URL, ANO_API_KEY);
        $ano->onboard('u' . $user['id'], $like, $dislike);
        user_mark_onboarded(current_uid());
        redirect('/feed.php');
    }
}
$topics = all_topics();
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Set up your feed — <?= APP_NAME ?></title>
<link rel="stylesheet" href="/assets/style.css">
</head>
<body class="auth-page">
<div class="onboard-card">
  <div class="onboard-header">
    <span class="logo-mark">⚡</span>
    <h2>What do you care about?</h2>
    <p>Click once to <strong>like</strong>, twice to <strong>block</strong>, skip to stay neutral.</p>
  </div>

  <?php if ($error): ?><div class="alert alert-error"><?= h($error) ?></div><?php endif; ?>

  <form method="POST" id="onboardForm">
    <input type="hidden" name="csrf" value="<?= csrf_token() ?>">
    <div class="topic-grid" id="topicGrid">
      <?php foreach ($topics as $key => $meta): ?>
        <label class="topic-chip" data-topic="<?= $key ?>" data-state="neutral">
          <input type="checkbox" name="like[]" value="<?= $key ?>" hidden>
          <span class="chip-inner">
            <span class="chip-icon"><?= $meta['icon'] ?></span>
            <span class="chip-label"><?= $meta['label'] ?></span>
            <span class="chip-state"></span>
          </span>
        </label>
      <?php endforeach; ?>
    </div>
    <div id="dislikeInputs"></div>
    <button type="submit" class="btn btn-primary btn-full" style="margin-top:1.5rem">Start my feed →</button>
  </form>
</div>
<script>
document.querySelectorAll('.topic-chip').forEach(chip => {
  let s = 'neutral';
  const inp = chip.querySelector('input');
  const st  = chip.querySelector('.chip-state');
  const upd = () => {
    chip.dataset.state = s;
    inp.disabled = s !== 'like'; inp.checked = s === 'like';
    st.textContent = s==='like'?'❤️':s==='dislike'?'🚫':'';
    syncDislikes();
  };
  chip.addEventListener('click', e => { e.preventDefault(); s=s==='neutral'?'like':s==='like'?'dislike':'neutral'; upd(); });
  upd();
});
function syncDislikes() {
  const c = document.getElementById('dislikeInputs'); c.innerHTML='';
  document.querySelectorAll('[data-state="dislike"]').forEach(chip => {
    const i=document.createElement('input'); i.type='hidden'; i.name='dislike[]'; i.value=chip.dataset.topic; c.appendChild(i);
  });
}
</script>
</body>
</html>

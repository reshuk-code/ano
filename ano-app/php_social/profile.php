<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/ano.php';
require_login();

$user = current_user();
$ano  = new Ano(ANO_BASE_URL, ANO_API_KEY);

$success = '';
$error   = '';

// Handle topic update form
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $topics  = all_topics();
    $payload = [];
    foreach ($topics as $key => $_) {
        $val = $_POST['topic_' . $key] ?? 'neutral';
        if ($val === 'like')    $payload[$key] = true;
        elseif ($val === 'dislike') $payload[$key] = false;
        else                    $payload[$key] = null;
    }
    $ok = $ano->updateProfile($user['id'], $payload);
    if ($ok) {
        $_SESSION['onboarded'] = true;
        $success = 'Interests saved! Your feed will update next visit.';
    } else {
        $error = 'Could not save. Check your ANO_API_KEY.';
    }
}

// Load current profile
$profile  = $ano->getProfile($user['id']);
$explicit = $profile['explicitTopics'] ?? [];
$implicit = $profile['topicScores']    ?? [];
$topics   = all_topics();
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Interests — <?= APP_NAME ?></title>
<link rel="stylesheet" href="/assets/style.css">
</head>
<body>

<header class="topbar">
  <div class="topbar-inner">
    <a href="/feed.php" class="topbar-logo">⚡ <?= APP_NAME ?></a>
    <nav class="topbar-nav">
      <a href="/feed.php" class="nav-link">Feed</a>
      <a href="/profile.php" class="nav-link active">Interests</a>
    </nav>
    <div class="topbar-user">
      <span class="user-badge"><?= htmlspecialchars($user['username']) ?></span>
      <a href="/logout.php" class="nav-link muted">Sign out</a>
    </div>
  </div>
</header>

<main class="profile-layout">
  <div class="profile-header">
    <h2>Your Interests</h2>
    <p>Set explicit topic preferences. Your implicit learning from feed interactions is shown below.</p>
  </div>

  <?php if ($success): ?>
    <div class="alert alert-success"><?= htmlspecialchars($success) ?></div>
  <?php endif; ?>
  <?php if ($error): ?>
    <div class="alert alert-error"><?= htmlspecialchars($error) ?></div>
  <?php endif; ?>

  <form method="POST" class="profile-form">
    <div class="profile-topics">
      <?php foreach ($topics as $key => $meta):
        $explicitVal = $explicit[$key] ?? null;
        $implicitScore = $implicit[$key] ?? 0;
        $current = $explicitVal === true ? 'like' : ($explicitVal === false ? 'dislike' : 'neutral');
      ?>
      <div class="profile-topic-row">
        <div class="profile-topic-info">
          <span class="chip-icon"><?= $meta['icon'] ?></span>
          <span class="chip-label"><?= $meta['label'] ?></span>
          <?php if ($implicitScore != 0): ?>
            <span class="implicit-bar" title="Implicit score: <?= round($implicitScore,2) ?>">
              <span class="implicit-fill" style="width:<?= min(100, abs($implicitScore)*100) ?>%; background:<?= $implicitScore > 0 ? 'var(--green)' : 'var(--red)' ?>"></span>
            </span>
            <small class="implicit-label"><?= $implicitScore > 0 ? '+' : '' ?><?= round($implicitScore,2) ?> learned</small>
          <?php endif; ?>
        </div>
        <div class="topic-toggle" data-name="topic_<?= $key ?>">
          <button type="button" class="toggle-btn <?= $current==='like'?'active':'' ?>" data-val="like">❤️ Like</button>
          <button type="button" class="toggle-btn <?= $current==='neutral'?'active':'' ?>" data-val="neutral">— Neutral</button>
          <button type="button" class="toggle-btn <?= $current==='dislike'?'active':'' ?>" data-val="dislike">🚫 Block</button>
          <input type="hidden" name="topic_<?= $key ?>" value="<?= $current ?>">
        </div>
      </div>
      <?php endforeach; ?>
    </div>

    <div class="profile-actions">
      <button type="submit" class="btn btn-primary">Save preferences</button>
      <a href="/feed.php" class="btn btn-ghost">Back to feed</a>
    </div>
  </form>
</main>

<script>
document.querySelectorAll('.topic-toggle').forEach(group => {
  const hidden = group.querySelector('input[type=hidden]');
  group.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      group.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      hidden.value = btn.dataset.val;
    });
  });
});
</script>
</body>
</html>

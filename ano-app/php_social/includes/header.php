<?php
/**
 * layout.php — shared header/topbar
 * Usage: include with $page set to current page name
 */
$u = current_user();
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title><?= h($pageTitle ?? APP_NAME) ?></title>
<link rel="stylesheet" href="/assets/style.css">
</head>
<body>
<header class="topbar">
  <div class="topbar-inner">
    <a href="/feed.php" class="topbar-logo">⚡ <?= APP_NAME ?></a>
    <nav class="topbar-nav">
      <a href="/feed.php"   class="nav-link <?= ($page??'')==='feed'?'active':'' ?>">Feed</a>
      <a href="/interests.php" class="nav-link <?= ($page??'')==='interests'?'active':'' ?>">Interests</a>
    </nav>
    <div class="topbar-right">
      <a href="/create.php" class="btn btn-primary btn-sm">+ Post</a>
      <a href="/user.php?u=<?= h($u['username']) ?>" class="topbar-avatar" style="background:<?= h(user_by_id(current_uid())['avatar_color'] ?? '#6c63ff') ?>">
        <?= avatar_initials($u['username']) ?>
      </a>
      <a href="/logout.php" class="nav-link muted">Sign out</a>
    </div>
  </div>
</header>

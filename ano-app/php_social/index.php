<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/includes/db.php';

if (logged_in()) redirect('/feed.php');

$error = '';
$mode  = $_GET['mode'] ?? 'login'; // login | signup

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $mode     = $_POST['mode']     ?? 'login';
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';

    if (strlen($username) < 2)  $error = 'Username must be at least 2 characters.';
    elseif (strlen($password) < 4) $error = 'Password must be at least 4 characters.';
    elseif ($mode === 'signup') {
        $id = user_create($username, $password);
        if ($id === false) {
            $error = 'Username already taken.';
        } else {
            $_SESSION['user_id']   = $id;
            $_SESSION['username']  = $username;
            $_SESSION['onboarded'] = false;
            redirect('/onboard.php');
        }
    } else {
        $user = user_login($username, $password);
        if (!$user) {
            $error = 'Wrong username or password.';
        } else {
            $_SESSION['user_id']   = $user['id'];
            $_SESSION['username']  = $user['username'];
            $_SESSION['onboarded'] = (bool)$user['onboarded'];
            redirect($user['onboarded'] ? '/feed.php' : '/onboard.php');
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title><?= APP_NAME ?></title>
<link rel="stylesheet" href="/assets/style.css">
</head>
<body class="auth-page">
<div class="auth-card">
  <div class="auth-logo">
    <span class="logo-mark">⚡</span>
    <h1><?= APP_NAME ?></h1>
    <p>Your feed, ranked for you.</p>
  </div>

  <div class="auth-tabs">
    <a href="?mode=login"  class="auth-tab <?= $mode==='login' ?'active':'' ?>">Sign in</a>
    <a href="?mode=signup" class="auth-tab <?= $mode==='signup'?'active':'' ?>">Create account</a>
  </div>

  <?php if ($error): ?>
    <div class="alert alert-error"><?= h($error) ?></div>
  <?php endif; ?>

  <form method="POST" class="auth-form">
    <input type="hidden" name="mode" value="<?= h($mode) ?>">
    <div class="field">
      <label>Username</label>
      <input type="text" name="username" value="<?= h($_POST['username']??'') ?>" autofocus autocomplete="username" required>
    </div>
    <div class="field">
      <label>Password</label>
      <input type="password" name="password" autocomplete="<?= $mode==='signup'?'new-password':'current-password' ?>" required>
    </div>
    <button type="submit" class="btn btn-primary btn-full">
      <?= $mode === 'signup' ? 'Create account →' : 'Sign in →' ?>
    </button>
  </form>
</div>
</body>
</html>

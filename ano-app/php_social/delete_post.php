<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/includes/db.php';
require_login();
csrf_check();
$postId  = (int)($_POST['post_id'] ?? 0);
$back    = $_POST['redirect'] ?? '/feed.php';
post_delete($postId, current_uid());
redirect($back);

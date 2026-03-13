<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../includes/db.php';
header('Content-Type: application/json');
if (!logged_in()) { http_response_code(401); echo json_encode(['error'=>'Not logged in']); exit; }
csrf_check();
$body   = json_decode(file_get_contents('php://input'), true);
$postId = (int)($body['post_id'] ?? 0);
if (!$postId) { http_response_code(400); echo json_encode(['error'=>'Invalid post_id']); exit; }
$action = like_toggle(current_uid(), $postId);
$s = db()->prepare("SELECT COUNT(*) FROM likes WHERE post_id=?"); $s->execute([$postId]);
echo json_encode(['action'=>$action, 'count'=>(int)$s->fetchColumn()]);

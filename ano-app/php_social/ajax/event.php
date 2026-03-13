<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/ano.php';
header('Content-Type: application/json');
if (!logged_in()) { http_response_code(401); echo json_encode(['error'=>'Not logged in']); exit; }
csrf_check();
$body      = json_decode(file_get_contents('php://input'), true);
$eventType = $body['eventType'] ?? '';
$postId    = $body['postId']    ?? '';
$title     = $body['title']     ?? '';
$bdy       = $body['body']      ?? '';
$valid = ['share','like','click','view','skip','hide'];
if (!in_array($eventType, $valid)) { http_response_code(400); echo json_encode(['error'=>'Invalid event']); exit; }
$ano = new Ano(ANO_BASE_URL, ANO_API_KEY);
$ok  = $ano->recordEvent('u'.current_uid(), $eventType, ['id'=>$postId,'title'=>$title,'body'=>$bdy]);
echo json_encode(['ok'=>$ok]);

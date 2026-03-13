<?php
// ── ANO ──────────────────────────────────────────────────────
// Get your free API key at https://ano-ochre.vercel.app/dashboard
define('ANO_BASE_URL', 'https://ano-ochre.vercel.app');
define('ANO_API_KEY',  'ano_live_YOUR_KEY_HERE');

// ── App ───────────────────────────────────────────────────────
define('APP_NAME', 'Pulse');
define('DB_PATH',  __DIR__ . '/data/pulse.db');

session_name('pulse_session');
session_start();

function logged_in(): bool {
    $id = $_SESSION['user_id'] ?? null;
    if (!is_numeric($id) || (int)$id <= 0) {
        if ($id !== null) { session_unset(); session_destroy(); session_start(); }
        return false;
    }
    return true;
}
function current_uid(): int { return (int)($_SESSION['user_id'] ?? 0); }
function current_user(): array {
    return [
        'id'        => $_SESSION['user_id']   ?? 0,
        'username'  => $_SESSION['username']  ?? '',
        'onboarded' => $_SESSION['onboarded'] ?? false,
    ];
}
function redirect(string $to): never { header("Location: $to"); exit; }
function require_login(): void { if (!logged_in()) redirect('/index.php'); }

function csrf_token(): string {
    if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(16));
    return $_SESSION['csrf'];
}
function csrf_check(): void {
    $t = $_POST['csrf'] ?? ($_SERVER['HTTP_X_CSRF_TOKEN'] ?? '');
    if (!hash_equals($_SESSION['csrf'] ?? '', $t)) {
        http_response_code(403); die('Invalid CSRF token');
    }
}

<?php
/**
 * db.php — SQLite database layer
 */

function db(): PDO {
    static $pdo = null;
    if ($pdo) return $pdo;

    $pdo = new PDO('sqlite:' . DB_PATH);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $pdo->exec('PRAGMA journal_mode=WAL');
    $pdo->exec('PRAGMA foreign_keys=ON');
    migrate($pdo);
    return $pdo;
}

function migrate(PDO $db): void {
    $db->exec("
        CREATE TABLE IF NOT EXISTS users (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            username     TEXT UNIQUE NOT NULL COLLATE NOCASE,
            password     TEXT NOT NULL,
            bio          TEXT DEFAULT '',
            avatar_color TEXT DEFAULT '#6c63ff',
            onboarded    INTEGER DEFAULT 0,
            created_at   TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS posts (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            content    TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS comments (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id    INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
            user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            content    TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS likes (
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
            PRIMARY KEY (user_id, post_id)
        );

        CREATE TABLE IF NOT EXISTS follows (
            follower_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            following_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            PRIMARY KEY (follower_id, following_id)
        );

        CREATE INDEX IF NOT EXISTS idx_posts_user    ON posts(user_id);
        CREATE INDEX IF NOT EXISTS idx_posts_time    ON posts(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
        CREATE INDEX IF NOT EXISTS idx_likes_post    ON likes(post_id);
        CREATE INDEX IF NOT EXISTS idx_follows_flwr  ON follows(follower_id);
    ");
}

// ── Users ─────────────────────────────────────────────────────

function user_create(string $username, string $password): int|false {
    try {
        $color = sprintf('#%06x', mt_rand(0, 0xFFFFFF));
        $stmt = db()->prepare("INSERT INTO users (username, password, avatar_color) VALUES (?, ?, ?)");
        $stmt->execute([$username, password_hash($password, PASSWORD_DEFAULT), $color]);
        return (int)db()->lastInsertId();
    } catch (PDOException $e) {
        return false; // username taken
    }
}

function user_login(string $username, string $password): array|false {
    $u = db()->prepare("SELECT * FROM users WHERE username = ?");
    $u->execute([$username]);
    $user = $u->fetch();
    if (!$user || !password_verify($password, $user['password'])) return false;
    return $user;
}

function user_by_id(int $id): array|false {
    $s = db()->prepare("SELECT * FROM users WHERE id = ?");
    $s->execute([$id]);
    return $s->fetch();
}

function user_by_username(string $username): array|false {
    $s = db()->prepare("SELECT * FROM users WHERE username = ?");
    $s->execute([$username]);
    return $s->fetch();
}

function user_update_bio(int $id, string $bio): void {
    db()->prepare("UPDATE users SET bio=? WHERE id=?")->execute([trim($bio), $id]);
}

function user_mark_onboarded(int $id): void {
    db()->prepare("UPDATE users SET onboarded=1 WHERE id=?")->execute([$id]);
    $_SESSION['onboarded'] = true;
}

// ── Posts ─────────────────────────────────────────────────────

function post_create(int $userId, string $content): int {
    $s = db()->prepare("INSERT INTO posts (user_id, content) VALUES (?, ?)");
    $s->execute([$userId, trim($content)]);
    return (int)db()->lastInsertId();
}

function posts_all(int $limit = 100): array {
    return db()->query("
        SELECT p.*, u.username, u.avatar_color,
               (SELECT COUNT(*) FROM likes  WHERE post_id = p.id) as like_count,
               (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
        FROM posts p JOIN users u ON u.id = p.user_id
        ORDER BY p.created_at DESC LIMIT $limit
    ")->fetchAll();
}

function posts_by_user(int $userId): array {
    $s = db()->prepare("
        SELECT p.*, u.username, u.avatar_color,
               (SELECT COUNT(*) FROM likes  WHERE post_id = p.id) as like_count,
               (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
        FROM posts p JOIN users u ON u.id = p.user_id
        WHERE p.user_id = ?
        ORDER BY p.created_at DESC
    ");
    $s->execute([$userId]);
    return $s->fetchAll();
}

function post_by_id(int $id): array|false {
    $s = db()->prepare("
        SELECT p.*, u.username, u.avatar_color,
               (SELECT COUNT(*) FROM likes WHERE post_id=p.id) as like_count,
               (SELECT COUNT(*) FROM comments WHERE post_id=p.id) as comment_count
        FROM posts p JOIN users u ON u.id=p.user_id
        WHERE p.id=?
    ");
    $s->execute([$id]);
    return $s->fetch();
}

function post_delete(int $postId, int $userId): bool {
    $s = db()->prepare("DELETE FROM posts WHERE id=? AND user_id=?");
    $s->execute([$postId, $userId]);
    return $s->rowCount() > 0;
}

// ── Likes ─────────────────────────────────────────────────────

function like_toggle(int $userId, int $postId): string {
    $s = db()->prepare("SELECT 1 FROM likes WHERE user_id=? AND post_id=?");
    $s->execute([$userId, $postId]);
    if ($s->fetch()) {
        db()->prepare("DELETE FROM likes WHERE user_id=? AND post_id=?")->execute([$userId, $postId]);
        return 'unliked';
    }
    db()->prepare("INSERT INTO likes (user_id, post_id) VALUES (?,?)")->execute([$userId, $postId]);
    return 'liked';
}

function user_liked_posts(int $userId): array {
    $s = db()->prepare("SELECT post_id FROM likes WHERE user_id=?");
    $s->execute([$userId]);
    return array_column($s->fetchAll(), 'post_id');
}

// ── Follows ───────────────────────────────────────────────────

function follow_toggle(int $followerId, int $followingId): string {
    $s = db()->prepare("SELECT 1 FROM follows WHERE follower_id=? AND following_id=?");
    $s->execute([$followerId, $followingId]);
    if ($s->fetch()) {
        db()->prepare("DELETE FROM follows WHERE follower_id=? AND following_id=?")->execute([$followerId, $followingId]);
        return 'unfollowed';
    }
    db()->prepare("INSERT INTO follows (follower_id, following_id) VALUES (?,?)")->execute([$followerId, $followingId]);
    return 'followed';
}

function is_following(int $followerId, int $followingId): bool {
    $s = db()->prepare("SELECT 1 FROM follows WHERE follower_id=? AND following_id=?");
    $s->execute([$followerId, $followingId]);
    return (bool)$s->fetch();
}

function follower_count(int $userId): int {
    $s = db()->prepare("SELECT COUNT(*) FROM follows WHERE following_id=?");
    $s->execute([$userId]);
    return (int)$s->fetchColumn();
}

function following_count(int $userId): int {
    $s = db()->prepare("SELECT COUNT(*) FROM follows WHERE follower_id=?");
    $s->execute([$userId]);
    return (int)$s->fetchColumn();
}

// ── Comments ──────────────────────────────────────────────────

function comment_create(int $postId, int $userId, string $content): int {
    $s = db()->prepare("INSERT INTO comments (post_id, user_id, content) VALUES (?,?,?)");
    $s->execute([$postId, $userId, trim($content)]);
    return (int)db()->lastInsertId();
}

function comments_for_post(int $postId): array {
    $s = db()->prepare("
        SELECT c.*, u.username, u.avatar_color
        FROM comments c JOIN users u ON u.id=c.user_id
        WHERE c.post_id=?
        ORDER BY c.created_at ASC
    ");
    $s->execute([$postId]);
    return $s->fetchAll();
}

// ── Helpers ───────────────────────────────────────────────────

function time_ago(string $ts): string {
    $diff = time() - strtotime($ts);
    if ($diff < 60)    return $diff . 's ago';
    if ($diff < 3600)  return floor($diff/60)   . 'm ago';
    if ($diff < 86400) return floor($diff/3600)  . 'h ago';
    return floor($diff/86400) . 'd ago';
}

function avatar_initials(string $username): string {
    return strtoupper(substr($username, 0, 1));
}

function h(string $s): string { return htmlspecialchars($s, ENT_QUOTES, 'UTF-8'); }

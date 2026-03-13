<?php
/**
 * ano.php — ANO API client (raw socket, no cURL or allow_url_fopen needed)
 */
class Ano {
    private string $baseUrl;
    private string $apiKey;

    public function __construct(string $baseUrl, string $apiKey) {
        $this->baseUrl = rtrim($baseUrl, '/');
        $this->apiKey  = $apiKey;
    }

    public function rankFeed(string $userId, array $posts): array {
        $res = $this->req('POST', '/feed', ['posts' => $posts], $userId);
        return $res['feed'] ?? [];
    }

    public function recordEvent(string $userId, string $eventType, array $post): bool {
        $res = $this->req('POST', '/event', ['eventType' => $eventType, 'post' => $post], $userId);
        return !empty($res['ok']);
    }

    public function onboard(string $userId, array $like, array $dislike): bool {
        $res = $this->req('POST', "/profile/{$userId}/onboard", ['like' => $like, 'dislike' => $dislike]);
        return !empty($res['ok']);
    }

    public function getProfile(string $userId): array {
        return $this->req('GET', "/profile/{$userId}", [], $userId);
    }

    public function updateProfile(string $userId, array $explicitTopics): bool {
        $res = $this->req('POST', "/profile/{$userId}", ['explicitTopics' => $explicitTopics]);
        return !empty($res['ok']);
    }

    private function req(string $method, string $path, array $body, string $userId = ''): array {
        $url    = $this->baseUrl . $path;
        $p      = parse_url($url);
        $host   = $p['host'];
        $port   = $p['port'] ?? ($p['scheme'] === 'https' ? 443 : 80);
        $rpath  = ($p['path'] ?? '/') . (isset($p['query']) ? '?' . $p['query'] : '');
        $isSSL  = ($p['scheme'] === 'https');
        $payload= ($method !== 'GET') ? json_encode($body) : '';

        $raw  = "$method $rpath HTTP/1.1\r\n";
        $raw .= "Host: $host\r\n";
        $raw .= "Content-Type: application/json\r\n";
        $raw .= "x-ano-api-key: {$this->apiKey}\r\n";
        if ($userId) $raw .= "x-ano-user-id: $userId\r\n";
        if ($payload) $raw .= "Content-Length: " . strlen($payload) . "\r\n";
        $raw .= "Connection: close\r\n\r\n";
        if ($payload) $raw .= $payload;

        $sock = @fsockopen(($isSSL ? 'ssl://' : '') . $host, $port, $errno, $errstr, 15);
        if (!$sock) { error_log("[ANO] $errstr ($errno)"); return []; }

        fwrite($sock, $raw);
        $resp = '';
        while (!feof($sock)) $resp .= fread($sock, 4096);
        fclose($sock);

        $sep  = strpos($resp, "\r\n\r\n");
        $hdrs = $sep !== false ? substr($resp, 0, $sep) : '';
        $bdy  = $sep !== false ? substr($resp, $sep + 4) : $resp;

        if (stripos($hdrs, 'Transfer-Encoding: chunked') !== false) {
            $out = '';
            while ($bdy !== '') {
                $crlf = strpos($bdy, "\r\n");
                if ($crlf === false) break;
                $size = hexdec(trim(substr($bdy, 0, $crlf)));
                if ($size === 0) break;
                $out .= substr($bdy, $crlf + 2, $size);
                $bdy  = substr($bdy, $crlf + 2 + $size + 2);
            }
            $bdy = $out;
        }

        return json_decode(trim($bdy), true) ?? [];
    }
}

function all_topics(): array {
    return [
        'military'      => ['icon' => '🎖️', 'label' => 'Military'],
        'aviation'      => ['icon' => '✈️',  'label' => 'Aviation'],
        'politics'      => ['icon' => '🏛️', 'label' => 'Politics'],
        'economy'       => ['icon' => '📈',  'label' => 'Economy'],
        'technology'    => ['icon' => '💻',  'label' => 'Technology'],
        'health'        => ['icon' => '🏥',  'label' => 'Health'],
        'sports'        => ['icon' => '⚽',  'label' => 'Sports'],
        'food'          => ['icon' => '🍜',  'label' => 'Food'],
        'science'       => ['icon' => '🔬',  'label' => 'Science'],
        'entertainment' => ['icon' => '🎬',  'label' => 'Entertainment'],
        'crime'         => ['icon' => '⚖️',  'label' => 'Crime'],
        'business'      => ['icon' => '💼',  'label' => 'Business'],
    ];
}

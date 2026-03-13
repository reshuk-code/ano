<?php
/**
 * ano.php — ANO API client
 * Uses raw fsockopen (SSL) — no cURL or allow_url_fopen needed.
 */

class Ano {

    private string $baseUrl;
    private string $apiKey;

    public function __construct(string $baseUrl, string $apiKey) {
        $this->baseUrl = rtrim($baseUrl, '/');
        $this->apiKey  = $apiKey;
    }

    // ── Public API ────────────────────────────────────────────

    public function rankFeed(string $userId, array $posts): array {
        $res = $this->post('/feed', ['posts' => $posts], $userId);
        return $res['feed'] ?? [];
    }

    public function recordEvent(string $userId, string $eventType, array $post): bool {
        $res = $this->post('/event', ['eventType' => $eventType, 'post' => $post], $userId);
        return !empty($res['ok']);
    }

    public function onboard(string $userId, array $like, array $dislike): bool {
        $res = $this->post("/profile/{$userId}/onboard", ['like' => $like, 'dislike' => $dislike]);
        return !empty($res['ok']);
    }

    public function getProfile(string $userId): array {
        return $this->request('GET', "/profile/{$userId}", [], $userId);
    }

    public function updateProfile(string $userId, array $explicitTopics): bool {
        $res = $this->post("/profile/{$userId}", ['explicitTopics' => $explicitTopics]);
        return !empty($res['ok']);
    }

    // ── HTTP via fsockopen (no extensions needed) ─────────────

    private function post(string $path, array $body, string $userId = ''): array {
        return $this->request('POST', $path, $body, $userId);
    }

    private function request(string $method, string $path, array $body, string $userId = ''): array {
        $url    = $this->baseUrl . $path;
        $parsed = parse_url($url);
        $host   = $parsed['host'];
        $port   = $parsed['port'] ?? ($parsed['scheme'] === 'https' ? 443 : 80);
        $reqPath= ($parsed['path'] ?? '/') . (isset($parsed['query']) ? '?' . $parsed['query'] : '');
        $isSSL  = ($parsed['scheme'] === 'https');

        $payload = ($method !== 'GET') ? json_encode($body) : '';

        // Build raw HTTP/1.1 request
        $req  = "$method $reqPath HTTP/1.1\r\n";
        $req .= "Host: $host\r\n";
        $req .= "Content-Type: application/json\r\n";
        $req .= "x-ano-api-key: {$this->apiKey}\r\n";
        if ($userId) $req .= "x-ano-user-id: $userId\r\n";
        if ($payload) $req .= "Content-Length: " . strlen($payload) . "\r\n";
        $req .= "Connection: close\r\n";
        $req .= "\r\n";
        if ($payload) $req .= $payload;

        $target = $isSSL ? "ssl://$host" : $host;
        $sock   = @fsockopen($target, $port, $errno, $errstr, 15);
        if (!$sock) {
            error_log("[ANO] Socket connect failed — $errstr ($errno)");
            return [];
        }

        fwrite($sock, $req);

        $raw = '';
        while (!feof($sock)) $raw .= fread($sock, 4096);
        fclose($sock);

        // Split response into headers + body
        $sep  = strpos($raw, "\r\n\r\n");
        $hdrs = $sep !== false ? substr($raw, 0, $sep) : '';
        $body = $sep !== false ? substr($raw, $sep + 4) : $raw;

        // Decode chunked transfer encoding if needed
        if (stripos($hdrs, 'Transfer-Encoding: chunked') !== false) {
            $body = $this->unchunk($body);
        }

        $decoded = json_decode(trim($body), true);
        if ($decoded === null) {
            error_log("[ANO] JSON decode failed on $method $path — raw body: " . substr($body, 0, 300));
            return [];
        }
        return $decoded;
    }

    private function unchunk(string $data): string {
        $out = '';
        while ($data !== '') {
            $crlf = strpos($data, "\r\n");
            if ($crlf === false) break;
            $size = hexdec(trim(substr($data, 0, $crlf)));
            if ($size === 0) break;
            $out  .= substr($data, $crlf + 2, $size);
            $data  = substr($data, $crlf + 2 + $size + 2);
        }
        return $out;
    }
}

// ── Sample posts ──────────────────────────────────────────────
function sample_posts(): array {
    return [
        ['id'=>'p1',  'title'=>'Army neutralises terror cell near northern border',        'body'=>'Military forces launched a precision operation, neutralising an armed cell that had crossed the border overnight.',                          'timestamp'=>date('c', strtotime('-2 hours')),    'platform'=>'pulse'],
        ['id'=>'p2',  'title'=>'SpaceX Starship completes full orbital test flight',       'body'=>'The vehicle successfully completed re-entry and landed at its designated ocean platform.',                                                   'timestamp'=>date('c', strtotime('-1 hour')),     'platform'=>'pulse'],
        ['id'=>'p3',  'title'=>'Central bank holds interest rates steady for third quarter','body'=>'Policymakers cited persistent inflation concerns and a resilient labour market in their unanimous decision.',                                'timestamp'=>date('c', strtotime('-3 hours')),    'platform'=>'pulse'],
        ['id'=>'p4',  'title'=>'Champions League: City beat Madrid 3-1 in thriller',       'body'=>'A stunning hat-trick from the striker sealed the win and put City top of Group B.',                                                         'timestamp'=>date('c', strtotime('-30 minutes')), 'platform'=>'pulse'],
        ['id'=>'p5',  'title'=>'New cancer vaccine enters Phase III trials',               'body'=>'Researchers report a 70% reduction in tumour recurrence in early participants using the mRNA approach.',                                    'timestamp'=>date('c', strtotime('-5 hours')),    'platform'=>'pulse'],
        ['id'=>'p6',  'title'=>'Meta unveils next-gen AR glasses with 8-hour battery',     'body'=>'The device features 120° field of view, real-time translation, and a built-in LLM assistant.',                                            'timestamp'=>date('c', strtotime('-4 hours')),    'platform'=>'pulse'],
        ['id'=>'p7',  'title'=>'Senate passes sweeping data privacy bill',                 'body'=>'The legislation requires companies to delete user data within 30 days of a deletion request.',                                              'timestamp'=>date('c', strtotime('-6 hours')),    'platform'=>'pulse'],
        ['id'=>'p8',  'title'=>'Michelin awards 3-star rating to Kathmandu restaurant',   'body'=>'Nepali cuisine gets its first-ever three-star recognition, putting the capital on the global food map.',                                    'timestamp'=>date('c', strtotime('-7 hours')),    'platform'=>'pulse'],
        ['id'=>'p9',  'title'=>'Boeing 737 MAX 10 receives FAA certification',             'body'=>'The long-delayed certification clears the way for airlines to begin taking delivery of the stretched variant.',                             'timestamp'=>date('c', strtotime('-8 hours')),    'platform'=>'pulse'],
        ['id'=>'p10', 'title'=>'Bitcoin crosses $120,000 for the first time',              'body'=>'Institutional ETF inflows and sovereign wealth fund buying are cited as the main drivers of the rally.',                                    'timestamp'=>date('c', strtotime('-9 hours')),    'platform'=>'pulse'],
        ['id'=>'p11', 'title'=>'Scientists discover Earth-like planet 12 light-years away','body'=>'The exoplanet sits in the habitable zone and shows spectroscopic evidence of liquid water.',                                                'timestamp'=>date('c', strtotime('-10 hours')),   'platform'=>'pulse'],
        ['id'=>'p12', 'title'=>'Netflix drops trailer for final season of Stranger Things','body'=>'The trailer broke the platform\'s record with 80M views in 24 hours.',                                                                     'timestamp'=>date('c', strtotime('-11 hours')),   'platform'=>'pulse'],
        ['id'=>'p13', 'title'=>'WHO declares end to mpox global health emergency',         'body'=>'Cases have dropped 94% from peak levels, prompting the organisation to downgrade the alert status.',                                        'timestamp'=>date('c', strtotime('-12 hours')),   'platform'=>'pulse'],
        ['id'=>'p14', 'title'=>'Tesla unveils robotaxi fleet for San Francisco rollout',   'body'=>'Fully autonomous vehicles will operate without safety drivers in a geofenced zone starting next month.',                                    'timestamp'=>date('c', strtotime('-13 hours')),   'platform'=>'pulse'],
        ['id'=>'p15', 'title'=>'Murder trial of tech billionaire begins in New York',      'body'=>'Prosecutors allege a meticulously planned killing; the defence argues a case of mistaken identity.',                                        'timestamp'=>date('c', strtotime('-14 hours')),   'platform'=>'pulse'],
        ['id'=>'p16', 'title'=>'Apple reports record $120B quarterly revenue',             'body'=>'Services revenue surpassed hardware for the first time in company history, driven by AI subscription tiers.',                               'timestamp'=>date('c', strtotime('-15 hours')),   'platform'=>'pulse'],
        ['id'=>'p17', 'title'=>'U.S. Navy launches new nuclear submarine class',           'body'=>'The Virginia-class Block VI features advanced stealth coatings and AI-assisted targeting systems.',                                         'timestamp'=>date('c', strtotime('-16 hours')),   'platform'=>'pulse'],
        ['id'=>'p18', 'title'=>'Street food festival draws 200,000 visitors to Bangkok',  'body'=>'Chefs from 40 countries competed across 12 cuisine categories over the three-day event.',                                                   'timestamp'=>date('c', strtotime('-17 hours')),   'platform'=>'pulse'],
        ['id'=>'p19', 'title'=>'OpenAI releases GPT-5 with real-time reasoning',          'body'=>'The model scores 98th percentile on bar exam and passes IMO gold medal threshold for the first time.',                                      'timestamp'=>date('c', strtotime('-18 hours')),   'platform'=>'pulse'],
        ['id'=>'p20', 'title'=>'World Athletics: New 100m world record set at 9.51s',     'body'=>'The Jamaican sprinter broke the 16-year-old record by four hundredths of a second in perfect conditions.',                                  'timestamp'=>date('c', strtotime('-19 hours')),   'platform'=>'pulse'],
    ];
}

// ── Topic metadata ────────────────────────────────────────────
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

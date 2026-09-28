<?php
/**
 * SocketBroadcaster
 * Centralized real-time socket broadcaster for QuickiBite / BigBite PHP Backend.
 * Automatically broadcasts events to the live Railway socket cluster as well as local fallback.
 */

class SocketBroadcaster {
    const SECRET = 'quickibite_internal_secret_2026';

    /**
     * Broadcast an order status or refresh trigger to connected staff and customer portals
     */
    public static function broadcastOrderTrigger($data = []) {
        $endpoints = [
            'https://comfortable-emotion-production-d38a.up.railway.app/trigger-order'
        ];

        // If local socket server on port 3001 is running, also dispatch locally
        $localCheck = @fsockopen('127.0.0.1', 3001, $errno, $errstr, 0.05);
        if ($localCheck) {
            fclose($localCheck);
            $endpoints[] = 'http://localhost:3001/trigger-order';
        }

        foreach ($endpoints as $url) {
            try {
                $ctx = stream_context_create([
                    'http' => [
                        'method'  => 'POST',
                        'timeout' => 1.5,
                        'header'  => "Content-Type: application/json\r\n" .
                                     "x-internal-secret: " . self::SECRET . "\r\n",
                        'content' => json_encode($data)
                    ]
                ]);
                @file_get_contents($url, false, $ctx);
            } catch (\Throwable $e) {
                error_log("SocketBroadcaster error for {$url}: " . $e->getMessage());
            }
        }
    }
}

<?php
/**
 * JwtHelper - Lightweight JWT (JSON Web Token) Implementation
 * No external libraries required (Composer-free).
 * Uses HMAC-SHA256 for signing.
 */
class JwtHelper {
    // 🔥 SECRET KEY: Change this to a strong random string in production!
    private static $secretKey = "QUICKBITE_JWT_SECRET_KEY_2026_SUPER_SECURE";
    private static $algorithm = "HS256";

    /**
     * Generate a JWT Token
     * @param array $payload - Data to encode (e.g., user_id, role)
     * @param int $expiry - Token validity in seconds (default: 8 hours)
     * @return string - The JWT token string
     */
    public static function generateToken($payload, $expiry = 28800) {
        // Header
        $header = self::base64UrlEncode(json_encode([
            "alg" => self::$algorithm,
            "typ" => "JWT"
        ]));

        // Payload with standard claims
        $payload['iat'] = time();                // Issued At
        $payload['exp'] = time() + $expiry;      // Expiration Time
        $payloadEncoded = self::base64UrlEncode(json_encode($payload));

        // Signature
        $signature = self::base64UrlEncode(
            hash_hmac('sha256', "$header.$payloadEncoded", self::$secretKey, true)
        );

        return "$header.$payloadEncoded.$signature";
    }

    /**
     * Verify and Decode a JWT Token
     * @param string $token - The JWT token to verify
     * @return array|false - Decoded payload on success, false on failure
     */
    public static function verifyToken($token) {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return false;
        }

        list($header, $payload, $signature) = $parts;

        // Re-create signature and compare
        $expectedSignature = self::base64UrlEncode(
            hash_hmac('sha256', "$header.$payload", self::$secretKey, true)
        );

        if (!hash_equals($expectedSignature, $signature)) {
            return false; // Signature mismatch = token tampered
        }

        // Decode payload
        $decodedPayload = json_decode(self::base64UrlDecode($payload), true);

        if (!$decodedPayload) {
            return false;
        }

        // Check expiry
        if (isset($decodedPayload['exp']) && $decodedPayload['exp'] < time()) {
            return false; // Token expired
        }

        return $decodedPayload;
    }

    /**
     * URL-safe Base64 Encode
     */
    private static function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    /**
     * URL-safe Base64 Decode
     */
    private static function base64UrlDecode($data) {
        return base64_decode(strtr($data, '-_', '+/'));
    }
}
?>

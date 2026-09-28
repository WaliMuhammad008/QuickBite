<?php
/**
 * Auth Middleware - JWT Token Verification
 * Include this file at the top of any protected API endpoint.
 * It will automatically reject requests without a valid token.
 * 
 * After including this file, the variable $auth_user will be available
 * containing the decoded token payload (user_id, role, name).
 */
include_once __DIR__ . '/cors_headers.php';
include_once __DIR__ . '/JwtHelper.php';

$auth_user = null;

// 1. Extract Bearer Token from Authorization header
$headers = function_exists('getallheaders') ? getallheaders() : [];
$authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : 
              (isset($headers['authorization']) ? $headers['authorization'] : null);

if (!$authHeader && isset($_SERVER['HTTP_AUTHORIZATION'])) {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
}

// 🚀 FIX FOR INFINITYFREE / CUSTOM PROXIES: Check custom headers if Authorization is stripped
if (!$authHeader && isset($_SERVER['HTTP_X_AUTH_TOKEN'])) {
    $authHeader = 'Bearer ' . $_SERVER['HTTP_X_AUTH_TOKEN'];
}
if (!$authHeader && isset($_SERVER['HTTP_X_TOKEN'])) {
    $authHeader = 'Bearer ' . $_SERVER['HTTP_X_TOKEN'];
}

// Fallback: Check request body or query parameter if headers are stripped by web server
if (!$authHeader) {
    if (!empty($_GET['auth_token'])) {
        $authHeader = 'Bearer ' . $_GET['auth_token'];
    } elseif (!empty($_GET['token'])) {
        $authHeader = 'Bearer ' . $_GET['token'];
    } else {
        $rawInput = file_get_contents('php://input');
        if (!empty($rawInput)) {
            $parsedJson = json_decode($rawInput, true);
            if (!empty($parsedJson['auth_token'])) {
                $authHeader = 'Bearer ' . $parsedJson['auth_token'];
            } elseif (!empty($parsedJson['token'])) {
                $authHeader = 'Bearer ' . $parsedJson['token'];
            }
        }
    }
}

if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    http_response_code(401);
    if (ob_get_level()) ob_clean();
    echo json_encode([
        "success" => false, 
        "message" => "Access denied. No authentication token provided.",
        "code" => "NO_TOKEN"
    ]);
    exit();
}

$token = $matches[1];

// 2. Verify the token
$decoded = JwtHelper::verifyToken($token);

if (!$decoded) {
    http_response_code(401);
    if (ob_get_level()) ob_clean();
    echo json_encode([
        "success" => false, 
        "message" => "Invalid or expired token. Please login again.",
        "code" => "INVALID_TOKEN"
    ]);
    exit();
}

// 3. Make user data available to the API endpoint
$auth_user = $decoded;

/**
 * Enforce RBAC: Verify if the current user has one of the allowed roles
 * @param array $allowed_roles - Array of string roles allowed to access the endpoint
 */
function require_role($allowed_roles) {
    global $auth_user;
    if (!$auth_user) {
        http_response_code(403);
        echo json_encode([
            "success" => false, 
            "message" => "Access denied. You do not have the required permissions.",
            "code" => "FORBIDDEN"
        ]);
        exit();
    }
    $user_role = strtolower($auth_user['role']);
    $allowed_lowercase = array_map('strtolower', $allowed_roles);
    if (!in_array($user_role, $allowed_lowercase)) {
        http_response_code(403);
        echo json_encode([
            "success" => false, 
            "message" => "Access denied. You do not have the required permissions.",
            "code" => "FORBIDDEN"
        ]);
        exit();
    }
}
?>

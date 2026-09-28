<?php
if (ob_get_level()) ob_clean();
ob_start();

include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/Database.php';
include_once __DIR__ . '/../config/JwtHelper.php';

header('Content-Type: application/json; charset=utf-8');

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"), true);
if (!$data) {
    $data = $_POST;
}

$email = isset($data['email']) ? trim((string)$data['email']) : '';
$otp   = isset($data['otp']) ? trim((string)$data['otp']) : '';

if (empty($email) || empty($otp)) {
    if (ob_get_level()) ob_clean();
    echo json_encode([
        'success' => false,
        'message' => 'Please provide both your staff email and 6-digit verification code.'
    ]);
    exit();
}

if (!preg_match('/^\d{6}$/', $otp)) {
    if (ob_get_level()) ob_clean();
    echo json_encode([
        'success' => false,
        'message' => 'Verification code must be exactly 6 digits.'
    ]);
    exit();
}

try {
    $stmt = $db->prepare("SELECT id, name, role, phone, email, status, otp_token, otp_expires, otp_attempts FROM staff WHERE email = :email LIMIT 1");
    $stmt->execute([':email' => $email]);
    $staff = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$staff) {
        if (ob_get_level()) ob_clean();
        echo json_encode([
            'success' => false,
            'message' => 'Staff account not found.'
        ]);
        exit();
    }

    if (strtolower($staff['status']) !== 'active') {
        if (ob_get_level()) ob_clean();
        echo json_encode([
            'success' => false,
            'message' => 'Your staff account is currently inactive. Contact Admin.'
        ]);
        exit();
    }

    $currentAttempts = intval($staff['otp_attempts'] ?? 0);
    if ($currentAttempts >= 5) {
        if (ob_get_level()) ob_clean();
        echo json_encode([
            'success' => false,
            'message' => 'Too many failed attempts. Please request a new verification code.'
        ]);
        exit();
    }

    if (empty($staff['otp_token']) || empty($staff['otp_expires'])) {
        if (ob_get_level()) ob_clean();
        echo json_encode([
            'success' => false,
            'message' => 'No active verification code found. Please request a new code.'
        ]);
        exit();
    }

    if (strtotime($staff['otp_expires']) < time()) {
        if (ob_get_level()) ob_clean();
        echo json_encode([
            'success' => false,
            'message' => 'Verification code has expired. Please request a new code.'
        ]);
        exit();
    }

    if (!password_verify($otp, $staff['otp_token'])) {
        $newAttempts = $currentAttempts + 1;
        $up = $db->prepare("UPDATE staff SET otp_attempts = :attempts WHERE id = :id");
        $up->execute([':attempts' => $newAttempts, ':id' => $staff['id']]);

        $remaining = max(0, 5 - $newAttempts);
        if (ob_get_level()) ob_clean();
        echo json_encode([
            'success' => false,
            'message' => $remaining > 0 
                ? "Invalid verification code. ($remaining attempt" . ($remaining === 1 ? "" : "s") . " remaining)" 
                : "Too many failed attempts. Please request a new verification code."
        ]);
        exit();
    }

    $clearStmt = $db->prepare("UPDATE staff SET otp_token = NULL, otp_expires = NULL, otp_attempts = 0 WHERE id = :id");
    $clearStmt->execute([':id' => $staff['id']]);

    $token = JwtHelper::generateToken([
        "user_id" => $staff['id'],
        "name"    => $staff['name'],
        "role"    => $staff['role']
    ]);

    $userData = [
        "id"     => $staff['id'],
        "name"   => $staff['name'],
        "role"   => $staff['role'],
        "status" => $staff['status'],
        "email"  => $staff['email'],
        "phone"  => $staff['phone']
    ];

    if (ob_get_level()) ob_clean();
    echo json_encode([
        "success" => true,
        "message" => "Login successful",
        "user"    => $userData,
        "token"   => $token
    ]);
} catch (Exception $e) {
    if (ob_get_level()) ob_clean();
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
?>

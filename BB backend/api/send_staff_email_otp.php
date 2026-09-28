<?php
if (ob_get_level()) ob_clean();
ob_start();

include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/Database.php';
include_once __DIR__ . '/../config/Mailer.php';

header('Content-Type: application/json; charset=utf-8');

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"), true);
if (!$data) {
    $data = $_POST;
}

$email = isset($data['email']) ? trim((string)$data['email']) : '';

if (empty($email)) {
    if (ob_get_level()) ob_clean();
    echo json_encode([
        'success' => false,
        'message' => 'Please provide your registered staff email address.'
    ]);
    exit();
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    if (ob_get_level()) ob_clean();
    echo json_encode([
        'success' => false,
        'message' => 'Please provide a valid email address format.'
    ]);
    exit();
}

try {
    $stmt = $db->prepare("SELECT id, name, role, email, status, otp_expires, otp_attempts FROM staff WHERE email = :email LIMIT 1");
    $stmt->execute([':email' => $email]);
    $staff = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$staff) {
        if (ob_get_level()) ob_clean();
        echo json_encode([
            'success' => false,
            'message' => 'No staff account found with this email address. Please contact Admin.'
        ]);
        exit();
    }

    if (strtolower($staff['status']) !== 'active') {
        if (ob_get_level()) ob_clean();
        echo json_encode([
            'success' => false,
            'message' => 'Your staff account is currently inactive. Please contact Management.'
        ]);
        exit();
    }

    // Cooldown check (60 seconds)
    if (!empty($staff['otp_expires'])) {
        $expiryTimestamp = strtotime($staff['otp_expires']);
        $remainingSeconds = $expiryTimestamp - time();
        if ($remainingSeconds > 240) {
            $waitSeconds = $remainingSeconds - 240;
            if (ob_get_level()) ob_clean();
            echo json_encode([
                'success' => false,
                'message' => "Please wait {$waitSeconds} seconds before requesting a new code.",
                'cooldown' => $waitSeconds
            ]);
            exit();
        }
    }

    // Generate secure 6-digit OTP
    $otp = strval(rand(100000, 999999));
    $hashedOtp = password_hash($otp, PASSWORD_DEFAULT);
    $expires = date('Y-m-d H:i:s', strtotime('+5 minutes'));

    // Update staff record
    $updateStmt = $db->prepare("UPDATE staff SET otp_token = :token, otp_expires = :expires, otp_attempts = 0 WHERE id = :id");
    $updateStmt->execute([
        ':token'   => $hashedOtp,
        ':expires' => $expires,
        ':id'      => $staff['id']
    ]);

    // Dispatch email
    $mailResult = Mailer::sendStaffPasswordResetEmail($staff['email'], $staff['name'], $staff['role'], $otp);

    if (!$mailResult['success']) {
        if (ob_get_level()) ob_clean();
        echo json_encode([
            'success' => false,
            'message' => $mailResult['message'] ?? 'Failed to send OTP email. Please verify mail configuration.'
        ]);
        exit();
    }

    if (ob_get_level()) ob_clean();
    echo json_encode([
        'success'  => true,
        'message'  => 'Verification code sent successfully to your email.',
        'cooldown' => 60
    ]);
} catch (Exception $e) {
    if (ob_get_level()) ob_clean();
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
?>

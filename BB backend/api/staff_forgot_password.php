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

$action = isset($data['action']) ? trim((string)$data['action']) : 'request';
$email  = isset($data['email']) ? trim((string)$data['email']) : '';

if (empty($email)) {
    if (ob_get_level()) ob_clean();
    echo json_encode([
        'success' => false,
        'message' => 'Please enter your registered staff email address.'
    ]);
    exit();
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    if (ob_get_level()) ob_clean();
    echo json_encode([
        'success' => false,
        'message' => 'Please enter a valid email address format (e.g. you@gmail.com).'
    ]);
    exit();
}

try {
    // ══════════════════════════════════════════════════════════════
    // ACTION 1: REQUEST PASSWORD RESET CODE
    // ══════════════════════════════════════════════════════════════
    if ($action === 'request') {
        $stmt = $db->prepare("SELECT id, name, role, email, status, otp_expires FROM staff WHERE email = :email LIMIT 1");
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

        // 60-second cooldown protection
        if (!empty($staff['otp_expires'])) {
            $expiryTimestamp = strtotime($staff['otp_expires']);
            $remainingSeconds = $expiryTimestamp - time();
            if ($remainingSeconds > 240) { // 5-minute TTL: > 240s means requested < 60s ago
                $waitSeconds = $remainingSeconds - 240;
                if (ob_get_level()) ob_clean();
                echo json_encode([
                    'success' => false,
                    'message' => "Please wait {$waitSeconds} seconds before requesting another code.",
                    'cooldown' => $waitSeconds
                ]);
                exit();
            }
        }

        // Generate 6-digit OTP
        $otp = strval(rand(100000, 999999));
        $hashedOtp = password_hash($otp, PASSWORD_DEFAULT);
        $expires = date('Y-m-d H:i:s', strtotime('+5 minutes'));

        // Save hashed OTP
        $upStmt = $db->prepare("UPDATE staff SET otp_token = :token, otp_expires = :expires, otp_attempts = 0 WHERE id = :id");
        $upStmt->execute([
            ':token'   => $hashedOtp,
            ':expires' => $expires,
            ':id'      => $staff['id']
        ]);

        // Dispatch via Gmail SMTP
        $mailResult = Mailer::sendStaffPasswordResetEmail($staff['email'], $staff['name'], $staff['role'], $otp);

        if (!$mailResult['success']) {
            if (ob_get_level()) ob_clean();
            echo json_encode([
                'success' => false,
                'message' => $mailResult['message'] ?? 'Failed to send reset email. Please contact System Administrator.'
            ]);
            exit();
        }

        if (ob_get_level()) ob_clean();
        echo json_encode([
            'success'  => true,
            'message'  => 'A 6-digit verification code has been dispatched to your email.',
            'cooldown' => 60
        ]);
        exit();
    }

    // ══════════════════════════════════════════════════════════════
    // ACTION 2: VERIFY CODE & SET NEW PASSWORD
    // ══════════════════════════════════════════════════════════════
    if ($action === 'reset') {
        $otp             = isset($data['otp']) ? trim((string)$data['otp']) : '';
        $newPassword     = isset($data['new_password']) ? (string)$data['new_password'] : '';
        $confirmPassword = isset($data['confirm_password']) ? (string)$data['confirm_password'] : '';

        if (empty($otp)) {
            if (ob_get_level()) ob_clean();
            echo json_encode(['success' => false, 'message' => 'Please enter the 6-digit verification code.']);
            exit();
        }

        if (!preg_match('/^\d{6}$/', $otp)) {
            if (ob_get_level()) ob_clean();
            echo json_encode(['success' => false, 'message' => 'Verification code must be exactly 6 digits.']);
            exit();
        }

        if (strlen($newPassword) < 8) {
            if (ob_get_level()) ob_clean();
            echo json_encode(['success' => false, 'message' => 'New password must be at least 8 characters long.']);
            exit();
        }

        if (!preg_match('/[A-Z]/', $newPassword)) {
            if (ob_get_level()) ob_clean();
            echo json_encode(['success' => false, 'message' => 'New password must contain at least one uppercase letter (A-Z).']);
            exit();
        }

        if (!preg_match('/[!@#$%^&*(),.?":{}|<>]/', $newPassword)) {
            if (ob_get_level()) ob_clean();
            echo json_encode(['success' => false, 'message' => 'New password must contain at least one special character (!@#$%^&* etc.).']);
            exit();
        }

        if ($newPassword !== $confirmPassword) {
            if (ob_get_level()) ob_clean();
            echo json_encode(['success' => false, 'message' => 'New password and confirm password do not match.']);
            exit();
        }

        // Query staff
        $stmt = $db->prepare("SELECT id, name, role, status, otp_token, otp_expires, otp_attempts FROM staff WHERE email = :email LIMIT 1");
        $stmt->execute([':email' => $email]);
        $staff = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$staff) {
            if (ob_get_level()) ob_clean();
            echo json_encode(['success' => false, 'message' => 'Staff account not found.']);
            exit();
        }

        if (strtolower($staff['status']) !== 'active') {
            if (ob_get_level()) ob_clean();
            echo json_encode(['success' => false, 'message' => 'Your staff account is currently inactive. Contact Admin.']);
            exit();
        }

        $currentAttempts = intval($staff['otp_attempts'] ?? 0);
        if ($currentAttempts >= 5) {
            if (ob_get_level()) ob_clean();
            echo json_encode(['success' => false, 'message' => 'Too many failed attempts. Please request a new verification code.']);
            exit();
        }

        if (empty($staff['otp_token']) || empty($staff['otp_expires'])) {
            if (ob_get_level()) ob_clean();
            echo json_encode(['success' => false, 'message' => 'No active password reset request found. Please request a code first.']);
            exit();
        }

        // Check expiration
        if (strtotime($staff['otp_expires']) < time()) {
            if (ob_get_level()) ob_clean();
            echo json_encode(['success' => false, 'message' => 'Verification code has expired. Please request a new one.']);
            exit();
        }

        // Verify code
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

        // Update password & clear OTP
        $newHashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
        $updateStmt = $db->prepare("UPDATE staff SET password = :password, otp_token = NULL, otp_expires = NULL, otp_attempts = 0 WHERE id = :id");
        $updateStmt->execute([
            ':password' => $newHashedPassword,
            ':id'       => $staff['id']
        ]);

        if (ob_get_level()) ob_clean();
        echo json_encode([
            'success' => true,
            'message' => 'Your password has been successfully updated! You can now log in.'
        ]);
        exit();
    }

    if (ob_get_level()) ob_clean();
    echo json_encode(['success' => false, 'message' => 'Invalid action specified.']);
} catch (Exception $e) {
    if (ob_get_level()) ob_clean();
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>

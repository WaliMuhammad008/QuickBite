<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/Database.php';
include_once __DIR__ . '/../config/Mailer.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents('php://input'), true);
if (!$data) {
    $data = $_POST;
}

$action = $data['action'] ?? 'request'; // 'request' | 'reset'
$identifier = trim($data['email'] ?? ($data['identifier'] ?? ($data['phone'] ?? '')));

if (empty($identifier)) {
    echo json_encode([
        'success' => false,
        'error_type' => 'EMPTY_INPUT',
        'message' => 'Please enter your registered email address.'
    ]);
    exit();
}

$isEmail = strpos($identifier, '@') !== false;

try {
    if ($action === 'request') {
        // Enforce email format for sending OTP
        if (!$isEmail || !filter_var($identifier, FILTER_VALIDATE_EMAIL)) {
            echo json_encode([
                'success' => false,
                'error_type' => 'INVALID_FORMAT',
                'message' => 'Please enter a valid email address format (e.g. you@gmail.com).'
            ]);
            exit();
        }

        // Check if email exists in database
        $stmt = $db->prepare("SELECT id, full_name, email FROM customer_users WHERE email = :email LIMIT 1");
        $stmt->execute([':email' => $identifier]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            echo json_encode([
                'success' => false,
                'error_type' => 'NOT_REGISTERED',
                'message' => 'Invalid email'
            ]);
            exit();
        }

        // Generate 6-digit verification code
        $otp = strval(rand(100000, 999999));
        $expires = date('Y-m-d H:i:s', strtotime('+2 minutes'));

        $up = $db->prepare("UPDATE customer_users SET reset_token = :token, reset_expires = :expires WHERE id = :id");
        $up->execute([
            ':token' => $otp,
            ':expires' => $expires,
            ':id' => $user['id']
        ]);

        // Dispatch OTP via Gmail SMTP
        $mailResult = Mailer::sendOtpEmail($user['email'], $user['full_name'], $otp);

        if (!$mailResult['success']) {
            echo json_encode([
                'success' => false,
                'error_type' => 'MAIL_FAILED',
                'message' => $mailResult['message'] ?? 'Failed to send OTP email. Please try again later.'
            ]);
            exit();
        }

        echo json_encode([
            'success' => true,
            'message' => 'Verification code sent to your Gmail! Please check your inbox.',
            'email' => $user['email']
        ]);
        exit();
    } elseif ($action === 'reset') {
        $otp = trim($data['reset_code'] ?? ($data['otp'] ?? ($data['token'] ?? '')));
        $newPassword = $data['new_password'] ?? ($data['password'] ?? '');

        if (empty($otp) || empty($newPassword)) {
            echo json_encode(['success' => false, 'message' => 'Reset code and new password are required.']);
            exit();
        }

        $stmt = $db->prepare("SELECT id, reset_expires FROM customer_users WHERE (phone = :id OR email = :id) AND reset_token = :token LIMIT 1");
        $stmt->execute([':id' => $identifier, ':token' => $otp]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            echo json_encode(['success' => false, 'message' => 'Invalid or expired reset code.']);
            exit();
        }

        if (!empty($user['reset_expires']) && strtotime($user['reset_expires']) < time()) {
            echo json_encode(['success' => false, 'message' => 'Reset code has expired. Please request a new one.']);
            exit();
        }

        $newHash = password_hash($newPassword, PASSWORD_BCRYPT);
        $up = $db->prepare("UPDATE customer_users SET password_hash = :hash, reset_token = NULL, reset_expires = NULL WHERE id = :id");
        $up->execute([':hash' => $newHash, ':id' => $user['id']]);

        echo json_encode([
            'success' => true,
            'message' => 'Password reset successfully! You can now log in with your new password.'
        ]);
        exit();
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}

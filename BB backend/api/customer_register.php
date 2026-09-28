<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/Database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents('php://input'), true);
if (!$data) {
    $data = $_POST;
}

$fullName = trim($data['full_name'] ?? '');
$phone = preg_replace('/[^0-9]/', '', $data['phone'] ?? '');
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if (empty($fullName) || empty($phone) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Full name, phone, and password are required.']);
    exit();
}

// Validate Pakistani mobile format: 03XXXXXXXXX (11 digits)
if (!preg_match('/^03[0-9]{9}$/', $phone)) {
    echo json_encode(['success' => false, 'message' => 'Mobile number must start with 03 and be exactly 11 digits (e.g. 03001234567).']);
    exit();
}

// Validate email format if provided
if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Please provide a valid email address (e.g. name@gmail.com).']);
    exit();
}

try {
    // Check phone uniqueness
    $chkStmt = $db->prepare("SELECT id FROM customer_users WHERE phone = :phone LIMIT 1");
    $chkStmt->execute([':phone' => $phone]);
    if ($chkStmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'An account with this phone number already exists.']);
        exit();
    }

    // If email provided, check email uniqueness
    if (!empty($email)) {
        $chkEmail = $db->prepare("SELECT id FROM customer_users WHERE email = :email LIMIT 1");
        $chkEmail->execute([':email' => $email]);
        if ($chkEmail->fetch()) {
            echo json_encode(['success' => false, 'message' => 'An account with this email address already exists.']);
            exit();
        }
    }

    $hash = password_hash($password, PASSWORD_BCRYPT);
    $insStmt = $db->prepare("INSERT INTO customer_users (full_name, phone, email, password_hash) VALUES (:name, :phone, :email, :hash)");
    $insStmt->execute([
        ':name' => $fullName,
        ':phone' => $phone,
        ':email' => !empty($email) ? $email : null,
        ':hash' => $hash
    ]);

    $customerId = (int)$db->lastInsertId();

    echo json_encode([
        'success' => true,
        'message' => 'Account created successfully!',
        'customer' => [
            'id' => $customerId,
            'full_name' => $fullName,
            'phone' => $phone,
            'email' => $email
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Registration error: ' . $e->getMessage()]);
}

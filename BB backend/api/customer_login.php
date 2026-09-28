<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/Database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents('php://input'), true);
if (!$data) {
    $data = $_POST;
}

$identifier = trim($data['identifier'] ?? ($data['phone'] ?? ($data['email'] ?? '')));
$password = $data['password'] ?? '';

if (empty($identifier) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Phone/Email and password are required.']);
    exit();
}

$isEmail = strpos($identifier, '@') !== false;

if ($isEmail) {
    if (!filter_var($identifier, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'message' => 'Please provide a valid email address (e.g. name@gmail.com).']);
        exit();
    }
    $queryPhone = null;
    $queryEmail = $identifier;
} else {
    $cleanPhone = preg_replace('/[^0-9]/', '', $identifier);
    if (!preg_match('/^03[0-9]{9}$/', $cleanPhone)) {
        echo json_encode(['success' => false, 'message' => 'Mobile number must start with 03 and be exactly 11 digits (e.g. 03001234567).']);
        exit();
    }
    $queryPhone = $cleanPhone;
    $queryEmail = null;
}

try {
    if ($queryPhone) {
        $stmt = $db->prepare("SELECT * FROM customer_users WHERE phone = :phone LIMIT 1");
        $stmt->execute([':phone' => $queryPhone]);
    } else {
        $stmt = $db->prepare("SELECT * FROM customer_users WHERE email = :email LIMIT 1");
        $stmt->execute([':email' => $queryEmail]);
    }
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || !password_verify($password, $user['password_hash'])) {
        echo json_encode(['success' => false, 'message' => 'Invalid phone/email or password.']);
        exit();
    }

    if ((int)$user['is_active'] === 0) {
        echo json_encode(['success' => false, 'message' => 'This account has been disabled. Please contact support.']);
        exit();
    }

    echo json_encode([
        'success' => true,
        'message' => 'Login successful!',
        'customer' => [
            'id' => (int)$user['id'],
            'full_name' => $user['full_name'],
            'phone' => $user['phone'],
            'email' => $user['email']
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Login error: ' . $e->getMessage()]);
}

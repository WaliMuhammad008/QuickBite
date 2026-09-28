<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/Database.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);
if (!$data) {
    $data = $_POST;
}

$customerId = intval($data['customer_id'] ?? ($data['id'] ?? 0));
$phone = trim($data['phone'] ?? ($data['customer_mobile'] ?? ''));

if ($customerId <= 0) {
    echo json_encode(['success' => false, 'message' => 'Valid customer ID is required.']);
    exit();
}

$cleanPhone = preg_replace('/[^0-9]/', '', $phone);
if (!preg_match('/^03[0-9]{9}$/', $cleanPhone)) {
    echo json_encode([
        'success' => false, 
        'message' => 'Please enter a valid 11-digit Pakistani mobile number starting with 03 (e.g. 03001234567).'
    ]);
    exit();
}

try {
    // Check if phone is already claimed by another user account
    $chkStmt = $db->prepare("SELECT id FROM customer_users WHERE phone = :phone AND id != :cid LIMIT 1");
    $chkStmt->execute([':phone' => $cleanPhone, ':cid' => $customerId]);
    if ($chkStmt->fetch()) {
        echo json_encode([
            'success' => false, 
            'message' => 'This phone number is already registered with another account.'
        ]);
        exit();
    }

    $upStmt = $db->prepare("UPDATE customer_users SET phone = :phone WHERE id = :cid");
    $upStmt->execute([':phone' => $cleanPhone, ':cid' => $customerId]);

    echo json_encode([
        'success' => true,
        'message' => 'Phone number updated successfully.',
        'phone' => $cleanPhone
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error updating phone: ' . $e->getMessage()]);
}
?>

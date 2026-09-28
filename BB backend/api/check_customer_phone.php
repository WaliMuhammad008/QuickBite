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

$rawPhone = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $rawPhone = $data['phone'] ?? ($data['customer_mobile'] ?? '');
} else {
    $rawPhone = $_GET['phone'] ?? '';
}

$cleanPhone = preg_replace('/[^0-9]/', '', $rawPhone);

if (strlen($cleanPhone) < 10) {
    echo json_encode(['success' => true, 'exists' => false]);
    exit();
}

try {
    // Check both raw and normalized variations (e.g. 0300... vs 92300...)
    $altPhone = '';
    if (str_starts_with($cleanPhone, '92') && strlen($cleanPhone) === 12) {
        $altPhone = '0' . substr($cleanPhone, 2);
    } elseif (str_starts_with($cleanPhone, '03') && strlen($cleanPhone) === 11) {
        $altPhone = '92' . substr($cleanPhone, 1);
    }

    $stmt = $db->prepare("
        SELECT id, full_name, phone 
        FROM customer_users 
        WHERE phone = :p1 OR (phone = :p2 AND :p2 != '') 
        LIMIT 1
    ");
    $stmt->execute([
        ':p1' => $cleanPhone,
        ':p2' => $altPhone
    ]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        echo json_encode([
            'success' => true,
            'exists' => true,
            'name' => $user['full_name'],
            'customer_id' => intval($user['id'])
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'exists' => false
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Query error: ' . $e->getMessage()]);
}
?>

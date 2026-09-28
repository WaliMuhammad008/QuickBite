<?php
require_once __DIR__ . '/../config/cors_headers.php';
require_once __DIR__ . '/../config/Database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception("Database connection failed.");
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $id = !empty($data['id']) ? intval($data['id']) : (!empty($_GET['id']) ? intval($_GET['id']) : null);
    $action = $data['action'] ?? ($_GET['action'] ?? 'delete');

    if (!$id) {
        echo json_encode(['success' => false, 'message' => 'Coupon ID is required.']);
        exit();
    }

    if ($action === 'toggle') {
        $stmt = $db->prepare("UPDATE coupons SET is_active = IF(is_active = 1, 0, 1) WHERE id = :id");
        $stmt->execute([':id' => $id]);
        echo json_encode(['success' => true, 'message' => 'Coupon status updated.']);
    } else {
        $stmt = $db->prepare("DELETE FROM coupons WHERE id = :id");
        $stmt->execute([':id' => $id]);
        echo json_encode(['success' => true, 'message' => 'Coupon deleted successfully.']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>

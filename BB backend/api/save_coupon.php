<?php
require_once __DIR__ . '/../config/cors_headers.php';
require_once __DIR__ . '/../config/auth_middleware.php';
require_role(['Admin', 'Manager']);
require_once __DIR__ . '/../config/Database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception("Database connection failed.");
    }

    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) {
        throw new Exception("Invalid request payload.");
    }

    $id = !empty($data['id']) ? intval($data['id']) : null;
    $code = strtoupper(trim($data['code'] ?? ''));
    $discount_type = in_array($data['discount_type'] ?? '', ['percentage', 'fixed']) ? $data['discount_type'] : 'fixed';
    $discount_value = floatval($data['discount_value'] ?? 0);
    $min_spend = floatval($data['min_spend'] ?? 0);
    $max_discount = (!empty($data['max_discount']) && floatval($data['max_discount']) > 0) ? floatval($data['max_discount']) : null;
    $usage_limit = (!empty($data['usage_limit']) && intval($data['usage_limit']) > 0) ? intval($data['usage_limit']) : null;
    $expiry_date = !empty($data['expiry_date']) ? date('Y-m-d H:i:s', strtotime($data['expiry_date'])) : null;
    $is_active = isset($data['is_active']) ? (intval($data['is_active']) ? 1 : 0) : 1;

    if (empty($code)) {
        echo json_encode(['success' => false, 'message' => 'Coupon code is required.']);
        exit();
    }

    if ($discount_value <= 0) {
        echo json_encode(['success' => false, 'message' => 'Discount value must be greater than 0.']);
        exit();
    }

    if ($discount_type === 'percentage' && $discount_value > 100) {
        echo json_encode(['success' => false, 'message' => 'Percentage discount cannot exceed 100%.']);
        exit();
    }

    // Check duplicate code
    if ($id) {
        $checkStmt = $db->prepare("SELECT id FROM coupons WHERE BINARY code = :code AND id != :id LIMIT 1");
        $checkStmt->execute([':code' => $code, ':id' => $id]);
    } else {
        $checkStmt = $db->prepare("SELECT id FROM coupons WHERE BINARY code = :code LIMIT 1");
        $checkStmt->execute([':code' => $code]);
    }

    if ($checkStmt->fetch()) {
        echo json_encode(['success' => false, 'message' => "Coupon code '$code' already exists."]);
        exit();
    }

    if ($id) {
        $query = "UPDATE coupons SET 
                    code = :code,
                    discount_type = :discount_type,
                    discount_value = :discount_value,
                    min_spend = :min_spend,
                    max_discount = :max_discount,
                    usage_limit = :usage_limit,
                    expiry_date = :expiry_date,
                    is_active = :is_active
                  WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->execute([
            ':code'           => $code,
            ':discount_type'  => $discount_type,
            ':discount_value' => $discount_value,
            ':min_spend'      => $min_spend,
            ':max_discount'   => $max_discount,
            ':usage_limit'    => $usage_limit,
            ':expiry_date'    => $expiry_date,
            ':is_active'      => $is_active,
            ':id'             => $id
        ]);
        $message = "Promo code updated successfully!";
    } else {
        $query = "INSERT INTO coupons (code, discount_type, discount_value, min_spend, max_discount, usage_limit, times_used, expiry_date, is_active)
                  VALUES (:code, :discount_type, :discount_value, :min_spend, :max_discount, :usage_limit, 0, :expiry_date, :is_active)";
        $stmt = $db->prepare($query);
        $stmt->execute([
            ':code'           => $code,
            ':discount_type'  => $discount_type,
            ':discount_value' => $discount_value,
            ':min_spend'      => $min_spend,
            ':max_discount'   => $max_discount,
            ':usage_limit'    => $usage_limit,
            ':expiry_date'    => $expiry_date,
            ':is_active'      => $is_active
        ]);
        $id = $db->lastInsertId();
        $message = "Promo code created successfully!";
    }

    echo json_encode([
        'success' => true,
        'message' => $message,
        'coupon_id' => $id
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>

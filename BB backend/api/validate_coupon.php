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
    $code = strtoupper(trim($data['code'] ?? ''));
    $subtotal = floatval($data['subtotal'] ?? 0);
    $customerId = !empty($data['customer_id']) ? intval($data['customer_id']) : (!empty($data['customerId']) ? intval($data['customerId']) : null);
    $customerMobile = trim($data['customer_mobile'] ?? ($data['customerMobile'] ?? ($data['phone'] ?? ($data['mobile'] ?? ''))));

    if (empty($code)) {
        echo json_encode(['success' => false, 'message' => 'Please enter a promo code.']);
        exit();
    }

    if ($subtotal <= 0) {
        echo json_encode(['success' => false, 'message' => 'Cart subtotal must be greater than zero to apply promo code.']);
        exit();
    }

    $stmt = $db->prepare("SELECT * FROM coupons WHERE BINARY code = :code AND is_active = 1 LIMIT 1");
    $stmt->execute([':code' => $code]);
    $coupon = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$coupon) {
        echo json_encode(['success' => false, 'message' => 'Invalid or expired promo code.']);
        exit();
    }

    if (!empty($coupon['expiry_date']) && strtotime($coupon['expiry_date']) < time()) {
        echo json_encode(['success' => false, 'message' => 'This promo code has expired.']);
        exit();
    }

    if (!is_null($coupon['usage_limit']) && intval($coupon['times_used']) >= intval($coupon['usage_limit'])) {
        echo json_encode(['success' => false, 'message' => 'This promo code usage limit has been reached.']);
        exit();
    }

    if ($subtotal < floatval($coupon['min_spend'])) {
        echo json_encode([
            'success' => false, 
            'message' => 'Minimum order amount for this code is Rs. ' . number_format($coupon['min_spend'], 0)
        ]);
        exit();
    }

    // Auto-link customerId by mobile if not explicitly provided
    if (!$customerId && !empty($customerMobile)) {
        $cleanPh = preg_replace('/[^0-9]/', '', $customerMobile);
        $findCust = $db->prepare("SELECT id FROM customer_users WHERE phone = :ph OR phone = :ph2 LIMIT 1");
        $findCust->execute([':ph' => $customerMobile, ':ph2' => $cleanPh]);
        $cRow = $findCust->fetch(PDO::FETCH_ASSOC);
        if ($cRow) {
            $customerId = intval($cRow['id']);
        }
    }

    // Strict Rule: Coupon discounts are exclusive to registered customers only
    if (empty($customerId)) {
        echo json_encode([
            'success' => false,
            'message' => 'Coupon discounts are exclusive to registered members. Please sign in or create an account to claim.'
        ]);
        exit();
    }

    // Rule B (Per-Customer Multi-Use Prevention)
    if (!empty($customerId) || !empty($customerMobile)) {
        $whereParts = [];
        $params = [':code' => $code];

        if (!empty($customerId)) {
            $whereParts[] = "customer_id = :cid";
            $params[':cid'] = $customerId;
        }
        if (!empty($customerMobile)) {
            $whereParts[] = "customer_mobile = :mobile";
            $params[':mobile'] = $customerMobile;
        }

        $whereClause = implode(" OR ", $whereParts);
        $usageCheckStmt = $db->prepare("SELECT COUNT(*) FROM orders WHERE coupon_code = :code AND ({$whereClause}) AND status != 'Cancelled'");
        $usageCheckStmt->execute($params);
        if (intval($usageCheckStmt->fetchColumn()) > 0) {
            echo json_encode([
                'success' => false,
                'message' => 'You have already redeemed this promo code on a previous order.'
            ]);
            exit();
        }
    }

    // Rule A (Welcome & First-Order Coupons)
    $isFirstOrderOnly = ($code === 'WELCOME50' || !empty($coupon['is_first_order_only']));
    if ($isFirstOrderOnly) {
        if (empty($customerId)) {
            echo json_encode([
                'success' => false,
                'message' => "The {$coupon['code']} coupon is exclusive to registered members. Please log in or create an account to claim."
            ]);
            exit();
        }

        $priorStmt = $db->prepare("SELECT COUNT(*) FROM orders WHERE customer_id = :cid AND status != 'Cancelled'");
        $priorStmt->execute([':cid' => $customerId]);
        if (intval($priorStmt->fetchColumn()) > 0) {
            echo json_encode([
                'success' => false,
                'message' => 'This welcome promo is valid on your first order only.'
            ]);
            exit();
        }
    }

    $discount = 0.00;
    if ($coupon['discount_type'] === 'percentage') {
        $discount = ($subtotal * floatval($coupon['discount_value'])) / 100;
        if (!empty($coupon['max_discount']) && $discount > floatval($coupon['max_discount'])) {
            $discount = floatval($coupon['max_discount']);
        }
    } else {
        $discount = floatval($coupon['discount_value']);
    }

    // Ensure discount does not exceed subtotal
    $discount = min($discount, $subtotal);

    echo json_encode([
        'success' => true,
        'code' => $coupon['code'],
        'discount_type' => $coupon['discount_type'],
        'discount_value' => floatval($coupon['discount_value']),
        'discount_amount' => round($discount, 2),
        'message' => 'Promo code applied successfully!'
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>

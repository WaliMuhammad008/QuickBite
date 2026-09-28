<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
require_role(['Admin', 'Cashier', 'Manager']);

include_once __DIR__ . '/../config/Database.php';

if (ob_get_level()) ob_clean();
header('Content-Type: application/json; charset=utf-8');

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database connection failed."]);
    exit();
}

$rawInput = file_get_contents("php://input");
$data = json_decode($rawInput);

// Validate order_ids
$orderIds = [];
if (!empty($data->order_ids) && is_array($data->order_ids)) {
    $orderIds = array_values(array_filter(array_map('intval', $data->order_ids), function($id) {
        return $id > 0;
    }));
} elseif (!empty($data->order_id)) {
    $orderIds = [intval($data->order_id)];
}

if (empty($orderIds)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "order_ids must be a non-empty array of valid order IDs."
    ]);
    exit();
}

$status = !empty($data->status) ? trim($data->status) : 'Paid';
$riderId = !empty($data->rider_id) ? intval($data->rider_id) : null;
$riderName = !empty($data->rider_name) ? trim($data->rider_name) : null;
$totalCash = isset($data->total_cash) ? floatval($data->total_cash) : (isset($data->total_amount) ? floatval($data->total_amount) : 0.0);

try {
    $db->beginTransaction();

    // Dynamically build IN clause placeholders
    $placeholders = implode(',', array_fill(0, count($orderIds), '?'));

    // 1. Update orders table
    $updateOrdersSql = "UPDATE orders SET payment_status = ? WHERE id IN ($placeholders)";
    $stmtOrders = $db->prepare($updateOrdersSql);
    $params = array_merge([$status], $orderIds);
    $stmtOrders->execute($params);
    $affectedOrders = $stmtOrders->rowCount();

    // 2. Update existing entries in payments table
    $updatePaymentsSql = "UPDATE payments SET status = ? WHERE order_id IN ($placeholders)";
    $stmtPayments = $db->prepare($updatePaymentsSql);
    $stmtPayments->execute($params);

    // 3. For any orders without a payments row, insert one
    $checkPaymentStmt = $db->prepare("SELECT order_id FROM payments WHERE order_id IN ($placeholders)");
    $checkPaymentStmt->execute($orderIds);
    $existingOrderIdsWithPayment = $checkPaymentStmt->fetchAll(PDO::FETCH_COLUMN);
    $missingOrderIds = array_diff($orderIds, $existingOrderIdsWithPayment);

    if (!empty($missingOrderIds)) {
        $fetchOrdersStmt = $db->prepare("SELECT id, total, payment_method FROM orders WHERE id = ?");
        $insertPaymentStmt = $db->prepare("INSERT INTO payments (order_id, amount, method, status) VALUES (?, ?, ?, ?)");

        foreach ($missingOrderIds as $mId) {
            $fetchOrdersStmt->execute([$mId]);
            $ordRow = $fetchOrdersStmt->fetch(PDO::FETCH_ASSOC);
            $amount = $ordRow ? floatval($ordRow['total'] ?? 0) : 0.0;
            $method = $ordRow && !empty($ordRow['payment_method']) ? $ordRow['payment_method'] : 'Cash';
            $insertPaymentStmt->execute([$mId, $amount, $method, $status]);
        }
    }

    $db->commit();

    echo json_encode([
        "success" => true,
        "message" => "Cash reconciled successfully",
        "reconciled_orders_count" => count($orderIds),
        "order_ids" => $orderIds,
        "payment_status" => $status,
        "rider_id" => $riderId,
        "rider_name" => $riderName,
        "total_cash" => $totalCash
    ]);
} catch (PDOException $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Database error during cash reconciliation: " . $e->getMessage()
    ]);
}
?>

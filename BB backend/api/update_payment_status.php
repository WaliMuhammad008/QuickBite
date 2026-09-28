<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
include_once __DIR__ . '/../config/Database.php';

$database = new Database();
$db = $database->getConnection();
$data = json_decode(file_get_contents("php://input"));

// Extract target order IDs: either single 'id' or array 'order_ids'
$orderIds = [];
if (!empty($data->order_ids) && is_array($data->order_ids)) {
    $orderIds = array_map('intval', $data->order_ids);
} elseif (isset($data->id) && $data->id !== "") {
    $orderIds = [intval($data->id)];
}

$status = isset($data->status) ? trim($data->status) : '';

if (!empty($orderIds) && !empty($status)) {
    try {
        $db->beginTransaction();

        $updateOrderStmt = $db->prepare("UPDATE orders SET payment_status = :status WHERE id = :id");
        $checkPaymentStmt = $db->prepare("SELECT id FROM payments WHERE order_id = :id LIMIT 1");
        $updatePaymentStmt = $db->prepare("UPDATE payments SET status = :status WHERE order_id = :id");
        $getOrderStmt = $db->prepare("SELECT total, payment_method FROM orders WHERE id = :id LIMIT 1");
        $insertPaymentStmt = $db->prepare("INSERT INTO payments (order_id, amount, method, status) VALUES (:id, :amount, :method, :status)");

        $updatedCount = 0;

        foreach ($orderIds as $oid) {
            if ($oid <= 0) continue;

            // 1. Update orders table
            $updateOrderStmt->execute([
                ':status' => $status,
                ':id' => $oid
            ]);

            // 2. Check existing payments entry
            $checkPaymentStmt->execute([':id' => $oid]);
            $existingPayment = $checkPaymentStmt->fetch(PDO::FETCH_ASSOC);

            if ($existingPayment) {
                // Update existing payments entry
                $updatePaymentStmt->execute([
                    ':status' => $status,
                    ':id' => $oid
                ]);
            } else {
                // Fetch order total and payment_method to create payments entry
                $getOrderStmt->execute([':id' => $oid]);
                $orderRow = $getOrderStmt->fetch(PDO::FETCH_ASSOC);

                $amount = $orderRow ? floatval($orderRow['total'] ?? 0) : 0.00;
                $method = $orderRow && !empty($orderRow['payment_method']) ? $orderRow['payment_method'] : 'Cash';

                $insertPaymentStmt->execute([
                    ':id' => $oid,
                    ':amount' => $amount,
                    ':method' => $method,
                    ':status' => $status
                ]);
            }

            $updatedCount++;
        }

        $db->commit();

        echo json_encode([
            "success" => true,
            "message" => "Payment status updated to '{$status}' for {$updatedCount} order(s).",
            "updated_ids" => $orderIds,
            "status" => $status
        ]);
    } catch (PDOException $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        echo json_encode([
            "success" => false,
            "message" => "Database error: " . $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        "success" => false,
        "message" => "Order ID(s) and status are required.",
        "received_data" => $data
    ]);
}
?>
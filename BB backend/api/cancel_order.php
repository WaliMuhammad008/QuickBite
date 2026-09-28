<?php
require_once __DIR__ . '/../config/cors_headers.php';
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../config/InventoryHelper.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception("Unable to connect to database.");
    }

    $data = json_decode(file_get_contents("php://input"));
    $order_id = !empty($data->order_id) ? intval($data->order_id) : (!empty($data->id) ? intval($data->id) : 0);
    $is_staff_override = !empty($data->is_staff_override);
    $cancel_reason = !empty($data->reason) ? trim($data->reason) : 'Customer cancelled within window';

    if ($order_id <= 0) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Valid order ID is required."]);
        exit();
    }

    // 1. Fetch order status, created_at, and exact DB elapsed seconds
    $orderStmt = $db->prepare("
        SELECT id, status, created_at, 
               TIMESTAMPDIFF(SECOND, created_at, NOW()) as elapsed_seconds,
               total, customer_name, customer_mobile, payment_method, payment_status,
               order_type, order_mode, table_number
        FROM orders 
        WHERE id = ?
    ");
    $orderStmt->execute([$order_id]);
    $order = $orderStmt->fetch(PDO::FETCH_ASSOC);

    if (!$order) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Order not found."]);
        exit();
    }

    $currentStatus = strtolower(trim($order['status'] ?? ''));
    $elapsedSeconds = intval($order['elapsed_seconds'] ?? (time() - strtotime($order['created_at'])));

    // Strict validation:
    // If not staff override, customer can only cancel if status is strictly 'pending' AND elapsed <= 120s AND not online paid AND not dine-in
    if (!$is_staff_override) {
        $orderMode = strtolower(trim(($order['order_type'] ?? '') . ' ' . ($order['order_mode'] ?? '')));
        $isDineIn = str_contains($orderMode, 'dine') || !empty($order['table_number']);

        if ($isDineIn) {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "message" => "Dine-in orders cannot be cancelled directly. Please speak with floor staff."
            ]);
            exit();
        }

        $payMethod = strtolower(trim($order['payment_method'] ?? ''));
        $payStatus = strtolower(trim($order['payment_status'] ?? ''));

        $isDigitalMethod = str_contains($payMethod, 'card') ||
                           str_contains($payMethod, 'jazz') ||
                           str_contains($payMethod, 'easy') ||
                           str_contains($payMethod, 'online') ||
                           str_contains($payMethod, 'stripe') ||
                           str_contains($payMethod, 'wallet');

        // Note: Strict comparison so 'unpaid' does NOT match 'paid'
        $isStrictlyPaid = ($payStatus === 'paid' || $payStatus === 'completed' || str_starts_with($payStatus, 'paid online'));
        $isOnlinePaid = $isDigitalMethod || ($isStrictlyPaid && !str_contains($payMethod, 'cash'));

        if ($isOnlinePaid) {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "message" => "Online paid orders cannot be cancelled directly. Please contact the restaurant helpline."
            ]);
            exit();
        }

        if ($currentStatus !== 'pending') {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "message" => "Order cannot be cancelled because the kitchen has already started preparing it.",
                "current_status" => $order['status']
            ]);
            exit();
        }

        if ($elapsedSeconds > 120) {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "message" => "Cancellation window (2 minutes) has expired.",
                "current_status" => $order['status']
            ]);
            exit();
        }
    }

    $db->beginTransaction();

    // Prevent race conditions: Lock row and re-verify status under transaction lock
    $lockStmt = $db->prepare("SELECT status FROM orders WHERE id = ? FOR UPDATE");
    $lockStmt->execute([$order_id]);
    $lockedStatus = strtolower(trim($lockStmt->fetchColumn() ?: ''));

    if (!$is_staff_override && $lockedStatus !== 'pending') {
        $db->rollBack();
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Order cannot be cancelled because the kitchen has already started preparing it.",
            "current_status" => $lockedStatus
        ]);
        exit();
    }

    // 2. Restore inventory stock (recipes + addons) using atomic logs
    $restoredCount = InventoryHelper::restockOrderInventory($order_id, $db, $cancel_reason);

    // 4. Update order status
    $newStatus = 'cancelled';
    $updateOrderStmt = $db->prepare("UPDATE orders SET status = ?, cancel_reason = ? WHERE id = ?");
    // Check if cancel_reason column exists, otherwise fallback
    try {
        $updateOrderStmt->execute([$newStatus, $cancel_reason, $order_id]);
    } catch (Exception $colErr) {
        $fallbackStmt = $db->prepare("UPDATE orders SET status = ? WHERE id = ?");
        $fallbackStmt->execute([$newStatus, $order_id]);
    }

    // 5. Insert staff notification
    $notifStmt = $db->prepare("
        INSERT INTO staff_notifications (type, title, message, order_id, is_read)
        VALUES ('cancellation', ?, ?, ?, 0)
    ");
    $notifTitle = "Order #{$order_id} Cancelled";
    $notifMsg = "Order #{$order_id} was cancelled ({$cancel_reason}). Inventory stock was automatically restored.";
    $notifStmt->execute([$notifTitle, $notifMsg, $order_id]);

    $db->commit();

    echo json_encode([
        "success" => true,
        "message" => "Order #{$order_id} cancelled successfully. Inventory restored.",
        "order_id" => $order_id,
        "status" => "cancelled",
        "items_restored" => $restoredCount
    ]);
} catch (Exception $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to cancel order: " . $e->getMessage()
    ]);
}
?>

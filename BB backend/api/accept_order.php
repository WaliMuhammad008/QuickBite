<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
include_once __DIR__ . '/../config/Database.php';

$database = new Database();
$db = $database->getConnection();
$data = json_decode(file_get_contents("php://input"));

$rawOrderIds = [];
if (!empty($data->order_ids) && is_array($data->order_ids)) {
    $rawOrderIds = $data->order_ids;
} elseif (!empty($data->order_id)) {
    $rawOrderIds = [$data->order_id];
} elseif (!empty($data->id)) {
    $rawOrderIds = [$data->id];
}

$orderIds = array_values(array_unique(array_filter(array_map('intval', $rawOrderIds))));

if (!empty($orderIds) && !empty($data->rider_id)) {
    $riderId = intval($data->rider_id);

    try {
        $db->beginTransaction();

        // 1. Update order statuses to 'Out for Delivery'
        $updateOrder = $db->prepare("UPDATE orders SET status = 'Out for Delivery' WHERE id = :order_id AND rider_id = :rider_id");
        foreach ($orderIds as $oid) {
            $updateOrder->execute([
                ':order_id' => $oid,
                ':rider_id' => $riderId
            ]);
        }

        // 2. Recalculate rider capacity
        $activeStmt = $db->prepare("SELECT COUNT(*) FROM orders WHERE rider_id = :rider_id AND status IN ('Dispatched', 'Out for Delivery', 'On The Way')");
        $activeStmt->execute([':rider_id' => $riderId]);
        $activeCount = intval($activeStmt->fetchColumn());

        $newShiftStatus = ($activeCount >= 3) ? 'Busy' : 'Available';
        $updateRider = $db->prepare("UPDATE staff SET shift_status = :shift_status WHERE id = :rider_id");
        $updateRider->execute([
            ':shift_status' => $newShiftStatus,
            ':rider_id' => $riderId
        ]);

        $db->commit();

        // 3. Non-blocking trigger to live socket server
        include_once __DIR__ . '/../config/SocketBroadcaster.php';
        SocketBroadcaster::broadcastOrderTrigger(['order_ids' => $orderIds, 'status' => 'Out for Delivery']);

        if (ob_get_level()) ob_clean();
        echo json_encode([
            "success" => true,
            "message" => count($orderIds) > 1 ? "Batch accepted! All orders are now out for delivery." : "Order accepted! It is now out for delivery.",
            "order_ids" => $orderIds,
            "rider_id" => $riderId,
            "active_count" => $activeCount
        ]);
        exit();

    } catch (PDOException $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Database Error: " . $e->getMessage()]);
        exit();
    }
} else {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Incomplete data. Both order_id(s) and rider_id are required."]);
    exit();
}

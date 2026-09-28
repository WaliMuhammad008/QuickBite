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

if(!empty($orderIds) && !empty($data->rider_id)) {
    try {
        $db->beginTransaction();

        // 1. Order status 'Ready' kar do aur rider_id hata do taa ke dispatcher ko dobara "Ready" orders mein show ho
        $stmt1 = $db->prepare("UPDATE orders SET status = 'Ready', rider_id = 0 WHERE id = :order_id");
        foreach ($orderIds as $oid) {
            $stmt1->execute([':order_id' => $oid]);
        }

        // 2. Rider capacity re-calculation: Check if rider still has remaining active orders in transit
        $activeStmt = $db->prepare("SELECT COUNT(*) FROM orders WHERE rider_id = :rider_id AND status IN ('Dispatched', 'Out for Delivery', 'On The Way')");
        $activeStmt->execute([':rider_id' => $data->rider_id]);
        $remainingCount = intval($activeStmt->fetchColumn());

        $newShiftStatus = ($remainingCount >= 3) ? 'Busy' : 'Available';
        $query2 = "UPDATE staff SET shift_status = :shift_status WHERE id = :rider_id";
        $stmt2 = $db->prepare($query2);
        $stmt2->execute([
            ':shift_status' => $newShiftStatus,
            ':rider_id' => $data->rider_id
        ]);

        $db->commit();

        // 3. Trigger real-time broadcast to live socket server for Dispatcher & Kitchen
        include_once __DIR__ . '/../config/SocketBroadcaster.php';
        SocketBroadcaster::broadcastOrderTrigger(['order_ids' => $orderIds, 'status' => 'Ready']);

        if (ob_get_level()) ob_clean();
        echo json_encode([
            "success" => true, 
            "message" => count($orderIds) > 1 ? "Batch of orders cancelled. Returned to dispatcher." : "Order #{$orderIds[0]} cancelled. Returned to dispatcher.",
            "order_ids" => $orderIds,
            "remaining_active" => $remainingCount
        ]);
        exit();
    } catch(PDOException $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Database Error: " . $e->getMessage()]);
        exit();
    }
} else {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Incomplete data."]);
    exit();
}
?>

<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
require_role(['Admin', 'Manager', 'Dispatcher']);
include_once __DIR__ . '/../config/Database.php';

$database = new Database();
$db = $database->getConnection();
$data = json_decode(file_get_contents("php://input"));

// Collect and sanitize order IDs (support both order_ids array and single order_id)
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
    try {
        $db->beginTransaction();

        // 1. Verify Rider exists and is active/on-shift (Lock row)
        $riderStmt = $db->prepare("SELECT id, name, status, shift_status FROM staff WHERE id = :rider_id FOR UPDATE");
        $riderStmt->execute([':rider_id' => $data->rider_id]);
        $rider = $riderStmt->fetch(PDO::FETCH_ASSOC);

        if (!$rider) {
            $db->rollBack();
            http_response_code(400);
            if (ob_get_level()) ob_clean();
            echo json_encode(["success" => false, "message" => "Rider not found."]);
            exit();
        }

        if (strtolower($rider['status'] ?? '') === 'inactive' || strtolower($rider['shift_status'] ?? '') === 'offline') {
            $db->rollBack();
            http_response_code(400);
            if (ob_get_level()) ob_clean();
            echo json_encode([
                "success" => false, 
                "message" => "Rider is currently offline and cannot be assigned."
            ]);
            exit();
        }

        // 2. Capacity Guard: Check current active dispatched orders for this rider
        $activeStmt = $db->prepare("SELECT COUNT(*) FROM orders WHERE rider_id = :rider_id AND status IN ('Dispatched', 'Out for Delivery', 'On The Way')");
        $activeStmt->execute([':rider_id' => $data->rider_id]);
        $activeOrdersCount = intval($activeStmt->fetchColumn());

        if ($activeOrdersCount + count($orderIds) > 3) {
            $db->rollBack();
            http_response_code(400);
            if (ob_get_level()) ob_clean();
            echo json_encode([
                "success" => false, 
                "message" => "Rider would exceed maximum delivery capacity (3 orders max). Active: {$activeOrdersCount}, trying to assign: " . count($orderIds) . "."
            ]);
            exit();
        }

        // 3. Verify Orders exist and are ready for dispatch (Lock rows)
        $orderStmt = $db->prepare("SELECT id, status, rider_id FROM orders WHERE id = :order_id FOR UPDATE");
        $updateOrder = $db->prepare("UPDATE orders SET status = 'Dispatched', rider_id = :rider_id WHERE id = :order_id");

        foreach ($orderIds as $oid) {
            $orderStmt->execute([':order_id' => $oid]);
            $order = $orderStmt->fetch(PDO::FETCH_ASSOC);

            if (!$order) {
                $db->rollBack();
                http_response_code(400);
                if (ob_get_level()) ob_clean();
                echo json_encode(["success" => false, "message" => "Order #{$oid} not found."]);
                exit();
            }

            if (in_array(strtolower($order['status']), ['dispatched', 'out for delivery', 'delivered', 'cancelled'])) {
                $db->rollBack();
                http_response_code(400);
                if (ob_get_level()) ob_clean();
                echo json_encode([
                    "success" => false, 
                    "message" => "Order #{$oid} is already {$order['status']}."
                ]);
                exit();
            }

            // Atomically update Order status and assign rider
            $updateOrder->execute([
                ':rider_id' => $data->rider_id,
                ':order_id' => $oid
            ]);
        }

        // 4. Update Rider shift_status (Busy if reached 3, else Available for further assignment)
        $newActiveCount = $activeOrdersCount + count($orderIds);
        $newShiftStatus = ($newActiveCount >= 3) ? 'Busy' : 'Available';
        $updateRider = $db->prepare("UPDATE staff SET shift_status = :shift_status WHERE id = :rider_id");
        $updateRider->execute([
            ':shift_status' => $newShiftStatus,
            ':rider_id' => $data->rider_id
        ]);

        $db->commit();
        if (ob_get_level()) ob_clean();
        echo json_encode([
            "success" => true, 
            "message" => count($orderIds) > 1 ? "Batch of " . count($orderIds) . " orders assigned successfully." : "Order assigned successfully.",
            "order_ids" => $orderIds,
            "order_id" => $orderIds[0],
            "rider_id" => $data->rider_id,
            "active_orders_count" => $newActiveCount
        ]);

    } catch (PDOException $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        echo json_encode(["success" => false, "message" => "Database Error: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Incomplete data. Both order_id(s) and rider_id are required."]);
}
?>
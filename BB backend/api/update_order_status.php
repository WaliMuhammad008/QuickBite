<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
require_role(['Admin', 'Manager', 'Cashier', 'Kitchen', 'Chef', 'Dispatcher', 'Rider']);
include_once __DIR__ . '/../config/Database.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"));

$orderId = !empty($data->id) ? $data->id : (!empty($data->order_id) ? $data->order_id : null);

if (!empty($orderId) && !empty($data->status)) {
    try {
        $id = intval($orderId);
        $rawStatus = trim($data->status);

        // Normalize status string (capitalized word for DB, lowercase for client)
        $statusMap = [
            'pending'    => 'Pending',
            'cooking'    => 'Cooking',
            'preparing'  => 'Cooking',
            'ready'      => 'Ready',
            'dispatched' => 'Dispatched',
            'delivered'  => 'Delivered',
            'completed'  => 'Completed',
            'cancelled'  => 'Cancelled',
            'declined'   => 'Declined'
        ];

        $normKey = strtolower($rawStatus);
        if (!isset($statusMap[$normKey])) {
            http_response_code(400);
            echo json_encode([
                "success" => false, 
                "message" => "Invalid order status. Allowed: Pending, Cooking, Ready, Dispatched, Delivered, Completed, Cancelled, Declined"
            ]);
            exit();
        }
        $dbStatus = $statusMap[$normKey];

        // Fetch current status to check transition validity
        $currStmt = $db->prepare("SELECT status FROM orders WHERE id = :id LIMIT 1");
        $currStmt->execute([':id' => $id]);
        $currentOrder = $currStmt->fetch(PDO::FETCH_ASSOC);

        if (!$currentOrder) {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "Order #$id not found."]);
            exit();
        }

        $currentStatus = $currentOrder['status'] ?? 'Pending';

        // If status is unchanged, return idempotent success
        if (strcasecmp($currentStatus, $dbStatus) === 0) {
            echo json_encode([
                "success" => true,
                "message" => "Order #$id is already $dbStatus",
                "status" => $dbStatus,
                "id" => $id
            ]);
            exit();
        }

        // Strict State Transition Progression Matrix
        $allowedTransitions = [
            'Pending'    => ['Cooking', 'Cancelled', 'Declined'],
            'Cooking'    => ['Ready', 'Cancelled'],
            'Ready'      => ['Completed', 'Dispatched', 'Cancelled'],
            'Dispatched' => ['Delivered', 'Cancelled'],
            'Delivered'  => ['Completed'],
            'Completed'  => [],
            'Cancelled'  => [],
            'Declined'   => []
        ];

        $validTargets = $allowedTransitions[$currentStatus] ?? [];

        if (!in_array($dbStatus, $validTargets)) {
            http_response_code(400);
            echo json_encode([
                "success" => false, 
                "message" => "State jump blocked: Cannot transition order #$id directly from '$currentStatus' to '$dbStatus'. Allowed next states: " . (empty($validTargets) ? "None (Terminal Status)" : implode(', ', $validTargets)),
                "current_status" => $currentStatus,
                "requested_status" => $dbStatus
            ]);
            exit();
        }

        $query = "UPDATE orders SET status = :status WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->execute([
            ':status' => $dbStatus,
            ':id' => $id
        ]);

        // Restock inventory if order was Cancelled or Declined (unless marked with wastage)
        if ($dbStatus === 'Cancelled' || $dbStatus === 'Declined') {
            $isWastage = !empty($data->is_wastage) || (isset($data->reason) && stripos($data->reason, 'wastage') !== false);
            if (!$isWastage) {
                include_once __DIR__ . '/../config/InventoryHelper.php';
                InventoryHelper::restockOrderInventory($id, $db, $data->reason ?? "Order {$dbStatus} by staff");
            }
        }

        // Trigger real-time broadcast to live socket cluster
        include_once __DIR__ . '/../config/SocketBroadcaster.php';
        SocketBroadcaster::broadcastOrderTrigger(['order_id' => $id, 'status' => $dbStatus]);

        echo json_encode([
            "success" => true,
            "message" => "Order #$id status updated to $dbStatus",
            "status" => $dbStatus,
            "id" => $id
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Database Error: " . $e->getMessage()
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Order ID and status are required."
    ]);
}
?>
<?php
include_once __DIR__ . '/../config/cors_headers.php';

// No auth_middleware included so it's public.
// This endpoint is used by the customer-facing OrderTracker.

include_once '../config/Database.php';
$database = new Database();
$db = $database->getConnection();

try {
    // Only fetch necessary safe columns for active orders
    // DO NOT expose customer_name, customer_mobile, customer_address
    $query = "SELECT id, order_type, total, status, created_at as time FROM orders WHERE status != 'Delivered' AND status != 'Completed' ORDER BY id DESC";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $final_orders = [];

    foreach ($orders as $order) {
        $itemQuery = "SELECT title as name, qty, price FROM order_items WHERE order_id = :oid";
        $itemStmt = $db->prepare($itemQuery);
        $itemStmt->execute([':oid' => $order['id']]);
        
        $order['cart'] = $itemStmt->fetchAll(PDO::FETCH_ASSOC);
        
        $final_orders[] = $order;
    }

    echo json_encode($final_orders ?: []);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "SQL Error: " . $e->getMessage()]);
}
?>

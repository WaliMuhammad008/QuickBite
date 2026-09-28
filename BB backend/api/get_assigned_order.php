<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/Database.php';

$database = new Database();
$db = $database->getConnection();

if (empty($_GET['rider_id'])) {
    echo json_encode(["success" => false, "message" => "rider_id parameter is required.", "order" => null]);
    exit();
}

$rider_id = $_GET['rider_id'];

try {
    // Return all orders that are actively assigned/in transit to this rider
    $query = "SELECT * FROM orders 
              WHERE rider_id = :rider_id 
                AND status IN ('Dispatched', 'Out for Delivery', 'On the Way')
              ORDER BY id ASC";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":rider_id", $rider_id);
    $stmt->execute();

    $orders = [];
    while ($order = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Fetch order items (cart)
        $itemQuery = "SELECT * FROM order_items WHERE order_id = :order_id";
        $itemStmt = $db->prepare($itemQuery);
        $itemStmt->bindParam(":order_id", $order['id']);
        $itemStmt->execute();
        
        $cart = [];
        while ($row = $itemStmt->fetch(PDO::FETCH_ASSOC)) {
            $cart[] = $row;
        }
        $order['cart'] = $cart;
        $orders[] = $order;
    }

    if (!empty($orders)) {
        echo json_encode([
            "success" => true, 
            "orders" => $orders, 
            "order" => $orders[0],
            "count" => count($orders)
        ]);
    } else {
        echo json_encode([
            "success" => false, 
            "message" => "No active orders.", 
            "orders" => [], 
            "order" => null,
            "count" => 0
        ]);
    }
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database Error: " . $e->getMessage(), "orders" => [], "order" => null]);
}
?>
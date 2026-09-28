<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/Database.php';

$database = new Database();
$db = $database->getConnection();

$range = isset($_GET['range']) ? $_GET['range'] : 'today'; // today, month, year, all

$dateCondition = "";
if ($range === 'today') {
    $dateCondition = "DATE(o.created_at) = CURDATE()";
} elseif ($range === 'month') {
    $dateCondition = "MONTH(o.created_at) = MONTH(CURDATE()) AND YEAR(o.created_at) = YEAR(CURDATE())";
} elseif ($range === 'year') {
    $dateCondition = "YEAR(o.created_at) = YEAR(CURDATE())";
} else {
    $dateCondition = "1=1";
}

// Ensure we only calculate profit for Completed orders
$query = "SELECT 
            SUM(oi.price * oi.qty) AS revenue,
            SUM(oi.cost_price * oi.qty) AS cogs
          FROM orders o
          JOIN order_items oi ON o.id = oi.order_id
          WHERE o.status IN ('Completed', 'Delivered') AND $dateCondition";

$stmt = $db->prepare($query);
$stmt->execute();
$result = $stmt->fetch(PDO::FETCH_ASSOC);

$revenue = floatval($result['revenue'] ?? 0);
$cogs = floatval($result['cogs'] ?? 0);
$profit = $revenue - $cogs;
$margin = $revenue > 0 ? round(($profit / $revenue) * 100, 2) : 0;

echo json_encode([
    "success" => true,
    "data" => [
        "revenue" => $revenue,
        "cogs" => $cogs,
        "gross_profit" => $profit,
        "profit_margin_percent" => $margin
    ]
]);
?>

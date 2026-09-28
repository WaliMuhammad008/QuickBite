<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/Database.php';

$database = new Database();
$db = $database->getConnection();

$range = isset($_GET['range']) ? $_GET['range'] : 'all'; // today, weekly, monthly, yearly, all

$dateCondition = "1=1";
if ($range === 'today') {
    $dateCondition = "DATE(o.created_at) = CURDATE()";
} elseif ($range === 'weekly') {
    $dateCondition = "o.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
} elseif ($range === 'monthly') {
    $dateCondition = "MONTH(o.created_at) = MONTH(CURDATE()) AND YEAR(o.created_at) = YEAR(CURDATE())";
} elseif ($range === 'yearly') {
    $dateCondition = "YEAR(o.created_at) = YEAR(CURDATE())";
} elseif ($range === 'custom') {
    $start = isset($_GET['start']) ? $_GET['start'] : date('Y-m-d');
    $end = isset($_GET['end']) ? $_GET['end'] : date('Y-m-d');
    $dateCondition = "DATE(o.created_at) >= :start AND DATE(o.created_at) <= :end";
}

$params = [];
if ($range === 'custom') {
    $params[':start'] = $start;
    $params[':end'] = $end;
}

$query = "SELECT 
            oi.title,
            SUM(oi.qty) as total_qty,
            SUM(oi.price * oi.qty) as total_revenue,
            SUM(oi.cost_price * oi.qty) as total_cogs,
            COALESCE(MAX(mi.category), CASE WHEN MAX(d.id) IS NOT NULL THEN 'Deals & Combos' ELSE NULL END, 'Special') as category
          FROM orders o
          JOIN order_items oi ON o.id = oi.order_id
          LEFT JOIN menu_items mi ON LOWER(oi.title) = LOWER(mi.name)
          LEFT JOIN deals d ON LOWER(oi.title) = LOWER(d.title)
          WHERE o.status IN ('Completed', 'Delivered') 
            AND oi.price > 0 
            AND $dateCondition
          GROUP BY oi.title
          HAVING total_revenue > 0
          ORDER BY total_revenue DESC";

$stmt = $db->prepare($query);
$stmt->execute($params);
$results = $stmt->fetchAll(PDO::FETCH_ASSOC);

$formatted_results = [];
foreach ($results as $row) {
    $rev = floatval($row['total_revenue']);
    $cogs = floatval($row['total_cogs']);
    
    // Fallback: If COGS is missing or 0 for an item with sales revenue, estimate standard food cost (45%)
    if ($cogs <= 0 && $rev > 0) {
        $cogs = round($rev * 0.45, 2);
    }
    
    $profit = $rev - $cogs;
    $margin = $rev > 0 ? round(($profit / $rev) * 100, 1) : 0;
    
    $formatted_results[] = [
        "title" => $row['title'],
        "qty" => intval($row['total_qty']),
        "revenue" => round($rev, 2),
        "cogs" => round($cogs, 2),
        "profit" => round($profit, 2),
        "margin" => $margin,
        "category" => $row['category'] ?: 'Special'
    ];
}

echo json_encode([
    "success" => true,
    "data" => $formatted_results
]);
?>

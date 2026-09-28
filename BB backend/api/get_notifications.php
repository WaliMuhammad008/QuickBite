<?php
require_once __DIR__ . '/../config/cors_headers.php';
require_once __DIR__ . '/../config/Database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception("Database connection failed.");
    }

    // 1. Live Dynamic Inventory Alerts
    $stockAlerts = [];
    try {
        $stockSql = "
            SELECT i.id, i.name, i.stock, i.unit, i.threshold,
                   GROUP_CONCAT(DISTINCT m.name ORDER BY m.name SEPARATOR ', ') AS affected_products,
                   COUNT(DISTINCT m.id) AS affected_count
            FROM inventory i
            LEFT JOIN recipes r ON r.inventory_id = i.id
            LEFT JOIN menu_items m ON r.menu_item_id = m.id
            WHERE i.stock <= i.threshold
            GROUP BY i.id, i.name, i.stock, i.unit, i.threshold
            ORDER BY (i.stock <= 0) DESC, i.stock ASC
        ";
        $stockStmt = $db->query($stockSql);
        if ($stockStmt) {
            while ($sRow = $stockStmt->fetch(PDO::FETCH_ASSOC)) {
                $stockVal = floatval($sRow['stock']);
                $threshVal = floatval($sRow['threshold']);
                $unit = $sRow['unit'] ?: 'units';
                $isCritical = $stockVal <= 0;
                $affectedCount = intval($sRow['affected_count'] ?? 0);
                $affectedList = $sRow['affected_products'] ?? '';
                
                if ($isCritical) {
                    $severity = 'critical';
                    $title = "Critical: {$sRow['name']} is at {$stockVal}{$unit}!";
                    $affectedMsg = $affectedCount > 0 
                        ? "Affected: {$affectedCount} product(s) ({$affectedList})." 
                        : "No mapped products directly affected.";
                    $msg = "Out of stock! {$affectedMsg} Recipes cannot be prepared.";
                } else {
                    $severity = 'warning';
                    $title = "Low Stock: {$sRow['name']} below threshold";
                    $affectedMsg = $affectedCount > 0 
                        ? "Affected: {$affectedCount} product(s) ({$affectedList})." 
                        : "Stock is low.";
                    $msg = "{$stockVal} {$unit} remaining (Threshold: {$threshVal} {$unit}). {$affectedMsg}";
                }
                
                $stockAlerts[] = [
                    "id" => "stock_alert_" . $sRow['id'],
                    "type" => "stock_alert",
                    "severity" => $severity,
                    "title" => $title,
                    "message" => $msg,
                    "stock" => $stockVal,
                    "unit" => $unit,
                    "threshold" => $threshVal,
                    "affected_products" => $affectedList,
                    "affected_count" => $affectedCount,
                    "order_id" => null,
                    "is_read" => 0,
                    "created_at" => date('Y-m-d H:i:s')
                ];
            }
        }
    } catch (\Throwable $e) {}

    // 2. Staff Event Notifications
    $stmt = $db->query("
        SELECT id, type, title, message, order_id, is_read, created_at
        FROM staff_notifications
        ORDER BY created_at DESC
        LIMIT 30
    ");
    $notifs = $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];

    $unreadStmt = $db->query("SELECT COUNT(*) as unread_count FROM staff_notifications WHERE is_read = 0");
    $rawUnread = intval($unreadStmt ? ($unreadStmt->fetch(PDO::FETCH_ASSOC)['unread_count'] ?? 0) : 0);
    $totalUnread = count($stockAlerts) + $rawUnread;

    $combinedNotifs = array_merge($stockAlerts, $notifs);

    echo json_encode([
        "success" => true,
        "unread_count" => $totalUnread,
        "stock_alerts_count" => count($stockAlerts),
        "notifications" => $combinedNotifs
    ]);
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "unread_count" => 0,
        "stock_alerts_count" => 0,
        "notifications" => [],
        "message" => $e->getMessage()
    ]);
}

<?php
require_once __DIR__ . '/../config/cors_headers.php';
require_once __DIR__ . '/../config/auth_middleware.php';
require_role(['Admin', 'Manager']);
require_once __DIR__ . '/../config/Database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception("Database connection failed.");
    }

    $data = json_decode(file_get_contents("php://input"));
    $action = $_GET['action'] ?? ($data->action ?? 'get_notifications');

    // 1. GET NOTIFICATIONS (Live Inventory Stock Alerts + Staff Event Notifications)
    if ($action === 'get_notifications') {
        // A. Live Dynamic Stock Alerts
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
        } catch (\Throwable $e) {
            // Graceful fallback if table query encounters issues
        }

        // B. Recorded Staff Event Notifications
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
        exit();
    }

    // 2. MARK NOTIFICATIONS READ
    if ($action === 'mark_notifications_read') {
        $notifId = !empty($data->id) ? intval($data->id) : 0;
        if ($notifId > 0) {
            $stmt = $db->prepare("UPDATE staff_notifications SET is_read = 1 WHERE id = ?");
            $stmt->execute([$notifId]);
        } else {
            $db->exec("UPDATE staff_notifications SET is_read = 1");
        }

        echo json_encode(["success" => true, "message" => "Notifications marked as read."]);
        exit();
    }

    // 3. GET WASTAGE LOGS
    if ($action === 'get_wastage_logs') {
        $stmt = $db->query("
            SELECT w.id, w.order_id, w.inventory_id, w.quantity, w.unit, w.cost_lost,
                   w.stage, w.reported_by, w.reason, w.is_verified, w.verified_by, w.created_at,
                   i.name as inventory_name, i.price as item_unit_price
            FROM inventory_wastage w
            JOIN inventory i ON w.inventory_id = i.id
            ORDER BY w.created_at DESC
            LIMIT 100
        ");
        $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["success" => true, "logs" => $logs]);
        exit();
    }

    // 4. VERIFY AUDIT LOG
    if ($action === 'verify_wastage') {
        $logId = !empty($data->id) ? intval($data->id) : 0;
        $verifiedBy = !empty($data->verified_by) ? trim($data->verified_by) : 'Admin';

        if ($logId <= 0) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Valid log ID required."]);
            exit();
        }

        $stmt = $db->prepare("UPDATE inventory_wastage SET is_verified = 1, verified_by = ? WHERE id = ?");
        $stmt->execute([$verifiedBy, $logId]);

        echo json_encode(["success" => true, "message" => "Wastage audit verified successfully."]);
        exit();
    }

    // 5. GET WASTAGE ANALYTICS SUMMARY
    if ($action === 'get_wastage_analytics') {
        // Today's total lost cost
        $todayStmt = $db->query("
            SELECT COALESCE(SUM(cost_lost), 0) as today_lost
            FROM inventory_wastage
            WHERE DATE(created_at) = CURDATE()
        ");
        $todayLost = floatval($todayStmt->fetch(PDO::FETCH_ASSOC)['today_lost'] ?? 0);

        // Pending audits count
        $pendingStmt = $db->query("
            SELECT COUNT(*) as pending_count
            FROM inventory_wastage
            WHERE is_verified = 0
        ");
        $pendingCount = intval($pendingStmt->fetch(PDO::FETCH_ASSOC)['pending_count'] ?? 0);

        // Top wasted item
        $topStmt = $db->query("
            SELECT i.name, SUM(w.quantity) as total_qty, w.unit, SUM(w.cost_lost) as total_cost
            FROM inventory_wastage w
            JOIN inventory i ON w.inventory_id = i.id
            GROUP BY w.inventory_id
            ORDER BY total_cost DESC
            LIMIT 1
        ");
        $topItem = $topStmt->fetch(PDO::FETCH_ASSOC);

        // Stage breakdown
        $stageStmt = $db->query("
            SELECT stage, COUNT(*) as report_count, COALESCE(SUM(cost_lost), 0) as total_cost
            FROM inventory_wastage
            GROUP BY stage
        ");
        $stageBreakdown = $stageStmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "today_lost_cost" => $todayLost,
            "pending_audits" => $pendingCount,
            "top_wasted_item" => $topItem ?: ["name" => "None", "total_cost" => 0, "total_qty" => 0],
            "stage_breakdown" => $stageBreakdown
        ]);
        exit();
    }

    // 6. LOG RAW INGREDIENT WASTAGE DIRECTLY FROM ADMIN
    if ($action === 'log_raw_wastage') {
        $inv_id = !empty($data->inventory_id) ? intval($data->inventory_id) : 0;
        $qty = !empty($data->quantity) ? floatval($data->quantity) : 0.0;
        $reason = !empty($data->reason) ? trim($data->reason) : 'Expired / Spoilage';
        $reported_by = !empty($data->reported_by) ? trim($data->reported_by) : ($auth_user['name'] ?? 'Admin');

        if ($inv_id <= 0 || $qty <= 0) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Valid inventory_id and quantity (> 0) required."]);
            exit();
        }

        $invStmt = $db->prepare("SELECT id, name, stock, unit, price, threshold FROM inventory WHERE id = ? FOR UPDATE");
        $db->beginTransaction();
        $invStmt->execute([$inv_id]);
        $invItem = $invStmt->fetch(PDO::FETCH_ASSOC);

        if (!$invItem) {
            $db->rollBack();
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "Inventory item not found."]);
            exit();
        }

        $unitCost = floatval($invItem['price'] ?? 0.0);
        $costLost = round($qty * $unitCost, 2);
        $itemUnit = !empty($data->unit) ? trim($data->unit) : ($invItem['unit'] ?: 'kg');

        // Insert into inventory_wastage
        $wastageStmt = $db->prepare("
            INSERT INTO inventory_wastage (order_id, inventory_id, quantity, unit, cost_lost, stage, reported_by, reason, is_verified)
            VALUES (NULL, ?, ?, ?, ?, 'inventory_audit', ?, ?, 1)
        ");
        $wastageStmt->execute([$inv_id, $qty, $itemUnit, $costLost, $reported_by, $reason]);

        // Atomic deduction
        $deductStmt = $db->prepare("UPDATE inventory SET stock = GREATEST(0, stock - ?) WHERE id = ?");
        $deductStmt->execute([$qty, $inv_id]);

        $newStock = max(0.0, floatval($invItem['stock']) - $qty);
        $threshold = floatval($invItem['threshold'] ?? 10.0);

        // Low stock alert check
        $alertTriggered = false;
        if ($newStock <= $threshold) {
            $alertTitle = "Low Stock Alert: " . $invItem['name'];
            $alertMsg = "Stock for {$invItem['name']} dropped to {$newStock} {$itemUnit} (Threshold: {$threshold} {$itemUnit}) after wastage audit.";
            $notifStmt = $db->prepare("
                INSERT INTO staff_notifications (type, title, message, order_id, is_read)
                VALUES ('wastage', ?, ?, NULL, 0)
            ");
            $notifStmt->execute([$alertTitle, $alertMsg]);
            $alertTriggered = true;
        }

        $db->commit();

        echo json_encode([
            "success" => true,
            "message" => "Raw ingredient wastage recorded and stock deducted successfully.",
            "inventory_id" => $inv_id,
            "inventory_name" => $invItem['name'],
            "quantity_deducted" => $qty,
            "remaining_stock" => $newStock,
            "cost_lost" => $costLost,
            "low_stock_alert" => $alertTriggered
        ]);
        exit();
    }

    echo json_encode(["success" => false, "message" => "Invalid action."]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>

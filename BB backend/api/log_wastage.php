<?php
require_once __DIR__ . '/../config/cors_headers.php';
require_once __DIR__ . '/../config/auth_middleware.php';
require_role(['Admin', 'Manager', 'Chef', 'Kitchen', 'Rider']);
require_once __DIR__ . '/../config/Database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception("Database connection failed.");
    }

    $data = json_decode(file_get_contents("php://input"));
    $action = !empty($data->action) ? trim($data->action) : 'report_kitchen_burn';
    $reported_by = !empty($data->reported_by) ? trim($data->reported_by) : 'Staff';
    $reason = !empty($data->reason) ? trim($data->reason) : 'Food loss reported';
    $notes = !empty($data->notes) ? trim($data->notes) : '';

    // =========================================================================
    // CASE A: Direct Raw Kitchen Ingredient Wastage (No Order Required)
    // =========================================================================
    if ($action === 'report_raw_ingredient_wastage' || $action === 'log_raw_wastage') {
        $inv_id = !empty($data->inventory_id) ? intval($data->inventory_id) : 0;
        $qty = !empty($data->quantity) ? floatval($data->quantity) : 0.0;

        if ($inv_id <= 0 || $qty <= 0) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Valid inventory_id and quantity (> 0) are required."]);
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
        $totalLostCost = round($qty * $unitCost, 2);
        $itemUnit = !empty($data->unit) ? trim($data->unit) : ($invItem['unit'] ?: 'kg');
        $stage = !empty($data->stage) ? trim($data->stage) : 'kitchen';
        $order_id = !empty($data->order_id) ? intval($data->order_id) : null;

        // 1. Insert into inventory_wastage
        $wastageStmt = $db->prepare("
            INSERT INTO inventory_wastage (order_id, inventory_id, quantity, unit, cost_lost, stage, reported_by, reason, is_verified)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
        ");
        $wastageStmt->execute([
            $order_id,
            $inv_id,
            $qty,
            $itemUnit,
            $totalLostCost,
            $stage,
            $reported_by,
            $notes ? ($reason . " - " . $notes) : $reason
        ]);
        $wastageId = $db->lastInsertId();

        // 2. Atomic stock deduction
        $deductStmt = $db->prepare("UPDATE inventory SET stock = GREATEST(0, stock - ?) WHERE id = ?");
        $deductStmt->execute([$qty, $inv_id]);

        $newStock = max(0.0, floatval($invItem['stock']) - $qty);
        $threshold = floatval($invItem['threshold'] ?? 10.0);

        // 3. Generate Low-Stock Alert in staff_notifications if stock drops below threshold
        $alertTriggered = false;
        if ($newStock <= $threshold) {
            $alertTitle = "Low Stock Alert: " . $invItem['name'];
            $alertMsg = "Stock for {$invItem['name']} dropped to {$newStock} {$itemUnit} (Threshold: {$threshold} {$itemUnit}) after wastage deduction.";
            $notifStmt = $db->prepare("
                INSERT INTO staff_notifications (type, title, message, order_id, is_read)
                VALUES ('wastage', ?, ?, ?, 0)
            ");
            $notifStmt->execute([$alertTitle, $alertMsg, $order_id]);
            $alertTriggered = true;
        }

        $db->commit();

        echo json_encode([
            "success" => true,
            "message" => "Raw ingredient wastage logged and stock deducted successfully.",
            "wastage_id" => $wastageId,
            "inventory_id" => $inv_id,
            "inventory_name" => $invItem['name'],
            "quantity_deducted" => $qty,
            "remaining_stock" => $newStock,
            "unit" => $itemUnit,
            "cost_lost" => $totalLostCost,
            "low_stock_alert" => $alertTriggered
        ]);
        exit();
    }

    // =========================================================================
    // CASE B: Order-Tied Wastage (Remake, Delivery Failure, Mid-Prep Cancel)
    // =========================================================================
    $order_id = !empty($data->order_id) ? intval($data->order_id) : 0;
    if ($order_id <= 0) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Valid Order ID is required."]);
        exit();
    }

    // Fetch order details & items
    $orderStmt = $db->prepare("SELECT id, status, total as total_price, customer_name FROM orders WHERE id = ?");
    $orderStmt->execute([$order_id]);
    $order = $orderStmt->fetch(PDO::FETCH_ASSOC);

    if (!$order) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Order #{$order_id} not found."]);
        exit();
    }

    $itemsStmt = $db->prepare("SELECT id, title, qty as quantity, size FROM order_items WHERE order_id = ?");
    $itemsStmt->execute([$order_id]);
    $orderItems = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);

    // Fetch recipes & inventory pricing from 'recipes' table
    $recipeStmt = $db->query("
        SELECT r.menu_item_id, r.variant_name, r.inventory_id, r.quantity_to_deduct as quantity, m.name as menu_name,
               i.name as inventory_name, i.unit as inventory_unit, i.price as unit_cost, i.threshold as inv_threshold
        FROM recipes r
        JOIN menu_items m ON r.menu_item_id = m.id
        JOIN inventory i ON r.inventory_id = i.id
    ");
    $recipes = $recipeStmt ? $recipeStmt->fetchAll(PDO::FETCH_ASSOC) : [];
    $recipesMap = [];
    foreach ($recipes as $r) {
        $mName = strtolower(trim($r['menu_name']));
        $vName = strtolower(trim($r['variant_name'] ?? ''));
        if (!empty($vName)) {
            $recipesMap[$mName . '_' . $vName][] = $r;
        }
        $recipesMap[$mName][] = $r;
    }

    $db->beginTransaction();

    $wastageInserts = [];
    $totalLostCost = 0.0;

    $stage = 'kitchen';
    $notifType = 'remake';
    $notifTitle = "Kitchen Remake for Order #{$order_id}";

    if ($action === 'report_delivery_failure') {
        $stage = 'rider';
        $notifType = 'delivery_failed';
        $notifTitle = "Delivery Failed - Order #{$order_id}";
        $updOrder = $db->prepare("UPDATE orders SET status = 'delivery_failed' WHERE id = ?");
        $updOrder->execute([$order_id]);
    } elseif ($action === 'report_cashier_wastage') {
        $stage = 'cashier';
        $notifType = 'cancellation';
        $notifTitle = "Mid-Prep Cancellation Loss - Order #{$order_id}";
        $updOrder = $db->prepare("UPDATE orders SET status = 'cancelled_with_wastage' WHERE id = ?");
        $updOrder->execute([$order_id]);
    }

    $wastageStmt = $db->prepare("
        INSERT INTO inventory_wastage (order_id, inventory_id, quantity, unit, cost_lost, stage, reported_by, reason, is_verified)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
    ");

    $deductStmt = $db->prepare("UPDATE inventory SET stock = GREATEST(0, stock - ?) WHERE id = ?");

    foreach ($orderItems as $item) {
        $itemQty = intval($item['quantity'] ?: 1);
        $titleKey = strtolower(trim($item['title']));
        $sizeKey = strtolower(trim($item['size'] ?? ''));

        // Match variant specific or fallback to item base
        $matchedIngs = $recipesMap[$titleKey . '_' . $sizeKey] ?? ($recipesMap[$titleKey] ?? []);

        // Deduplicate ingredients if base key had multiple variants
        $uniqueIngs = [];
        foreach ($matchedIngs as $ing) {
            $invId = intval($ing['inventory_id']);
            if (!isset($uniqueIngs[$invId])) {
                $uniqueIngs[$invId] = $ing;
            }
        }

        foreach ($uniqueIngs as $ing) {
            $invId = intval($ing['inventory_id']);
            $qty = floatval($ing['quantity']) * $itemQty;
            $unitCost = floatval($ing['unit_cost'] ?: 0.0);
            $costLost = round($qty * $unitCost, 2);

            $totalLostCost += $costLost;
            $wastageStmt->execute([
                $order_id,
                $invId,
                $qty,
                $ing['inventory_unit'] ?: 'g',
                $costLost,
                $stage,
                $reported_by,
                $reason
            ]);

            // Atomic inventory deduction
            $deductStmt->execute([$qty, $invId]);

            $wastageInserts[] = [
                'inventory_name' => $ing['inventory_name'],
                'qty' => $qty,
                'unit' => $ing['inventory_unit'],
                'cost_lost' => $costLost
            ];
        }
    }

    // Insert staff notification
    $notifMsg = "{$reported_by} reported {$reason} for Order #{$order_id}. Estimated raw material loss: Rs " . number_format($totalLostCost, 2);
    if ($notes) {
        $notifMsg .= " (Notes: {$notes})";
    }

    $notifStmt = $db->prepare("
        INSERT INTO staff_notifications (type, title, message, order_id, is_read)
        VALUES (?, ?, ?, ?, 0)
    ");
    $notifStmt->execute([$notifType, $notifTitle, $notifMsg, $order_id]);

    $db->commit();

    echo json_encode([
        "success" => true,
        "message" => "Wastage logged, inventory deducted, and staff alert sent.",
        "order_id" => $order_id,
        "stage" => $stage,
        "total_cost_lost" => $totalLostCost,
        "records_logged" => count($wastageInserts),
        "details" => $wastageInserts
    ]);

} catch (Exception $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to log wastage: " . $e->getMessage()
    ]);
}
?>

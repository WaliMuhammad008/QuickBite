<?php
if (!ob_get_level()) {
    ob_start();
}

include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/Database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception("Database connection failed");
    }

    $menu_item_id = isset($_GET['menu_item_id']) ? intval($_GET['menu_item_id']) : 0;

    if ($menu_item_id <= 0) {
        if (ob_get_level()) ob_clean();
        echo json_encode(["success" => true, "status" => "success", "data" => [], "addons" => []]);
        exit;
    }

    $query = "SELECT id, menu_item_id, addon_name, addon_price, inventory_id, qty_to_deduct 
              FROM menu_addons 
              WHERE menu_item_id = ? 
              ORDER BY id ASC";
    $stmt = $db->prepare($query);
    $stmt->execute([$menu_item_id]);
    $addons = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (ob_get_level()) ob_clean();
    echo json_encode([
        "success" => true,
        "status" => "success",
        "data" => $addons ?: [],
        "addons" => $addons ?: []
    ]);
    exit;
} catch (Exception $e) {
    if (ob_get_level()) ob_clean();
    echo json_encode([
        "success" => false,
        "status" => "error",
        "message" => $e->getMessage(),
        "data" => [],
        "addons" => []
    ]);
    exit;
}
?>
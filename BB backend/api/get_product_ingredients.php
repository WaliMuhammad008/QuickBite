<?php
include_once __DIR__ . '/../config/cors_headers.php';

include_once __DIR__ . '/../config/Database.php';

$database = new Database();
$db = $database->getConnection();

$menu_item_id = isset($_GET['menu_item_id']) ? $_GET['menu_item_id'] : (isset($_GET['product_id']) ? $_GET['product_id'] : (isset($_GET['id']) ? $_GET['id'] : null));
if ($menu_item_id) {
    $menu_item_id = intval(preg_replace('/^(prod-|deal-)/', '', strval($menu_item_id)));
}
$variant_name = isset($_GET['variant_name']) ? $_GET['variant_name'] : 'Regular';

if (!$menu_item_id) {
    echo json_encode([
        "status" => "error",
        "message" => "Menu Item ID is required",
        "ingredients" => []
    ]);
    exit();
}

try {
    $query = "SELECT 
                r.id as recipe_id,
                r.inventory_id,
                i.name as ingredient_name,
                r.quantity_to_deduct as qty,
                i.unit,
                r.is_removable
              FROM recipes r
              LEFT JOIN inventory i ON r.inventory_id = i.id
              WHERE r.menu_item_id = :menu_item_id AND (r.variant_name = :variant_name OR r.variant_name IS NULL)";

    $stmt = $db->prepare($query);
    $stmt->bindParam(":menu_item_id", $menu_item_id);
    $stmt->bindParam(":variant_name", $variant_name);
    $stmt->execute();

    $ingredients = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "menu_item_id" => $menu_item_id,
        "variant_name" => $variant_name,
        "ingredients" => $ingredients ? $ingredients : []
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "status" => "error",
        "message" => "Database Error: " . $e->getMessage(),
        "ingredients" => []
    ]);
}
?>

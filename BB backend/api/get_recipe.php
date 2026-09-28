<?php
include_once __DIR__ . '/../config/cors_headers.php';

include_once '../config/Database.php';

$database = new Database();
$db = $database->getConnection();

// React se aanay wala data
$menu_item_id = isset($_GET['menu_item_id']) ? $_GET['menu_item_id'] : die(json_encode(["error" => "Menu Item ID is required"]));
$variant_name = isset($_GET['variant_name']) ? $_GET['variant_name'] : 'Regular';

try {
    // 🔥 SQL JOIN QUERY (Column ka naam theek kar diya: quantity_to_deduct)
    $query = "SELECT 
                r.id as recipe_id,
                r.inventory_id,
                i.name as ingredient_name,
                r.quantity_to_deduct as qty,
                i.unit,
                r.is_removable
              FROM recipes r
              LEFT JOIN inventory i ON r.inventory_id = i.id
              WHERE r.menu_item_id = :menu_item_id AND r.variant_name = :variant_name";

    $stmt = $db->prepare($query);
    $stmt->bindParam(":menu_item_id", $menu_item_id);
    $stmt->bindParam(":variant_name", $variant_name);
    $stmt->execute();

    $ingredients = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "menu_item_id" => $menu_item_id,
        "variant_name" => $variant_name,
        "ingredients" => $ingredients
    ]);

} catch (PDOException $e) {
    // Agar future mein koi error aaye tou clean JSON format mein aaye, HTML mein nahi
    echo json_encode([
        "status" => "error",
        "message" => "Database Error: " . $e->getMessage()
    ]);
}
?>
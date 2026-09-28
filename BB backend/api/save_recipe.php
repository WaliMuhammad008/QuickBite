<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
include_once '../config/Database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->menu_item_id) && !empty($data->variant_name) && !empty($data->ingredients) && is_array($data->ingredients)) {
    
    try {
        $db->beginTransaction();

        // 1. Purani Recipe Delete Karein (Sirf us specific Variant ki)
        $deleteQuery = "DELETE FROM recipes WHERE menu_item_id = :menu_item_id AND variant_name = :variant_name";
        $deleteStmt = $db->prepare($deleteQuery);
        $deleteStmt->bindParam(":menu_item_id", $data->menu_item_id);
        $deleteStmt->bindParam(":variant_name", $data->variant_name);
        $deleteStmt->execute();

        // 🔥 FIX: Added ingredient_name and changed quantity_needed to quantity_to_deduct
        $insertQuery = "INSERT INTO recipes (menu_item_id, variant_name, inventory_id, ingredient_name, quantity_to_deduct, is_removable) VALUES (:menu_item_id, :variant_name, :inventory_id, :ingredient_name, :qty, :is_removable)";
        $insertStmt = $db->prepare($insertQuery);

        foreach($data->ingredients as $ing) {
            if(empty($ing->inventory_id) || empty($ing->qty) || $ing->qty <= 0) {
                continue; 
            }

            $is_removable = (isset($ing->is_removable) && $ing->is_removable == true) ? 1 : 0;
            
            // 🔥 Frontend se ingredient ka naam read karna (fallback 'Unknown')
            $ingredient_name = isset($ing->name) ? $ing->name : (isset($ing->ingredient_name) ? $ing->ingredient_name : 'Unknown Ingredient');

            $insertStmt->bindParam(":menu_item_id", $data->menu_item_id);
            $insertStmt->bindParam(":variant_name", $data->variant_name);
            $insertStmt->bindParam(":inventory_id", $ing->inventory_id);
            $insertStmt->bindParam(":ingredient_name", $ingredient_name); // Naya Column
            $insertStmt->bindParam(":qty", $ing->qty);                     // quantity_to_deduct
            $insertStmt->bindParam(":is_removable", $is_removable);
            
            $insertStmt->execute();
        }

        $db->commit();
        
        echo json_encode([
            "status" => "success", 
            "message" => "Recipe saved successfully."
        ]);

    } catch(PDOException $e) {
        $db->rollBack();
        echo json_encode([
            "status" => "error", 
            "message" => "Database error: " . $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        "status" => "error", 
        "message" => "Incomplete data. Please provide menu item, variant and ingredients."
    ]);
}
?>
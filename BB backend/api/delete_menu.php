<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
require_role(['Admin', 'Manager']);
include_once __DIR__ . '/../config/Database.php';
include_once __DIR__ . '/../models/MenuItem.php';

$database = new Database();
$db = $database->getConnection();
$menuItem = new MenuItem($db);

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->id)) {
    $menuItem->id = $data->id;

    // --- STEP 1: Delete karne se pehle Image ka URL nikalna ---
    $query = "SELECT img FROM menu_items WHERE id = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$menuItem->id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    $imageUrl = $row['img'] ?? '';

    // --- STEP 2: Clean up child relations inside transaction before deleting ---
    $db->beginTransaction();
    $errorMsg = null;
    try {
        $db->prepare("DELETE FROM product_custom_addons WHERE menu_item_id = ?")->execute([$menuItem->id]);
        $db->prepare("DELETE FROM menu_addons WHERE menu_item_id = ?")->execute([$menuItem->id]);
        $db->prepare("DELETE FROM menu_variants WHERE menu_id = ?")->execute([$menuItem->id]);
        $db->prepare("DELETE FROM recipes WHERE menu_item_id = ?")->execute([$menuItem->id]);
        $db->prepare("DELETE FROM deal_items WHERE menu_item_id = ?")->execute([$menuItem->id]);

        $isDeleted = $menuItem->delete();
        $db->commit();
    } catch (Exception $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        error_log("Delete Menu Error: " . $e->getMessage());
        $errorMsg = $e->getMessage();
        $isDeleted = false;
    }

    if($isDeleted){
        
        // --- STEP 3: Cloudinary se picture delete karna (PRO LEVEL) ---
        if (!empty($imageUrl) && strpos($imageUrl, 'cloudinary.com') !== false) {
            
            // Cloudinary details loaded from env with hardcoded fallbacks
            $cloud_name = getenv('CLOUDINARY_CLOUD_NAME') ?: "dovuegkwa";
            $api_key = getenv('CLOUDINARY_API_KEY') ?: "188259856346934";
            $api_secret = getenv('CLOUDINARY_API_SECRET') ?: "_RWHAQbUhMHVXp4E5IgPIvIDjAI";

            // URL se image ka naam (public_id) nikalna. (e.g., asdfghjkl.jpg se 'asdfghjkl' nikalna)
            $parts = explode('/', parse_url($imageUrl, PHP_URL_PATH));
            $filename = end($parts); 
            $public_id = pathinfo($filename, PATHINFO_FILENAME); 

            // Cloudinary Security Signature banana
            $timestamp = time();
            $signature = sha1("public_id=" . $public_id . "&timestamp=" . $timestamp . $api_secret);

            // cURL ke zariye Cloudinary ko request bhejna
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, "https://api.cloudinary.com/v1_1/" . $cloud_name . "/image/destroy");
            curl_setopt($ch, CURLOPT_POST, TRUE);
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
                "public_id" => $public_id,
                "api_key" => $api_key,
                "timestamp" => $timestamp,
                "signature" => $signature
            ]));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
            $response = curl_exec($ch); // Request Execute
            curl_close($ch);
            
            // Aap chahein toh $response ko log bhi karwa sakte hain debugging ke liye
        }

        // Broadcast real-time menu change to all connected screens
        include_once __DIR__ . '/../config/SocketBroadcaster.php';
        SocketBroadcaster::broadcastOrderTrigger(['type' => 'menu_updated', 'action' => 'delete', 'id' => $menuItem->id]);

        http_response_code(200);
        echo json_encode(array("success" => true, "message" => "Item and image deleted successfully."));
    } else {
        http_response_code(500);
        echo json_encode(array("success" => false, "message" => "Unable to delete item from database: " . ($errorMsg ?? "Unknown error")));
    }
} else {
    http_response_code(400);
    echo json_encode(array("success" => false, "message" => "Item ID is missing."));
}
?>
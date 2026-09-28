<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
require_role(['Admin', 'Manager']);


include_once __DIR__ . '/../config/Database.php';
include_once __DIR__ . '/../models/Category.php';

$database = new Database();
$db = $database->getConnection();
$category = new Category($db);

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->id)) {
    $category->id = $data->id;

    // Fetch category name and img before deletion
    $query = "SELECT name, img FROM categories WHERE id = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$category->id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    $categoryName = $row['name'] ?? '';
    $imageUrl = $row['img'] ?? '';

    // Helper function for Cloudinary image destruction
    $deleteCloudinaryImage = function($imgUrl) {
        if (empty($imgUrl) || strpos($imgUrl, 'cloudinary.com') === false) return;
        $cloud_name = getenv('CLOUDINARY_CLOUD_NAME') ?: "dovuegkwa";
        $api_key = getenv('CLOUDINARY_API_KEY') ?: "188259856346934";
        $api_secret = getenv('CLOUDINARY_API_SECRET') ?: "_RWHAQbUhMHVXp4E5IgPIvIDjAI";

        $parts = explode('/', parse_url($imgUrl, PHP_URL_PATH));
        $filename = end($parts);
        $public_id = pathinfo($filename, PATHINFO_FILENAME);

        $timestamp = time();
        $signature = sha1("public_id=" . $public_id . "&timestamp=" . $timestamp . $api_secret);

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
        $is_local = in_array($_SERVER['REMOTE_ADDR'] ?? '', ['127.0.0.1', '::1', 'localhost']);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, !$is_local); 
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, $is_local ? 0 : 2);
        curl_exec($ch);
        curl_close($ch);
    };

    // 1. Fetch all menu items belonging to this category (by category_id or category name)
    $menuItemsStmt = $db->prepare("SELECT id, img FROM menu_items WHERE category_id = ? OR category = ?");
    $menuItemsStmt->execute([$category->id, $categoryName]);
    $menuItems = $menuItemsStmt->fetchAll(PDO::FETCH_ASSOC);
    $menuItemIds = array_column($menuItems, 'id');

    $db->beginTransaction();
    try {
        if (!empty($menuItemIds)) {
            $inPlaceholders = implode(',', array_fill(0, count($menuItemIds), '?'));

            // Cascade delete child relations for all related menu items
            $db->prepare("DELETE FROM product_custom_addons WHERE menu_item_id IN ($inPlaceholders)")->execute($menuItemIds);
            $db->prepare("DELETE FROM menu_addons WHERE menu_item_id IN ($inPlaceholders)")->execute($menuItemIds);
            $db->prepare("DELETE FROM menu_variants WHERE menu_id IN ($inPlaceholders)")->execute($menuItemIds);
            $db->prepare("DELETE FROM recipes WHERE menu_item_id IN ($inPlaceholders)")->execute($menuItemIds);
            $db->prepare("DELETE FROM deal_items WHERE menu_item_id IN ($inPlaceholders)")->execute($menuItemIds);

            // Delete the menu items themselves
            $db->prepare("DELETE FROM menu_items WHERE id IN ($inPlaceholders)")->execute($menuItemIds);
        }

        // Clean up category_addons mappings
        if (!empty($categoryName)) {
            $db->prepare("DELETE FROM category_addons WHERE target_category = ? OR addon_category = ?")->execute([$categoryName, $categoryName]);
        }

        // Delete the category itself
        $delCatStmt = $db->prepare("DELETE FROM categories WHERE id = ?");
        $delCatStmt->execute([$category->id]);

        $db->commit();

        // 2. Destroy images from Cloudinary
        $deleteCloudinaryImage($imageUrl);
        foreach ($menuItems as $mItem) {
            if (!empty($mItem['img'])) {
                $deleteCloudinaryImage($mItem['img']);
            }
        }

        // 3. Broadcast real-time socket updates
        include_once __DIR__ . '/../config/SocketBroadcaster.php';
        SocketBroadcaster::broadcastOrderTrigger([
            'type' => 'menu_updated',
            'action' => 'category_deleted',
            'category_id' => $category->id,
            'deleted_menu_items_count' => count($menuItemIds)
        ]);

        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Category and " . count($menuItemIds) . " associated menu items deleted successfully.",
            "deleted_items_count" => count($menuItemIds)
        ]);
        exit();

    } catch (Exception $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        error_log("Delete Category Error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        exit();
    }
} else {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Category ID missing."]);
}
?>
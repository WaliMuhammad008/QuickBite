<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
require_role(['Admin', 'Manager']);
include_once __DIR__ . '/../config/Database.php';

$database = new Database();
$conn = $database->getConnection(); 

if (!$conn) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database connection failed."]);
    exit();
}

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id) && !empty($data->name) && !empty($data->variants)) {
    $id = intval($data->id);
    $name = trim($data->name);
    $description = isset($data->description) ? trim($data->description) : '';
    $category = isset($data->category) ? trim($data->category) : '';
    $img = isset($data->img) ? $data->img : '';
    $isAvailable = !empty($data->isAvailable) ? 1 : 0;
    $isTopDeal = !empty($data->isTopDeal) ? 1 : 0;
    $isBestSeller = !empty($data->isBestSeller) ? 1 : 0;
    $promo_banner_image = isset($data->promo_banner_image) ? $data->promo_banner_image : null;
    $is_featured_banner = !empty($data->is_featured_banner) ? 1 : 0;
    $banner_order = isset($data->banner_order) ? intval($data->banner_order) : 0;
    $has_spice_option = isset($data->has_spice_option) ? (!empty($data->has_spice_option) ? 1 : 0) : 1;
    
    $slider_placements = isset($data->slider_placements) && is_array($data->slider_placements) ? $data->slider_placements : [];

    $category_id = !empty($data->category_id) ? intval($data->category_id) : null;
    if (!$category_id && !empty($category)) {
        $findCat = $conn->prepare("SELECT id FROM categories WHERE LOWER(TRIM(name)) = LOWER(TRIM(?)) LIMIT 1");
        $findCat->execute([$category]);
        $cRow = $findCat->fetch(PDO::FETCH_ASSOC);
        if ($cRow) {
            $category_id = intval($cRow['id']);
        }
    }
    $inventory_id = !empty($data->inventory_id) ? intval($data->inventory_id) : null;

    try {
        $conn->beginTransaction();

        // 1. Update Main Item with relational links
        $query1 = "UPDATE menu_items SET name=?, description=?, category=?, category_id=?, inventory_id=?, img=?, isAvailable=?, isTopDeal=?, isBestSeller=?, promo_banner_image=?, is_featured_banner=?, banner_order=?, has_spice_option=? WHERE id=?";
        $stmt1 = $conn->prepare($query1);
        $stmt1->execute([$name, $description, $category, $category_id, $inventory_id, $img, $isAvailable, $isTopDeal, $isBestSeller, $promo_banner_image, $is_featured_banner, $banner_order, $has_spice_option, $id]);

        // 2. Delete Old Variants
        $delQuery = "DELETE FROM menu_variants WHERE menu_id=?";
        $delStmt = $conn->prepare($delQuery);
        $delStmt->execute([$id]);

        // 3. Insert New Variants with in_stock
        $query2 = "INSERT INTO menu_variants (menu_id, size_name, price, in_stock) VALUES (?, ?, ?, ?)";
        $stmt2 = $conn->prepare($query2);
        
        foreach ($data->variants as $variant) {
            $size = !empty($variant->size) ? trim($variant->size) : 'Regular';
            $price = isset($variant->price) && $variant->price !== '' ? floatval($variant->price) : 0.0;
            $inStock = (isset($variant->inStock) && $variant->inStock !== false) ? 1 : 0;
            
            $stmt2->execute([$id, $size, $price, $inStock]);
        }

        // 4. Update Custom Sliders (slider_placements)
        $sliderQuery = "SELECT id, content_data FROM homepage_sections WHERE section_type = 'product_slider' AND content_data LIKE 'custom:%'";
        $sliderStmt = $conn->prepare($sliderQuery);
        $sliderStmt->execute();
        $customSliders = $sliderStmt->fetchAll(PDO::FETCH_ASSOC);

        $updateSliderStmt = $conn->prepare("UPDATE homepage_sections SET content_data = ? WHERE id = ?");

        foreach ($customSliders as $slider) {
            $contentStr = str_replace('custom:', '', $slider['content_data']);
            $currentIds = $contentStr !== '' ? explode(',', $contentStr) : [];
            $currentIds = array_map('intval', $currentIds);

            $sliderId = (int)$slider['id'];
            $shouldInclude = in_array($sliderId, $slider_placements);
            $currentIndex = array_search((int)$id, $currentIds);
            
            if ($shouldInclude && $currentIndex === false) {
                $currentIds[] = (int)$id;
            } elseif (!$shouldInclude && $currentIndex !== false) {
                unset($currentIds[$currentIndex]);
            }

            $newContentData = 'custom:' . implode(',', array_values($currentIds));
            $updateSliderStmt->execute([$newContentData, $sliderId]);
        }

        $conn->commit();

        // Broadcast real-time menu change to all connected screens
        include_once __DIR__ . '/../config/SocketBroadcaster.php';
        SocketBroadcaster::broadcastOrderTrigger(['type' => 'menu_updated', 'action' => 'update', 'id' => $id]);

        echo json_encode(["success" => true, "message" => "Item updated successfully."]);
    } catch (PDOException $e) {
        $conn->rollBack();
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Database Error: " . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Incomplete data. ID, Name, and variants are required."]);
}
$conn = null;
?>
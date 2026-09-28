<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
require_role(['Admin', 'Manager']);
include_once __DIR__ . '/../config/Database.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->title) && isset($data->price) && $data->price !== '') {
    try {
        $db->beginTransaction();

        $title = trim($data->title);
        $description = isset($data->description) ? trim($data->description) : '';
        $price = floatval($data->price);
        $originalPrice = !empty($data->original_price) ? floatval($data->original_price) : null;
        $badgeTag = !empty($data->badge_tag) ? trim($data->badge_tag) : (!empty($data->tag) ? trim($data->tag) : 'POPULAR');
        $img = isset($data->img) ? trim($data->img) : '';
        $promoBannerImage = !empty($data->promo_banner_image) ? trim($data->promo_banner_image) : null;
        $isFeaturedBanner = !empty($data->is_featured_banner) ? 1 : 0;
        $bannerOrder = isset($data->banner_order) ? intval($data->banner_order) : 0;
        $isPermanent = !empty($data->is_permanent) ? 1 : 0;
        $startTime = ($isPermanent || empty($data->start_time)) ? null : trim($data->start_time);
        $endTime = ($isPermanent || empty($data->end_time)) ? null : trim($data->end_time);
        $dayLimit = (isset($data->day_limit) && $data->day_limit !== '' && intval($data->day_limit) > 0) ? intval($data->day_limit) : null;
        $expiresAt = null;
        if ($dayLimit !== null) {
            $expiresAt = date('Y-m-d H:i:s', strtotime("+$dayLimit days"));
        }

        // 1. Deal Insert
        $query = "INSERT INTO deals (title, description, price, original_price, badge_tag, tag, img, promo_banner_image, is_featured_banner, banner_order, is_permanent, start_time, end_time, day_limit, expires_at, is_active) 
                  VALUES (:title, :description, :price, :original_price, :badge_tag, :tag, :img, :promo_img, :is_featured, :b_order, :is_p, :s_time, :e_time, :day_limit, :expires_at, 1)";
        $stmt = $db->prepare($query);
        
        $stmt->execute([
            ':title' => $title,
            ':description' => $description,
            ':price' => $price,
            ':original_price' => $originalPrice,
            ':badge_tag' => $badgeTag,
            ':tag' => $badgeTag,
            ':img'   => $img,
            ':promo_img' => $promoBannerImage,
            ':is_featured' => $isFeaturedBanner,
            ':b_order' => $bannerOrder,
            ':is_p'  => $isPermanent,
            ':s_time'=> $startTime,
            ':e_time'=> $endTime,
            ':day_limit' => $dayLimit,
            ':expires_at' => $expiresAt
        ]);
        
        $deal_id = $db->lastInsertId();

        // 2. Deal Items Insert
        if (!empty($data->items) && is_array($data->items)) {
            $itemQuery = "INSERT INTO deal_items 
                          (deal_id, menu_item_id, category, item_title, size, flavor_name, flavor_mode, quantity, is_customizable, choice_group_name, options_json) 
                          VALUES (:deal_id, :menu_item_id, :category, :item_title, :size, :flavor_name, :flavor_mode, :qty, :is_customizable, :choice_group_name, :options_json)";
            $itemStmt = $db->prepare($itemQuery);

            foreach ($data->items as $item) {
                $item = (object)$item;
                $itemTitle = trim($item->item_title ?? $item->name ?? '');
                if ($itemTitle === '') continue;

                $menuItemId = !empty($item->menu_item_id) ? intval($item->menu_item_id) : (!empty($item->id) && is_numeric($item->id) ? intval($item->id) : 0);
                $category = !empty($item->category) ? trim($item->category) : null;
                $size = !empty($item->size) ? trim($item->size) : 'Regular';
                $flavorName = !empty($item->flavor_name) ? trim($item->flavor_name) : null;
                $flavorMode = !empty($item->flavor_mode) ? trim($item->flavor_mode) : (!empty($item->is_customizable) ? 'choice' : 'fixed');
                $isCustomizable = ($flavorMode === 'choice' || !empty($item->is_customizable)) ? 1 : 0;

                $optionsJson = null;
                if (!empty($item->options_json)) {
                    $optionsJson = is_string($item->options_json) ? $item->options_json : json_encode($item->options_json);
                } elseif (!empty($item->options_str)) {
                    $optionsJson = json_encode(array_values(array_filter(array_map('trim', explode(',', $item->options_str)))));
                } elseif (!empty($item->options)) {
                    $optionsJson = is_array($item->options) ? json_encode($item->options) : json_encode(array_values(array_filter(array_map('trim', explode(',', $item->options)))));
                }

                $itemStmt->execute([
                    ':deal_id' => $deal_id,
                    ':menu_item_id' => $menuItemId,
                    ':category' => $category,
                    ':item_title' => $itemTitle,
                    ':size' => $size,
                    ':flavor_name' => $flavorName,
                    ':flavor_mode' => $flavorMode,
                    ':qty' => max(1, intval($item->quantity ?? $item->qty ?? 1)),
                    ':is_customizable' => $isCustomizable,
                    ':choice_group_name' => !empty($item->choice_group_name) ? trim($item->choice_group_name) : null,
                    ':options_json' => $optionsJson
                ]);
            }
        }

        $db->commit();
        echo json_encode([
            "success" => true, 
            "message" => "New Deal Created Successfully!",
            "deal_id" => $deal_id
        ]);
    } catch (Exception $e) {
        $db->rollBack();
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Database Error: " . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Incomplete data for deal creation."]);
}
?>
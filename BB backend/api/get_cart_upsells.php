<?php
require_once __DIR__ . '/../config/cors_headers.php';
require_once __DIR__ . '/../config/Database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception("Unable to connect to database.");
    }

    // 1. Fetch Dynamic Delivery Threshold & Fee from Settings
    $settingsStmt = $db->query("SELECT setting_key, setting_value FROM settings WHERE setting_key IN ('free_delivery_threshold', 'default_delivery_fee', 'delivery_fee')");
    $settings = [];
    while ($row = $settingsStmt->fetch(PDO::FETCH_ASSOC)) {
        $settings[$row['setting_key']] = $row['setting_value'];
    }

    $threshold = isset($settings['free_delivery_threshold']) ? floatval($settings['free_delivery_threshold']) : 1500.00;
    $deliveryFee = isset($settings['default_delivery_fee']) ? floatval($settings['default_delivery_fee']) : (isset($settings['delivery_fee']) ? floatval($settings['delivery_fee']) : 150.00);

    // 2. Parse Current Cart Item IDs
    $cartItemIds = [];
    if (isset($_GET['cart_item_ids']) && trim($_GET['cart_item_ids']) !== '') {
        $cartItemIds = array_values(array_unique(array_filter(array_map('intval', explode(',', $_GET['cart_item_ids'])))));
    }

    $cartHasDrink = false;
    $cartHasSauce = false;
    $cartHasMainFood = false;

    if (!empty($cartItemIds)) {
        $inClause = implode(',', $cartItemIds);
        $checkStmt = $db->query("
            SELECT id, LOWER(COALESCE(category, '')) AS cat_name, LOWER(name) AS item_name 
            FROM menu_items 
            WHERE id IN ($inClause)
        ");
        $itemsInCart = $checkStmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($itemsInCart as $cartItem) {
            $cat = $cartItem['cat_name'];
            $name = $cartItem['item_name'];

            if (strpos($cat, 'drink') !== false || strpos($cat, 'beverage') !== false || 
                strpos($name, 'pepsi') !== false || strpos($name, 'coke') !== false || 
                strpos($name, 'fanta') !== false || strpos($name, 'dew') !== false || 
                strpos($name, '7up') !== false || strpos($name, 'water') !== false) {
                $cartHasDrink = true;
            } elseif (strpos($cat, 'sauce') !== false || strpos($cat, 'dip') !== false || 
                      strpos($name, 'sauce') !== false || strpos($name, 'dip') !== false || 
                      strpos($name, 'mayo') !== false) {
                $cartHasSauce = true;
            } else {
                $cartHasMainFood = true;
            }
        }
    }

    // 3. Intelligent Recommendation Helper
    $fetchCategoryItems = function($categoryKeywords, $limit, $excludeIds) use ($db) {
        if (empty($categoryKeywords)) return [];
        
        $likes = [];
        $params = [];
        foreach ($categoryKeywords as $kw) {
            $likes[] = "(LOWER(m.category) LIKE ? OR LOWER(m.name) LIKE ?)";
            $searchTerm = "%" . strtolower($kw) . "%";
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }
        $whereCategory = "(" . implode(" OR ", $likes) . ")";
        
        $sql = "
            SELECT 
                m.id, 
                m.name, 
                m.category, 
                COALESCE(m.img, '') AS image_url,
                COALESCE(m.img, '') AS img,
                COALESCE(m.category, 'Sides') AS category_name,
                MIN(v.price) AS price,
                v.size_name AS default_size,
                v.id AS default_variant_id
            FROM menu_items m
            LEFT JOIN menu_variants v ON m.id = v.menu_id
            WHERE m.isAvailable = 1 AND $whereCategory
        ";

        if (!empty($excludeIds)) {
            $cleanedIds = implode(',', array_map('intval', $excludeIds));
            $sql .= " AND m.id NOT IN ($cleanedIds)";
        }

        $sql .= " GROUP BY m.id ORDER BY price ASC, m.id DESC LIMIT " . intval($limit);

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($rows as &$item) {
            $item['price'] = floatval($item['price'] ?: 0);
            $item['id'] = intval($item['id']);
        }
        return $rows;
    };

    $allExcludedIds = $cartItemIds;
    $recommendations = [];

    // SCENARIO 1: Cart ONLY has Drinks -> Recommend Food, Sides, Fries & Snacks (NO drinks)
    if ($cartHasDrink && !$cartHasMainFood && !$cartHasSauce) {
        $foodItems = $fetchCategoryItems(['side', 'fries', 'snack', 'burger', 'wrap', 'broast'], 6, $allExcludedIds);
        $recommendations = array_merge($recommendations, $foodItems);
    }
    // SCENARIO 2: Cart ONLY has Sauces/Dips -> Recommend Main Meals & Fries (NO sauces)
    elseif ($cartHasSauce && !$cartHasMainFood && !$cartHasDrink) {
        $meals = $fetchCategoryItems(['burger', 'broast', 'pizza', 'fries', 'side', 'wrap'], 6, $allExcludedIds);
        $recommendations = array_merge($recommendations, $meals);
    }
    // SCENARIO 3: Standard Cart / Has Main Meals -> Balanced Pairings
    else {
        // A. Sides / Fries / Appetizers
        $sides = $fetchCategoryItems(['side', 'fries', 'appetizer', 'snack'], 3, $allExcludedIds);
        $recommendations = array_merge($recommendations, $sides);
        $allExcludedIds = array_merge($allExcludedIds, array_column($sides, 'id'));

        // B. Beverages (Only if cart doesn't already contain a drink)
        if (!$cartHasDrink) {
            $drinks = $fetchCategoryItems(['drink', 'beverage', 'water', 'pepsi', 'coke', '7up', 'fanta', 'dew'], 3, $allExcludedIds);
            $recommendations = array_merge($recommendations, $drinks);
            $allExcludedIds = array_merge($allExcludedIds, array_column($drinks, 'id'));
        }

        // C. Gourmet Dips / Sauces / Desserts (Only if cart doesn't already contain a sauce)
        if (!$cartHasSauce) {
            $dips = $fetchCategoryItems(['dip', 'sauce', 'dessert', 'mayo'], 2, $allExcludedIds);
            $recommendations = array_merge($recommendations, $dips);
            $allExcludedIds = array_merge($allExcludedIds, array_column($dips, 'id'));
        }
    }

    // Fallback: If recommendation pool is smaller than 4 items, backfill with available items
    if (count($recommendations) < 4) {
        $existingIds = array_unique(array_merge($allExcludedIds, array_column($recommendations, 'id')));
        $fallbackSql = "
            SELECT 
                m.id, 
                m.name, 
                m.category, 
                COALESCE(m.img, '') AS image_url,
                COALESCE(m.img, '') AS img,
                COALESCE(m.category, 'Sides') AS category_name,
                MIN(v.price) AS price,
                v.size_name AS default_size,
                v.id AS default_variant_id
            FROM menu_items m
            LEFT JOIN menu_variants v ON m.id = v.menu_id
            WHERE m.isAvailable = 1
        ";
        if (!empty($existingIds)) {
            $fallbackInClause = implode(',', array_map('intval', $existingIds));
            $fallbackSql .= " AND m.id NOT IN ($fallbackInClause)";
        }
        $fallbackSql .= " GROUP BY m.id ORDER BY price ASC, m.id DESC LIMIT " . (6 - count($recommendations));
        
        $fallbackStmt = $db->query($fallbackSql);
        $fallbackItems = $fallbackStmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($fallbackItems as &$fb) {
            $fb['price'] = floatval($fb['price'] ?: 0);
            $fb['id'] = intval($fb['id']);
        }
        $recommendations = array_merge($recommendations, $fallbackItems);
    }

    echo json_encode([
        'success' => true,
        'threshold' => $threshold,
        'default_delivery_fee' => $deliveryFee,
        'cart_context' => [
            'has_drink' => $cartHasDrink,
            'has_sauce' => $cartHasSauce,
            'has_main_food' => $cartHasMainFood,
            'excluded_count' => count($cartItemIds)
        ],
        'upsell_items' => array_values($recommendations)
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>

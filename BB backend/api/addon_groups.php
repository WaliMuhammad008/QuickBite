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
        throw new Exception("Unable to connect to database.");
    }

    // Auto-create/upgrade category_addons table if missing
    $tableCheck = "CREATE TABLE IF NOT EXISTS category_addons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        target_category VARCHAR(255) NOT NULL,
        addon_category VARCHAR(255) NOT NULL,
        custom_label VARCHAR(255) NULL,
        selection_type VARCHAR(50) NOT NULL DEFAULT 'multiple_choice',
        is_required TINYINT(1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_category_mapping (target_category, addon_category)
    )";
    $db->exec($tableCheck);

    // Check if custom_label column exists, add if missing
    try {
        $db->query("SELECT custom_label FROM category_addons LIMIT 1");
    } catch (Exception $colEx) {
        $db->exec("ALTER TABLE category_addons ADD COLUMN custom_label VARCHAR(255) NULL AFTER addon_category");
    }

    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

    if ($method === 'GET') {
        if (isset($_GET['action']) && $_GET['action'] === 'get_for_product') {
            // Intelligent Cross-Category Pairing Engine
            $category = trim($_GET['category'] ?? '');
            $itemId = isset($_GET['item_id']) ? intval($_GET['item_id']) : (isset($_GET['id']) ? intval($_GET['id']) : 0);
            $dealId = isset($_GET['deal_id']) ? intval($_GET['deal_id']) : 0;
            
            // Normalize deal/deals
            if (strtolower($category) === 'deal' || $dealId > 0) {
                $category = 'deals';
            }

            $targetCatLower = strtolower($category);

            // Define intelligent cross-category complementary pool per target category
            $crossCategoryMap = [
                'pizza' => ['Pasta', 'Grilled Wings', 'Potato Corner'],
                'burger' => ['Potato Corner', 'Fried Chicken', 'Grilled Wings', 'Wraps'],
                'potato corner' => ['burger', 'Wraps', 'Shawarma', 'Grilled Wings'],
                'pasta' => ['Pizza', 'Grilled Wings', 'Potato Corner'],
                'broast' => ['Potato Corner', 'Wraps', 'Shawarma', 'Grilled Wings'],
                'fried chicken' => ['Potato Corner', 'Wraps', 'Shawarma', 'Grilled Wings'],
                'shawarma' => ['Potato Corner', 'Fried Chicken', 'Grilled Wings'],
                'wraps' => ['Potato Corner', 'Fried Chicken', 'Grilled Wings'],
                'grilled wings' => ['Potato Corner', 'burger', 'Fried Chicken'],
                'sauses' => ['Potato Corner', 'burger', 'Fried Chicken'],
                'drinks' => ['burger', 'Pizza', 'Potato Corner', 'Shawarma'],
                'deals' => ['Potato Corner', 'Grilled Wings', 'Fried Chicken', 'Wraps'],
            ];

            // If deal has specific custom addon_categories configured in deals table, respect that
            if ($dealId > 0) {
                try {
                    $dealStmt = $db->prepare("SELECT addon_categories FROM deals WHERE id = ?");
                    $dealStmt->execute([$dealId]);
                    $dealRow = $dealStmt->fetch(PDO::FETCH_ASSOC);
                    if ($dealRow && !empty($dealRow['addon_categories'])) {
                        $customDealCats = array_map('trim', explode(',', $dealRow['addon_categories']));
                        if (count($customDealCats) > 0) {
                            $crossCategoryMap['deals'] = $customDealCats;
                        }
                    }
                } catch (Exception $e) {
                    // Ignore and use default
                }
            }

            // 1. DRINKS GROUP ("COMPLETE WITH A DRINK")
            $drinksGroup = null;
            if ($targetCatLower !== 'drinks') {
                $drinkSql = "
                    SELECT m.id, m.name as item_name, m.img, m.category, COALESCE(v.price, m.price, 0) as price 
                    FROM menu_items m 
                    LEFT JOIN (SELECT menu_id, MIN(price) as price FROM menu_variants GROUP BY menu_id) v ON m.id = v.menu_id 
                    WHERE LOWER(m.category) = 'drinks' AND (m.isAvailable = 1 OR m.isAvailable IS NULL) " . ($itemId > 0 ? " AND m.id != ?" : "") . "
                    ORDER BY m.id ASC
                ";
                $drinkStmt = $db->prepare($drinkSql);
                if ($itemId > 0) {
                    $drinkStmt->execute([$itemId]);
                } else {
                    $drinkStmt->execute();
                }
                $drinkRows = $drinkStmt->fetchAll(PDO::FETCH_ASSOC);

                $drinksItems = [];
                foreach ($drinkRows as $row) {
                    $drinksItems[] = [
                        'id' => $row['id'],
                        'item_name' => $row['item_name'] ?? 'Drink',
                        'name' => $row['item_name'] ?? 'Drink',
                        'price' => floatval($row['price'] ?? 0),
                        'img' => $row['img'] ?? '',
                        'category' => $row['category'] ?? 'drinks',
                        'is_menu_item' => true
                    ];
                }

                if (count($drinksItems) > 0) {
                    $drinksGroup = [
                        'group_id' => 'drinks',
                        'id' => 'drinks',
                        'name' => 'drinks',
                        'group_title' => 'COMPLETE WITH A DRINK',
                        'title' => 'COMPLETE WITH A DRINK',
                        'custom_label' => 'Refreshing beverages & cold drinks',
                        'subtitle' => 'Refreshing beverages & cold drinks',
                        'selection_type' => 'multiple_choice',
                        'type' => 'multiple_choice',
                        'is_required' => 0,
                        'items' => $drinksItems
                    ];
                }
            }

            // 2. PERFECT PAIRINGS GROUP (Dynamic Cross-Category Pairings, Max 6 items)
            $complementaryCategories = $crossCategoryMap[$targetCatLower] ?? ['Potato Corner', 'Grilled Wings', 'burger', 'Fried Chicken'];
            
            // Exclude drinks and sauces from pairings pool
            $complementaryCategories = array_values(array_filter($complementaryCategories, function($c) {
                $clow = strtolower($c);
                return $clow !== 'drinks' && $clow !== 'sauses' && $clow !== 'sauces';
            }));

            $pairingsGroup = null;
            if (count($complementaryCategories) > 0) {
                $inPlaceholders = implode(',', array_fill(0, count($complementaryCategories), '?'));
                $pairParams = [];
                foreach ($complementaryCategories as $c) {
                    $pairParams[] = strtolower($c);
                }
                $pairParams[] = $targetCatLower; // for category exclusion
                
                $whereItemId = "";
                if ($itemId > 0) {
                    $whereItemId = " AND m.id != ? ";
                    $pairParams[] = $itemId;
                }

                $pairQuery = "
                    SELECT m.id, m.name as item_name, m.img, m.category, COALESCE(v.price, m.price, 0) as price 
                    FROM menu_items m 
                    LEFT JOIN (SELECT menu_id, MIN(price) as price FROM menu_variants GROUP BY menu_id) v ON m.id = v.menu_id 
                    WHERE LOWER(m.category) IN ($inPlaceholders) 
                      AND LOWER(m.category) != ? 
                      AND (m.isAvailable = 1 OR m.isAvailable IS NULL)
                      $whereItemId
                    ORDER BY FIELD(LOWER(m.category), " . implode(',', array_fill(0, count($complementaryCategories), '?')) . "), m.id ASC
                ";

                $pairExecParams = array_merge($pairParams, array_map('strtolower', $complementaryCategories));
                $pairStmt = $db->prepare($pairQuery);
                $pairStmt->execute($pairExecParams);
                $pairRows = $pairStmt->fetchAll(PDO::FETCH_ASSOC);

                $pairingItems = [];
                foreach ($pairRows as $row) {
                    $pairingItems[] = [
                        'id' => $row['id'],
                        'item_name' => $row['item_name'] ?? 'Pairing Item',
                        'name' => $row['item_name'] ?? 'Pairing Item',
                        'price' => floatval($row['price'] ?? 0),
                        'img' => $row['img'] ?? '',
                        'category' => $row['category'] ?? '',
                        'is_menu_item' => true
                    ];
                }

                // Strict limit: cap to maximum 6 items
                $pairingItems = array_slice($pairingItems, 0, 6);

                if (count($pairingItems) > 0) {
                    $pairingsGroup = [
                        'group_id' => 'perfect_pairings',
                        'id' => 'perfect_pairings',
                        'name' => 'perfect_pairings',
                        'group_title' => 'PERFECT PAIRINGS',
                        'title' => 'PERFECT PAIRINGS',
                        'custom_label' => 'Recommended favorites that pair best with your selection',
                        'subtitle' => 'Recommended favorites that pair best with your selection',
                        'selection_type' => 'multiple_choice',
                        'type' => 'multiple_choice',
                        'is_required' => 0,
                        'items' => $pairingItems
                    ];
                }
            }

            // 3. SAUCES & DIPS GROUP ("ADD SOME DIPS")
            $saucesGroup = null;
            if ($targetCatLower !== 'sauses' && $targetCatLower !== 'sauces') {
                $sauceSql = "
                    SELECT m.id, m.name as item_name, m.img, m.category, COALESCE(v.price, m.price, 0) as price 
                    FROM menu_items m 
                    LEFT JOIN (SELECT menu_id, MIN(price) as price FROM menu_variants GROUP BY menu_id) v ON m.id = v.menu_id 
                    WHERE (LOWER(m.category) = 'sauses' OR LOWER(m.category) = 'sauces') 
                      AND (m.isAvailable = 1 OR m.isAvailable IS NULL) " . ($itemId > 0 ? " AND m.id != ?" : "") . "
                    ORDER BY m.id ASC
                ";
                $sauceStmt = $db->prepare($sauceSql);
                if ($itemId > 0) {
                    $sauceStmt->execute([$itemId]);
                } else {
                    $sauceStmt->execute();
                }
                $sauceRows = $sauceStmt->fetchAll(PDO::FETCH_ASSOC);

                $saucesItems = [];
                foreach ($sauceRows as $row) {
                    $saucesItems[] = [
                        'id' => $row['id'],
                        'item_name' => $row['item_name'] ?? 'Dip',
                        'name' => $row['item_name'] ?? 'Dip',
                        'price' => floatval($row['price'] ?? 0),
                        'img' => $row['img'] ?? '',
                        'category' => 'Sauces & Dips',
                        'is_menu_item' => true
                    ];
                }

                if (count($saucesItems) > 0) {
                    $saucesGroup = [
                        'group_id' => 'sauces',
                        'id' => 'sauces',
                        'name' => 'sauces',
                        'group_title' => 'ADD SOME DIPS',
                        'title' => 'ADD SOME DIPS',
                        'custom_label' => 'Garlic mayo, spicy dip & extra sauces',
                        'subtitle' => 'Garlic mayo, spicy dip & extra sauces',
                        'selection_type' => 'multiple_choice',
                        'type' => 'multiple_choice',
                        'is_required' => 0,
                        'items' => $saucesItems
                    ];
                }
            }

            // ORDER: 1. Drinks -> 2. Perfect Pairings (Max 6) -> 3. Add Some Dips
            $addonGroups = [];
            if ($drinksGroup !== null) {
                $addonGroups[] = $drinksGroup;
            }
            if ($pairingsGroup !== null) {
                $addonGroups[] = $pairingsGroup;
            }
            if ($saucesGroup !== null) {
                $addonGroups[] = $saucesGroup;
            }

            if (ob_get_level()) ob_clean();
            echo json_encode(['status' => 'success', 'addon_groups' => $addonGroups]);
            exit();
        } else {
            // Fetch all category mappings for admin panel
            $query = "SELECT * FROM category_addons ORDER BY target_category, id ASC";
            $stmt = $db->prepare($query);
            $stmt->execute();
            $mappings = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Group by target_category
            $grouped = [];
            foreach ($mappings as $map) {
                $target = $map['target_category'];
                if (!isset($grouped[$target])) {
                    $grouped[$target] = [
                        'target_category' => $target,
                        'addons' => []
                    ];
                }
                $grouped[$target]['addons'][] = [
                    'id' => $map['id'],
                    'addon_category' => $map['addon_category'],
                    'custom_label' => $map['custom_label'] ?? '',
                    'selection_type' => $map['selection_type'] ?? 'multiple_choice',
                    'is_required' => ($map['is_required'] == 1 || $map['is_required'] === true)
                ];
            }

            if (ob_get_level()) ob_clean();
            echo json_encode(['status' => 'success', 'category_addons' => array_values($grouped)]);
            exit();
        }
    } elseif ($method === 'POST') {
        $rawInput = file_get_contents("php://input");
        $data = json_decode($rawInput, true);
        if (!$data && !empty($_POST)) {
            $data = $_POST;
        }
        $action = $data['action'] ?? '';

        if ($action === 'save_mapping') {
            $targetCategory = trim($data['target_category'] ?? '');
            if (empty($targetCategory)) {
                throw new Exception("Target category is required.");
            }

            $addons = $data['addons'] ?? [];

            $db->beginTransaction();
            try {
                // Delete existing mappings for this target_category
                $delStmt = $db->prepare("DELETE FROM category_addons WHERE target_category = ?");
                $delStmt->execute([$targetCategory]);

                // Insert new mappings
                if (!empty($addons) && is_array($addons)) {
                    $insStmt = $db->prepare("INSERT INTO category_addons (target_category, addon_category, custom_label, selection_type, is_required) VALUES (?, ?, ?, ?, ?)");
                    foreach ($addons as $addon) {
                        $addonCategory = trim($addon['addon_category'] ?? '');
                        if (!empty($addonCategory)) {
                            $insStmt->execute([
                                $targetCategory, 
                                $addonCategory, 
                                !empty($addon['custom_label']) ? trim($addon['custom_label']) : null,
                                $addon['selection_type'] ?? 'multiple_choice', 
                                !empty($addon['is_required']) ? 1 : 0
                            ]);
                        }
                    }
                }

                $db->commit();
                if (ob_get_level()) ob_clean();
                echo json_encode(['status' => 'success', 'message' => 'Category addons saved successfully.']);
                exit();
            } catch (Exception $e) {
                $db->rollBack();
                throw $e;
            }
        } elseif ($action === 'delete_mapping') {
            $targetCategory = trim($data['target_category'] ?? '');
            if (empty($targetCategory)) {
                throw new Exception("Target category is required.");
            }

            $stmt = $db->prepare("DELETE FROM category_addons WHERE target_category = ?");
            $stmt->execute([$targetCategory]);

            if (ob_get_level()) ob_clean();
            echo json_encode(['status' => 'success', 'message' => 'Mapping deleted successfully.']);
            exit();
        } else {
            throw new Exception("Unknown action: " . htmlspecialchars($action));
        }
    } else {
        http_response_code(405);
        throw new Exception("Method not allowed.");
    }
} catch (Exception $e) {
    if (ob_get_level()) ob_clean();
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage(),
        'data' => []
    ]);
    exit();
}
?>

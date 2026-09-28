<?php
require_once __DIR__ . '/../config/cors_headers.php';
require_once __DIR__ . '/../config/Database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception("Unable to connect to database.");
    }

    $itemId = isset($_GET['item_id']) ? intval($_GET['item_id']) : (isset($_GET['id']) ? intval($_GET['id']) : 0);
    $category = trim($_GET['category'] ?? ($_GET['category_name'] ?? ''));
    $dealId = isset($_GET['deal_id']) ? intval($_GET['deal_id']) : 0;

    // If item_id is provided and category is empty or 'uncategorized', fetch category from menu_items
    if ($itemId > 0 && (empty($category) || strtolower($category) === 'uncategorized')) {
        $stmt = $db->prepare("SELECT category FROM menu_items WHERE id = ?");
        $stmt->execute([$itemId]);
        $fetchedCat = $stmt->fetchColumn();
        if (!empty($fetchedCat)) {
            $category = $fetchedCat;
        }
    }

    if ($dealId > 0 || strtolower($category) === 'deal') {
        $category = 'deals';
    }

    $targetCatLower = strtolower($category);

    // ── Helper: Classify custom addon type for UI icon/badges ────────────────
    function getAddonVisualType($title) {
        $t = strtolower($title);
        if (strpos($t, 'cheese') !== false) return 'cheese';
        if (strpos($t, 'patty') !== false || strpos($t, 'chicken') !== false || strpos($t, 'beef') !== false) return 'patty';
        if (strpos($t, 'sauce') !== false || strpos($t, 'mayo') !== false || strpos($t, 'dip') !== false) return 'sauce';
        if (strpos($t, 'olive') !== false || strpos($t, 'jelapeno') !== false || strpos($t, 'jalapeno') !== false || strpos($t, 'mashroom') !== false || strpos($t, 'mushroom') !== false) return 'topping';
        return 'extra';
    }

    // ── 1. FETCH PRODUCT-SPECIFIC CUSTOM ADDONS ─────────────────────────────
    $productAddons = [];
    if ($itemId > 0) {
        // Check product_custom_addons table first with live inventory stock check
        $stmt = $db->prepare("
            SELECT p.id, p.title, p.price, p.inventory_id, p.qty_to_deduct, i.stock as inv_stock 
            FROM product_custom_addons p 
            LEFT JOIN inventory i ON p.inventory_id = i.id
            WHERE p.menu_item_id = ? AND p.is_active = 1
            ORDER BY p.id ASC
        ");
        $stmt->execute([$itemId]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (!empty($rows)) {
            foreach ($rows as $r) {
                $invId = !empty($r['inventory_id']) ? intval($r['inventory_id']) : null;
                $invStock = isset($r['inv_stock']) ? floatval($r['inv_stock']) : null;
                $deductQty = !empty($r['qty_to_deduct']) ? floatval($r['qty_to_deduct']) : 1.0;
                $inStock = true;
                if ($invId !== null && $invStock !== null && ($invStock <= 0 || $invStock < $deductQty)) {
                    $inStock = false;
                }

                $productAddons[] = [
                    'id' => intval($r['id']),
                    'uid' => 'custom_' . intval($r['id']),
                    'title' => $r['title'],
                    'name' => $r['title'],
                    'price' => floatval($r['price']),
                    'inventory_id' => $invId,
                    'qty' => !empty($r['qty_to_deduct']) ? floatval($r['qty_to_deduct']) : null,
                    'in_stock' => $inStock,
                    'is_product_addon' => true,
                    'addon_type' => 'product_custom',
                    'visual_type' => getAddonVisualType($r['title']),
                    'image' => null,
                    'img' => null
                ];
            }
        } else {
            // Fallback to legacy menu_addons table
            $stmt = $db->prepare("
                SELECT m.id, m.addon_name as title, m.addon_price as price, m.inventory_id, m.qty_to_deduct, i.stock as inv_stock 
                FROM menu_addons m 
                LEFT JOIN inventory i ON m.inventory_id = i.id
                WHERE m.menu_item_id = ?
                ORDER BY m.id ASC
            ");
            $stmt->execute([$itemId]);
            $legacyRows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            foreach ($legacyRows as $r) {
                $invId = !empty($r['inventory_id']) ? intval($r['inventory_id']) : null;
                $invStock = isset($r['inv_stock']) ? floatval($r['inv_stock']) : null;
                $deductQty = !empty($r['qty_to_deduct']) ? floatval($r['qty_to_deduct']) : 1.0;
                $inStock = true;
                if ($invId !== null && $invStock !== null && ($invStock <= 0 || $invStock < $deductQty)) {
                    $inStock = false;
                }

                $productAddons[] = [
                    'id' => intval($r['id']),
                    'uid' => 'custom_' . intval($r['id']),
                    'title' => $r['title'],
                    'name' => $r['title'],
                    'price' => floatval($r['price']),
                    'inventory_id' => $invId,
                    'qty' => !empty($r['qty_to_deduct']) ? floatval($r['qty_to_deduct']) : null,
                    'in_stock' => $inStock,
                    'is_product_addon' => true,
                    'addon_type' => 'product_custom',
                    'visual_type' => getAddonVisualType($r['title']),
                    'image' => null,
                    'img' => null
                ];
            }
        }
    }

    // ── 2. FETCH MAPPED ADDON GROUPS & LIVE ITEMS ───────────────────────────
    $addonGroups = [];

    // Query dynamic mappings for this category
    $mappedGroups = [];
    if (!empty($targetCatLower)) {
        $mapStmt = $db->prepare("
            SELECT g.id, g.title, g.subtitle, g.icon_type, g.source_category_id, g.source_category_name
            FROM category_addon_mappings m
            JOIN addon_groups g ON m.addon_group_id = g.id
            WHERE LOWER(m.parent_category_name) = ? AND g.is_active = 1
            ORDER BY g.id ASC
        ");
        $mapStmt->execute([$targetCatLower]);
        $mappedGroups = $mapStmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Fallback: If no custom mapping in database for this category, check default active groups
    if (empty($mappedGroups)) {
        $defaultMapStmt = $db->query("
            SELECT g.id, g.title, g.subtitle, g.icon_type, g.source_category_id, g.source_category_name
            FROM addon_groups g
            WHERE g.is_active = 1
            ORDER BY g.id ASC
        ");
        $allGroups = $defaultMapStmt->fetchAll(PDO::FETCH_ASSOC);

        // Filter out group if the target category itself matches source category
        foreach ($allGroups as $grp) {
            $srcCatLower = strtolower($grp['source_category_name'] ?? '');
            if (empty($targetCatLower) || $srcCatLower !== $targetCatLower) {
                $mappedGroups[] = $grp;
            }
        }
    }

    // For each mapped group, fetch live menu items from source category
    foreach ($mappedGroups as $grp) {
        $srcCat = $grp['source_category_name'] ?? '';
        $srcCatId = !empty($grp['source_category_id']) ? intval($grp['source_category_id']) : null;

        $itemsQuery = "
            SELECT m.id, m.name as item_name, m.name as title, m.img, m.category, COALESCE(v.price, m.price, 0) as price 
            FROM menu_items m 
            LEFT JOIN (SELECT menu_id, MIN(price) as price FROM menu_variants GROUP BY menu_id) v ON m.id = v.menu_id 
            WHERE (m.isAvailable = 1 OR m.isAvailable IS NULL)
        ";
        $params = [];

        if (!empty($srcCat)) {
            $itemsQuery .= " AND (LOWER(m.category) = ? OR LOWER(m.category) LIKE ?)";
            $params[] = strtolower($srcCat);
            $params[] = '%' . strtolower($srcCat) . '%';
        }

        if ($itemId > 0) {
            $itemsQuery .= " AND m.id != ?";
            $params[] = $itemId;
        }

        $itemsQuery .= " ORDER BY m.id ASC LIMIT 12";

        $iStmt = $db->prepare($itemsQuery);
        $iStmt->execute($params);
        $items = $iStmt->fetchAll(PDO::FETCH_ASSOC);

        if (!empty($items)) {
            $formattedItems = [];
            foreach ($items as $it) {
                $formattedItems[] = [
                    'id' => intval($it['id']),
                    'uid' => 'item_' . intval($it['id']),
                    'name' => $it['item_name'],
                    'title' => $it['item_name'],
                    'price' => floatval($it['price']),
                    'img' => $it['img'],
                    'image' => $it['img'],
                    'image_url' => $it['img'],
                    'category' => $it['category'],
                    'is_addon' => true,
                    'addon_type' => 'upsell_item',
                    'visual_type' => 'item'
                ];
            }

            $addonGroups[] = [
                'id' => intval($grp['id']),
                'title' => $grp['title'],
                'subtitle' => $grp['subtitle'] ?: 'Select optional add-ons to complete your meal',
                'icon_type' => $grp['icon_type'] ?: 'addon',
                'source_category' => $srcCat,
                'items' => $formattedItems
            ];
        }
    }

    echo json_encode([
        'success' => true,
        'product_addons' => $productAddons,
        'addon_groups' => $addonGroups
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'product_addons' => [],
        'addon_groups' => []
    ]);
}
?>

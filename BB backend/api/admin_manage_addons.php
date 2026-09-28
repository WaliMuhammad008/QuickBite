<?php
require_once __DIR__ . '/../config/cors_headers.php';
require_once __DIR__ . '/../config/auth_middleware.php';
require_role(['Admin', 'Manager']);
require_once __DIR__ . '/../config/Database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception("Unable to connect to database.");
    }

    // Auto-migrate menu_addons to allow NULL inventory_id / qty_to_deduct
    try {
        $db->exec("ALTER TABLE `menu_addons` MODIFY `inventory_id` INT NULL DEFAULT NULL");
        $db->exec("ALTER TABLE `menu_addons` MODIFY `qty_to_deduct` DECIMAL(10,2) NULL DEFAULT NULL");
    } catch (\Throwable $e) {}

    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $action = $_GET['action'] ?? ($_POST['action'] ?? '');

    if ($method === 'GET') {
        if ($action === 'get_addon_groups') {
            $stmt = $db->query("
                SELECT id, title, subtitle, source_category_id, source_category_name, icon_type, is_active, created_at 
                FROM addon_groups 
                ORDER BY id ASC
            ");
            $groups = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["success" => true, "data" => $groups]);
            exit();
        }

        if ($action === 'get_category_mappings') {
            $stmt = $db->query("
                SELECT 
                    cam.id,
                    cam.parent_category_id,
                    COALESCE(cam.parent_category_name, c.name, 'General') AS parent_category_name,
                    cam.addon_group_id,
                    ag.title AS addon_group_title,
                    ag.title AS group_title,
                    ag.subtitle AS addon_group_subtitle,
                    ag.subtitle AS group_subtitle,
                    ag.source_category_name,
                    ag.icon_type,
                    cam.created_at
                FROM category_addon_mappings cam
                LEFT JOIN categories c ON cam.parent_category_id = c.id
                LEFT JOIN addon_groups ag ON cam.addon_group_id = ag.id
                ORDER BY cam.parent_category_name ASC, cam.id ASC
            ");
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Group by parent_category_name for card views
            $grouped = [];
            foreach ($rows as $row) {
                $pCat = $row['parent_category_name'];
                if (!isset($grouped[$pCat])) {
                    $grouped[$pCat] = [
                        "target_category" => $pCat,
                        "parent_category_name" => $pCat,
                        "parent_category_id" => $row['parent_category_id'],
                        "addons" => []
                    ];
                }
                $grouped[$pCat]["addons"][] = [
                    "id" => intval($row['id']),
                    "mapping_id" => intval($row['id']),
                    "addon_group_id" => intval($row['addon_group_id']),
                    "addon_category" => $row['addon_group_title'] ?: ($row['source_category_name'] ?: 'Addon Group'),
                    "group_title" => $row['addon_group_title'] ?: 'Addon Group',
                    "group_subtitle" => $row['addon_group_subtitle'] ?: '',
                    "source_category_name" => $row['source_category_name'] ?: '',
                    "icon_type" => $row['icon_type'] ?: 'drink',
                    "selection_type" => "multiple_choice",
                    "is_required" => false
                ];
            }

            echo json_encode([
                "success" => true,
                "data" => array_values($grouped),
                "mappings" => $rows,
                "count" => count($rows)
            ]);
            exit();
        }

        if ($action === 'get_all_product_addons') {
            $stmt = $db->query("
                SELECT p.id, p.menu_item_id, p.title, p.price, p.inventory_id, p.qty_to_deduct, p.is_active,
                       m.name as product_name, m.category as product_category, m.img as product_img,
                       i.name as inventory_name, i.stock as inventory_stock, i.unit as inventory_unit
                FROM product_custom_addons p
                JOIN menu_items m ON p.menu_item_id = m.id
                LEFT JOIN inventory i ON p.inventory_id = i.id
                WHERE p.is_active = 1
                ORDER BY m.name ASC, p.id ASC
            ");
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Group by product
            $grouped = [];
            foreach ($rows as $r) {
                $pId = $r['menu_item_id'];
                if (!isset($grouped[$pId])) {
                    $grouped[$pId] = [
                        'menu_item_id' => $pId,
                        'product_name' => $r['product_name'],
                        'product_category' => $r['product_category'],
                        'product_img' => $r['product_img'],
                        'addons' => []
                    ];
                }
                $grouped[$pId]['addons'][] = [
                    'id' => intval($r['id']),
                    'title' => $r['title'],
                    'price' => floatval($r['price']),
                    'inventory_id' => $r['inventory_id'] ? intval($r['inventory_id']) : null,
                    'qty_to_deduct' => $r['qty_to_deduct'] ? floatval($r['qty_to_deduct']) : 1.0,
                    'inventory_name' => $r['inventory_name'] ?: 'Linked Stock Item',
                    'inventory_stock' => $r['inventory_stock'] !== null ? floatval($r['inventory_stock']) : null,
                    'inventory_unit' => $r['inventory_unit'] ?: 'units'
                ];
            }

            echo json_encode(["success" => true, "data" => array_values($grouped)]);
            exit();
        }

        if ($action === 'get_product_addons') {
            $menuItemId = intval($_GET['menu_item_id'] ?? 0);
            if ($menuItemId <= 0) {
                throw new Exception("menu_item_id is required.");
            }

            $stmt = $db->prepare("
                SELECT id, menu_item_id, title, price, inventory_id, qty_to_deduct, is_active 
                FROM product_custom_addons 
                WHERE menu_item_id = ?
                ORDER BY id ASC
            ");
            $stmt->execute([$menuItemId]);
            $addons = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Fallback to legacy menu_addons if product_custom_addons is empty
            if (empty($addons)) {
                $legacyStmt = $db->prepare("
                    SELECT id, menu_item_id, addon_name as title, addon_price as price, inventory_id, qty_to_deduct 
                    FROM menu_addons 
                    WHERE menu_item_id = ?
                    ORDER BY id ASC
                ");
                $legacyStmt->execute([$menuItemId]);
                $addons = $legacyStmt->fetchAll(PDO::FETCH_ASSOC);
            }

            echo json_encode(["success" => true, "data" => $addons]);
            exit();
        }

        // Default: list all categories and groups for dropdowns
        $cats = $db->query("SELECT id, name FROM categories ORDER BY name ASC")->fetchAll(PDO::FETCH_ASSOC);
        $groups = $db->query("SELECT id, title, source_category_name FROM addon_groups WHERE is_active = 1 ORDER BY title ASC")->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["success" => true, "categories" => $cats, "addon_groups" => $groups]);
        exit();
    }

    if ($method === 'POST') {
        $rawInput = file_get_contents("php://input");
        $data = json_decode($rawInput, true) ?: $_POST;
        $postAction = $data['action'] ?? $action;

        // 1. Save Product Custom Addons
        if ($postAction === 'save_product_addons') {
            $menuItemId = intval($data['menu_item_id'] ?? 0);
            $addons = $data['addons'] ?? [];

            if ($menuItemId <= 0) {
                throw new Exception("Invalid menu_item_id.");
            }

            $db->beginTransaction();

            // Clear old custom addons
            $del1 = $db->prepare("DELETE FROM product_custom_addons WHERE menu_item_id = ?");
            $del1->execute([$menuItemId]);

            $del2 = $db->prepare("DELETE FROM menu_addons WHERE menu_item_id = ?");
            $del2->execute([$menuItemId]);

            $ins = $db->prepare("
                INSERT INTO product_custom_addons (menu_item_id, title, price, inventory_id, qty_to_deduct, is_active)
                VALUES (?, ?, ?, ?, ?, 1)
            ");
            $insLegacy = $db->prepare("
                INSERT INTO menu_addons (menu_item_id, addon_name, addon_price, inventory_id, qty_to_deduct)
                VALUES (?, ?, ?, ?, ?)
            ");

            foreach ($addons as $addon) {
                $title = trim($addon['title'] ?? ($addon['addon_name'] ?? ''));
                if ($title === '') continue;

                $price = floatval($addon['price'] ?? ($addon['addon_price'] ?? 0));
                $invId = !empty($addon['inventory_id']) ? intval($addon['inventory_id']) : null;
                $qty = !empty($addon['qty_to_deduct']) ? floatval($addon['qty_to_deduct']) : (!empty($addon['qty']) ? floatval($addon['qty']) : null);

                $ins->execute([$menuItemId, $title, $price, $invId, $qty]);
                $legacyInvId = $invId !== null ? $invId : 0;
                $legacyQty = $qty !== null ? $qty : 0.00;
                $insLegacy->execute([$menuItemId, $title, $price, $legacyInvId, $legacyQty]);
            }

            $db->commit();
            echo json_encode(["success" => true, "message" => "Product add-ons saved successfully."]);
            exit();
        }

        // 2. Save Category Addon Mapping
        if ($postAction === 'save_category_mapping') {
            $parentCat = trim($data['parent_category_name'] ?? ($data['target_category'] ?? ''));
            $rawAddons = $data['addons'] ?? [];
            $groupIds = $data['addon_group_ids'] ?? ($data['addon_category_ids'] ?? []);

            if (empty($parentCat)) {
                throw new Exception("Parent category name is required.");
            }

            // Find parent_category_id from categories table
            $parentCatStmt = $db->prepare("SELECT id FROM categories WHERE LOWER(name) = ?");
            $parentCatStmt->execute([strtolower($parentCat)]);
            $parentCatId = $parentCatStmt->fetchColumn() ?: null;

            // Fetch all available addon groups to map category names to group IDs
            $allGroups = $db->query("SELECT id, title, source_category_name FROM addon_groups")->fetchAll(PDO::FETCH_ASSOC);

            // Extract resolved Group IDs
            $resolvedGroupIds = [];

            if (is_array($groupIds)) {
                foreach ($groupIds as $gId) {
                    $intId = intval($gId);
                    if ($intId > 0) $resolvedGroupIds[] = $intId;
                }
            }

            if (is_array($rawAddons)) {
                foreach ($rawAddons as $ra) {
                    if (is_numeric($ra)) {
                        $resolvedGroupIds[] = intval($ra);
                        continue;
                    }
                    if (is_array($ra)) {
                        if (!empty($ra['addon_group_id'])) {
                            $resolvedGroupIds[] = intval($ra['addon_group_id']);
                            continue;
                        }
                        $catName = strtolower(trim($ra['addon_category'] ?? ($ra['title'] ?? '')));
                        if (!empty($catName)) {
                            $matchedId = null;
                            foreach ($allGroups as $grp) {
                                if (strtolower($grp['source_category_name']) === $catName || strtolower($grp['title']) === $catName || strpos(strtolower($grp['title']), $catName) !== false) {
                                    $matchedId = intval($grp['id']);
                                    break;
                                }
                            }
                            // Auto-create missing addon_groups record if not present
                            if (!$matchedId) {
                                $srcCatStmt = $db->prepare("SELECT id, name FROM categories WHERE LOWER(name) = ? LIMIT 1");
                                $srcCatStmt->execute([$catName]);
                                $srcCatRow = $srcCatStmt->fetch(PDO::FETCH_ASSOC);
                                $srcCatId = $srcCatRow['id'] ?? null;
                                $displayName = $srcCatRow['name'] ?? ucfirst($catName);

                                $newGrpStmt = $db->prepare("
                                    INSERT INTO addon_groups (title, subtitle, source_category_id, source_category_name, icon_type, is_active)
                                    VALUES (?, ?, ?, ?, 'addon', 1)
                                ");
                                $newGrpStmt->execute([
                                    strtoupper($displayName),
                                    "Select optional " . $displayName . " to complete your order",
                                    $srcCatId,
                                    $displayName
                                ]);
                                $matchedId = intval($db->lastInsertId());
                                $allGroups[] = [
                                    'id' => $matchedId,
                                    'title' => strtoupper($displayName),
                                    'source_category_name' => $displayName
                                ];
                            }
                            if ($matchedId > 0) {
                                $resolvedGroupIds[] = $matchedId;
                            }
                        }
                    }
                }
            }

            $resolvedGroupIds = array_unique($resolvedGroupIds);

            $db->beginTransaction();

            // Clear old mappings for this parent category
            $del = $db->prepare("DELETE FROM category_addon_mappings WHERE LOWER(parent_category_name) = ? OR parent_category_id = ?");
            $del->execute([strtolower($parentCat), $parentCatId]);

            $ins = $db->prepare("INSERT INTO category_addon_mappings (parent_category_id, parent_category_name, addon_group_id) VALUES (?, ?, ?)");

            foreach ($resolvedGroupIds as $grpIdInt) {
                if ($grpIdInt > 0) {
                    $ins->execute([$parentCatId, $parentCat, $grpIdInt]);
                }
            }

            $db->commit();
            echo json_encode(["success" => true, "message" => "Category mapping saved successfully."]);
            exit();
        }

        // 3. Delete Category Addon Mapping
        if ($postAction === 'delete_category_mapping') {
            $parentCat = trim($data['parent_category_name'] ?? ($data['target_category'] ?? ''));
            $mappingId = intval($data['id'] ?? ($data['mapping_id'] ?? 0));

            if ($mappingId > 0) {
                $del = $db->prepare("DELETE FROM category_addon_mappings WHERE id = ?");
                $del->execute([$mappingId]);
            } else if (!empty($parentCat)) {
                $del = $db->prepare("DELETE FROM category_addon_mappings WHERE LOWER(parent_category_name) = ?");
                $del->execute([strtolower($parentCat)]);
            } else {
                throw new Exception("Mapping ID or Category name required.");
            }

            echo json_encode(["success" => true, "message" => "Mapping removed successfully."]);
            exit();
        }

        // 4. Save Addon Group (Create/Update)
        if ($postAction === 'save_addon_group') {
            $groupId = intval($data['id'] ?? 0);
            $title = trim($data['title'] ?? '');
            $subtitle = trim($data['subtitle'] ?? '');
            $sourceCat = trim($data['source_category_name'] ?? '');
            $iconType = trim($data['icon_type'] ?? 'drink');

            if (empty($title) || empty($sourceCat)) {
                throw new Exception("Group title and Source Category are required.");
            }

            // Find category ID
            $catStmt = $db->prepare("SELECT id FROM categories WHERE LOWER(name) = ?");
            $catStmt->execute([strtolower($sourceCat)]);
            $srcCatId = $catStmt->fetchColumn() ?: null;

            if ($groupId > 0) {
                $stmt = $db->prepare("
                    UPDATE addon_groups 
                    SET title = ?, subtitle = ?, source_category_id = ?, source_category_name = ?, icon_type = ? 
                    WHERE id = ?
                ");
                $stmt->execute([$title, $subtitle, $srcCatId, $sourceCat, $iconType, $groupId]);
            } else {
                $stmt = $db->prepare("
                    INSERT INTO addon_groups (title, subtitle, source_category_id, source_category_name, icon_type, is_active) 
                    VALUES (?, ?, ?, ?, ?, 1)
                ");
                $stmt->execute([$title, $subtitle, $srcCatId, $sourceCat, $iconType]);
            }

            echo json_encode(["success" => true, "message" => "Addon group saved successfully."]);
            exit();
        }

        // 5. Delete Addon Group
        if ($postAction === 'delete_addon_group') {
            $groupId = intval($data['id'] ?? 0);
            if ($groupId <= 0) {
                throw new Exception("Invalid group ID.");
            }

            $db->beginTransaction();
            $db->prepare("DELETE FROM category_addon_mappings WHERE addon_group_id = ?")->execute([$groupId]);
            $db->prepare("DELETE FROM addon_groups WHERE id = ?")->execute([$groupId]);
            $db->commit();

            echo json_encode(["success" => true, "message" => "Addon group and related mappings deleted."]);
            exit();
        }

        throw new Exception("Unrecognized action: " . htmlspecialchars($postAction));
    }
} catch (Exception $e) {
    if (isset($db) && $db && $db->inTransaction()) {
        $db->rollBack();
    }
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>

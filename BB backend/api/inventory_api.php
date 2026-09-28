<?php
if (!ob_get_level()) {
    ob_start();
}

include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
require_role(['Admin', 'Manager', 'Chef', 'Kitchen', 'Cashier']);
include_once __DIR__ . '/../config/Database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception("Unable to connect to database.");
    }

    // Auto-create inventory table if missing
    $tableCheck = "CREATE TABLE IF NOT EXISTS inventory (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        stock DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        unit VARCHAR(50) NOT NULL DEFAULT 'pcs',
        threshold DECIMAL(10,2) NOT NULL DEFAULT 10.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    $db->exec($tableCheck);

    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

    switch ($method) {
        case 'GET':
            $search = trim($_GET['search'] ?? '');
            if ($search !== '') {
                $query = "SELECT * FROM inventory WHERE name LIKE :search ORDER BY id DESC";
                $stmt = $db->prepare($query);
                $stmt->execute([':search' => "%" . $search . "%"]);
                $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

                if (ob_get_level()) ob_clean();
                echo json_encode([
                    "success" => true,
                    "status" => "success",
                    "items" => $items ?: [],
                    "total" => count($items ?: []),
                    "has_more" => false,
                    "is_search" => true
                ]);
                exit();
            }

            if (isset($_GET['limit'])) {
                $limit = max(1, min(100, intval($_GET['limit'])));
                $offset = max(0, intval($_GET['offset'] ?? 0));

                $countStmt = $db->query("SELECT COUNT(*) FROM inventory");
                $total = (int)$countStmt->fetchColumn();

                $statsStmt = $db->query("
                    SELECT 
                        COUNT(*) as total_items,
                        SUM(CASE WHEN stock <= threshold AND stock > 0 THEN 1 ELSE 0 END) as low_stock,
                        SUM(price * stock) as total_value
                    FROM inventory
                ");
                $statsRow = $statsStmt ? $statsStmt->fetch(PDO::FETCH_ASSOC) : [];

                $query = "SELECT * FROM inventory ORDER BY id DESC LIMIT :limit OFFSET :offset";
                $stmt = $db->prepare($query);
                $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
                $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
                $stmt->execute();
                $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

                if (ob_get_level()) ob_clean();
                echo json_encode([
                    "success" => true,
                    "status" => "success",
                    "items" => $items ?: [],
                    "total" => $total,
                    "has_more" => ($offset + count($items)) < $total,
                    "limit" => $limit,
                    "offset" => $offset,
                    "stats" => [
                        "total_items" => (int)($statsRow['total_items'] ?? $total),
                        "low_stock" => (int)($statsRow['low_stock'] ?? 0),
                        "total_value" => number_format((float)($statsRow['total_value'] ?? 0), 2, '.', '')
                    ]
                ]);
                exit();
            }

            $query = "SELECT * FROM inventory ORDER BY id DESC";
            $stmt = $db->prepare($query);
            $stmt->execute();
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (ob_get_level()) ob_clean();
            echo json_encode($items ?: []);
            exit();

        case 'POST':
            $rawInput = file_get_contents("php://input");
            $data = json_decode($rawInput, true);
            if (!$data && !empty($_POST)) {
                $data = $_POST;
            }

            $name = trim($data['name'] ?? '');
            $price = isset($data['price']) ? floatval($data['price']) : null;
            $stock = isset($data['stock']) ? floatval($data['stock']) : null;
            $unit = !empty($data['unit']) ? trim($data['unit']) : 'pcs';
            $threshold = isset($data['threshold']) ? floatval($data['threshold']) : 10;

            if (empty($name) || $price === null || $stock === null) {
                throw new Exception("Name, price, and stock are required fields.");
            }

            $query = "INSERT INTO inventory (name, price, stock, unit, threshold) VALUES (:name, :price, :stock, :unit, :threshold)";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":name", $name);
            $stmt->bindParam(":price", $price);
            $stmt->bindParam(":stock", $stock);
            $stmt->bindParam(":unit", $unit);
            $stmt->bindParam(":threshold", $threshold);

            if ($stmt->execute()) {
                if (ob_get_level()) ob_clean();
                echo json_encode([
                    "status" => "success",
                    "message" => "Item added successfully.",
                    "id" => $db->lastInsertId()
                ]);
                exit();
            } else {
                throw new Exception("Failed to add inventory item.");
            }

        case 'PUT':
            $rawInput = file_get_contents("php://input");
            $data = json_decode($rawInput, true);
            if (!$data && !empty($_POST)) {
                $data = $_POST;
            }

            $id = isset($data['id']) ? intval($data['id']) : 0;
            $name = trim($data['name'] ?? '');
            $price = isset($data['price']) ? floatval($data['price']) : null;
            $stock = isset($data['stock']) ? floatval($data['stock']) : null;
            $unit = !empty($data['unit']) ? trim($data['unit']) : 'pcs';
            $threshold = isset($data['threshold']) ? floatval($data['threshold']) : 10;

            if ($id <= 0 || empty($name) || $price === null || $stock === null) {
                throw new Exception("Valid ID, name, price, and stock are required.");
            }

            $query = "UPDATE inventory SET name=:name, price=:price, stock=:stock, unit=:unit, threshold=:threshold WHERE id=:id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":name", $name);
            $stmt->bindParam(":price", $price);
            $stmt->bindParam(":stock", $stock);
            $stmt->bindParam(":unit", $unit);
            $stmt->bindParam(":threshold", $threshold);
            $stmt->bindParam(":id", $id);

            if ($stmt->execute()) {
                if (ob_get_level()) ob_clean();
                echo json_encode([
                    "status" => "success",
                    "message" => "Item updated successfully."
                ]);
                exit();
            } else {
                throw new Exception("Failed to update inventory item.");
            }

        case 'DELETE':
            $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
            if ($id <= 0) {
                // Check JSON body if id is not in query params
                $data = json_decode(file_get_contents("php://input"), true);
                $id = isset($data['id']) ? intval($data['id']) : 0;
            }

            if ($id <= 0) {
                throw new Exception("Valid item ID is required for deletion.");
            }

            // 1. Identify all menu items associated with this inventory item:
            // a) Directly via menu_items.inventory_id = :id
            // b) Indirectly via recipes.inventory_id = :id
            $findMenuStmt = $db->prepare("
                SELECT DISTINCT m.id, m.img 
                FROM menu_items m 
                LEFT JOIN recipes r ON m.id = r.menu_item_id 
                WHERE m.inventory_id = ? OR r.inventory_id = ?
            ");
            $findMenuStmt->execute([$id, $id]);
            $associatedMenuItems = $findMenuStmt->fetchAll(PDO::FETCH_ASSOC);
            $menuItemIds = array_column($associatedMenuItems, 'id');

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

                // Clean up any remaining recipe and addon links for this inventory item
                $db->prepare("DELETE FROM recipes WHERE inventory_id = ?")->execute([$id]);
                $db->prepare("DELETE FROM menu_addons WHERE inventory_id = ?")->execute([$id]);

                // Delete the inventory item
                $delInvStmt = $db->prepare("DELETE FROM inventory WHERE id = ?");
                $delInvStmt->execute([$id]);

                $db->commit();

                // Broadcast socket trigger to update connected clients
                include_once __DIR__ . '/../config/SocketBroadcaster.php';
                SocketBroadcaster::broadcastOrderTrigger([
                    'type' => 'menu_updated',
                    'action' => 'inventory_deleted',
                    'inventory_id' => $id,
                    'deleted_menu_items_count' => count($menuItemIds)
                ]);

                if (ob_get_level()) ob_clean();
                echo json_encode([
                    "status" => "success",
                    "success" => true,
                    "message" => "Inventory item and " . count($menuItemIds) . " associated menu items deleted successfully.",
                    "deleted_menu_items_count" => count($menuItemIds)
                ]);
                exit();

            } catch (Exception $delEx) {
                if ($db->inTransaction()) {
                    $db->rollBack();
                }
                throw new Exception("Failed to delete inventory item: " . $delEx->getMessage());
            }

        default:
            http_response_code(405);
            throw new Exception("Method not allowed.");
    }
} catch (Exception $e) {
    if (ob_get_level()) ob_clean();
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage(),
        "data" => []
    ]);
    exit();
}
?>
<?php
require_once __DIR__ . '/../config/Database.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    die("Database connection failed.\n");
}

echo "=== Running Performance Index Migration ===\n\n";

$indexesToAdd = [
    'orders' => [
        'idx_orders_status' => "ALTER TABLE `orders` ADD INDEX `idx_orders_status` (`status`)",
        'idx_orders_created_at' => "ALTER TABLE `orders` ADD INDEX `idx_orders_created_at` (`created_at`)",
        'idx_orders_status_created' => "ALTER TABLE `orders` ADD INDEX `idx_orders_status_created` (`status`, `created_at`)",
        'idx_orders_rider_id' => "ALTER TABLE `orders` ADD INDEX `idx_orders_rider_id` (`rider_id`)",
    ],
    'recipes' => [
        'idx_recipes_menu_inv' => "ALTER TABLE `recipes` ADD INDEX `idx_recipes_menu_inv` (`menu_item_id`, `inventory_id`)",
    ],
    'menu_items' => [
        'idx_menu_category' => "ALTER TABLE `menu_items` ADD INDEX `idx_menu_category` (`category`)",
        'idx_menu_available' => "ALTER TABLE `menu_items` ADD INDEX `idx_menu_available` (`isAvailable`)",
    ],
    'order_reviews' => [
        'idx_reviews_status' => "ALTER TABLE `order_reviews` ADD INDEX `idx_reviews_status` (`status`)",
    ]
];

foreach ($indexesToAdd as $table => $indexes) {
    echo "Checking table: `{$table}`...\n";
    
    // Check existing indexes
    $existingIndexes = [];
    try {
        $stmt = $db->query("SHOW INDEX FROM `{$table}`");
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $existingIndexes[$row['Key_name']] = true;
        }
    } catch (Exception $e) {
        echo "  [WARN] Table `{$table}` does not exist or cannot be inspected: " . $e->getMessage() . "\n";
        continue;
    }

    foreach ($indexes as $indexName => $alterSql) {
        if (isset($existingIndexes[$indexName])) {
            echo "  [SKIP] Index `{$indexName}` already exists on `{$table}`.\n";
        } else {
            try {
                $db->exec($alterSql);
                echo "  [OK] Added index `{$indexName}` to `{$table}`.\n";
            } catch (Exception $e) {
                echo "  [ERROR] Failed to add `{$indexName}` to `{$table}`: " . $e->getMessage() . "\n";
            }
        }
    }
    echo "\n";
}

echo "=== Migration Complete ===\n";

<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once '../config/Database.php';

$database = new Database();
$db = $database->getConnection();

try {
    // Auto-deactivate deals whose day limit has expired
    $db->exec("UPDATE deals SET is_active = 0 WHERE is_active = 1 AND expires_at IS NOT NULL AND expires_at <= NOW()");

    $query = "SELECT * FROM deals ORDER BY id DESC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $deals = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($deals as &$deal) {
        $deal_id = $deal['id'];
        
        $itemQuery = "SELECT id, menu_item_id, category, item_title, size, flavor_name, flavor_mode, quantity, is_customizable, choice_group_name, options_json 
                      FROM deal_items 
                      WHERE deal_id = :deal_id 
                      ORDER BY id ASC";
                      
        $itemStmt = $db->prepare($itemQuery);
        $itemStmt->execute([':deal_id' => $deal_id]);
        $rawItems = $itemStmt->fetchAll(PDO::FETCH_ASSOC);
        
        $itemsList = [];
        foreach ($rawItems as $it) {
            $options = null;
            if (!empty($it['options_json'])) {
                $options = is_string($it['options_json']) ? json_decode($it['options_json'], true) : $it['options_json'];
            }

            $itemsList[] = [
                'id' => $it['id'],
                'menu_item_id' => intval($it['menu_item_id'] ?? 0),
                'category' => $it['category'] ?? '',
                'item_title' => $it['item_title'],
                'size' => $it['size'] ?? 'Regular',
                'flavor_name' => $it['flavor_name'] ?? '',
                'flavor_mode' => $it['flavor_mode'] ?? 'fixed',
                'quantity' => intval($it['quantity'] ?? 1),
                'is_customizable' => intval($it['is_customizable'] ?? 0) === 1,
                'choice_group_name' => $it['choice_group_name'] ?? '',
                'options' => $options ?? []
            ];
        }

        $deal['items'] = $itemsList;
        $deal['badge_tag'] = $deal['badge_tag'] ?? $deal['tag'] ?? 'DEAL';
        $deal['day_limit'] = !empty($deal['day_limit']) ? intval($deal['day_limit']) : null;
        $deal['expires_at'] = $deal['expires_at'] ?? null;
        $deal['is_expired'] = (!empty($deal['expires_at']) && strtotime($deal['expires_at']) <= time());
    }

    echo json_encode(["success" => true, "data" => $deals]);
} catch(PDOException $e) {
    echo json_encode(["success" => false, "message" => "DB Error: " . $e->getMessage()]);
}
?>
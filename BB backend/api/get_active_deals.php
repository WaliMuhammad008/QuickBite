<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/Database.php';

$database = new Database();
$db = $database->getConnection();

include_once __DIR__ . '/../config/DealInventoryHelper.php';

try {
    // Auto-deactivate deals whose day limit has expired
    $db->exec("UPDATE deals SET is_active = 0 WHERE is_active = 1 AND expires_at IS NOT NULL AND expires_at <= NOW()");

    // Initialize inventory and recipe helper
    DealInventoryHelper::init($db);

    date_default_timezone_set('Asia/Karachi');
    $current_time = date('H:i:s');

    // Fetch all active deals; deals outside their time window will be marked with is_time_active = false
    $query = "SELECT * FROM deals 
              WHERE is_active = 1 
              AND (expires_at IS NULL OR expires_at > NOW())
              ORDER BY id DESC";

    $stmt = $db->prepare($query);
    $stmt->execute();
    $deals = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($deals as &$deal) {
        $deal_id = $deal['id'];
        
        // Time window active evaluation
        $isPermanent = intval($deal['is_permanent'] ?? 1) === 1;
        $isTimeActive = true;
        $timeWindowText = "";

        if (!$isPermanent && !empty($deal['start_time']) && !empty($deal['end_time'])) {
            $st = $deal['start_time'];
            $et = $deal['end_time'];

            $start_ts = strtotime($st);
            $end_ts = strtotime($et);
            $curr_ts = strtotime($current_time);

            if ($end_ts > $start_ts) {
                // Same-day window e.g. 12:00 to 16:00
                $isTimeActive = ($curr_ts >= $start_ts && $curr_ts <= $end_ts);
            } else {
                // Overnight window e.g. 20:00 to 02:00
                $isTimeActive = ($curr_ts >= $start_ts || $curr_ts <= $end_ts);
            }

            $timeWindowText = date("h:i A", $start_ts) . " - " . date("h:i A", $end_ts);
        }

        $deal['is_time_active'] = $isTimeActive;
        $deal['isTimeActive'] = $isTimeActive;
        $deal['time_window_text'] = $timeWindowText;

        // Fetch structured deal items
        $itemQuery = "SELECT id, menu_item_id, category, item_title, size, flavor_name, flavor_mode, quantity, is_customizable, choice_group_name, options_json 
                      FROM deal_items 
                      WHERE deal_id = :deal_id 
                      ORDER BY id ASC";
                      
        $itemStmt = $db->prepare($itemQuery);
        $itemStmt->execute([':deal_id' => $deal_id]);
        $rawItems = $itemStmt->fetchAll(PDO::FETCH_ASSOC);

        // Process stock cascading across slots and flavor options
        DealInventoryHelper::processDeal($deal, $rawItems);
    }

    echo json_encode(["success" => true, "data" => $deals]);
} catch(PDOException $e) {
    echo json_encode(["success" => false, "message" => "DB Error: " . $e->getMessage()]);
}
?>
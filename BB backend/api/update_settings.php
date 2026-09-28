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

$data = json_decode(file_get_contents("php://input"), true);

if ($data && is_array($data)) {
    try {
        $db->beginTransaction();

        $query = "INSERT INTO settings (setting_key, setting_value) VALUES (:key, :val) 
                  ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)";
        $stmt = $db->prepare($query);

        // Key aliases for seamless bidirectional synchronization
        $aliasMap = [
            'store_address' => 'restaurant_address',
            'restaurant_address' => 'store_address',
            'contact_phone' => 'restaurant_phone',
            'restaurant_phone' => 'contact_phone',
            'admin_email' => 'restaurant_email',
            'restaurant_email' => 'admin_email',
            'about_journey_text' => 'about_us',
            'about_us' => 'about_journey_text',
            'about_mission_text' => 'about_us_mission',
            'about_us_mission' => 'about_mission_text',
            'privacy_overview_text' => 'privacy_policy',
            'privacy_policy' => 'privacy_overview_text',
            'terms_agreement_text' => 'terms_and_conditions',
            'terms_and_conditions' => 'terms_agreement_text',
            'delivery_fee' => 'default_delivery_fee',
            'default_delivery_fee' => 'delivery_fee',
            'store_lat' => 'restaurant_lat',
            'restaurant_lat' => 'store_lat',
            'store_lng' => 'restaurant_lng',
            'restaurant_lng' => 'store_lng'
        ];

        foreach ($data as $key => $value) {
            // Ignore extra frontend helper keys
            if (in_array($key, ['old_logo', 'original_logo'])) continue;

            if (is_bool($value)) {
                $valStr = $value ? '1' : '0';
            } elseif (is_null($value)) {
                $valStr = '';
            } elseif (is_array($value)) {
                $valStr = json_encode($value);
            } else {
                $valStr = (string)$value;
            }

            $stmt->bindValue(':key', $key);
            $stmt->bindValue(':val', $valStr);
            $stmt->execute();

            // Also keep synchronized alias key updated
            if (isset($aliasMap[$key]) && !isset($data[$aliasMap[$key]])) {
                $stmt->bindValue(':key', $aliasMap[$key]);
                $stmt->bindValue(':val', $valStr);
                $stmt->execute();
            }
        }

        $db->commit();

        // Broadcast real-time settings change to all connected staff and customer portals
        include_once __DIR__ . '/../config/SocketBroadcaster.php';
        SocketBroadcaster::broadcastOrderTrigger(['type' => 'settings_updated']);

        echo json_encode([
            "success" => true, 
            "message" => "Settings updated successfully"
        ]);

    } catch(PDOException $e) {
        $db->rollBack();
        http_response_code(500);
        echo json_encode([
            "success" => false, 
            "message" => "Database Error: " . $e->getMessage()
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode([
        "success" => false, 
        "message" => "Invalid or no data received"
    ]);
}
?>
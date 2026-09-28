<?php
include_once __DIR__ . '/../config/cors_headers.php';

include_once '../config/Database.php';
$database = new Database();
$db = $database->getConnection();

try {
    // 1. Get Shift Timings from Settings
    $stmtSettings = $db->query("SELECT setting_key, setting_value FROM settings WHERE setting_key IN ('morning_shift', 'evening_shift', 'night_shift')");
    $settingsData = $stmtSettings->fetchAll(PDO::FETCH_ASSOC);
    
    $timings = [
        "Morning" => "08:00 AM - 04:00 PM",
        "Evening" => "04:00 PM - 12:00 AM",
        "Night" => "12:00 AM - 08:00 AM"
    ];

    foreach($settingsData as $row) {
        if($row['setting_key'] == 'morning_shift') $timings['Morning'] = $row['setting_value'];
        if($row['setting_key'] == 'evening_shift') $timings['Evening'] = $row['setting_value'];
        if($row['setting_key'] == 'night_shift') $timings['Night'] = $row['setting_value'];
    }

    // 2. Get Staff
    $stmtStaff = $db->query("SELECT id, name, role, shift FROM staff WHERE status = 'Active'");
    $staff = $stmtStaff->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "timings" => $timings, "data" => $staff]);

} catch(PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database Error: " . $e->getMessage()]);
}
?>
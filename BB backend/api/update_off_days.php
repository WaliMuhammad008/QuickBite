<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
require_role(['Admin', 'Manager']);
include_once '../config/Database.php';
$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (isset($data->off_days) && is_numeric($data->off_days) && $data->off_days >= 0) {
    try {
        // Upsert: update agar row exist kare warna insert karo
        $check = $db->prepare("SELECT COUNT(*) FROM settings WHERE setting_key = 'monthly_off_days'");
        $check->execute();
        $exists = $check->fetchColumn();

        if ($exists) {
            $stmt = $db->prepare("UPDATE settings SET setting_value = :val WHERE setting_key = 'monthly_off_days'");
        } else {
            $stmt = $db->prepare("INSERT INTO settings (setting_key, setting_value) VALUES ('monthly_off_days', :val)");
        }

        $stmt->execute([':val' => (int)$data->off_days]);
        echo json_encode(["success" => true, "message" => "Off days updated to " . (int)$data->off_days]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "DB Error: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid off_days value provided."]);
}
?>

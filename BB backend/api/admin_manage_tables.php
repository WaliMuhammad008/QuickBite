<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
require_role(['Admin', 'Manager', 'Cashier']);
include_once __DIR__ . '/../config/Database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $db->query("SELECT * FROM restaurant_tables ORDER BY created_at DESC");
        $tables = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $stmt2 = $db->query("SELECT setting_value FROM settings WHERE setting_key = 'qr_base_url'");
        $qrSetting = $stmt2->fetch(PDO::FETCH_ASSOC);
        $qrBaseUrl = $qrSetting ? $qrSetting['setting_value'] : "";
        
        echo json_encode(["success" => true, "data" => $tables, "qr_base_url" => $qrBaseUrl]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    
    if (isset($data->action) && $data->action === 'add') {
        if (empty($data->table_name)) {
            echo json_encode(["success" => false, "message" => "Table name is required"]);
            exit;
        }
        try {
            $stmt = $db->prepare("INSERT INTO restaurant_tables (table_name) VALUES (:name)");
            $stmt->execute([':name' => $data->table_name]);
            echo json_encode(["success" => true, "message" => "Table added successfully", "id" => $db->lastInsertId()]);
        } catch (PDOException $e) {
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
    } elseif (isset($data->action) && $data->action === 'toggle_status') {
        if (empty($data->id)) {
            echo json_encode(["success" => false, "message" => "Table ID is required"]);
            exit;
        }
        try {
            $stmt = $db->prepare("UPDATE restaurant_tables SET status = NOT status WHERE id = :id");
            $stmt->execute([':id' => $data->id]);
            echo json_encode(["success" => true, "message" => "Table status updated"]);
        } catch (PDOException $e) {
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
    } elseif (isset($data->action) && $data->action === 'delete') {
        if (empty($data->id)) {
            echo json_encode(["success" => false, "message" => "Table ID is required"]);
            exit;
        }
        try {
            $stmt = $db->prepare("DELETE FROM restaurant_tables WHERE id = :id");
            $stmt->execute([':id' => $data->id]);
            echo json_encode(["success" => true, "message" => "Table deleted successfully"]);
        } catch (PDOException $e) {
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
    } elseif (isset($data->action) && $data->action === 'save_qr_base_url') {
        try {
            $val = isset($data->url) ? trim($data->url) : "";
            $stmt = $db->prepare("INSERT INTO settings (setting_key, setting_value) VALUES ('qr_base_url', :val) ON DUPLICATE KEY UPDATE setting_value = :val");
            $stmt->execute([':val' => $val]);
            echo json_encode(["success" => true, "message" => "QR Link saved successfully"]);
        } catch (PDOException $e) {
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "Invalid action"]);
    }
}
?>

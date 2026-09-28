<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
include_once '../config/Database.php';
$database = new Database();
$db = $database->getConnection();
$data = json_decode(file_get_contents("php://input"));

if(!empty($data->Morning) && !empty($data->Evening) && !empty($data->Night)) {
    try {
        $db->beginTransaction();

        $stmt = $db->prepare("UPDATE settings SET setting_value = :val WHERE setting_key = :key");
        $stmt->execute([':val' => $data->Morning, ':key' => 'morning_shift']);
        $stmt->execute([':val' => $data->Evening, ':key' => 'evening_shift']);
        $stmt->execute([':val' => $data->Night, ':key' => 'night_shift']);

        $db->commit();
        echo json_encode(["success" => true, "message" => "Timings updated!"]);
    } catch(PDOException $e) {
        $db->rollBack();
        echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Incomplete data."]);
}
?>
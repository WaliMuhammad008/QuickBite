<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
include_once '../config/Database.php';
$database = new Database();
$db = $database->getConnection();
$data = json_decode(file_get_contents("php://input"));

if(!empty($data->staff_id) && !empty($data->shift)) {
    try {
        $stmt = $db->prepare("UPDATE staff SET shift = :shift WHERE id = :id");
        $stmt->execute([':shift' => $data->shift, ':id' => $data->staff_id]);
        echo json_encode(["success" => true, "message" => "Shift updated!"]);
    } catch(PDOException $e) {
        echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Incomplete data."]);
}
?>
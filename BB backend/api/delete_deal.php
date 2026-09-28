<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
require_role(['Admin', 'Manager']);
include_once __DIR__ . '/../config/Database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id)) {
    try {
        $delItems = $db->prepare("DELETE FROM deal_items WHERE deal_id = :id");
        $delItems->execute([':id' => $data->id]);

        $query = "DELETE FROM deals WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->execute([':id' => $data->id]);
        echo json_encode(["success" => true, "message" => "Deal Deleted!"]);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Deal ID is missing."]);
}
?>
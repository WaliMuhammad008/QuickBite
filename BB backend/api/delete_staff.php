<?php
if (ob_get_level()) ob_clean();
ob_start();

include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
require_role(['Admin', 'Manager']);
include_once __DIR__ . '/../config/Database.php';

header('Content-Type: application/json; charset=utf-8');

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->id)) {
    try {
        if (!$db->inTransaction()) {
            $db->beginTransaction();
        }

        // Clean up rider record if exists
        $riderStmt = $db->prepare("DELETE FROM rider WHERE staff_id = :id");
        $riderStmt->execute([':id' => $data->id]);

        $query = "DELETE FROM staff WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":id", $data->id);
        $stmt->execute();

        if ($db->inTransaction()) {
            $db->commit();
        }

        if (ob_get_level()) ob_clean();
        echo json_encode(["success" => true, "message" => "Staff member deleted successfully."]);
    } catch(PDOException $e) {
        if (isset($db) && $db instanceof PDO && $db->inTransaction()) {
            $db->rollBack();
        }
        if (ob_get_level()) ob_clean();
        echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
    }
} else {
    if (ob_get_level()) ob_clean();
    echo json_encode(["success" => false, "message" => "No ID provided."]);
}
?>
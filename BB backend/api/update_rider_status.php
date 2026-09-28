<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
include_once '../config/Database.php';
$database = new Database();
$db = $database->getConnection();
$data = json_decode(file_get_contents("php://input"));

if(isset($data->status)) {
    // Prevent IDOR: target authenticated user's ID, allow override only for Admin/Dispatcher
    $target_id = $auth_user['user_id'];
    if (!empty($data->id) && $data->id != $auth_user['user_id']) {
        if (in_array(strtolower($auth_user['role']), ['admin', 'dispatcher'])) {
            $target_id = $data->id;
        } else {
            http_response_code(403);
            echo json_encode(["success" => false, "message" => "Unauthorized to update another user's status."]);
            exit();
        }
    }

    try {
        $db->beginTransaction();

        // 1. Staff Table me 'shift_status' update karo
        $query1 = "UPDATE staff SET shift_status = :status WHERE id = :id";
        $stmt1 = $db->prepare($query1);
        $stmt1->execute([
            ':status' => $data->status,
            ':id' => $target_id
        ]);

        // 2. Rider Table me sirf location update karo (Status nahi)
        if(isset($data->lat) && isset($data->lng)) {
            $query2 = "UPDATE rider SET lat = :lat, lng = :lng WHERE staff_id = :id";
            $stmt2 = $db->prepare($query2);
            $stmt2->execute([
                ':lat' => $data->lat,
                ':lng' => $data->lng,
                ':id' => $target_id
            ]);
        }

        $db->commit();
        echo json_encode(["success" => true, "message" => "Status updated successfully"]);

    } catch(PDOException $e) {
        $db->rollBack();
        echo json_encode(["success" => false, "message" => "Database Error: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Incomplete details provided."]);
}
?>
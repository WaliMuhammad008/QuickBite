<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
include_once __DIR__ . '/../config/Database.php';

$database = new Database();
$db = $database->getConnection();
$data = json_decode(file_get_contents("php://input"));

if (!empty($data->lat) && !empty($data->lng)) {
    // Target authenticated user's ID, allow override only for Admin/Dispatcher
    $target_id = $auth_user['user_id'];
    if (!empty($data->id) && $data->id != $auth_user['user_id']) {
        if (in_array(strtolower($auth_user['role'] ?? ''), ['admin', 'dispatcher'])) {
            $target_id = $data->id;
        } else {
            http_response_code(403);
            echo json_encode(["success" => false, "message" => "Unauthorized to update another user's location."]);
            exit();
        }
    }

    try {
        // Location is stored in rider table associated with staff_id
        $query = "UPDATE rider SET lat = :lat, lng = :lng WHERE staff_id = :id";
        $stmt = $db->prepare($query);
        $stmt->execute([
            ':lat' => $data->lat,
            ':lng' => $data->lng,
            ':id'  => $target_id
        ]);

        if ($stmt->rowCount() === 0) {
            // If rider record doesn't exist yet, check and insert
            $chk = $db->prepare("SELECT id FROM rider WHERE staff_id = :id");
            $chk->execute([':id' => $target_id]);
            if ($chk->rowCount() === 0) {
                $ins = $db->prepare("INSERT INTO rider (staff_id, lat, lng, trips_completed) VALUES (:id, :lat, :lng, 0)");
                $ins->execute([
                    ':id'  => $target_id,
                    ':lat' => $data->lat,
                    ':lng' => $data->lng
                ]);
            }
        }

        echo json_encode(["success" => true, "message" => "Location updated successfully."]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "Database Error: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Incomplete details."]);
}
?>
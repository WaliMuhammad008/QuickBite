<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
include_once '../config/Database.php';
$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->date) && !empty($data->attendance) && is_array($data->attendance)) {
    try {
        $db->beginTransaction();

        foreach($data->attendance as $record) {
            $staff_id = $record->staff_id;
            $status = $record->status;
            $time = isset($record->time) ? $record->time : null; // Naya time field
            $date = $data->date;

            // Check if attendance already exists for this date
            $checkQuery = "SELECT id FROM attendance WHERE staff_id = :staff_id AND date = :date";
            $checkStmt = $db->prepare($checkQuery);
            $checkStmt->execute([':staff_id' => $staff_id, ':date' => $date]);

            if($checkStmt->rowCount() > 0) {
                // Update
                $updateQuery = "UPDATE attendance SET status = :status, check_in_time = :time WHERE staff_id = :staff_id AND date = :date";
                $updateStmt = $db->prepare($updateQuery);
                $updateStmt->execute([':status' => $status, ':time' => $time, ':staff_id' => $staff_id, ':date' => $date]);
            } else {
                // Insert
                $insertQuery = "INSERT INTO attendance (staff_id, date, status, check_in_time) VALUES (:staff_id, :date, :status, :time)";
                $insertStmt = $db->prepare($insertQuery);
                $insertStmt->execute([':staff_id' => $staff_id, ':date' => $date, ':status' => $status, ':time' => $time]);
            }
        }

        $db->commit();
        echo json_encode(["success" => true, "message" => "Sheet saved successfully!"]);

    } catch(PDOException $e) {
        $db->rollBack();
        echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Incomplete data provided."]);
}
?>
<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/Database.php';

$database = new Database();
$db = $database->getConnection();

try {
    // 1. If a specific date is requested (for AttendanceSheet.jsx daily matrix)
    if (!empty($_GET['date'])) {
        $date = $_GET['date'];
        $query = "SELECT 
                    s.id, 
                    s.name, 
                    s.role,
                    COALESCE(a.status, 'Present') as status,
                    COALESCE(DATE_FORMAT(a.check_in_time, '%H:%i'), '09:00') as time,
                    a.id as attendance_id
                  FROM staff s
                  LEFT JOIN attendance a ON s.id = a.staff_id AND a.date = :date
                  WHERE s.status = 'Active'
                  ORDER BY s.id ASC";
        $stmt = $db->prepare($query);
        $stmt->execute([':date' => $date]);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["success" => true, "date" => $date, "data" => $results]);
        exit();
    }

    // 2. Month-specific or default current month performance summary (for AttendanceHistory.jsx)
    $target_month = !empty($_GET['month']) ? $_GET['month'] : date('Y-m');

    $query = "SELECT 
                s.id, 
                s.name, 
                COALESCE(SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END), 0) as present,
                COALESCE(SUM(CASE WHEN a.status = 'Absent' THEN 1 ELSE 0 END), 0) as absent,
                COALESCE(SUM(CASE WHEN a.status = 'Late' THEN 1 ELSE 0 END), 0) as late
              FROM staff s
              LEFT JOIN attendance a ON s.id = a.staff_id AND DATE_FORMAT(a.date, '%Y-%m') = :target_month
              WHERE s.status = 'Active'
              GROUP BY s.id, s.name
              ORDER BY s.id ASC";

    $stmt = $db->prepare($query);
    $stmt->execute([':target_month' => $target_month]);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "month" => $target_month, "data" => $results]);

} catch(PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
}
?>
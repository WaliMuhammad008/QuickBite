<?php
include_once __DIR__ . '/../config/cors_headers.php';

include_once __DIR__ . '/../config/auth_middleware.php';
require_role(['Admin', 'Manager']);

include_once '../config/Database.php';
$database = new Database();
$db = $database->getConnection();

try {
    // 1. Get Monthly Off Days (admin-configured, default: 4)
    $offStmt = $db->query("SELECT setting_value FROM settings WHERE setting_key = 'monthly_off_days'");
    $offRow   = $offStmt->fetch(PDO::FETCH_ASSOC);
    $off_days = $offRow ? (int)$offRow['setting_value'] : 4;

    // 2. Auto-detect total calendar days in the current month
    $total_days   = (int)date('t');          // e.g. 31 for May
    $working_days = max(1, $total_days - $off_days);  // prevent division by zero

    $current_month = date('Y-m');

    // 3. Get Staff list with absents count and paid status for this month
    $query = "SELECT 
                s.id, s.name, s.role, s.salary,
                (SELECT COUNT(*) FROM attendance a 
                 WHERE a.staff_id = s.id 
                   AND a.status = 'Absent' 
                   AND DATE_FORMAT(a.date, '%Y-%m') = :curr_month) AS absents,
                (SELECT COUNT(*) FROM payroll p 
                 WHERE p.staff_id = s.id 
                   AND p.month = :curr_month) AS is_paid
              FROM staff s 
              WHERE s.status = 'Active'";

    $stmt = $db->prepare($query);
    $stmt->execute([':curr_month' => $current_month]);
    $staff = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success"      => true,
        "off_days"     => $off_days,
        "total_days"   => $total_days,
        "working_days" => $working_days,
        "current_month" => date('F Y'),
        "data"         => $staff
    ]);

} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "DB Error: " . $e->getMessage()]);
}
?>
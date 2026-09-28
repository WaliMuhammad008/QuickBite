<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
require_role(['Admin', 'Manager']);
include_once '../config/Database.php';

$database = new Database();
$db = $database->getConnection();
$data = json_decode(file_get_contents("php://input"));

if (isset($data->staff_id) && isset($data->salary) && isset($data->absents) && isset($data->net_pay)) {
    try {
        $month = !empty($data->month) ? trim($data->month) : date('Y-m');
        $staff_id = intval($data->staff_id);

        $db->beginTransaction();

        // Concurrency Lock: Check if already paid for this month to prevent duplicate disbursements
        $checkStmt = $db->prepare("SELECT id, paid_on, net_pay FROM payroll WHERE staff_id = :staff_id AND month = :month FOR UPDATE");
        $checkStmt->execute([':staff_id' => $staff_id, ':month' => $month]);
        $existing = $checkStmt->fetch(PDO::FETCH_ASSOC);

        if ($existing) {
            $db->rollBack();
            http_response_code(409); // Conflict
            echo json_encode([
                "success" => false, 
                "message" => "Salary for month {$month} has already been disbursed to this employee (Transaction #{$existing['id']}).",
                "code" => "DUPLICATE_PAYOUT"
            ]);
            exit();
        }

        $basicSalary = floatval($data->salary);
        $absents = intval($data->absents);
        $netPay = floatval($data->net_pay);
        $deduction = max(0.0, round($basicSalary - $netPay, 2));

        $stmt = $db->prepare("INSERT INTO payroll (staff_id, month, basic_salary, absents, deduction, net_pay) 
                              VALUES (:staff_id, :month, :salary, :absents, :deduction, :net_pay)");
        
        $stmt->execute([
            ':staff_id' => $staff_id,
            ':month' => $month,
            ':salary' => $basicSalary,
            ':absents' => $absents,
            ':deduction' => $deduction,
            ':net_pay' => $netPay
        ]);

        $payoutId = $db->lastInsertId();
        $db->commit();
        
        echo json_encode([
            "success" => true, 
            "message" => "Salary paid successfully!",
            "payout_id" => $payoutId,
            "staff_id" => $staff_id,
            "month" => $month,
            "net_pay" => $netPay
        ]);
    } catch(PDOException $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Database Error: " . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Incomplete data provided. staff_id, salary, absents, and net_pay are required."]);
}
?>
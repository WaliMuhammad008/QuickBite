<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/Database.php';

$database = new Database();
$db = $database->getConnection();

$data = [];
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    if (!empty($rawInput)) {
        $json = json_decode($rawInput, true);
        if (is_array($json)) {
            $data = $json;
        }
    }
    if (empty($data) && !empty($_POST)) {
        $data = $_POST;
    }
}

$customerId = (int)($data['customer_id'] ?? ($_GET['customer_id'] ?? 0));
$phone = trim($data['phone'] ?? ($data['customer_mobile'] ?? ($_GET['phone'] ?? ($_GET['customer_mobile'] ?? ''))));
$email = trim($data['email'] ?? ($data['customer_email'] ?? ($_GET['email'] ?? ($_GET['customer_email'] ?? ''))));

if (!$customerId && empty($phone) && empty($email)) {
    echo json_encode(['success' => false, 'message' => 'Customer identification required.', 'orders' => []]);
    exit();
}

try {
    $custPhone = $phone;
    $custEmail = $email;

    // If customerId is provided, pull associated phone and email from customer_users
    if ($customerId > 0) {
        $uStmt = $db->prepare("SELECT phone, email FROM customer_users WHERE id = :cid LIMIT 1");
        $uStmt->execute([':cid' => $customerId]);
        $uRow = $uStmt->fetch(PDO::FETCH_ASSOC);
        if ($uRow) {
            if (empty($custPhone) && !empty($uRow['phone'])) {
                $custPhone = $uRow['phone'];
            }
            if (empty($custEmail) && !empty($uRow['email'])) {
                $custEmail = $uRow['email'];
            }
        }
    }

    $cleanPhone = !empty($custPhone) ? preg_replace('/[^0-9]/', '', $custPhone) : '';

    $whereClauses = [];
    $params = [];

    if ($customerId > 0) {
        $whereClauses[] = "o.customer_id = :cid";
        $params[':cid'] = $customerId;
    }

    if (!empty($custPhone)) {
        $whereClauses[] = "o.customer_mobile = :cphone";
        $params[':cphone'] = $custPhone;
        if (!empty($cleanPhone) && $cleanPhone !== $custPhone) {
            $whereClauses[] = "o.customer_mobile = :cleanPhone";
            $params[':cleanPhone'] = $cleanPhone;
        }
    }

    $whereSql = implode(' OR ', $whereClauses);
    if (empty($whereSql)) {
        $whereSql = "1=0";
    }

    $sql = "SELECT DISTINCT o.* FROM orders o WHERE {$whereSql} ORDER BY o.id DESC LIMIT 50";
    $stmt = $db->prepare($sql);
    $stmt->execute($params);

    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($orders as &$ord) {
        $itemStmt = $db->prepare("SELECT * FROM order_items WHERE order_id = :oid");
        $itemStmt->execute([':oid' => $ord['id']]);
        $ord['items'] = $itemStmt->fetchAll(PDO::FETCH_ASSOC);
    }

    echo json_encode(['success' => true, 'orders' => $orders]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error fetching customer orders: ' . $e->getMessage(), 'orders' => []]);
}

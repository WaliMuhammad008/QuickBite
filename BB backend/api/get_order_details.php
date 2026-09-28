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

$order_id = isset($data['id']) ? intval($data['id']) : (isset($data['order_id']) ? intval($data['order_id']) : 0);
if ($order_id <= 0) {
    $order_id = isset($_GET['id']) ? intval($_GET['id']) : (isset($_GET['order_id']) ? intval($_GET['order_id']) : 0);
}

if ($order_id <= 0) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Valid Order ID is required"
    ]);
    exit();
}

try {
    $stmt = $db->prepare("SELECT o.*, DATE_FORMAT(o.created_at, '%h:%i %p') as time, DATE_FORMAT(o.created_at, '%d/%m/%Y') as date FROM orders o WHERE o.id = :id");
    $stmt->execute([':id' => $order_id]);
    $order = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$order) {
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "message" => "Order #$order_id not found in database"
        ]);
        exit();
    }

    // Security / IDOR Protection: Verify ownership by customer_id or phone number
    $phone = isset($data['phone']) ? trim($data['phone']) : (isset($data['customer_mobile']) ? trim($data['customer_mobile']) : '');
    if (empty($phone)) {
        $phone = isset($_GET['phone']) ? trim($_GET['phone']) : (isset($_GET['customer_mobile']) ? trim($_GET['customer_mobile']) : '');
    }

    $customer_id = isset($data['customer_id']) ? intval($data['customer_id']) : 0;
    if ($customer_id <= 0) {
        $customer_id = isset($_GET['customer_id']) ? intval($_GET['customer_id']) : 0;
    }

    $is_authorized = false;

    // 1. Check logged-in Customer ID match
    if ($customer_id > 0 && !empty($order['customer_id']) && intval($order['customer_id']) === $customer_id) {
        $is_authorized = true;
    }

    // 2. Check Customer Phone Number match
    if (!$is_authorized && !empty($phone)) {
        $cleanReqPhone = preg_replace('/\D+/', '', $phone);
        $cleanOrderPhone = preg_replace('/\D+/', '', $order['customer_mobile'] ?? '');

        if (!empty($cleanReqPhone) && !empty($cleanOrderPhone)) {
            if ($cleanReqPhone === $cleanOrderPhone) {
                $is_authorized = true;
            } else {
                $reqLast10 = strlen($cleanReqPhone) >= 10 ? substr($cleanReqPhone, -10) : $cleanReqPhone;
                $orderLast10 = strlen($cleanOrderPhone) >= 10 ? substr($cleanOrderPhone, -10) : $cleanOrderPhone;
                if ($reqLast10 === $orderLast10) {
                    $is_authorized = true;
                }
            }
        }
    }

    if (!$is_authorized) {
        http_response_code(403);
        echo json_encode([
            "success" => false,
            "is_unauthorized" => true,
            "message" => "Verification required: Please provide the phone number used when placing Order #$order_id."
        ]);
        exit();
    }

    $itemStmt = $db->prepare("SELECT id, title as name, size, note, qty, price, spice_level, selected_addons_json FROM order_items WHERE order_id = :oid");
    $itemStmt->execute([':oid' => $order_id]);
    $order['cart'] = $itemStmt->fetchAll(PDO::FETCH_ASSOC);
    $order['items'] = $order['cart'];

    echo json_encode([
        "success" => true,
        "order" => $order
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Database Error: " . $e->getMessage()
    ]);
}
?>

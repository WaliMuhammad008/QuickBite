<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
require_role(['Admin', 'Manager']);
include_once __DIR__ . '/../config/Database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) {
        $data = $_POST;
    }

    $cid = (int)($data['customer_id'] ?? ($data['id'] ?? 0));
    $status = isset($data['is_active']) ? (int)$data['is_active'] : 1;

    if (!$cid) {
        echo json_encode(['success' => false, 'message' => 'Customer ID is required.']);
        exit();
    }

    try {
        $stmt = $db->prepare("UPDATE customer_users SET is_active = :st WHERE id = :id");
        $stmt->execute([':st' => $status, ':id' => $cid]);
        echo json_encode(['success' => true, 'message' => 'Customer status updated successfully!']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error updating customer: ' . $e->getMessage()]);
    }
    exit();
}

try {
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 0;
    $offset = isset($_GET['offset']) ? max(0, intval($_GET['offset'])) : 0;

    // 1. Fetch CRM Summary Statistics (entire database)
    $statsStmt = $db->query("
        SELECT 
            COUNT(DISTINCT u.id) AS total_customers,
            COALESCE(SUM(CASE WHEN u.is_active = 1 THEN 1 ELSE 0 END), 0) AS active_customers,
            COALESCE(SUM(CASE WHEN u.is_active = 0 THEN 1 ELSE 0 END), 0) AS blocked_customers,
            COALESCE((SELECT SUM(total) FROM orders), 0) AS total_revenue
        FROM customer_users u
    ");
    $stats = $statsStmt->fetch(PDO::FETCH_ASSOC);

    $totalCustomers = intval($stats['total_customers'] ?? 0);
    $activeCustomers = intval($stats['active_customers'] ?? 0);
    $blockedCustomers = intval($stats['blocked_customers'] ?? 0);
    $totalRevenue = floatval($stats['total_revenue'] ?? 0);

    $search = isset($_GET['search']) ? trim($_GET['search']) : '';
    $whereClause = "";
    $params = [];
    if ($search !== '') {
        $whereClause = " WHERE (u.full_name LIKE :search OR u.phone LIKE :search OR u.email LIKE :search) ";
        $params[':search'] = "%" . $search . "%";
    }

    $limitSql = "";
    if ($search === '' && $limit > 0) {
        $limitSql = " LIMIT " . intval($limit) . " OFFSET " . intval($offset);
    }

    $query = "SELECT u.id, u.full_name, u.phone, u.email, u.avatar_url, u.google_id, u.is_active, u.created_at,
              COUNT(o.id) AS total_orders,
              COALESCE(SUM(o.total), 0) AS lifetime_spend,
              MAX(o.created_at) AS last_order_at
              FROM customer_users u
              LEFT JOIN orders o ON u.id = o.customer_id
              " . $whereClause . "
              GROUP BY u.id
              ORDER BY u.id DESC" . $limitSql;

    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $customers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $has_more = ($search !== '') ? false : (($limit > 0) ? (($offset + count($customers)) < $totalCustomers) : false);

    echo json_encode([
        'success' => true,
        'customers' => $customers,
        'total' => $totalCustomers,
        'has_more' => $has_more,
        'limit' => $limit,
        'offset' => $offset,
        'stats' => [
            'total_customers' => $totalCustomers,
            'active_customers' => $activeCustomers,
            'blocked_customers' => $blockedCustomers,
            'total_revenue' => $totalRevenue
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'CRM Query Error: ' . $e->getMessage()]);
}

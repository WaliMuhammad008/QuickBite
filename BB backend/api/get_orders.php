<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
require_role(['Admin', 'Cashier', 'Kitchen', 'Chef', 'Dispatcher', 'Manager', 'Rider']);

include_once __DIR__ . '/../config/Database.php';
$database = new Database();
$db = $database->getConnection();

if (!$db) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database connection failed", "data" => []]);
    exit();
}

try {
    $type = isset($_GET['type']) ? trim($_GET['type']) : 'active';
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 0;
    $offset = isset($_GET['offset']) ? max(0, intval($_GET['offset'])) : 0;
    $format = isset($_GET['format']) ? trim($_GET['format']) : '';

    $limitSql = "";
    if ($limit > 0) {
        $limitSql = " LIMIT " . intval($limit) . " OFFSET " . intval($offset);
    }

    $sortDir = 'DESC';
    if ($type === 'kitchen' || (isset($_GET['sort']) && strtolower(trim($_GET['sort'])) === 'asc') || (isset($_GET['order_by']) && strtolower(trim($_GET['order_by'])) === 'fcfs') || $type === 'dispatcher') {
        $sortDir = 'ASC';
    }

    $orderByClause = "ORDER BY o.id " . $sortDir;
    if ((isset($_GET['order_by']) && strtolower(trim($_GET['order_by'])) === 'fcfs') || $type === 'dispatcher') {
        $orderByClause = "ORDER BY o.created_at ASC, o.id ASC";
    }

    $search = isset($_GET['search']) ? trim($_GET['search']) : '';
    $queryParams = [];

    $limitSql = "";
    if ($search === '' && $limit > 0) {
        $limitSql = " LIMIT " . intval($limit) . " OFFSET " . intval($offset);
    }

    if ($type === 'all' || $type === 'cashier') {
        if ($search !== '') {
            $whereClause = "WHERE (o.id LIKE :search OR o.customer_name LIKE :search OR o.table_number LIKE :search OR s.name LIKE :search OR o.customer_mobile LIKE :search)";
            $queryParams[':search'] = "%" . $search . "%";
            $countQuery = "SELECT COUNT(*) FROM orders o LEFT JOIN staff s ON o.rider_id = s.id " . $whereClause;
            $query = "SELECT o.*, 
                             COALESCE(p.status, o.payment_status, 'Pending') as payment_status, 
                             COALESCE(p.method, o.payment_method, 'Cash') as payment_method,
                             DATE_FORMAT(o.created_at, '%h:%i %p') as time,
                             DATE_FORMAT(o.created_at, '%d/%m/%Y') as date,
                             s.name as rider_name,
                             s.phone as rider_phone
                      FROM orders o 
                      LEFT JOIN payments p ON o.id = p.order_id 
                      LEFT JOIN staff s ON o.rider_id = s.id
                      " . $whereClause . "
                      " . $orderByClause;
        } else {
            $countQuery = "SELECT COUNT(*) FROM orders";
            $query = "SELECT o.*, 
                             COALESCE(p.status, o.payment_status, 'Pending') as payment_status, 
                             COALESCE(p.method, o.payment_method, 'Cash') as payment_method,
                             DATE_FORMAT(o.created_at, '%h:%i %p') as time,
                             DATE_FORMAT(o.created_at, '%d/%m/%Y') as date,
                             s.name as rider_name,
                             s.phone as rider_phone
                      FROM orders o 
                      LEFT JOIN payments p ON o.id = p.order_id 
                      LEFT JOIN staff s ON o.rider_id = s.id
                      " . $orderByClause . $limitSql;
        }
    } else if ($type === 'pending_cod') {
        $wherePendingCod = "WHERE (LOWER(o.order_type) LIKE '%delivery%' OR LOWER(o.order_mode) LIKE '%delivery%')
                             AND (LOWER(COALESCE(p.method, o.payment_method, '')) IN ('cod', 'cash', 'cash on delivery', '') OR LOWER(COALESCE(p.method, o.payment_method, '')) LIKE '%delivery%')
                             AND LOWER(COALESCE(p.status, o.payment_status, 'pending')) NOT IN ('paid', 'completed')
                             AND o.status IN ('Delivered', 'Completed', 'Dispatched')";
        $countQuery = "SELECT COUNT(*) FROM orders o LEFT JOIN payments p ON o.id = p.order_id " . $wherePendingCod;
        $query = "SELECT o.*, 
                         COALESCE(p.status, o.payment_status, 'Pending') as payment_status, 
                         COALESCE(p.method, o.payment_method, 'Cash') as payment_method,
                         DATE_FORMAT(o.created_at, '%h:%i %p') as time,
                         DATE_FORMAT(o.created_at, '%d/%m/%Y') as date,
                         s.name as rider_name,
                         s.phone as rider_phone
                  FROM orders o 
                  LEFT JOIN payments p ON o.id = p.order_id 
                  LEFT JOIN staff s ON o.rider_id = s.id
                  " . $wherePendingCod . "
                  " . $orderByClause . $limitSql;
    } else {
        $countQuery = "SELECT COUNT(*) FROM orders o WHERE o.status NOT IN ('Delivered', 'Completed', 'Dispatched', 'Cancelled', 'Declined')";
        $query = "SELECT o.*, 
                         COALESCE(p.status, o.payment_status, 'Pending') as payment_status, 
                         COALESCE(p.method, o.payment_method, 'Cash') as payment_method,
                         DATE_FORMAT(o.created_at, '%h:%i %p') as time,
                         DATE_FORMAT(o.created_at, '%d/%m/%Y') as date,
                         s.name as rider_name,
                         s.phone as rider_phone
                  FROM orders o 
                  LEFT JOIN payments p ON o.id = p.order_id 
                  LEFT JOIN staff s ON o.rider_id = s.id
                  WHERE o.status NOT IN ('Delivered', 'Completed', 'Dispatched', 'Cancelled', 'Declined') 
                  " . $orderByClause . $limitSql;
    }

    $totalStmt = $db->prepare($countQuery);
    $totalStmt->execute($queryParams);
    $total_count = intval($totalStmt->fetchColumn());

    $stmt = $db->prepare($query);
    $stmt->execute($queryParams);
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $final_orders = [];
    $orderIds = array_column($orders, 'id');
    $itemsByOrder = [];

    if (!empty($orderIds)) {
        $inPlaceholders = implode(',', array_fill(0, count($orderIds), '?'));
        $itemQuery = "SELECT id, order_id, title as name, size, note, qty, price, spice_level, selected_addons_json FROM order_items WHERE order_id IN ($inPlaceholders)";
        $itemStmt = $db->prepare($itemQuery);
        $itemStmt->execute($orderIds);
        $allItems = $itemStmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($allItems as $item) {
            $oid = $item['order_id'];
            if (!isset($itemsByOrder[$oid])) {
                $itemsByOrder[$oid] = [];
            }
            $itemsByOrder[$oid][] = $item;
        }
    }

    foreach ($orders as $order) {
        $orderItems = $itemsByOrder[$order['id']] ?? [];
        $order['items'] = $orderItems;
        $order['cart'] = $orderItems;
        $final_orders[] = $order;
    }

    $has_more = ($limit > 0) ? (($offset + count($final_orders)) < $total_count) : false;

    if ($format === 'paginated') {
        echo json_encode([
            "success" => true,
            "orders" => $final_orders,
            "total" => $total_count,
            "has_more" => $has_more,
            "limit" => $limit,
            "offset" => $offset
        ]);
    } else {
        header("X-Total-Count: " . $total_count);
        header("X-Has-More: " . ($has_more ? "1" : "0"));
        echo json_encode($final_orders);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "SQL Error: " . $e->getMessage(), "data" => []]);
}
?>
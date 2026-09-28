<?php
if (ob_get_level()) ob_clean();
ob_start();

include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
require_role(['Admin', 'Manager', 'Dispatcher']);
include_once __DIR__ . '/../config/Database.php';

header('Content-Type: application/json; charset=utf-8');

$database = new Database();
$db = $database->getConnection();

try {
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';
    $limit  = isset($_GET['limit']) ? intval($_GET['limit']) : 0;
    $offset = isset($_GET['offset']) ? max(0, intval($_GET['offset'])) : 0;

    $whereClause = "";
    $params = [];
    if ($search !== '') {
        $whereClause = " WHERE s.name LIKE :search OR s.role LIKE :search OR s.phone LIKE :search OR s.username LIKE :search OR s.email LIKE :search ";
        $params[':search'] = "%" . $search . "%";
    }

    if ($search !== '') {
        $countStmt = $db->prepare("SELECT COUNT(*) FROM staff s" . $whereClause);
        $countStmt->execute($params);
        $total_count = intval($countStmt->fetchColumn());
        $limitSql = "";
    } else {
        $totalStmt = $db->query("SELECT COUNT(*) FROM staff");
        $total_count = intval($totalStmt->fetchColumn());

        $limitSql = "";
        if ($limit > 0) {
            $limitSql = " LIMIT " . intval($limit) . " OFFSET " . intval($offset);
        }
    }

    $query = "SELECT s.id, s.name, s.role, s.phone, s.email, s.salary, s.status, s.shift_status, s.username, s.shift, s.hire_date AS created_at,
                     r.vehicle, r.lat, r.lng, r.trips_completed, r.license_number,
                     COALESCE(act.active_orders_count, 0) AS active_orders_count
              FROM staff s 
              LEFT JOIN rider r ON s.id = r.staff_id
              LEFT JOIN (
                  SELECT rider_id, COUNT(*) AS active_orders_count 
                  FROM orders 
                  WHERE status IN ('Dispatched', 'Out for Delivery', 'On The Way')
                  GROUP BY rider_id
              ) act ON s.id = act.rider_id
              " . $whereClause . "
              ORDER BY s.id DESC" . $limitSql;
              
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    
    $staff = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $has_more = ($search !== '') ? false : (($limit > 0) ? (($offset + count($staff)) < $total_count) : false);
    
    if (ob_get_level()) ob_clean();
    echo json_encode([
        "success"  => true, 
        "data"     => $staff,
        "total"    => $total_count,
        "has_more" => $has_more,
        "limit"    => $limit,
        "offset"   => $offset
    ]);
} catch(PDOException $e) {
    if (ob_get_level()) ob_clean();
    echo json_encode(["success" => false, "message" => "Database Error: " . $e->getMessage()]);
}
?>

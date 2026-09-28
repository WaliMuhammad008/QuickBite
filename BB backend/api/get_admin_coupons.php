<?php
require_once __DIR__ . '/../config/cors_headers.php';
require_once __DIR__ . '/../config/Database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception("Database connection failed.");
    }

    $isPaginated = isset($_GET['limit']);
    $limit = $isPaginated ? max(1, min(100, intval($_GET['limit']))) : null;
    $offset = $isPaginated ? max(0, intval($_GET['offset'] ?? 0)) : 0;

    // Total count & stats
    $statsStmt = $db->query("
        SELECT 
            COUNT(*) as total_coupons,
            SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_coupons,
            SUM(COALESCE(times_used, 0)) as total_used
        FROM coupons
    ");
    $stats = $statsStmt ? $statsStmt->fetch(PDO::FETCH_ASSOC) : [];
    $search = trim($_GET['search'] ?? '');
    if ($search !== '') {
        $stmt = $db->prepare("
            SELECT 
                id, 
                code, 
                discount_type, 
                discount_value, 
                min_spend, 
                max_discount, 
                usage_limit, 
                times_used, 
                expiry_date, 
                is_active, 
                created_at 
            FROM coupons 
            WHERE code LIKE :search OR discount_type LIKE :search
            ORDER BY id DESC
        ");
        $stmt->execute([':search' => "%" . $search . "%"]);
        $coupons = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'data' => $coupons ?: [],
            'total' => count($coupons ?: []),
            'has_more' => false,
            'stats' => [
                'total_coupons' => $total,
                'active_coupons' => (int)($stats['active_coupons'] ?? 0),
                'total_used' => (int)($stats['total_used'] ?? 0),
            ]
        ]);
        exit();
    }

    if ($isPaginated) {
        $stmt = $db->prepare("
            SELECT 
                id, 
                code, 
                discount_type, 
                discount_value, 
                min_spend, 
                max_discount, 
                usage_limit, 
                times_used, 
                expiry_date, 
                is_active, 
                created_at 
            FROM coupons 
            ORDER BY id DESC
            LIMIT :limit OFFSET :offset
        ");
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
    } else {
        $stmt = $db->query("
            SELECT 
                id, 
                code, 
                discount_type, 
                discount_value, 
                min_spend, 
                max_discount, 
                usage_limit, 
                times_used, 
                expiry_date, 
                is_active, 
                created_at 
            FROM coupons 
            ORDER BY id DESC
        ");
    }

    $coupons = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $response = [
        'success' => true,
        'data' => $coupons ?: [],
        'total' => $total,
        'has_more' => $isPaginated ? (($offset + count($coupons)) < $total) : false,
        'stats' => [
            'total_coupons' => $total,
            'active_coupons' => (int)($stats['active_coupons'] ?? 0),
            'total_used' => (int)($stats['total_used'] ?? 0),
        ]
    ];

    if ($isPaginated) {
        $response['limit'] = $limit;
        $response['offset'] = $offset;
    }

    echo json_encode($response);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
?>

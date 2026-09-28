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

    $reviewId = (int)($data['id'] ?? ($data['review_id'] ?? 0));
    $action = $data['action'] ?? 'update'; // 'update' | 'delete' | 'toggle_featured'

    if (!$reviewId) {
        echo json_encode(['success' => false, 'message' => 'Review ID is required.']);
        exit();
    }

    try {
        if ($action === 'delete') {
            $stmt = $db->prepare("DELETE FROM order_reviews WHERE id = :id");
            $stmt->execute([':id' => $reviewId]);
            echo json_encode(['success' => true, 'message' => 'Review deleted successfully.']);
            exit();
        }

        if ($action === 'toggle_featured') {
            $isFeatured = !empty($data['is_featured']) ? 1 : 0;
            $stmt = $db->prepare("UPDATE order_reviews SET is_featured = :feat WHERE id = :id");
            $stmt->execute([':feat' => $isFeatured, ':id' => $reviewId]);
            echo json_encode(['success' => true, 'message' => 'Featured status updated.']);
            exit();
        }

        // General update (status / is_featured)
        $status = trim($data['status'] ?? 'approved');
        if (!in_array($status, ['approved', 'pending', 'hidden'])) {
            $status = 'approved';
        }
        $isFeatured = isset($data['is_featured']) ? (int)$data['is_featured'] : 0;

        $stmt = $db->prepare("UPDATE order_reviews SET status = :st, is_featured = :feat WHERE id = :id");
        $stmt->execute([':st' => $status, ':feat' => $isFeatured, ':id' => $reviewId]);

        echo json_encode(['success' => true, 'message' => 'Review updated successfully!']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Review update error: ' . $e->getMessage()]);
    }
    exit();
}

// GET: Fetch all reviews for admin moderation
try {
    $query = "SELECT r.*, o.order_type, o.total AS order_total, o.customer_mobile, o.created_at AS order_created_at
              FROM order_reviews r
              LEFT JOIN orders o ON r.order_id = o.id
              ORDER BY r.id DESC";
    $stmt = $db->query($query);
    $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Summary Metrics
    $total = count($reviews);
    $approved = 0;
    $hidden = 0;
    $featured = 0;
    $sumRating = 0;

    foreach ($reviews as $rev) {
        if ($rev['status'] === 'approved') $approved++;
        if ($rev['status'] === 'hidden') $hidden++;
        if ((int)$rev['is_featured'] === 1) $featured++;
        $sumRating += (int)$rev['rating'];
    }

    $avg = $total > 0 ? round($sumRating / $total, 1) : 5.0;

    echo json_encode([
        'success' => true,
        'reviews' => $reviews,
        'stats' => [
            'total_reviews' => $total,
            'approved_reviews' => $approved,
            'hidden_reviews' => $hidden,
            'featured_reviews' => $featured,
            'average_rating' => $avg
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Admin reviews query error: ' . $e->getMessage()]);
}

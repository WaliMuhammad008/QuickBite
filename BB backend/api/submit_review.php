<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/Database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents('php://input'), true);
if (!$data) {
    $data = $_POST;
}

$orderId = (int)($data['order_id'] ?? 0);
$customerId = !empty($data['customer_id']) ? (int)$data['customer_id'] : null;
$customerName = trim($data['customer_name'] ?? 'Verified Buyer');
$rating = (int)($data['rating'] ?? 5);
$reviewText = trim($data['review_text'] ?? ($data['comment'] ?? ''));
$tags = isset($data['tags']) && is_array($data['tags']) ? implode(',', $data['tags']) : trim($data['tags'] ?? '');
$itemRatings = isset($data['item_ratings']) ? (is_string($data['item_ratings']) ? $data['item_ratings'] : json_encode($data['item_ratings'])) : null;

if (!$orderId || $rating < 1 || $rating > 5) {
    echo json_encode(['success' => false, 'message' => 'Valid Order ID and Rating (1-5) are required.']);
    exit();
}

try {
    // 1. Verify that order exists
    $ordStmt = $db->prepare("SELECT id, status, customer_name, customer_id FROM orders WHERE id = :oid LIMIT 1");
    $ordStmt->execute([':oid' => $orderId]);
    $order = $ordStmt->fetch(PDO::FETCH_ASSOC);

    if (!$order) {
        echo json_encode(['success' => false, 'message' => 'Order not found in database.']);
        exit();
    }

    // Auto-fill customer details from order if missing
    if (empty($customerName) || $customerName === 'Verified Buyer') {
        if (!empty($order['customer_name'])) {
            $customerName = $order['customer_name'];
        }
    }
    if (!$customerId && !empty($order['customer_id'])) {
        $customerId = (int)$order['customer_id'];
    }

    // 2. Check for existing review on this order (support update/replace or error)
    $chkStmt = $db->prepare("SELECT id FROM order_reviews WHERE order_id = :oid LIMIT 1");
    $chkStmt->execute([':oid' => $orderId]);
    $existing = $chkStmt->fetch(PDO::FETCH_ASSOC);

    if ($existing) {
        $upStmt = $db->prepare("UPDATE order_reviews SET rating = :rating, review_text = :txt, tags = :tags, item_ratings = :items, status = 'approved' WHERE id = :id");
        $upStmt->execute([
            ':rating' => $rating,
            ':txt' => !empty($reviewText) ? $reviewText : null,
            ':tags' => !empty($tags) ? $tags : null,
            ':items' => $itemRatings,
            ':id' => $existing['id']
        ]);
        $reviewId = (int)$existing['id'];
        $msg = 'Your review has been updated successfully!';
    } else {
        $insStmt = $db->prepare("INSERT INTO order_reviews (order_id, customer_id, customer_name, rating, review_text, tags, item_ratings, status, is_featured) 
                                 VALUES (:oid, :cid, :cname, :rating, :txt, :tags, :items, 'approved', 0)");
        $insStmt->execute([
            ':oid' => $orderId,
            ':cid' => $customerId,
            ':cname' => $customerName,
            ':rating' => $rating,
            ':txt' => !empty($reviewText) ? $reviewText : null,
            ':tags' => !empty($tags) ? $tags : null,
            ':items' => $itemRatings
        ]);
        $reviewId = (int)$db->lastInsertId();
        $msg = 'Thank you! Your verified buyer review has been posted.';
    }

    echo json_encode([
        'success' => true,
        'message' => $msg,
        'review' => [
            'id' => $reviewId,
            'order_id' => $orderId,
            'customer_name' => $customerName,
            'rating' => $rating,
            'review_text' => $reviewText,
            'tags' => $tags,
            'status' => 'approved'
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Review Submission Error: ' . $e->getMessage()]);
}

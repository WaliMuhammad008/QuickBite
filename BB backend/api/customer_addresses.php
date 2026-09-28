<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/Database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $customerId = (int)($_GET['customer_id'] ?? 0);
    if (!$customerId) {
        echo json_encode(['success' => false, 'message' => 'Customer ID required.']);
        exit();
    }
    try {
        $stmt = $db->prepare("SELECT * FROM customer_addresses WHERE customer_id = :cid ORDER BY is_default DESC, id DESC");
        $stmt->execute([':cid' => $customerId]);
        $addresses = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'addresses' => $addresses]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit();
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) {
        $data = $_POST;
    }

    $customerId = (int)($data['customer_id'] ?? 0);
    $label = trim($data['label'] ?? 'Home');
    if (!in_array($label, ['Home', 'Work', 'Hostel', 'Other'])) {
        $label = 'Home';
    }
    $address = trim($data['address_line'] ?? ($data['address'] ?? ''));
    $area = trim($data['area'] ?? '');
    $landmark = trim($data['landmark'] ?? '');
    $lat = !empty($data['latitude']) ? (float)$data['latitude'] : (!empty($data['lat']) ? (float)$data['lat'] : null);
    $lng = !empty($data['longitude']) ? (float)$data['longitude'] : (!empty($data['lng']) ? (float)$data['lng'] : null);
    $isDefault = !empty($data['is_default']) ? 1 : 0;

    if (!$customerId || empty($address)) {
        echo json_encode(['success' => false, 'message' => 'Customer ID and address are required.']);
        exit();
    }

    try {
        if ($isDefault) {
            $up = $db->prepare("UPDATE customer_addresses SET is_default = 0 WHERE customer_id = :cid");
            $up->execute([':cid' => $customerId]);
        }

        $stmt = $db->prepare("INSERT INTO customer_addresses (customer_id, label, address_line, area, landmark, latitude, longitude, is_default) VALUES (:cid, :label, :addr, :area, :landmark, :lat, :lng, :def)");
        $stmt->execute([
            ':cid' => $customerId,
            ':label' => $label,
            ':addr' => $address,
            ':area' => $area,
            ':landmark' => $landmark,
            ':lat' => $lat,
            ':lng' => $lng,
            ':def' => $isDefault
        ]);

        $newId = (int)$db->lastInsertId();

        echo json_encode([
            'success' => true,
            'message' => 'Address saved successfully!',
            'address' => [
                'id' => $newId,
                'customer_id' => $customerId,
                'label' => $label,
                'address_line' => $address,
                'area' => $area,
                'landmark' => $landmark,
                'latitude' => $lat,
                'longitude' => $lng,
                'is_default' => $isDefault
            ]
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to save address: ' . $e->getMessage()]);
    }
    exit();
}

if ($method === 'DELETE') {
    $addressId = (int)($_GET['id'] ?? 0);
    $customerId = (int)($_GET['customer_id'] ?? 0);

    if (!$addressId || !$customerId) {
        $bodyData = json_decode(file_get_contents('php://input'), true);
        if ($bodyData) {
            $addressId = (int)($bodyData['id'] ?? $addressId);
            $customerId = (int)($bodyData['customer_id'] ?? $customerId);
        }
    }

    if (!$addressId || !$customerId) {
        echo json_encode(['success' => false, 'message' => 'Address ID and Customer ID are required for deletion.']);
        exit();
    }

    try {
        $stmt = $db->prepare("DELETE FROM customer_addresses WHERE id = :id AND customer_id = :cid");
        $stmt->execute([':id' => $addressId, ':cid' => $customerId]);
        echo json_encode(['success' => true, 'message' => 'Address removed.']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error deleting address: ' . $e->getMessage()]);
    }
    exit();
}

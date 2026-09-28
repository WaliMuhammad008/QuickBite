<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/Database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents('php://input'), true);
if (!$data) {
    $data = $_POST;
}

$email = trim($data['email'] ?? '');
$name = trim($data['name'] ?? ($data['full_name'] ?? ''));
$googleId = trim($data['google_id'] ?? ($data['sub'] ?? ''));
$avatar = trim($data['avatar'] ?? ($data['avatar_url'] ?? ($data['picture'] ?? '')));

if (empty($email) || empty($googleId)) {
    echo json_encode(['success' => false, 'message' => 'Invalid Google authentication payload.']);
    exit();
}

try {
    $stmt = $db->prepare("SELECT * FROM customer_users WHERE email = :email OR google_id = :gid LIMIT 1");
    $stmt->execute([':email' => $email, ':gid' => $googleId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        if ((int)$user['is_active'] === 0) {
            echo json_encode(['success' => false, 'message' => 'This account has been disabled. Please contact support.']);
            exit();
        }

        // Update google_id or avatar if missing
        $updates = [];
        $params = [':id' => $user['id']];
        if (empty($user['google_id'])) {
            $updates[] = "google_id = :gid";
            $params[':gid'] = $googleId;
        }
        if (empty($user['avatar_url']) && !empty($avatar)) {
            $updates[] = "avatar_url = :av";
            $params[':av'] = $avatar;
        }
        if (!empty($updates)) {
            $upSql = "UPDATE customer_users SET " . implode(", ", $updates) . " WHERE id = :id";
            $upStmt = $db->prepare($upSql);
            $upStmt->execute($params);
        }

        $customerId = (int)$user['id'];
        $fullName = $user['full_name'];
        $phone = $user['phone'] ?? '';
        $avatarUrl = !empty($user['avatar_url']) ? $user['avatar_url'] : $avatar;
    } else {
        // Create new user via Google
        $ins = $db->prepare("INSERT INTO customer_users (full_name, email, phone, password_hash, google_id, avatar_url) VALUES (:name, :email, NULL, 'GOOGLE_OAUTH_USER', :gid, :av)");
        $ins->execute([
            ':name' => !empty($name) ? $name : 'Google User',
            ':email' => $email,
            ':gid' => $googleId,
            ':av' => !empty($avatar) ? $avatar : null
        ]);
        $customerId = (int)$db->lastInsertId();
        $fullName = !empty($name) ? $name : 'Google User';
        $phone = '';
        $avatarUrl = $avatar;
    }

    echo json_encode([
        'success' => true,
        'message' => 'Authenticated successfully!',
        'customer' => [
            'id' => $customerId,
            'full_name' => $fullName,
            'email' => $email,
            'phone' => $phone,
            'avatar_url' => $avatarUrl,
            'avatar' => $avatarUrl
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Auth error: ' . $e->getMessage()]);
}

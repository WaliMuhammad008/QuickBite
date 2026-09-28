<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
include_once __DIR__ . '/../config/Database.php';

$database = new Database();
$db = $database->getConnection();
$data = json_decode(file_get_contents("php://input"));

if(!empty($data->new_password)) {
    $rawPassword = trim((string)$data->new_password);

    if (strlen($rawPassword) < 8) {
        echo json_encode(["success" => false, "message" => "New password must be at least 8 characters long."]);
        exit();
    }
    if (!preg_match('/[A-Z]/', $rawPassword)) {
        echo json_encode(["success" => false, "message" => "New password must contain at least one capital letter (A-Z)."]);
        exit();
    }
    if (!preg_match('/[!@#$%^&*(),.?":{}|<>]/', $rawPassword)) {
        echo json_encode(["success" => false, "message" => "New password must contain at least one special character."]);
        exit();
    }
    if (isset($data->confirm_password) && $rawPassword !== trim((string)$data->confirm_password)) {
        echo json_encode(["success" => false, "message" => "New password and confirm password do not match."]);
        exit();
    }

    // 1. Identify the target account and verify authorization (IDOR Prevention)
    $target_id = !empty($data->staff_id) ? intval($data->staff_id) : $auth_user['user_id'];
    $is_admin = (strtolower($auth_user['role']) === 'admin');

    if ($target_id !== $auth_user['user_id'] && !$is_admin) {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "Access denied. You cannot change another user's password."]);
        exit();
    }

    try {
        // 2. Enforce current password check for self-service updates
        if (!$is_admin || $target_id === $auth_user['user_id']) {
            if (empty($data->current_password)) {
                echo json_encode(["success" => false, "message" => "Please enter your current password to change it."]);
                exit();
            }
            
            // Retrieve current hashed password from database
            $check_query = "SELECT password FROM staff WHERE id = :id";
            $chk_stmt = $db->prepare($check_query);
            $chk_stmt->execute([':id' => $target_id]);
            $user_pass = $chk_stmt->fetchColumn();

            if (!$user_pass || !password_verify($data->current_password, $user_pass)) {
                echo json_encode(["success" => false, "message" => "Incorrect current password."]);
                exit();
            }
        }

        // 3. Hash and update new password
        $hashed_password = password_hash($data->new_password, PASSWORD_DEFAULT);
        $query = "UPDATE staff SET password = :password WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->execute([
            ':password' => $hashed_password, 
            ':id' => $target_id
        ]);
        
        echo json_encode(["success" => true, "message" => "Password securely updated!"]);
    } catch(PDOException $e) {
        echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Please provide the new password."]);
}
?>
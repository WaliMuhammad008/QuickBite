<?php
if (ob_get_level()) ob_clean();
ob_start();

include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
require_role(['Admin', 'Manager']);
include_once __DIR__ . '/../config/Database.php';

header('Content-Type: application/json; charset=utf-8');

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->id) && !empty($data->name) && !empty($data->role)) {
    try {
        $username = isset($data->username) && trim((string)$data->username) !== '' ? trim((string)$data->username) : null;
        if ($username !== null) {
            $check_user = $db->prepare("SELECT id FROM staff WHERE username = :username AND id != :id");
            $check_user->execute([':username' => $username, ':id' => $data->id]);
            if ($check_user->fetch()) {
                if (ob_get_level()) ob_clean();
                echo json_encode(["success" => false, "message" => "This username is already taken by another staff member!"]);
                exit();
            }
        }

        $email = isset($data->email) && trim((string)$data->email) !== '' ? trim((string)$data->email) : null;
        if ($email !== null) {
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                if (ob_get_level()) ob_clean();
                echo json_encode(["success" => false, "message" => "Please enter a valid staff email address."]);
                exit();
            }
            $check_email = $db->prepare("SELECT id FROM staff WHERE email = :email AND id != :id");
            $check_email->execute([':email' => $email, ':id' => $data->id]);
            if ($check_email->fetch()) {
                if (ob_get_level()) ob_clean();
                echo json_encode(["success" => false, "message" => "This email address is already in use by another staff member!"]);
                exit();
            }
        }

        $query = "UPDATE staff SET name = :name, role = :role, status = :status, phone = :phone, email = :email, salary = :salary, username = :username WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":name", $data->name);
        $stmt->bindParam(":role", $data->role);
        $status = $data->status ?? 'Active';
        $stmt->bindParam(":status", $status);
        $stmt->bindParam(":phone", $data->phone);
        $stmt->bindParam(":email", $email);
        $stmt->bindParam(":salary", $data->salary);
        $stmt->bindParam(":username", $username);
        $stmt->bindParam(":id", $data->id);
        
        $stmt->execute();

        // Permanently save custom / assigned role in staff_roles table (DML only, no DDL)
        $assignedRole = trim((string)$data->role);
        if (!empty($assignedRole)) {
            try {
                $roleStmt = $db->prepare("INSERT IGNORE INTO staff_roles (role_name) VALUES (:role_name)");
                $roleStmt->execute([':role_name' => $assignedRole]);
            } catch (Exception $roleErr) {
                // Non-fatal if staff_roles does not exist or duplicate
            }
        }
        
        if (isset($data->password) && trim((string)$data->password) !== '') {
            $rawPassword = trim((string)$data->password);

            if (strlen($rawPassword) < 8) {
                if (ob_get_level()) ob_clean();
                echo json_encode(["success" => false, "message" => "New password must be at least 8 characters long."]);
                exit();
            }
            if (!preg_match('/[A-Z]/', $rawPassword)) {
                if (ob_get_level()) ob_clean();
                echo json_encode(["success" => false, "message" => "New password must contain at least one capital letter (A-Z)."]);
                exit();
            }
            if (!preg_match('/[!@#$%^&*(),.?":{}|<>]/', $rawPassword)) {
                if (ob_get_level()) ob_clean();
                echo json_encode(["success" => false, "message" => "New password must contain at least one special character."]);
                exit();
            }
            if (isset($data->confirm_password) && $rawPassword !== trim((string)$data->confirm_password)) {
                if (ob_get_level()) ob_clean();
                echo json_encode(["success" => false, "message" => "New password and confirm password do not match."]);
                exit();
            }

            $hashed_password = password_hash($rawPassword, PASSWORD_DEFAULT);
            $pass_query = "UPDATE staff SET password = :password WHERE id = :id";
            $pass_stmt = $db->prepare($pass_query);
            $pass_stmt->bindParam(":password", $hashed_password);
            $pass_stmt->bindParam(":id", $data->id);
            $pass_stmt->execute();
        }

        if (ob_get_level()) ob_clean();
        echo json_encode(["success" => true, "message" => "Staff member updated successfully."]);
    } catch(PDOException $e) {
        if (ob_get_level()) ob_clean();
        if ($e->getCode() == 23000) {
            echo json_encode(["success" => false, "message" => "This username or email is already taken!"]);
        } else {
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
    }
} else {
    if (ob_get_level()) ob_clean();
    echo json_encode(["success" => false, "message" => "Incomplete data provided."]);
}
?>

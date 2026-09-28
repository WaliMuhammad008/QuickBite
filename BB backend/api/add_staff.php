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

// Validation: Check if required fields exist
if(isset($data->name) && isset($data->role) && isset($data->phone) && isset($data->salary)) {
    
    // Check for empty spaces
    if(trim($data->name) === '' || trim($data->phone) === '' || trim((string)$data->salary) === '') {
        if (ob_get_level()) ob_clean();
        echo json_encode(["success" => false, "message" => "Fields cannot be blank spaces."]);
        exit();
    }

    $enablePortal = false;
    if (isset($data->enable_portal)) {
        $enablePortal = filter_var($data->enable_portal, FILTER_VALIDATE_BOOLEAN);
    } elseif (!empty($data->username) || !empty($data->password)) {
        $enablePortal = true;
    }

    $username = null;
    $password = null;

    if ($enablePortal) {
        $rawUsername = !empty($data->username) ? trim((string)$data->username) : '';
        if ($rawUsername === '') {
            if (ob_get_level()) ob_clean();
            echo json_encode(["success" => false, "message" => "Username is required for portal login access."]);
            exit();
        }

        // Check if username already exists
        $userCheckStmt = $db->prepare("SELECT id FROM staff WHERE username = :username LIMIT 1");
        $userCheckStmt->execute([':username' => $rawUsername]);
        if ($userCheckStmt->fetch()) {
            if (ob_get_level()) ob_clean();
            echo json_encode(["success" => false, "message" => "This username is already taken!"]);
            exit();
        }

        $rawPassword = !empty($data->password) ? (string)$data->password : '';
        if (strlen($rawPassword) < 8) {
            if (ob_get_level()) ob_clean();
            echo json_encode(["success" => false, "message" => "Password must be at least 8 characters long."]);
            exit();
        }
        if (!preg_match('/[A-Z]/', $rawPassword)) {
            if (ob_get_level()) ob_clean();
            echo json_encode(["success" => false, "message" => "Password must contain at least one capital letter (A-Z)."]);
            exit();
        }
        if (!preg_match('/[!@#$%^&*(),.?":{}|<>]/', $rawPassword)) {
            if (ob_get_level()) ob_clean();
            echo json_encode(["success" => false, "message" => "Password must contain at least one special character."]);
            exit();
        }
        if (isset($data->confirm_password) && $rawPassword !== (string)$data->confirm_password) {
            if (ob_get_level()) ob_clean();
            echo json_encode(["success" => false, "message" => "Password and confirm password do not match."]);
            exit();
        }

        $username = $rawUsername;
        $password = password_hash($rawPassword, PASSWORD_DEFAULT);
    }

    // Email handling & uniqueness check
    $email = isset($data->email) && trim((string)$data->email) !== '' ? trim((string)$data->email) : null;
    if ($email !== null) {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            if (ob_get_level()) ob_clean();
            echo json_encode(["success" => false, "message" => "Please enter a valid staff email address."]);
            exit();
        }
        $emailCheckStmt = $db->prepare("SELECT id FROM staff WHERE email = :email LIMIT 1");
        $emailCheckStmt->execute([':email' => $email]);
        if ($emailCheckStmt->fetch()) {
            if (ob_get_level()) ob_clean();
            echo json_encode(["success" => false, "message" => "This email address is already in use by another staff member!"]);
            exit();
        }
    }

    try {
        if (!$db->inTransaction()) {
            $db->beginTransaction(); 
        }

        // 1. Insert into staff table
        $query1 = "INSERT INTO staff (name, role, phone, email, salary, status, shift_status, username, password, shift) 
                   VALUES (:name, :role, :phone, :email, :salary, 'Active', 'Offline', :username, :password, 'Morning')";
        
        $stmt1 = $db->prepare($query1);
        $stmt1->execute([
            ':name'     => trim($data->name),
            ':role'     => trim($data->role),
            ':phone'    => trim($data->phone),
            ':email'    => $email,
            ':salary'   => $data->salary,
            ':username' => $username,
            ':password' => $password
        ]);
        
        $staff_id = $db->lastInsertId(); 

        // 2. If Rider, insert into rider table
        if(trim($data->role) === 'Rider') {
            $bike_number = !empty($data->bike_number) ? trim($data->bike_number) : 'Bike';
            $license_number = !empty($data->license_number) ? trim($data->license_number) : null;

            $query2 = "INSERT INTO rider (staff_id, vehicle, license_number, trips_completed) 
                       VALUES (:staff_id, :vehicle, :license_number, 0)";
            $stmt2 = $db->prepare($query2);
            $stmt2->execute([
                ':staff_id' => $staff_id,
                ':vehicle' => $bike_number,
                ':license_number' => $license_number
            ]);
        }

        // 3. Save custom / assigned role in staff_roles table (DML only, no DDL)
        $assignedRole = trim($data->role);
        if (!empty($assignedRole)) {
            try {
                $roleStmt = $db->prepare("INSERT IGNORE INTO staff_roles (role_name) VALUES (:role_name)");
                $roleStmt->execute([':role_name' => $assignedRole]);
            } catch (Exception $roleErr) {
                // Non-fatal if staff_roles does not exist or duplicate
            }
        }

        if ($db->inTransaction()) {
            $db->commit(); 
        }

        if (ob_get_level()) ob_clean();
        echo json_encode([
            "success" => true, 
            "message" => "Staff enrolled successfully",
            "staff_id" => $staff_id
        ]);
        exit(); 
        
    } catch(Exception $e) {
        if (isset($db) && $db instanceof PDO && $db->inTransaction()) {
            $db->rollBack(); 
        }
        
        if (ob_get_level()) ob_clean();
        $code = ($e instanceof PDOException) ? $e->getCode() : 0;
        if($code == 23000) { 
            echo json_encode(["success" => false, "message" => "This username or email is already taken!"]);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to add staff: " . $e->getMessage()]);
        }
        exit();
    }
} else {
    if (ob_get_level()) ob_clean();
    echo json_encode(["success" => false, "message" => "Incomplete details provided."]);
    exit();
}
?>

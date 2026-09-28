<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/Database.php';
include_once __DIR__ . '/../config/JwtHelper.php';

$database = new Database();
$db = $database->getConnection();
$data = json_decode(file_get_contents("php://input"));

$username = !empty($data->username) ? trim($data->username) : null;
$password = !empty($data->password) ? $data->password : null;

if(!empty($username) && !empty($password)) {
    try {
        $query = "SELECT id, name, role, status, password FROM staff WHERE username = :username OR phone = :username";
        $stmt = $db->prepare($query);
        $stmt->execute([
            ':username' => $username
        ]);

        if($stmt->rowCount() > 0) {
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            if(password_verify($data->password, $user['password'])) {
                unset($user['password']);
                if($user['status'] === 'Active') {

                    // 🔥 Generate JWT Token with user info
                    $token = JwtHelper::generateToken([
                        "user_id" => $user['id'],
                        "name"    => $user['name'],
                        "role"    => $user['role']
                    ]);

                    echo json_encode([
                        "success" => true, 
                        "message" => "Login successful", 
                        "user"    => $user,
                        "token"   => $token   // 🔥 Token bhej rahe hain frontend ko
                    ]);
                } else {
                    echo json_encode(["success" => false, "message" => "Your account is inactive. Contact Admin."]);
                }
            } else {
                echo json_encode(["success" => false, "message" => "Invalid username or password!"]);
            }
        } else {
            echo json_encode(["success" => false, "message" => "Invalid username or password!"]);
        }
    } catch(PDOException $e) {
        echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Please provide username and password."]);
}
?>

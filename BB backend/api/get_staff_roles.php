<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
require_role(['Admin', 'Manager', 'Dispatcher', 'Cashier']);
include_once __DIR__ . '/../config/Database.php';

$database = new Database();
$db = $database->getConnection();

try {
    // 1. Auto-create staff_roles table if it does not exist
    $createTableQuery = "CREATE TABLE IF NOT EXISTS staff_roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        role_name VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
    $db->exec($createTableQuery);

    // 2. Standard baseline roles
    $standardRoles = ['Admin', 'Manager', 'Cashier', 'Chef', 'Rider', 'Waiter'];

    // 3. Seed baseline roles if table is empty
    $countStmt = $db->query("SELECT COUNT(*) FROM staff_roles");
    if ($countStmt->fetchColumn() == 0) {
        $seedStmt = $db->prepare("INSERT IGNORE INTO staff_roles (role_name) VALUES (:role_name)");
        foreach ($standardRoles as $r) {
            $seedStmt->execute([':role_name' => $r]);
        }
    }

    // 4. Also fetch distinct roles already used in the staff table and sync to staff_roles
    $staffRolesStmt = $db->query("SELECT DISTINCT role FROM staff WHERE role IS NOT NULL AND TRIM(role) != ''");
    $existingStaffRoles = $staffRolesStmt->fetchAll(PDO::FETCH_COLUMN);

    if (!empty($existingStaffRoles)) {
        $syncStmt = $db->prepare("INSERT IGNORE INTO staff_roles (role_name) VALUES (:role_name)");
        foreach ($existingStaffRoles as $existingRole) {
            $trimmed = trim($existingRole);
            if (!empty($trimmed)) {
                $syncStmt->execute([':role_name' => $trimmed]);
            }
        }
    }

    // 5. Fetch all saved roles ordered alphabetically (with standard baseline prioritized)
    $rolesStmt = $db->query("SELECT role_name FROM staff_roles ORDER BY id ASC");
    $allRoles = $rolesStmt->fetchAll(PDO::FETCH_COLUMN);

    // Ensure standard roles are always present at the top
    $finalRoles = [];
    foreach ($standardRoles as $sr) {
        if (!in_array($sr, $finalRoles)) {
            $finalRoles[] = $sr;
        }
    }
    foreach ($allRoles as $ar) {
        $clean = trim($ar);
        if (!empty($clean) && !in_array($clean, $finalRoles)) {
            $finalRoles[] = $clean;
        }
    }

    echo json_encode([
        "success" => true,
        "roles" => $finalRoles
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Database error: " . $e->getMessage()
    ]);
}
?>

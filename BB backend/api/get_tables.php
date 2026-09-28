<?php
require_once __DIR__ . '/../config/cors_headers.php';
require_once __DIR__ . '/../config/Database.php';

header("Content-Type: application/json; charset=UTF-8");

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $database = new Database();
    $db = $database->getConnection();

    // Fetch active occupied table names from live orders
    $occupiedSet = [];
    try {
        $activeStmt = $db->query("
            SELECT DISTINCT table_number 
            FROM orders 
            WHERE (order_type = 'Dine-In' OR order_mode = 'dine_in')
            AND status NOT IN ('Completed', 'Delivered', 'Cancelled', 'Declined') 
            AND table_number IS NOT NULL AND table_number != ''
        ");
        $activeTableNumbers = $activeStmt->fetchAll(PDO::FETCH_COLUMN);

        foreach ($activeTableNumbers as $t) {
            $tNorm = trim(strtolower($t));
            $occupiedSet[$tNorm] = true;
            $cleanNum = preg_replace('/[^0-9]/', '', $t);
            if ($cleanNum) {
                $occupiedSet[$cleanNum] = true;
                $occupiedSet["table " . $cleanNum] = true;
                $occupiedSet["table" . $cleanNum] = true;
            }
        }
    } catch (Exception $eOcc) {
        // Fallback
    }

    // Check if restaurant_tables or tables exists
    $tables = [];
    try {
        $stmt = $db->query("SELECT id, table_name, status FROM restaurant_tables ORDER BY id ASC");
        $tables = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e1) {
        try {
            $stmt = $db->query("SELECT * FROM tables ORDER BY id ASC");
            $tables = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e2) {
            $tables = [];
        }
    }

    // Enhance each table with live occupancy state
    foreach ($tables as &$tbl) {
        $tableName = $tbl['table_name'] ?? ($tbl['name'] ?? "Table " . $tbl['id']);
        $nameLower = trim(strtolower($tableName));
        $idStr = strval($tbl['id']);
        
        $isOccupied = isset($occupiedSet[$nameLower]) || 
                      isset($occupiedSet[$idStr]) || 
                      isset($occupiedSet["table " . $idStr]) ||
                      (isset($tbl['status']) && (strtolower(strval($tbl['status'])) === 'occupied' || strval($tbl['status']) === '0'));

        $tbl['table_name'] = $tableName;
        $tbl['is_occupied'] = $isOccupied;
        $tbl['status'] = $isOccupied ? 'occupied' : 'available';
    }

    echo json_encode([
        "status" => "success",
        "success" => true,
        "data" => $tables ?: []
    ]);
} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "success" => false,
        "message" => $e->getMessage(),
        "data" => []
    ]);
}
exit();

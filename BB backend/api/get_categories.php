<?php
include_once __DIR__ . '/../config/cors_headers.php';

// Folder paths check karein
include_once __DIR__ . '/../config/Database.php';
include_once __DIR__ . '/../models/Category.php';

$database = new Database();
$db = $database->getConnection();

if($db) {
    $category = new Category($db);
    $stmt = $category->read();
    $num = $stmt->rowCount();

    if($num > 0) {
        $cat_arr = array();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)){
            // Ensure values are strings/integers correctly
            $cat_item = array(
                "id" => $row['id'],
                "name" => $row['name'],
                "img" => $row['img'],
                "show_on_hero" => (int)($row['show_on_hero'] ?? 0)
            );
            array_push($cat_arr, $cat_item);
        }
        http_response_code(200);
        echo json_encode($cat_arr);
    } else {
        http_response_code(200);
        echo json_encode([]); // Khali array bhejain agar data na ho
    }
} else {
    http_response_code(500);
    echo json_encode(["message" => "Database connection failed"]);
}
?>
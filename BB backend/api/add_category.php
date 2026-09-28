<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
require_role(['Admin', 'Manager']);

include_once __DIR__ . '/../config/Database.php';
include_once __DIR__ . '/../models/Category.php';

$database = new Database();
$db = $database->getConnection();
$category = new Category($db);

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->name) && !empty($data->img)){
    $category->name = $data->name;
    $category->img = $data->img; // Cloudinary URL Handle
    $category->show_on_hero = isset($data->show_on_hero) ? ($data->show_on_hero ? 1 : 0) : 0;

    if($category->create()){
        echo json_encode(["success" => true, "id" => $db->lastInsertId()]);
    } else {
        echo json_encode(["success" => false]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Data incomplete."]);
}
?>
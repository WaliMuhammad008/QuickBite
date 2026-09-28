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

if(!empty($data->id) && !empty($data->name) && !empty($data->img)){
    $category->id = $data->id;
    $category->name = $data->name;
    $category->img = $data->img; // Yeh Naya URL hai jo frontend se aya
    $category->show_on_hero = isset($data->show_on_hero) ? ($data->show_on_hero ? 1 : 0) : 0;

    // --- STEP 1: Update karne se pehle purani image aur naam nikalna ---
    $query = "SELECT name, img FROM categories WHERE id = ?";
    $stmt = $db->prepare($query);
    $stmt->execute([$category->id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    $oldName = $row['name'] ?? '';
    $oldImageUrl = $row['img'] ?? '';

    // --- STEP 2: Database mein naya data Update karna ---
    if($category->update()){
        // Cascade category name change to menu_items
        if (!empty($oldName) && $oldName !== $category->name) {
            $cascadeStmt = $db->prepare("UPDATE menu_items SET category = ? WHERE category = ?");
            $cascadeStmt->execute([$category->name, $oldName]);
        }
        
        // --- STEP 3: Agar nayi image aayi hai, toh purani ko Cloudinary se Delete karna ---
        // Check: Purani image mojood ho + Nayi image purani se mukhtalif ho + Cloudinary ka link ho
        if (!empty($oldImageUrl) && $oldImageUrl !== $category->img && strpos($oldImageUrl, 'cloudinary.com') !== false) {
            
            // 👇 APNI CLOUDINARY DETAILS YAHAN DALEIN 👇
            $cloud_name = "dovuegkwa";
            $api_key = "188259856346934";
            $api_secret = "_RWHAQbUhMHVXp4E5IgPIvIDjAI";

            $parts = explode('/', parse_url($oldImageUrl, PHP_URL_PATH));
            $filename = end($parts);
            $public_id = pathinfo($filename, PATHINFO_FILENAME);

            $timestamp = time();
            $signature = sha1("public_id=" . $public_id . "&timestamp=" . $timestamp . $api_secret);

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, "https://api.cloudinary.com/v1_1/" . $cloud_name . "/image/destroy");
            curl_setopt($ch, CURLOPT_POST, TRUE);
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
                "public_id" => $public_id,
                "api_key" => $api_key,
                "timestamp" => $timestamp,
                "signature" => $signature
            ]));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
            
            // Localhost SSL error bypass (jo pichli dafa masla kar raha tha)
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); 
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

            curl_exec($ch);
            curl_close($ch);
        }

        http_response_code(200);
        echo json_encode(["success" => true, "message" => "Category updated successfully."]);
    } else {
        http_response_code(503);
        echo json_encode(["success" => false, "message" => "Unable to update category."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Incomplete data."]);
}
?>
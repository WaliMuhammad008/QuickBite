<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/auth_middleware.php';
require_role(['Admin', 'Manager']);
include_once __DIR__ . '/../config/Database.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"));
if (!$data || !isset($data->action)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "No action specified"]);
    exit();
}

$action = $data->action;

try {
    if ($action === 'update_order') {
        $db->beginTransaction();
        if (isset($data->sections) && is_array($data->sections)) {
            $stmt = $db->prepare("UPDATE homepage_sections SET sort_order = :sort WHERE id = :id");
            foreach ($data->sections as $sec) {
                $stmt->execute([':sort' => intval($sec->sort_order), ':id' => intval($sec->id)]);
            }
        }
        if (isset($data->hero_sliders) && is_array($data->hero_sliders)) {
            $stmt = $db->prepare("UPDATE hero_sliders SET sort_order = :sort WHERE id = :id");
            foreach ($data->hero_sliders as $slide) {
                $stmt->execute([':sort' => intval($slide->sort_order), ':id' => intval($slide->id)]);
            }
        }
        $db->commit();
        echo json_encode(["success" => true, "message" => "Order updated successfully"]);
    }
    elseif ($action === 'add_section') {
        $stmt = $db->prepare("INSERT INTO homepage_sections (section_type, title, subtitle, image_url, link_url, content_data, sort_order, slider_type, is_active) VALUES (:type, :title, :subtitle, :image, :link, :content, :sort, :slider_type, :is_active)");
        $slider_type = isset($data->slider_type) ? $data->slider_type : 'regular';
        $is_active = isset($data->is_active) ? intval($data->is_active) : 1;
        $sort_order = isset($data->sort_order) ? intval($data->sort_order) : 10;

        $stmt->execute([
            ':type' => $data->section_type,
            ':title' => $data->title ?? '',
            ':subtitle' => $data->subtitle ?? '',
            ':image' => $data->image_url ?? '',
            ':link' => $data->link_url ?? '',
            ':content' => $data->content_data ?? '',
            ':sort' => $sort_order,
            ':slider_type' => $slider_type,
            ':is_active' => $is_active
        ]);
        
        echo json_encode(["success" => true, "message" => "Section created successfully", "id" => (int)$db->lastInsertId()]);
    }
    elseif ($action === 'delete_section') {
        $stmt = $db->prepare("DELETE FROM homepage_sections WHERE id = :id");
        $stmt->execute([':id' => intval($data->id)]);
        echo json_encode(["success" => true, "message" => "Section deleted successfully"]);
    }
    elseif ($action === 'toggle_section_status') {
        $is_active = isset($data->is_active) ? intval($data->is_active) : 1;
        $stmt = $db->prepare("UPDATE homepage_sections SET is_active = :is_active WHERE id = :id");
        $stmt->execute([':is_active' => $is_active, ':id' => intval($data->id)]);
        echo json_encode(["success" => true, "message" => "Section status updated", "is_active" => $is_active]);
    }
    elseif ($action === 'toggle_hero_status') {
        $is_active = isset($data->is_active) ? intval($data->is_active) : 1;
        $stmt = $db->prepare("UPDATE hero_sliders SET is_active = :is_active WHERE id = :id");
        $stmt->execute([':is_active' => $is_active, ':id' => intval($data->id)]);
        echo json_encode(["success" => true, "message" => "Hero slide status updated", "is_active" => $is_active]);
    }
    elseif ($action === 'add_hero') {
        $stmt = $db->prepare("INSERT INTO hero_sliders (image_url, title, subtitle, link_url, sort_order, is_active) VALUES (:image, :title, :subtitle, :link, :sort, :is_active)");
        $is_active = isset($data->is_active) ? intval($data->is_active) : 1;
        $sort_order = isset($data->sort_order) ? intval($data->sort_order) : 0;

        $stmt->execute([
            ':image' => $data->image_url ?? '',
            ':title' => $data->title ?? '',
            ':subtitle' => $data->subtitle ?? '',
            ':link' => $data->link_url ?? '',
            ':sort' => $sort_order,
            ':is_active' => $is_active
        ]);
        
        echo json_encode(["success" => true, "message" => "Hero slider added", "id" => (int)$db->lastInsertId()]);
    }
    elseif ($action === 'delete_hero') {
        $stmt = $db->prepare("DELETE FROM hero_sliders WHERE id = :id");
        $stmt->execute([':id' => intval($data->id)]);
        echo json_encode(["success" => true, "message" => "Hero slide deleted successfully"]);
    }
    elseif ($action === 'update_section') {
        $stmt = $db->prepare("UPDATE homepage_sections SET section_type=:type, title=:title, subtitle=:subtitle, image_url=:image, link_url=:link, content_data=:content, sort_order=:sort, slider_type=:slider_type WHERE id=:id");
        $slider_type = isset($data->slider_type) ? $data->slider_type : 'regular';
        $sort_order = isset($data->sort_order) ? intval($data->sort_order) : 0;

        $stmt->execute([
            ':type' => $data->section_type,
            ':title' => $data->title ?? '',
            ':subtitle' => $data->subtitle ?? '',
            ':image' => $data->image_url ?? '',
            ':link' => $data->link_url ?? '',
            ':content' => $data->content_data ?? '',
            ':sort' => $sort_order,
            ':slider_type' => $slider_type,
            ':id' => intval($data->id)
        ]);
        
        echo json_encode(["success" => true, "message" => "Section updated successfully"]);
    }
    elseif ($action === 'update_hero') {
        $stmt = $db->prepare("UPDATE hero_sliders SET image_url=:image, title=:title, subtitle=:subtitle, link_url=:link, sort_order=:sort WHERE id=:id");
        $sort_order = isset($data->sort_order) ? intval($data->sort_order) : 0;

        $stmt->execute([
            ':image' => $data->image_url ?? '',
            ':title' => $data->title ?? '',
            ':subtitle' => $data->subtitle ?? '',
            ':link' => $data->link_url ?? '',
            ':sort' => $sort_order,
            ':id' => intval($data->id)
        ]);
        
        echo json_encode(["success" => true, "message" => "Hero slide updated successfully"]);
    }
    else {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Unknown action: " . htmlspecialchars($action)]);
    }
} catch (PDOException $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database Error: " . $e->getMessage()]);
}
?>

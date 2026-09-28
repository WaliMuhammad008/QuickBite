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
    echo json_encode(["success" => false, "message" => "Invalid payload"]);
    exit();
}

try {
    if ($data->action === 'get_all_banners') {
        // Fetch all potential banners from deals and menu_items
        $dealStmt = $db->query("SELECT id, title as name, description, price, img, promo_banner_image, is_featured_banner, banner_order, is_active FROM deals ORDER BY is_featured_banner DESC, banner_order ASC, id DESC");
        $deals = $dealStmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($deals as &$d) {
            $d['type'] = 'deal';
            $d['is_featured_banner'] = (bool)$d['is_featured_banner'];
            $d['banner_order'] = intval($d['banner_order']);
        }

        $menuStmt = $db->query("SELECT id, name, description, category, img, promo_banner_image, is_featured_banner, banner_order, isAvailable FROM menu_items ORDER BY is_featured_banner DESC, banner_order ASC, id DESC");
        $menuItems = $menuStmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($menuItems as &$m) {
            $m['type'] = 'product';
            $m['is_featured_banner'] = (bool)$m['is_featured_banner'];
            $m['banner_order'] = intval($m['banner_order']);
        }

        echo json_encode([
            "success" => true,
            "data" => [
                "deals" => $deals,
                "products" => $menuItems
            ]
        ]);
        exit();
    }

    if ($data->action === 'update_banner_status') {
        $type = $data->type; // 'deal' or 'product'
        $id = intval($data->id);
        $isFeatured = !empty($data->is_featured_banner) ? 1 : 0;
        $bannerOrder = isset($data->banner_order) ? intval($data->banner_order) : 0;
        $promoBannerImage = isset($data->promo_banner_image) ? $data->promo_banner_image : null;

        if ($type === 'deal') {
            if ($promoBannerImage !== null) {
                $stmt = $db->prepare("UPDATE deals SET is_featured_banner = :is_featured, banner_order = :banner_order, promo_banner_image = :promo_img WHERE id = :id");
                $stmt->execute([':is_featured' => $isFeatured, ':banner_order' => $bannerOrder, ':promo_img' => $promoBannerImage, ':id' => $id]);
            } else {
                $stmt = $db->prepare("UPDATE deals SET is_featured_banner = :is_featured, banner_order = :banner_order WHERE id = :id");
                $stmt->execute([':is_featured' => $isFeatured, ':banner_order' => $bannerOrder, ':id' => $id]);
            }
        } else {
            if ($promoBannerImage !== null) {
                $stmt = $db->prepare("UPDATE menu_items SET is_featured_banner = :is_featured, banner_order = :banner_order, promo_banner_image = :promo_img WHERE id = :id");
                $stmt->execute([':is_featured' => $isFeatured, ':banner_order' => $bannerOrder, ':promo_img' => $promoBannerImage, ':id' => $id]);
            } else {
                $stmt = $db->prepare("UPDATE menu_items SET is_featured_banner = :is_featured, banner_order = :banner_order WHERE id = :id");
                $stmt->execute([':is_featured' => $isFeatured, ':banner_order' => $bannerOrder, ':id' => $id]);
            }
        }

        echo json_encode(["success" => true, "message" => "Banner updated successfully"]);
        exit();
    }

    if ($data->action === 'reorder_banners') {
        if (!empty($data->banners) && is_array($data->banners)) {
            $db->beginTransaction();
            foreach ($data->banners as $idx => $b) {
                $type = $b->type;
                $id = intval($b->id);
                $order = intval($b->banner_order ?? $idx);
                $isFeatured = !empty($b->is_featured_banner) ? 1 : 0;

                if ($type === 'deal') {
                    $stmt = $db->prepare("UPDATE deals SET banner_order = :order, is_featured_banner = :is_featured WHERE id = :id");
                    $stmt->execute([':order' => $order, ':is_featured' => $isFeatured, ':id' => $id]);
                } else {
                    $stmt = $db->prepare("UPDATE menu_items SET banner_order = :order, is_featured_banner = :is_featured WHERE id = :id");
                    $stmt->execute([':order' => $order, ':is_featured' => $isFeatured, ':id' => $id]);
                }
            }
            $db->commit();
            echo json_encode(["success" => true, "message" => "Banners reordered successfully"]);
            exit();
        }
    }

    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Unknown action"]);

} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database Error: " . $e->getMessage()]);
}
?>

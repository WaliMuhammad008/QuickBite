<?php error_reporting(0);
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/Database.php';

$database = new Database();
$db = $database->getConnection();

$include_all = isset($_GET['all']) && ($_GET['all'] == '1' || $_GET['all'] == 'true');

// Fetch Hero Sliders
if ($include_all) {
    $query_hero = "SELECT id, image_url, title, subtitle, link_url, sort_order, is_active FROM hero_sliders ORDER BY sort_order ASC";
} else {
    $query_hero = "SELECT id, image_url, title, subtitle, link_url, sort_order FROM hero_sliders WHERE is_active = 1 ORDER BY sort_order ASC";
}
$stmt_hero = $db->prepare($query_hero);
$stmt_hero->execute();
$hero_sliders = $stmt_hero->fetchAll(PDO::FETCH_ASSOC);

// Fetch Homepage Sections Layout
if ($include_all) {
    $query_sections = "SELECT id, section_type, title, subtitle, image_url, link_url, content_data, slider_type, sort_order, is_active FROM homepage_sections ORDER BY sort_order ASC";
} else {
    $query_sections = "SELECT id, section_type, title, subtitle, image_url, link_url, content_data, slider_type, sort_order FROM homepage_sections WHERE is_active = 1 ORDER BY sort_order ASC";
}
$stmt_sections = $db->prepare($query_sections);
$stmt_sections->execute();
$homepage_sections = $stmt_sections->fetchAll(PDO::FETCH_ASSOC);

// ═══════════════════════════════════════════════════════════════
// 3. UNIFIED PROMO BANNERS (DEALS + MENU PRODUCTS)
// ═══════════════════════════════════════════════════════════════
$db->exec("UPDATE deals SET is_active = 0 WHERE is_active = 1 AND expires_at IS NOT NULL AND expires_at <= NOW()");

$featured_banners = [];

// A. Fetch Deals with is_featured_banner = 1
$query_deal_banners = "SELECT id, title, description, price, original_price, badge_tag, img, promo_banner_image, is_featured_banner, banner_order 
                       FROM deals 
                       WHERE is_featured_banner = 1 AND is_active = 1 AND (expires_at IS NULL OR expires_at > NOW())
                       ORDER BY banner_order ASC, id DESC";
$stmt_deal_banners = $db->prepare($query_deal_banners);
$stmt_deal_banners->execute();
$deal_banners_raw = $stmt_deal_banners->fetchAll(PDO::FETCH_ASSOC);

foreach ($deal_banners_raw as $b) {
    $bannerImg = !empty($b['promo_banner_image']) ? $b['promo_banner_image'] : $b['img'];
    
    // Fetch structured deal items for raw_data
    $itemStmt = $db->prepare("SELECT id, item_title, quantity, is_customizable, choice_group_name, options_json FROM deal_items WHERE deal_id = :deal_id ORDER BY id ASC");
    $itemStmt->execute([':deal_id' => $b['id']]);
    $rawItems = $itemStmt->fetchAll(PDO::FETCH_ASSOC);
    $itemsList = [];
    foreach ($rawItems as $it) {
        $options = null;
        if (!empty($it['options_json'])) {
            $options = is_string($it['options_json']) ? json_decode($it['options_json'], true) : $it['options_json'];
        }
        $itemsList[] = [
            'id' => $it['id'],
            'item_title' => $it['item_title'],
            'quantity' => intval($it['quantity'] ?? 1),
            'is_customizable' => intval($it['is_customizable'] ?? 0) === 1,
            'choice_group_name' => $it['choice_group_name'],
            'options' => $options ?? []
        ];
    }

    $rawDealObj = [
        "id" => intval($b['id']),
        "deal_id" => intval($b['id']),
        "name" => $b['title'],
        "title" => $b['title'],
        "description" => $b['description'],
        "price" => floatval($b['price']),
        "original_price" => !empty($b['original_price']) ? floatval($b['original_price']) : null,
        "badge_tag" => $b['badge_tag'] ?? 'HOT DEAL',
        "tag" => $b['badge_tag'] ?? 'HOT DEAL',
        "img" => $b['img'],
        "image" => $b['img'],
        "promo_banner_image" => $b['promo_banner_image'],
        "is_deal" => true,
        "is_featured_banner" => 1,
        "items" => $itemsList,
        "size" => "Combo"
    ];

    $featured_banners[] = [
        "id" => "deal-" . $b['id'],
        "target_id" => intval($b['id']),
        "type" => "deal",
        "title" => $b['title'],
        "name" => $b['title'],
        "description" => $b['description'],
        "subtitle" => $b['description'] ? $b['description'] : "Special Limited Time Combo",
        "price" => floatval($b['price']),
        "original_price" => !empty($b['original_price']) ? floatval($b['original_price']) : null,
        "badge_tag" => $b['badge_tag'] ?? 'HOT DEAL',
        "image" => $bannerImg,
        "img" => $bannerImg,
        "promo_banner_image" => $b['promo_banner_image'],
        "banner_order" => intval($b['banner_order'] ?? 0),
        "link" => "/deals?selected=" . $b['id'],
        "link_url" => "/deals?selected=" . $b['id'],
        "deal_id" => intval($b['id']),
        "is_deal" => true,
        "raw_data" => $rawDealObj
    ];
}

// B. Fetch Menu Items with is_featured_banner = 1
$insufficientVariants = [];
$insufficientProducts = [];
try {
    $rStmt = $db->query("SELECT r.menu_item_id, LOWER(TRIM(COALESCE(r.variant_name, ''))) as variant_name, r.quantity_to_deduct, i.stock 
                         FROM recipes r 
                         JOIN inventory i ON r.inventory_id = i.id");
    if ($rStmt) {
        while ($rRow = $rStmt->fetch(PDO::FETCH_ASSOC)) {
            $mId = intval($rRow['menu_item_id']);
            $vName = $rRow['variant_name'];
            $stock = floatval($rRow['stock']);
            $needed = floatval($rRow['quantity_to_deduct']);
            if ($stock <= 0 || $stock < $needed) {
                if (!empty($vName)) {
                    $insufficientVariants[$mId][$vName] = true;
                } else {
                    $insufficientProducts[$mId] = true;
                }
            }
        }
    }
} catch (Exception $e) {}

$query_menu_banners = "SELECT id, name, description, category, img, promo_banner_image, is_featured_banner, banner_order, isAvailable, isTopDeal, isBestSeller 
                       FROM menu_items 
                       WHERE is_featured_banner = 1 AND isAvailable = 1 
                       ORDER BY banner_order ASC, id DESC";
$stmt_menu_banners = $db->prepare($query_menu_banners);
$stmt_menu_banners->execute();
$menu_banners_raw = $stmt_menu_banners->fetchAll(PDO::FETCH_ASSOC);

foreach ($menu_banners_raw as $m) {
    $bannerImg = !empty($m['promo_banner_image']) ? $m['promo_banner_image'] : $m['img'];
    $mId = intval($m['id']);
    
    // Fetch variants
    $vStmt = $db->prepare("SELECT id, size_name, price, in_stock FROM menu_variants WHERE menu_id = :menu_id ORDER BY id ASC");
    $vStmt->execute([':menu_id' => $mId]);
    $variantsRaw = $vStmt->fetchAll(PDO::FETCH_ASSOC);
    $variants = [];
    $basePrice = 0;
    $hasAnyInStock = false;

    foreach ($variantsRaw as $v) {
        $rawInStock = isset($v['in_stock']) ? (bool)$v['in_stock'] : true;
        $vNameLower = strtolower(trim($v['size_name'] ?? ''));

        $isVariantDepleted = false;
        if (isset($insufficientProducts[$mId])) {
            $isVariantDepleted = true;
        } else if (isset($insufficientVariants[$mId])) {
            if (!empty($insufficientVariants[$mId][$vNameLower])) {
                $isVariantDepleted = true;
            } else if (!empty($insufficientVariants[$mId]['regular']) && ($vNameLower === 'regular' || $vNameLower === 'standard' || empty($vNameLower))) {
                $isVariantDepleted = true;
            }
        }

        $effectiveInStock = $rawInStock && !$isVariantDepleted;
        if ($effectiveInStock) $hasAnyInStock = true;

        $variants[] = [
            "id" => $v['id'],
            "size" => $v['size_name'],
            "price" => floatval($v['price']),
            "inStock" => $effectiveInStock
        ];
    }
    if (count($variants) > 0) {
        $basePrice = $variants[0]['price'];
    }

    $isItemAvailable = (bool)$m['isAvailable'];
    if (!empty($variants) && !$hasAnyInStock) {
        $isItemAvailable = false;
    } else if (isset($insufficientProducts[$mId])) {
        $isItemAvailable = false;
    }

    $rawProductObj = [
        "id" => $mId,
        "name" => $m['name'],
        "description" => $m['description'],
        "category" => $m['category'],
        "img" => $m['img'],
        "image" => $m['img'],
        "promo_banner_image" => $m['promo_banner_image'],
        "isAvailable" => $isItemAvailable,
        "isTopDeal" => (bool)$m['isTopDeal'],
        "isBestSeller" => (bool)$m['isBestSeller'],
        "price" => $basePrice,
        "variants" => $variants,
        "is_deal" => false
    ];

    $featured_banners[] = [
        "id" => "prod-" . $m['id'],
        "target_id" => intval($m['id']),
        "type" => "product",
        "title" => $m['name'],
        "name" => $m['name'],
        "description" => $m['description'],
        "subtitle" => $m['description'] ? $m['description'] : "Freshly Made " . $m['name'],
        "price" => $basePrice,
        "original_price" => null,
        "badge_tag" => !empty($m['isTopDeal']) ? "TOP DEAL" : (!empty($m['isBestSeller']) ? "BEST SELLER" : "FEATURED"),
        "image" => $bannerImg,
        "img" => $bannerImg,
        "promo_banner_image" => $m['promo_banner_image'],
        "banner_order" => intval($m['banner_order'] ?? 0),
        "link" => "product:" . $m['id'],
        "link_url" => "product:" . $m['id'],
        "is_deal" => false,
        "raw_data" => $rawProductObj
    ];
}

// Sort all featured banners by banner_order ASC
usort($featured_banners, function($a, $b) {
    return $a['banner_order'] - $b['banner_order'];
});

// Fetch Settings for homepage (hero position and empty message)
$query_settings = "SELECT setting_key, setting_value FROM settings WHERE setting_key IN ('hero_section_sort_order', 'empty_homepage_message')";
$stmt_settings = $db->prepare($query_settings);
$stmt_settings->execute();
$settings_result = $stmt_settings->fetchAll(PDO::FETCH_ASSOC);

$homepage_settings = [
    'hero_section_sort_order' => '0',
    'empty_homepage_message' => 'Homepage is currently empty. Add sections from the Admin Panel.'
];

foreach ($settings_result as $row) {
    if ($row['setting_key'] === 'hero_section_sort_order') {
        $homepage_settings['hero_section_sort_order'] = $row['setting_value'];
    }
    if ($row['setting_key'] === 'empty_homepage_message') {
        $homepage_settings['empty_homepage_message'] = $row['setting_value'];
    }
}

// Fetch Hero Categories (show_on_hero = 1)
$stmt_hero_cats = $db->prepare("SELECT id, name, img FROM categories WHERE show_on_hero = 1 AND img IS NOT NULL AND img != '' ORDER BY id ASC");
$stmt_hero_cats->execute();
$hero_categories = $stmt_hero_cats->fetchAll(PDO::FETCH_ASSOC);

// If none explicitly selected, fallback to active categories with images
if (empty($hero_categories)) {
    $stmt_fallback = $db->prepare("SELECT id, name, img FROM categories WHERE img IS NOT NULL AND img != '' ORDER BY id DESC LIMIT 8");
    $stmt_fallback->execute();
    $hero_categories = $stmt_fallback->fetchAll(PDO::FETCH_ASSOC);
}

// Fetch Customer Reviews for Homepage
$reviews_data = [];
$total_approved_reviews = 0;
$avg_rating = 5.0;

try {
    $reviews_query = "SELECT id, order_id, customer_name, rating, review_text, tags, item_ratings, is_featured, created_at 
                      FROM order_reviews 
                      WHERE status = 'approved' 
                      ORDER BY is_featured DESC, id DESC 
                      LIMIT 25";
    $stmt_rev = $db->prepare($reviews_query);
    $stmt_rev->execute();
    $reviews_data = $stmt_rev->fetchAll(PDO::FETCH_ASSOC);

    $rev_stats_query = "SELECT COUNT(*) as total_reviews, AVG(rating) as avg_rating 
                        FROM order_reviews 
                        WHERE status = 'approved'";
    $stmt_stats = $db->query($rev_stats_query);
    if ($stmt_stats) {
        $rev_stats = $stmt_stats->fetch(PDO::FETCH_ASSOC);
        $total_approved_reviews = intval($rev_stats['total_reviews'] ?? 0);
        $avg_rating = $total_approved_reviews > 0 ? round(floatval($rev_stats['avg_rating']), 1) : 5.0;
    }
} catch (Exception $e) {
    // Graceful fallback if table does not exist
}

echo json_encode([
    "success" => true,
    "data" => [
        "hero_sliders" => $hero_sliders,
        "hero_categories" => $hero_categories,
        "sections" => $homepage_sections,
        "featured_banners" => $featured_banners,
        "settings" => $homepage_settings,
        "reviews" => $reviews_data,
        "reviews_summary" => [
            "total_reviews" => $total_approved_reviews,
            "average_rating" => $avg_rating
        ]
    ]
]);
?>

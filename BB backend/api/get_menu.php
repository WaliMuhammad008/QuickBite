<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/Database.php';

$database = new Database();
$conn = $database->getConnection();

if (!$conn) {
    echo json_encode(["success" => false, "message" => "Database connection failed."]);
    exit();
}

// 🌟 1. Aggregate Live Item-Level Ratings from Approved Reviews
$menuRatingsMap = [];
$menuNameRatingsMap = [];

try {
    $revStmt = $conn->query("SELECT item_ratings, rating, status FROM order_reviews WHERE LOWER(status) = 'approved' OR status IS NULL OR status = ''");
    if ($revStmt) {
        while ($rRow = $revStmt->fetch(PDO::FETCH_ASSOC)) {
            $generalRating = floatval($rRow['rating'] ?? 5.0);
            if (!empty($rRow['item_ratings'])) {
                $parsed = json_decode($rRow['item_ratings'], true);
                if (is_array($parsed)) {
                    foreach ($parsed as $it) {
                        $mId = intval($it['menu_id'] ?? 0);
                        $rVal = floatval($it['rating'] ?? $generalRating);
                        $itemName = strtolower(trim($it['item_name'] ?? ''));

                        if ($rVal >= 1) {
                            if ($mId > 0) {
                                if (!isset($menuRatingsMap[$mId])) {
                                    $menuRatingsMap[$mId] = ['sum' => 0, 'count' => 0];
                                }
                                $menuRatingsMap[$mId]['sum'] += $rVal;
                                $menuRatingsMap[$mId]['count'] += 1;
                            }
                            if (!empty($itemName)) {
                                if (!isset($menuNameRatingsMap[$itemName])) {
                                    $menuNameRatingsMap[$itemName] = ['sum' => 0, 'count' => 0];
                                }
                                $menuNameRatingsMap[$itemName]['sum'] += $rVal;
                                $menuNameRatingsMap[$itemName]['count'] += 1;
                            }
                        }
                    }
                }
            }
        }
    }
} catch (Exception $e) {
    // Graceful fallback if table is not yet migrated
}

// 🌟 2. Fetch Live Recipe Stock Requirements to Dynamically Check In-Stock Status
$insufficientVariants = []; // [menu_id => [variant_name => true]]
$insufficientProducts = []; // [menu_id => true]

try {
    $recipeStockQuery = "SELECT r.menu_item_id, LOWER(TRIM(COALESCE(r.variant_name, ''))) as variant_name, 
                                r.quantity_to_deduct, i.stock 
                         FROM recipes r 
                         JOIN inventory i ON r.inventory_id = i.id";
    $rStmt = $conn->query($recipeStockQuery);
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
} catch (Exception $e) {
    // Fallback if recipes or inventory query has issues
}

// 🌟 3. Fetch Menu Items & Variants (Only exclude products if Admin manually disabled them)
$isAdmin = isset($_GET['admin']) || isset($_GET['all']);
$whereClause = $isAdmin ? "" : " WHERE (m.isAvailable = 1 OR m.isAvailable IS NULL)";
$query = "SELECT m.*, v.size_name, v.price, v.id as variant_id, v.in_stock 
          FROM menu_items m 
          LEFT JOIN menu_variants v ON m.id = v.menu_id" . $whereClause . " 
          ORDER BY m.id ASC, v.id ASC";

$stmt = $conn->query($query);
$menu = [];

if ($stmt && $stmt->rowCount() > 0) {
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $id = intval($row['id']);
        
        if (!isset($menu[$id])) {
            $normName = strtolower(trim($row['name']));
            $avgRating = 0.0;
            $totalReviews = 0;

            if (isset($menuRatingsMap[$id]) && $menuRatingsMap[$id]['count'] > 0) {
                $avgRating = round($menuRatingsMap[$id]['sum'] / $menuRatingsMap[$id]['count'], 1);
                $totalReviews = intval($menuRatingsMap[$id]['count']);
            } elseif (isset($menuNameRatingsMap[$normName]) && $menuNameRatingsMap[$normName]['count'] > 0) {
                $avgRating = round($menuNameRatingsMap[$normName]['sum'] / $menuNameRatingsMap[$normName]['count'], 1);
                $totalReviews = intval($menuNameRatingsMap[$normName]['count']);
            } else {
                // Check if any review item_name contains this product's name or vice-versa
                foreach ($menuNameRatingsMap as $revName => $rStats) {
                    if (strpos($normName, $revName) !== false || strpos($revName, $normName) !== false) {
                        $avgRating = round($rStats['sum'] / $rStats['count'], 1);
                        $totalReviews = intval($rStats['count']);
                        break;
                    }
                }
            }

            $menu[$id] = [
                "id" => $id,
                "name" => $row['name'],
                "description" => $row['description'],
                "category" => $row['category'],
                "img" => $row['img'],
                "promo_banner_image" => $row['promo_banner_image'],
                "is_featured_banner" => (bool)$row['is_featured_banner'],
                "banner_order" => intval($row['banner_order'] ?? 0),
                "isAvailable" => (bool)$row['isAvailable'],
                "inStock" => true,
                "isTopDeal" => (bool)$row['isTopDeal'],
                "isBestSeller" => (bool)$row['isBestSeller'],
                "has_spice_option" => isset($row['has_spice_option']) ? (bool)$row['has_spice_option'] : true,
                "avg_rating" => $avgRating,
                "rating" => $avgRating,
                "total_reviews" => $totalReviews,
                "review_count" => $totalReviews,
                "reviews_count" => $totalReviews,
                "variants" => []
            ];
        }
        
        if ($row['variant_id']) {
            $rawInStock = isset($row['in_stock']) ? (bool)$row['in_stock'] : true;
            $vNameLower = strtolower(trim($row['size_name'] ?? ''));

            $isVariantDepleted = false;
            if (isset($insufficientProducts[$id])) {
                $isVariantDepleted = true;
            } else if (isset($insufficientVariants[$id])) {
                if (!empty($insufficientVariants[$id][$vNameLower])) {
                    $isVariantDepleted = true;
                } else if (!empty($insufficientVariants[$id]['regular']) && ($vNameLower === 'regular' || $vNameLower === 'standard' || empty($vNameLower))) {
                    $isVariantDepleted = true;
                }
            }

            $effectiveInStock = $rawInStock && !$isVariantDepleted;

            $menu[$id]['variants'][] = [
                "id" => $row['variant_id'],
                "size" => $row['size_name'],
                "price" => $row['price'],
                "inStock" => $effectiveInStock
            ];
            
            // Default price for table view
            if (!isset($menu[$id]['price'])) {
                $menu[$id]['price'] = $row['price'];
            }
        }
    }
}

// Compute dynamic inStock flag for each product.
// DO NOT overwrite isAvailable (Admin toggle).
// DO NOT exclude out-of-stock products from the final array.
foreach ($menu as &$item) {
    $itemInStock = true;

    if (!empty($item['variants'])) {
        $hasAnyInStock = false;
        foreach ($item['variants'] as $v) {
            if (!empty($v['inStock'])) {
                $hasAnyInStock = true;
                break;
            }
        }
        $itemInStock = $hasAnyInStock;
    } else if (isset($insufficientProducts[$item['id']])) {
        $itemInStock = false;
    }

    $item['inStock'] = $itemInStock;
}
unset($item);

echo json_encode(array_values($menu));
$conn = null;
?>
<?php
include_once __DIR__ . '/../config/cors_headers.php';
include_once __DIR__ . '/../config/Database.php';
include_once __DIR__ . '/../config/InventoryHelper.php';

$database = new Database();
$db = $database->getConnection();

// ─── AUTO-MIGRATE: Ensure payment_method, payment_status, and coordinate columns exist ───
try {
    $checkCustId = $db->prepare("SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                                  WHERE TABLE_SCHEMA = DATABASE() 
                                  AND TABLE_NAME = 'orders' 
                                  AND COLUMN_NAME = 'customer_id'");
    $checkCustId->execute();
    if ($checkCustId->fetchColumn() == 0) {
        $db->exec("ALTER TABLE `orders` ADD COLUMN `customer_id` INT NULL AFTER `id`");
    }

    $checkCol = $db->prepare("SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                               WHERE TABLE_SCHEMA = DATABASE() 
                               AND TABLE_NAME = 'orders' 
                               AND COLUMN_NAME = 'payment_method'");
    $checkCol->execute();
    if ($checkCol->fetchColumn() == 0) {
        $db->exec("ALTER TABLE `orders` ADD COLUMN `payment_method` VARCHAR(50) NOT NULL DEFAULT 'cod' AFTER `status`");
    }

    $checkCol2 = $db->prepare("SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                                WHERE TABLE_SCHEMA = DATABASE() 
                                AND TABLE_NAME = 'orders' 
                                AND COLUMN_NAME = 'payment_status'");
    $checkCol2->execute();
    if ($checkCol2->fetchColumn() == 0) {
        $db->exec("ALTER TABLE `orders` ADD COLUMN `payment_status` VARCHAR(50) NOT NULL DEFAULT 'Pending' AFTER `payment_method`");
    }

    $checkLat = $db->prepare("SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                               WHERE TABLE_SCHEMA = DATABASE() 
                               AND TABLE_NAME = 'orders' 
                               AND COLUMN_NAME = 'customer_lat'");
    $checkLat->execute();
    if ($checkLat->fetchColumn() == 0) {
        $db->exec("ALTER TABLE `orders` ADD COLUMN `customer_lat` DECIMAL(10, 8) NULL DEFAULT NULL AFTER `customer_address`");
    }

    $checkLng = $db->prepare("SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                               WHERE TABLE_SCHEMA = DATABASE() 
                               AND TABLE_NAME = 'orders' 
                               AND COLUMN_NAME = 'customer_lng'");
    $checkLng->execute();
    if ($checkLng->fetchColumn() == 0) {
        $db->exec("ALTER TABLE `orders` ADD COLUMN `customer_lng` DECIMAL(11, 8) NULL DEFAULT NULL AFTER `customer_lat`");
    }

    $checkLat2 = $db->prepare("SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                                WHERE TABLE_SCHEMA = DATABASE() 
                                AND TABLE_NAME = 'orders' 
                                AND COLUMN_NAME = 'latitude'");
    $checkLat2->execute();
    if ($checkLat2->fetchColumn() == 0) {
        $db->exec("ALTER TABLE `orders` ADD COLUMN `latitude` DECIMAL(10, 8) NULL DEFAULT NULL AFTER `customer_lng`");
    }

    $checkLng2 = $db->prepare("SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                                 WHERE TABLE_SCHEMA = DATABASE() 
                                 AND TABLE_NAME = 'orders' 
                                 AND COLUMN_NAME = 'longitude'");
    $checkLng2->execute();
    if ($checkLng2->fetchColumn() == 0) {
        $db->exec("ALTER TABLE `orders` ADD COLUMN `longitude` DECIMAL(11, 8) NULL DEFAULT NULL AFTER `latitude`");
    }

    $checkHouse = $db->prepare("SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                                 WHERE TABLE_SCHEMA = DATABASE() 
                                 AND TABLE_NAME = 'orders' 
                                 AND COLUMN_NAME = 'house_info'");
    $checkHouse->execute();
    if ($checkHouse->fetchColumn() == 0) {
        $db->exec("ALTER TABLE `orders` ADD COLUMN `house_info` VARCHAR(255) NULL DEFAULT NULL AFTER `house_no`");
    }

    $checkTxn = $db->prepare("SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                               WHERE TABLE_SCHEMA = DATABASE() 
                               AND TABLE_NAME = 'orders' 
                               AND COLUMN_NAME = 'transaction_id'");
    $checkTxn->execute();
    if ($checkTxn->fetchColumn() == 0) {
        $db->exec("ALTER TABLE `orders` ADD COLUMN `transaction_id` VARCHAR(100) NULL DEFAULT NULL AFTER `payment_status`");
    }
    // Ensure inventory logs table exists outside any active transaction
    InventoryHelper::ensureLogsTable($db);
} catch (PDOException $migErr) {
    // Silently continue — migration may have already been applied
    error_log("Auto-migrate notice: " . $migErr->getMessage());
}

$data = json_decode(file_get_contents("php://input"));

// ─── DEBUG LOGGING ───
error_log("Order Payload: " . json_encode($data));

// 🔥 Time & Operational Validation Logic
$settingsQuery = "SELECT setting_key, setting_value FROM settings WHERE setting_key IN ('restaurant_open_time', 'restaurant_close_time', 'accept_orders')";
$settingsStmt = $db->prepare($settingsQuery);
$settingsStmt->execute();
$timings = [];
while ($row = $settingsStmt->fetch(PDO::FETCH_ASSOC)) {
    $timings[$row['setting_key']] = $row['setting_value'];
}

// 1. Check Accept Online Orders Toggle
$accept_orders_val = $timings['accept_orders'] ?? 'true';
if ($accept_orders_val === 'false' || $accept_orders_val === '0' || $accept_orders_val === false || $accept_orders_val === 0) {
    if (ob_get_level()) ob_clean();
    echo json_encode([
        "success" => false, 
        "message" => "Restaurant is currently not accepting online orders at this time.",
        "code" => "STORE_CLOSED_TOGGLE"
    ]);
    exit();
}

// 2. Check Opening and Closing Hours
$open_time_str = $timings['restaurant_open_time'] ?? '10:00';
$close_time_str = $timings['restaurant_close_time'] ?? '04:00';

date_default_timezone_set('Asia/Karachi'); // Assuming PKT timezone
$current_time_str = date('H:i');

$open_ts = strtotime($open_time_str);
$close_ts = strtotime($close_time_str);
$curr_ts = strtotime($current_time_str);

$is_open = false;

if ($close_ts > $open_ts) {
    if ($curr_ts >= $open_ts && $curr_ts < $close_ts) {
        $is_open = true;
    }
} else {
    // Overnight hours (e.g. 10:00 AM to 04:00 AM next day)
    if ($curr_ts >= $open_ts || $curr_ts < $close_ts) {
        $is_open = true;
    }
}

if (!$is_open) {
    if (ob_get_level()) ob_clean();
    echo json_encode([
        "success" => false, 
        "message" => "Restaurant is currently closed. Operating hours are from " . date("h:i A", $open_ts) . " to " . date("h:i A", $close_ts) . ".",
        "code" => "RESTAURANT_CLOSED"
    ]);
    exit();
}

$order_total = 0;
$addon_ids = [];
$menu_item_ids = [];

// Safely extract cart items from either 'cart' or 'items'
$raw_items = !empty($data->cart) && is_array($data->cart) ? $data->cart : (!empty($data->items) && is_array($data->items) ? $data->items : []);

// Sanitize and filter items to only allow valid positive quantities (1 to 100)
$cart_items = [];
foreach ($raw_items as $raw_item) {
    if (is_object($raw_item)) {
        $qty = intval($raw_item->qty ?? 1);
        if ($qty > 0 && $qty <= 100) {
            $raw_item->qty = $qty;
            $cart_items[] = $raw_item;
        }
    }
}

if (empty($cart_items)) {
    http_response_code(400);
    if (ob_get_level()) ob_clean();
    echo json_encode([
        "success" => false, 
        "message" => "Cart is empty or contains invalid item quantities."
    ]);
    exit();
}

if (!empty($cart_items)) {
    // Deal In-Stock & Availability Pre-validation
    include_once __DIR__ . '/../config/DealInventoryHelper.php';
    foreach ($cart_items as $item) {
        if (InventoryHelper::isDealItem($item)) {
            $dealId = InventoryHelper::extractDealId($item);
            if ($dealId > 0) {
                $dStmt = $db->prepare("SELECT * FROM deals WHERE id = ? LIMIT 1");
                $dStmt->execute([$dealId]);
                $dealRow = $dStmt->fetch(PDO::FETCH_ASSOC);
                if ($dealRow) {
                    $itStmt = $db->prepare("SELECT * FROM deal_items WHERE deal_id = ?");
                    $itStmt->execute([$dealId]);
                    $dItems = $itStmt->fetchAll(PDO::FETCH_ASSOC);
                    DealInventoryHelper::processDeal($dealRow, $dItems);
                    if (isset($dealRow['inStock']) && $dealRow['inStock'] === false) {
                        http_response_code(400);
                        echo json_encode([
                            "success" => false,
                            "message" => "Deal '" . ($dealRow['title'] ?? 'Selected Deal') . "' contains out-of-stock items and cannot be ordered right now."
                        ]);
                        exit();
                    }

                    // Validate deal timing window
                    $isPermanent = intval($dealRow['is_permanent'] ?? 1) === 1;
                    if (!$isPermanent && !empty($dealRow['start_time']) && !empty($dealRow['end_time'])) {
                        $st = $dealRow['start_time'];
                        $et = $dealRow['end_time'];
                        $start_ts = strtotime($st);
                        $end_ts = strtotime($et);
                        $curr_ts = strtotime(date('H:i:s'));
                        $isTimeActive = ($end_ts > $start_ts)
                            ? ($curr_ts >= $start_ts && $curr_ts <= $end_ts)
                            : ($curr_ts >= $start_ts || $curr_ts <= $end_ts);

                        if (!$isTimeActive) {
                            http_response_code(400);
                            echo json_encode([
                                "success" => false,
                                "message" => "Deal '" . ($dealRow['title'] ?? 'Selected Deal') . "' is only available between " . date("h:i A", $start_ts) . " and " . date("h:i A", $end_ts) . "."
                            ]);
                            exit();
                        }
                    }
                }
            }
        }
    }

    foreach($cart_items as $item) {
        if (!empty($item->is_addon) && !empty($item->addon_data)) {
            $addon_id = intval($item->addon_data->id ?? 0);
            if ($addon_id > 0) $addon_ids[] = $addon_id;
        } else {
            $menu_item_id = isset($item->menuItemId) ? intval($item->menuItemId) : 0;
            if ($menu_item_id <= 0 && isset($item->id)) {
                $parts = explode('-', strval($item->id));
                if (is_numeric($parts[0])) $menu_item_id = intval($parts[0]);
            }
            if ($menu_item_id > 0) $menu_item_ids[] = $menu_item_id;
        }
    }
}

// BULK FETCH PRICES
$addon_prices = [];
if (!empty($addon_ids)) {
    $ids_str = implode(',', array_fill(0, count($addon_ids), '?'));
    $stmt = $db->prepare("SELECT id, price FROM menu_addons WHERE id IN ($ids_str)");
    $stmt->execute($addon_ids);
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $addon_prices[$row['id']] = floatval($row['price']);
    }
}

$menu_item_prices = [];
$menu_variant_prices = [];
if (!empty($menu_item_ids)) {
    $ids_str = implode(',', array_fill(0, count($menu_item_ids), '?'));
    $stmt = $db->prepare("SELECT id, price FROM menu_items WHERE id IN ($ids_str)");
    $stmt->execute($menu_item_ids);
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $menu_item_prices[$row['id']] = floatval($row['price']);
    }
    
    $stmt = $db->prepare("SELECT menu_id, size_name, price FROM menu_variants WHERE menu_id IN ($ids_str)");
    $stmt->execute($menu_item_ids);
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $menu_variant_prices[$row['menu_id'] . '_' . $row['size_name']] = floatval($row['price']);
    }
}

// CALCULATE TOTAL
if (!empty($cart_items)) {
    foreach($cart_items as $item) {
        $order_qty = intval($item->qty ?? 1);
        if (!empty($item->is_addon) && !empty($item->addon_data)) {
            $addon_id = intval($item->addon_data->id ?? 0);
            if ($addon_id > 0 && isset($addon_prices[$addon_id])) {
                $order_total += $addon_prices[$addon_id] * $order_qty;
            } else {
                $order_total += floatval($item->price ?? 0) * $order_qty;
            }
        } else {
            $menu_item_id = isset($item->menuItemId) ? intval($item->menuItemId) : 0;
            if ($menu_item_id <= 0 && isset($item->id)) {
                $parts = explode('-', strval($item->id));
                if (is_numeric($parts[0])) $menu_item_id = intval($parts[0]);
            }
            $variant_name = $item->size ?? 'Regular';
            
            if ($menu_item_id > 0) {
                $key = $menu_item_id . '_' . $variant_name;
                $dbPrice = 0;
                if (isset($menu_variant_prices[$key]) && $menu_variant_prices[$key] > 0) {
                    $dbPrice = $menu_variant_prices[$key];
                } elseif (isset($menu_item_prices[$menu_item_id])) {
                    $dbPrice = $menu_item_prices[$menu_item_id];
                }
                if ($dbPrice <= 0 && isset($item->base_price)) {
                    $dbPrice = floatval($item->base_price);
                } elseif ($dbPrice <= 0 && isset($item->price)) {
                    $dbPrice = floatval($item->price);
                }

                $addons_sum = 0;
                $item_addons_arr = !empty($item->selected_addons) ? $item->selected_addons : (!empty($item->addons) ? $item->addons : []);
                if (is_string($item_addons_arr)) {
                    $item_addons_arr = json_decode($item_addons_arr, true) ?: [];
                }
                if (is_array($item_addons_arr) || is_object($item_addons_arr)) {
                    foreach ($item_addons_arr as $ad) {
                        $adObj = (object)$ad;
                        $addons_sum += floatval($adObj->price ?? ($adObj->addon_price ?? 0));
                    }
                }

                $order_total += ($dbPrice + $addons_sum) * $order_qty;
            } else {
                $order_total += floatval($item->price ?? 0) * $order_qty;
            }
        }
    }
}

$subtotal = $order_total;
$raw_order_type = !empty($data->order_type) ? $data->order_type : (!empty($data->orderType) ? $data->orderType : (!empty($data->type) ? $data->type : (!empty($data->order_mode) ? $data->order_mode : "delivery")));
$order_mode = "delivery";
$order_type = "Delivery";

if (strtolower($raw_order_type) === 'dine_in' || strtolower($raw_order_type) === 'dine-in') {
    $order_mode = "dine_in";
    $order_type = "Dine-In";
} elseif (strtolower($raw_order_type) === 'takeaway' || strtolower($raw_order_type) === 'pickup') {
    $order_mode = "takeaway";
    $order_type = "Takeaway";
} else {
    $order_mode = "delivery";
    $order_type = "Delivery";
}

$rider_tip = 0.00;
$delivery_fee = 0.00;
$discount_amount = 0.00;
$coupon_code = !empty($data->coupon_code) ? trim($data->coupon_code) : (!empty($data->couponCode) ? trim($data->couponCode) : (!empty($data->promo_code) ? trim($data->promo_code) : null));

// Extract customer info early for coupon security validation
$customer_mobile = !empty($data->customer_mobile) ? trim($data->customer_mobile) : 
                  (!empty($data->customerMobile) ? trim($data->customerMobile) : 
                  (!empty($data->mobile) ? trim($data->mobile) : 
                  (!empty($data->phone) ? trim($data->phone) : 
                  (!empty($data->contact) ? trim($data->contact) : null))));

$customer_id = !empty($data->customer_id) ? intval($data->customer_id) : (!empty($data->customerId) ? intval($data->customerId) : null);
if (!$customer_id && !empty($customer_mobile)) {
    $cleanPh = preg_replace('/[^0-9]/', '', $customer_mobile);
    $findCust = $db->prepare("SELECT id FROM customer_users WHERE phone = :ph OR phone = :ph2 LIMIT 1");
    $findCust->execute([':ph' => $customer_mobile, ':ph2' => $cleanPh]);
    $cRow = $findCust->fetch(PDO::FETCH_ASSOC);
    if ($cRow) {
        $customer_id = intval($cRow['id']);
    }
}
if (!$customer_id && !empty($data->customer_email ?? ($data->email ?? null))) {
    $em = trim($data->customer_email ?? $data->email);
    $findCustEm = $db->prepare("SELECT id FROM customer_users WHERE email = :em LIMIT 1");
    $findCustEm->execute([':em' => $em]);
    $cRowEm = $findCustEm->fetch(PDO::FETCH_ASSOC);
    if ($cRowEm) {
        $customer_id = intval($cRowEm['id']);
    }
}

// Dynamic Store Settings & Coordinates (Always loaded for all order modes: Delivery, Takeaway, Dine-In)
$delivSettingsQuery = $db->query("SELECT setting_key, setting_value FROM settings WHERE setting_key IN ('free_delivery_threshold', 'default_delivery_fee', 'delivery_fee', 'delivery_radius', 'restaurant_lat', 'restaurant_lng', 'store_lat', 'store_lng')");
$delivSettings = [];
if ($delivSettingsQuery) {
    while ($row = $delivSettingsQuery->fetch(PDO::FETCH_ASSOC)) {
        $delivSettings[$row['setting_key']] = $row['setting_value'];
    }
}
$restaurantLat = !empty($delivSettings['store_lat']) && floatval($delivSettings['store_lat']) != 0 ? floatval($delivSettings['store_lat']) : (!empty($delivSettings['restaurant_lat']) && floatval($delivSettings['restaurant_lat']) != 0 ? floatval($delivSettings['restaurant_lat']) : 31.5204);
$restaurantLng = !empty($delivSettings['store_lng']) && floatval($delivSettings['store_lng']) != 0 ? floatval($delivSettings['store_lng']) : (!empty($delivSettings['restaurant_lng']) && floatval($delivSettings['restaurant_lng']) != 0 ? floatval($delivSettings['restaurant_lng']) : 74.3587);

// 1. Enforce Delivery Fee & Delivery Radius Boundary Check based on Order Mode
if ($order_mode === 'delivery') {
    $dbThreshold = isset($delivSettings['free_delivery_threshold']) ? floatval($delivSettings['free_delivery_threshold']) : 1500.00;
    $dbDefaultFee = isset($delivSettings['default_delivery_fee']) ? floatval($delivSettings['default_delivery_fee']) : (isset($delivSettings['delivery_fee']) ? floatval($delivSettings['delivery_fee']) : 150.00);
    $delivery_fee = ($subtotal >= $dbThreshold) ? 0.00 : $dbDefaultFee;
    $maxDeliveryRadiusKm = isset($delivSettings['delivery_radius']) && floatval($delivSettings['delivery_radius']) > 0 ? floatval($delivSettings['delivery_radius']) : 10.0;

    $reqLat = !empty($data->customer_lat) ? floatval($data->customer_lat) : 
              (!empty($data->target_lat) ? floatval($data->target_lat) : 
              (!empty($data->latitude) ? floatval($data->latitude) : 
              (!empty($data->lat) ? floatval($data->lat) : null)));

    $reqLng = !empty($data->customer_lng) ? floatval($data->customer_lng) : 
              (!empty($data->target_lng) ? floatval($data->target_lng) : 
              (!empty($data->longitude) ? floatval($data->longitude) : 
              (!empty($data->lng) ? floatval($data->lng) : null)));

    if ($reqLat !== null && $reqLng !== null && ($reqLat != 0 || $reqLng != 0)) {
        $earthRadius = 6371; // Earth's radius in km
        $dLat = deg2rad($reqLat - $restaurantLat);
        $dLon = deg2rad($reqLng - $restaurantLng);
        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($restaurantLat)) * cos(deg2rad($reqLat)) *
             sin($dLon / 2) * sin($dLon / 2);
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        $distanceKm = $earthRadius * $c;

        if ($distanceKm > $maxDeliveryRadiusKm) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => "Delivery location exceeds our maximum delivery radius of " . number_format($maxDeliveryRadiusKm, 0) . " km.",
                'distance_km' => round($distanceKm, 2),
                'max_radius_km' => $maxDeliveryRadiusKm
            ]);
            exit();
        }
    }
} else {
    // Mode is Takeaway or Dine-In: Strictly zero out delivery fees
    $delivery_fee = 0.00;
}

// 2. Server-Side Coupon Re-validation
$couponIdToUpdate = null;
if (!empty($coupon_code)) {
    $cStmt = $db->prepare("SELECT * FROM coupons WHERE BINARY code = :code AND is_active = 1 LIMIT 1");
    $cStmt->execute([':code' => $coupon_code]);
    $validCoupon = $cStmt->fetch(PDO::FETCH_ASSOC);

    if ($validCoupon) {
        $minSpend = floatval($validCoupon['min_spend'] ?? 0);
        $isNotExpired = empty($validCoupon['expiry_date']) || strtotime($validCoupon['expiry_date']) >= time();
        $hasUsageLeft = is_null($validCoupon['usage_limit']) || intval($validCoupon['times_used']) < intval($validCoupon['usage_limit']);

        if (!$isNotExpired || !$hasUsageLeft || $subtotal < $minSpend) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'The applied promo code is no longer valid or minimum spend requirement is not met.'
            ]);
            exit();
        }

        // Rule B (Per-Customer Multi-Use Prevention)
        if (!empty($customer_id) || !empty($customer_mobile)) {
            $whereParts = [];
            $params = [':code' => $coupon_code];

            if (!empty($customer_id)) {
                $whereParts[] = "customer_id = :cid";
                $params[':cid'] = $customer_id;
            }
            if (!empty($customer_mobile)) {
                $whereParts[] = "customer_mobile = :mobile";
                $params[':mobile'] = $customer_mobile;
            }

            $whereClause = implode(" OR ", $whereParts);
            $usageCheckStmt = $db->prepare("SELECT COUNT(*) FROM orders WHERE coupon_code = :code AND ({$whereClause}) AND status != 'Cancelled'");
            $usageCheckStmt->execute($params);
            if (intval($usageCheckStmt->fetchColumn()) > 0) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'You have already redeemed this promo code on a previous order.'
                ]);
                exit();
            }
        }

        // Rule A (Welcome & First-Order Coupons)
        $isFirstOrderOnly = ($coupon_code === 'WELCOME50' || !empty($validCoupon['is_first_order_only']));
        if ($isFirstOrderOnly) {
            if (empty($customer_id)) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => "The {$validCoupon['code']} coupon is exclusive to registered members. Please log in or create an account to claim."
                ]);
                exit();
            }

            $priorStmt = $db->prepare("SELECT COUNT(*) FROM orders WHERE customer_id = :cid AND status != 'Cancelled'");
            $priorStmt->execute([':cid' => $customer_id]);
            if (intval($priorStmt->fetchColumn()) > 0) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'This welcome promo is valid on your first order only.'
                ]);
                exit();
            }
        }

        if ($validCoupon['discount_type'] === 'percentage') {
            $discount_amount = ($subtotal * floatval($validCoupon['discount_value'])) / 100;
            if (!empty($validCoupon['max_discount'])) {
                $discount_amount = min($discount_amount, floatval($validCoupon['max_discount']));
            }
        } else {
            $discount_amount = floatval($validCoupon['discount_value']);
        }
        $discount_amount = min($discount_amount, $subtotal);
        $couponIdToUpdate = $validCoupon['id'];
    } else {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid or expired promo code.'
        ]);
        exit();
    }
}

// 3. Final Grand Total Calculation
$tax_amount = !empty($data->tax_amount) ? floatval($data->tax_amount) : 0.00;
$order_total = max(0, $subtotal - $discount_amount) + $delivery_fee + $rider_tip + $tax_amount;

// Pre-transaction payment validations (ensures invalid requests fail fast without opening uncommitted transactions)
$payment_method = !empty($data->paymentMethod) ? $data->paymentMethod : (!empty($data->payment_method) ? $data->payment_method : "Cash on Delivery");
$payment_status = !empty($data->paymentStatus) ? $data->paymentStatus : (!empty($data->payment_status) ? $data->payment_status : "Pending");
$transaction_id = !empty($data->transaction_id) ? trim($data->transaction_id) : 
                  (!empty($data->transactionId) ? trim($data->transactionId) : 
                  (!empty($data->txn_id) ? trim($data->txn_id) : null));

// Strict Backend Validation: Online digital payments marked as Paid must have a transaction reference (auto-generate if missing for POS)
$isOnlinePayment = in_array(strtolower($payment_method), ['jazzcash', 'easypaisa', 'credit / debit card', 'card', 'online']);
$isMarkedPaid = in_array(strtolower($payment_status), ['paid', 'completed']) || str_starts_with(strtolower($payment_status), 'paid online');

if ($isOnlinePayment && $isMarkedPaid) {
    if (empty($transaction_id) || strlen($transaction_id) < 4) {
        $transaction_id = 'POS-' . strtoupper(substr(uniqid(), -6));
    }
}

if(!empty($cart_items) && $order_total > 0) {
    try {
        $db->beginTransaction();

        $customer_name = !empty($data->customer_name) ? trim($data->customer_name) : 
                         (!empty($data->customerName) ? trim($data->customerName) : 
                         (!empty($data->name) ? trim($data->name) : 
                         (!empty($data->fullName) ? trim($data->fullName) : "Walk-in")));

        $customer_mobile = !empty($data->customer_mobile) ? trim($data->customer_mobile) : 
                           (!empty($data->customerMobile) ? trim($data->customerMobile) : 
                           (!empty($data->mobile) ? trim($data->mobile) : 
                           (!empty($data->phone) ? trim($data->phone) : 
                           (!empty($data->contact) ? trim($data->contact) : null))));

        $table_num = !empty($data->table_number) ? trim($data->table_number) : 
                     (!empty($data->tableNumber) ? trim($data->tableNumber) : null);

        $cust_addr = !empty($data->customer_address) ? trim($data->customer_address) : 
                     (!empty($data->customerAddress) ? trim($data->customerAddress) : 
                     (!empty($data->address) ? trim($data->address) : 
                     (!empty($data->street_address) ? trim($data->street_address) : "")));

        $full_addr = $cust_addr ? $cust_addr : trim(($data->house_no ?? "")." ".($data->street ?? "")." ".($data->area ?? ""));

        $cust_lat = !empty($data->customer_lat) ? floatval($data->customer_lat) : 
                    (!empty($data->target_lat) ? floatval($data->target_lat) : 
                    (!empty($data->latitude) ? floatval($data->latitude) : 
                    (!empty($data->lat) ? floatval($data->lat) : null)));

        $cust_lng = !empty($data->customer_lng) ? floatval($data->customer_lng) : 
                    (!empty($data->target_lng) ? floatval($data->target_lng) : 
                    (!empty($data->longitude) ? floatval($data->longitude) : 
                    (!empty($data->lng) ? floatval($data->lng) : null)));

        // Dynamic store coordinates for Takeaway, Dine-in or missing coordinates
        if ($order_mode === 'takeaway' || $order_mode === 'dine_in' || empty($cust_lat) || empty($cust_lng)) {
            if (empty($cust_lat) || $order_mode !== 'delivery') $cust_lat = $restaurantLat;
            if (empty($cust_lng) || $order_mode !== 'delivery') $cust_lng = $restaurantLng;
        }

        $customer_id = !empty($data->customer_id) ? intval($data->customer_id) : (!empty($data->customerId) ? intval($data->customerId) : null);

        // Fallback: If customer_id is missing, auto-link to customer_users by phone or email
        if (!$customer_id && !empty($customer_mobile)) {
            $cleanPh = preg_replace('/[^0-9]/', '', $customer_mobile);
            $findCust = $db->prepare("SELECT id FROM customer_users WHERE phone = :ph OR phone = :ph2 LIMIT 1");
            $findCust->execute([':ph' => $customer_mobile, ':ph2' => $cleanPh]);
            $cRow = $findCust->fetch(PDO::FETCH_ASSOC);
            if ($cRow) {
                $customer_id = intval($cRow['id']);
            }
        }
        if (!$customer_id && !empty($data->customer_email ?? ($data->email ?? null))) {
            $em = trim($data->customer_email ?? $data->email);
            $findCustEm = $db->prepare("SELECT id FROM customer_users WHERE email = :em LIMIT 1");
            $findCustEm->execute([':em' => $em]);
            $cRowEm = $findCustEm->fetch(PDO::FETCH_ASSOC);
            if ($cRowEm) {
                $customer_id = intval($cRowEm['id']);
            }
        }

        $house_val = !empty($data->house_no) ? trim($data->house_no) : (!empty($data->house_info) ? trim($data->house_info) : (!empty($data->house) ? trim($data->house) : null));

        // Security safeguard: Coupons are exclusive to registered members
        if (empty($customer_id) && (!empty($coupon_code) || floatval($discount_amount) > 0)) {
            $coupon_code = null;
            $discount_amount = 0.00;
            // Recalculate order_total without coupon discount
            $order_total = $subtotal + $delivery_fee + $rider_tip + $tax_amount;
        }

        $query = "INSERT INTO orders (customer_id, order_type, order_mode, customer_name, customer_mobile, customer_address, customer_lat, customer_lng, latitude, longitude, house_no, house_info, street, area, table_number, delivery_fee, rider_tip, coupon_code, discount_amount, total, status, payment_method, payment_status, transaction_id) 
                  VALUES (:cid, :type, :mode, :name, :mobile, :address, :cust_lat, :cust_lng, :lat, :lng, :house, :house_info, :street, :area, :table, :deliv_fee, :tip, :coupon, :discount, :total, 'Pending', :pmethod, :pstatus, :txn_id)";
        $stmt = $db->prepare($query);
        $stmt->execute([
            ':cid'        => $customer_id,
            ':type'       => $order_type,
            ':mode'       => $order_mode,
            ':name'       => $customer_name,
            ':mobile'     => $customer_mobile,
            ':address'    => $full_addr,
            ':cust_lat'   => $cust_lat,
            ':cust_lng'   => $cust_lng,
            ':lat'        => $cust_lat,
            ':lng'        => $cust_lng,
            ':house'      => $house_val,
            ':house_info' => $house_val,
            ':street'     => $data->street ?? null,
            ':area'       => $data->area ?? null,
            ':table'      => $table_num,
            ':deliv_fee'  => $delivery_fee,
            ':tip'        => $rider_tip,
            ':coupon'     => $coupon_code,
            ':discount'   => $discount_amount,
            ':total'      => $order_total,
            ':pmethod'    => $payment_method,
            ':pstatus'    => $payment_status,
            ':txn_id'     => $transaction_id
        ]);
        $order_id = $db->lastInsertId();

        // Increment coupon times_used if applied
        if ($couponIdToUpdate) {
            $upStmt = $db->prepare("UPDATE coupons SET times_used = times_used + 1 WHERE id = :id");
            $upStmt->execute([':id' => $couponIdToUpdate]);
        }

        // INSERT ORDER ITEMS
        $itemQuery = "INSERT INTO order_items (order_id, title, size, note, qty, price, spice_level, selected_addons_json) VALUES (:oid, :title, :size, :note, :qty, :price, :spice, :addons_json)";
        $itemStmt = $db->prepare($itemQuery);

        $prepared_cart_items = [];
        foreach($cart_items as $item) {
            $spice_val = !empty($item->spice_level) ? $item->spice_level : (!empty($item->spiceLevel) ? $item->spiceLevel : 'Medium Spicy');
            $addons_json = null;
            if (!empty($item->selected_addons)) {
                $addons_json = is_string($item->selected_addons) ? $item->selected_addons : json_encode($item->selected_addons);
            } else if (!empty($item->addons)) {
                $addons_json = is_string($item->addons) ? $item->addons : json_encode($item->addons);
            }

            $itemStmt->execute([
                ':oid'         => $order_id,
                ':title'       => $item->name ?? ($item->title ?? 'Unknown Item'),
                ':size'        => $item->size ?? 'Regular',
                ':note'        => $item->note ?? '',
                ':qty'         => $item->qty ?? 1,
                ':price'       => $item->price ?? 0,
                ':spice'       => $spice_val,
                ':addons_json' => $addons_json
            ]);
            $order_item_id = $db->lastInsertId();
            if (is_object($item)) {
                $item->order_item_id = $order_item_id;
            } else if (is_array($item)) {
                $item['order_item_id'] = $order_item_id;
            }
            $prepared_cart_items[] = $item;
        }

        // DEDUCT INVENTORY (RECIPES + ADDONS) & RECORD IN ORDER LOGS
        InventoryHelper::deductOrderInventory($order_id, $prepared_cart_items, $db);

        // Synchronize Payments Ledger
        try {
            $payStmt = $db->prepare("
                INSERT INTO payments (order_id, amount, method, status, created_at)
                VALUES (:oid, :amt, :method, :status, NOW())
            ");
            $payStmt->execute([
                ':oid'    => $order_id,
                ':amt'    => $order_total,
                ':method' => $payment_method,
                ':status' => $payment_status
            ]);
        } catch (\Throwable $payErr) {
            error_log("Payments insert warning: " . $payErr->getMessage());
        }

        if ($db->inTransaction()) {
            $db->commit();
        }

        // NOTE: Socket broadcast handled by frontend (usePosCart.js emits 'new_order_placed' after success)
        // PHP-side HTTP trigger disabled to prevent response blocking on Windows.


        if (ob_get_level()) ob_clean();
        echo json_encode([
            "success"        => true, 
            "message"        => "Order saved successfully!", 
            "order_id"       => $order_id,
            "payment_method" => $payment_method,
            "payment_status" => $payment_status,
            "transaction_id" => $transaction_id,
            "total"          => $order_total,
            "database_used"  => "restaurant_db"
        ]);
    } catch(\Throwable $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        if (ob_get_level()) ob_clean();
        echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
    }
} else {
    if (ob_get_level()) ob_clean();
    echo json_encode(["success" => false, "message" => "Invalid Request Data"]);
}
?>
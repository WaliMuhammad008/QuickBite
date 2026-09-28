<?php
require_once __DIR__ . '/../config/cors_headers.php';
require_once __DIR__ . '/../config/Database.php';

$database = new Database();
$db = $database->getConnection();

try {
    $stmt = $db->query("SELECT setting_key, setting_value FROM settings");
    $db_settings = [];
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $db_settings[$row['setting_key']] = $row['setting_value'];
    }

    // Standardized comprehensive defaults
    $defaults = [
        "store_name" => "BigBite Restaurant",
        "store_address" => "123 Food Street, Main Market",
        "restaurant_address" => $db_settings['store_address'] ?? "123 Food Street, Main Market",
        "store_lat" => $db_settings['restaurant_lat'] ?? ($db_settings['store_lat'] ?? "31.5204"),
        "store_lng" => $db_settings['restaurant_lng'] ?? ($db_settings['store_lng'] ?? "74.3587"),
        "restaurant_lat" => $db_settings['store_lat'] ?? ($db_settings['restaurant_lat'] ?? "31.5204"),
        "restaurant_lng" => $db_settings['store_lng'] ?? ($db_settings['restaurant_lng'] ?? "74.3587"),
        "contact_phone" => "+92 300 1234567",
        "restaurant_phone" => $db_settings['contact_phone'] ?? "+92 300 1234567",
        "admin_email" => "support@bigbite.com",
        "restaurant_email" => $db_settings['admin_email'] ?? "support@bigbite.com",
        "delivery_fee" => "150",
        "default_delivery_fee" => "150",
        "free_delivery_threshold" => "1500",
        "estimated_delivery_time" => "30-40",
        "delivery_time" => "30",
        "min_order" => "500",
        "tax_rate" => "5",
        "restaurant_open_time" => "10:00",
        "restaurant_close_time" => "04:00",
        "accept_orders" => "true",

        // ═══ ABOUT US ═══
        "about_hero_badge" => "OUR STORY & PASSION",
        "about_hero_title" => "ABOUT BIGBITE",
        "about_hero_subtitle" => "Crafting mouth-watering burgers, loaded fries, cheesy pizzas, and crispy fried chicken with uncompromised quality.",
        "about_journey_title" => "Our Journey",
        "about_journey_text" => "At BigBite, we believe in serving fresh, hot, and delicious food to our community. Started with a passion for culinary excellence, we have grown into a beloved destination known for premium quality ingredients, handcrafted recipes, and unforgettable tastes. Every burger, pizza, and crispy chicken platter is freshly prepared on order to ensure unmatched quality and satisfaction.",
        "about_card1_title" => "100% Fresh",
        "about_card1_desc" => "Handcrafted recipes made with fresh chicken, artisanal buns, and signature sauces.",
        "about_card2_title" => "Hot & Fast Delivery",
        "about_card2_desc" => "Specialized thermal packaging ensures every meal arrives piping hot at your doorstep.",
        "about_card3_title" => "Hygiene Assured",
        "about_card3_desc" => "Prepared under strict international safety, cleanliness, and food standards.",
        "about_mission_title" => "Our Mission",
        "about_mission_text" => "To provide a delightful dining experience with fast delivery, excellent customer service, and food that brings a smile with every single bite.",

        // ═══ PRIVACY POLICY ═══
        "privacy_hero_badge" => "DATA SECURITY & TRUST",
        "privacy_hero_title" => "PRIVACY POLICY",
        "privacy_hero_subtitle" => "How we protect, encrypt, and handle your information during online ordering and delivery.",
        "privacy_overview_title" => "Privacy Overview",
        "privacy_overview_text" => "Your privacy is important to us. We collect personal information such as your name, phone number, and delivery address solely to process and accurately deliver your orders. We employ industry-standard encryption and security protocols to safeguard your personal data. We never sell, rent, or trade your personal details with third-party marketers.",
        "privacy_card1_title" => "Encrypted Data",
        "privacy_card1_desc" => "All order transactions and payment credentials are processed over 256-bit SSL encrypted channels.",
        "privacy_card2_title" => "No Data Sharing",
        "privacy_card2_desc" => "Your contact number and delivery coordinates are strictly used for delivery logistics.",
        "privacy_card3_title" => "Transparent Usage",
        "privacy_card3_desc" => "You retain full control over your saved addresses and order history at all times.",
        "privacy_guarantee_title" => "Data Protection Guarantee",
        "privacy_guarantee_text" => "We implement comprehensive physical, electronic, and administrative safeguards to protect your personal information against unauthorized access, loss, or misuse. If you have questions regarding our privacy practices, please reach out to our dedicated support helpline.",

        // ═══ TERMS & CONDITIONS ═══
        "terms_hero_badge" => "TERMS OF SERVICE",
        "terms_hero_title" => "TERMS & CONDITIONS",
        "terms_hero_subtitle" => "Please review the terms and ordering guidelines governing your BigBite culinary experience.",
        "terms_agreement_title" => "Ordering & Service Agreement",
        "terms_agreement_text" => "By placing an order with BigBite through our website or mobile application, you agree to our standard terms of service. Orders are prepared immediately upon confirmation. Delivery times are estimated based on preparation time and local traffic conditions. For order cancellations or modifications, please contact our helpline immediately before kitchen preparation commences.",
        "terms_card1_title" => "Order Confirmation",
        "terms_card1_desc" => "Orders are verified in real-time. Please ensure contact details and delivery addresses are accurate.",
        "terms_card2_title" => "Payment Terms",
        "terms_card2_desc" => "We accept Cash on Delivery as well as digital sandbox payment options. Exact change is appreciated.",
        "terms_card3_title" => "Delivery Schedule",
        "terms_card3_desc" => "Riders strive to deliver within the estimated window. Extreme weather or peak traffic may cause slight variations.",
        "terms_refund_title" => "Cancellation & Refund Guidelines",
        "terms_refund_text" => "Because all food items are prepared fresh to order, cancellations must be requested within 5 minutes of order placement. In the rare event of missing or incorrect items, please contact our support team with your order ID for an immediate replacement or store credit.",

        // Legacy compatibility
        "about_us" => $db_settings['about_journey_text'] ?? ($db_settings['about_us'] ?? "At BigBite, we believe in serving fresh, hot, and delicious food to our community."),
        "about_us_mission" => $db_settings['about_mission_text'] ?? ($db_settings['about_us_mission'] ?? "To provide a delightful dining experience with fast delivery."),
        "privacy_policy" => $db_settings['privacy_overview_text'] ?? ($db_settings['privacy_policy'] ?? "Your privacy is important to us."),
        "terms_and_conditions" => $db_settings['terms_agreement_text'] ?? ($db_settings['terms_and_conditions'] ?? "By placing an order, you agree to our terms."),

        "footer_tagline" => "Fresh Food, Delivered Hot & Fast. Experience the best taste in town with our premium quality ingredients.",
        "footer_phone" => "+92 300 1234567",
        "footer_email" => "support@bigbite.com",
        "footer_facebook" => "https://facebook.com",
        "footer_instagram" => "https://instagram.com",
        "footer_twitter" => "https://twitter.com",
        "footer_youtube" => "https://youtube.com"
    ];

    $merged_settings = array_merge($defaults, $db_settings);

    echo json_encode([
        "success" => true,
        "data" => $merged_settings
    ]);
} catch(PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Database Error: " . $e->getMessage()
    ]);
}
?>
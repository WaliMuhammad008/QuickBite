<?php
require_once __DIR__ . '/../../BB backend/config/Database.php';
$db = (new Database())->getConnection();
$stmt = $db->query("SELECT id, name, role, phone, email, status FROM staff ORDER BY id DESC LIMIT 10");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

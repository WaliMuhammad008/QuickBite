<?php
require_once __DIR__ . '/../../BB backend/config/Database.php';
$db = (new Database())->getConnection();
$stmt = $db->query("SELECT * FROM rider");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

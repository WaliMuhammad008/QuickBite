<?php
require_once __DIR__ . '/../../BB backend/config/Database.php';
$db = (new Database())->getConnection();
$stmt = $db->query("SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME 
                    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                    WHERE REFERENCED_TABLE_NAME = 'staff' AND TABLE_SCHEMA = 'quickibite'");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

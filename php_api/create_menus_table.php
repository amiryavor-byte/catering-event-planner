<?php
require_once 'db_connect.php';

$secret = $_GET['secret'] ?? '';
if ($secret !== 'migration_secret_key_12345') {
    die('Unauthorized');
}

try {
    $sql = "
    CREATE TABLE IF NOT EXISTS `menus` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `name` varchar(255) NOT NULL,
      `description` text,
      `menu_type` varchar(50),
      `is_active` tinyint(1) DEFAULT 1,
      `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`)
    )";

    $pdo->exec($sql);
    echo "SUCCESS: 'menus' table created!";
} catch (PDOException $e) {
    echo "ERROR: " . $e->getMessage();
}
?>
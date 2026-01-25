<?php
// recipes.php
require_once 'db_connect.php';

// Auto-update database structure
try {
    // 1. Create ingredients table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `ingredients` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `name` varchar(255) NOT NULL,
      `unit` varchar(50) NOT NULL,
      `price_per_unit` float NOT NULL,
      `supplier_url` text,
      `last_updated` timestamp DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`)
    )");

    // 2. Create menu_items table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `menu_items` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `name` varchar(255) NOT NULL,
      `description` text,
      `base_price` float DEFAULT 0,
      `category` varchar(100),
      PRIMARY KEY (`id`)
    )");

    // 3. Create recipes table (depends on ingredients and menu_items)
    $pdo->exec("CREATE TABLE IF NOT EXISTS `recipes` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `menu_item_id` int(11) NOT NULL,
      `ingredient_id` int(11) NOT NULL,
      `amount_required` float NOT NULL,
      PRIMARY KEY (`id`),
      FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items`(`id`) ON DELETE CASCADE,
      FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients`(`id`) ON DELETE CASCADE
    )");

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to update database structure: ' . $e->getMessage()]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Optional: Filter by menu_item_id
        $menuId = $_GET['menu_item_id'] ?? null;
        if ($menuId) {
            $sql = "SELECT r.*, i.name as ingredient_name, i.unit, i.price_per_unit 
                    FROM recipes r 
                    JOIN ingredients i ON r.ingredient_id = i.id 
                    WHERE r.menu_item_id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$menuId]);
        } else {
            $stmt = $pdo->query("SELECT * FROM recipes");
        }
        $data = $stmt->fetchAll();
        echo json_encode($data);
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);

        $sql = "INSERT INTO recipes (menu_item_id, ingredient_id, amount_required) VALUES (?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        try {
            $stmt->execute([
                $input['menuItemId'],
                $input['ingredientId'],
                $input['amountRequired']
            ]);
            echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    // TODO: DELETE method

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
?>
<?php
/**
 * Recipes API Endpoint
 * Manages the ingredients assigned to menu items.
 */

require_once 'db_connect.php';

header('Content-Type: application/json');
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        // GET: Retrieve recipe items for a menu item
        case 'GET':
            $menuItemId = $_GET['menu_item_id'] ?? null;

            if (!$menuItemId || !is_numeric($menuItemId)) {
                http_response_code(400);
                echo json_encode(['error' => 'Valid Menu Item ID is required']);
                exit;
            }

            // Join with ingredients to get details
            $sql = "SELECT r.*, i.name as ingredient_name, i.unit, i.price_per_unit 
                    FROM recipes r 
                    JOIN ingredients i ON r.ingredient_id = i.id 
                    WHERE r.menu_item_id = ?";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$menuItemId]);
            $data = $stmt->fetchAll();

            // Transform keys to camelCase for frontend
            $transformed = array_map(function($item) {
                return [
                    'id' => $item['id'],
                    'menuItemId' => $item['menu_item_id'],
                    'ingredientId' => $item['ingredient_id'],
                    'amountRequired' => (float)$item['amount_required'],
                    'ingredientName' => $item['ingredient_name'],
                    'unit' => $item['unit'],
                    'pricePerUnit' => (float)$item['price_per_unit']
                ];
            }, $data);

            echo json_encode($transformed);
            break;

        // POST: Add ingredient to recipe
        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);

            if (empty($input['menuItemId']) || empty($input['ingredientId']) || empty($input['amountRequired'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing required fields']);
                exit;
            }

            // Check if already exists
            $stmt = $pdo->prepare("SELECT id FROM recipes WHERE menu_item_id = ? AND ingredient_id = ?");
            $stmt->execute([$input['menuItemId'], $input['ingredientId']]);
            if ($stmt->fetch()) {
                http_response_code(409);
                echo json_encode(['error' => 'Ingredient already in recipe']);
                exit;
            }

            $stmt = $pdo->prepare("INSERT INTO recipes (menu_item_id, ingredient_id, amount_required) VALUES (?, ?, ?)");
            $stmt->execute([
                $input['menuItemId'],
                $input['ingredientId'],
                $input['amountRequired']
            ]);

            http_response_code(201);
            echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
            break;

        // PUT: Update amount
        case 'PUT':
            $input = json_decode(file_get_contents('php://input'), true);

            if (empty($input['id']) || !isset($input['amountRequired'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing ID or Amount']);
                exit;
            }

            $stmt = $pdo->prepare("UPDATE recipes SET amount_required = ? WHERE id = ?");
            $stmt->execute([$input['amountRequired'], $input['id']]);

            echo json_encode(['success' => true]);
            break;

        // DELETE: Remove ingredient from recipe
        case 'DELETE':
            $id = $_GET['id'] ?? null;

            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'ID required']);
                exit;
            }

            $stmt = $pdo->prepare("DELETE FROM recipes WHERE id = ?");
            $stmt->execute([$id]);

            echo json_encode(['success' => true]);
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
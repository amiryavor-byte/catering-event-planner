<?php
/**
 * KDS API - Kitchen Display System
 * 
 * Handles recipe scaling and ingredient aggregation for events.
 * 
 * Endpoints:
 * GET /kds.php?event_id=123
 *   - Returns total aggregated ingredients needed for the event.
 *   - Logic: Sum(EventMenuItem.quantity * RecipeItem.amount)
 * 
 * GET /kds.php?action=recipe&menu_item_id=123&scale=50
 *   - Returns a specific recipe scaled for X portions.
 */

require_once 'db_connect.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $action = $_GET['action'] ?? 'aggregate';

        if ($action === 'aggregate') {
            // Aggregate all ingredients for an event
            $eventId = $_GET['event_id'] ?? null;
            if (!$eventId) {
                throw new Exception('Event ID required');
            }

            // 1. Get all menu items for this event with their quantities
            $sql = "SELECT emi.menu_item_id, emi.quantity, mi.name as item_name 
                    FROM event_menu_items emi
                    JOIN menu_items mi ON emi.menu_item_id = mi.id
                    WHERE emi.event_id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$eventId]);
            $menuItems = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // 2. For each menu item, fetch its recipe and multiply
            $aggregatedIngredients = [];

            foreach ($menuItems as $item) {
                $qty = (float) $item['quantity']; // E.g., 50 portions

                // Get Recipe
                $rStmt = $pdo->prepare("SELECT r.amount_required, i.id as ingredient_id, i.name, i.unit 
                                       FROM recipes r 
                                       JOIN ingredients i ON r.ingredient_id = i.id 
                                       WHERE r.menu_item_id = ?");
                $rStmt->execute([$item['menu_item_id']]);
                $recipeItems = $rStmt->fetchAll(PDO::FETCH_ASSOC);

                foreach ($recipeItems as $ri) {
                    $ingId = $ri['ingredient_id'];
                    $totalAmount = (float) $ri['amount_required'] * $qty;

                    if (!isset($aggregatedIngredients[$ingId])) {
                        $aggregatedIngredients[$ingId] = [
                            'id' => $ingId,
                            'name' => $ri['name'],
                            'unit' => $ri['unit'],
                            'total_amount' => 0,
                            'breakdown' => [] // Traceability: "50kg from Chicken, 10kg from Soup"
                        ];
                    }

                    $aggregatedIngredients[$ingId]['total_amount'] += $totalAmount;
                    $aggregatedIngredients[$ingId]['breakdown'][] = [
                        'menu_item' => $item['item_name'],
                        'amount' => $totalAmount
                    ];
                }
            }

            echo json_encode(['data' => array_values($aggregatedIngredients)]);

        } elseif ($action === 'recipe') {
            // Get single recipe scaled
            $menuItemId = $_GET['menu_item_id'] ?? null;
            $scale = $_GET['scale'] ?? 1; // Number of portions

            if (!$menuItemId)
                throw new Exception('Menu Item ID required');

            $stmt = $pdo->prepare("SELECT r.amount_required, i.name, i.unit 
                                   FROM recipes r 
                                   JOIN ingredients i ON r.ingredient_id = i.id 
                                   WHERE r.menu_item_id = ?");
            $stmt->execute([$menuItemId]);
            $ingredients = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $scaled = array_map(function ($ing) use ($scale) {
                return [
                    'name' => $ing['name'],
                    'unit' => $ing['unit'],
                    'base_amount' => (float) $ing['amount_required'],
                    'scaled_amount' => (float) $ing['amount_required'] * (float) $scale
                ];
            }, $ingredients);

            echo json_encode(['data' => $scaled]);
        }

    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
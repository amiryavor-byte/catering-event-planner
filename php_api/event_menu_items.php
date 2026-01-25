<?php
// event_menu_items.php - Manage menu selections for events
require_once 'db_connect.php';

// Auto-create table
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS `event_menu_items` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `event_id` int(11) NOT NULL,
      `menu_item_id` int(11) NOT NULL,
      `quantity` float NOT NULL DEFAULT 1,
      `price_override` float DEFAULT NULL,
      `notes` text,
      PRIMARY KEY (`id`)
    )");
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database initialization failed: ' . $e->getMessage()]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (!isset($_GET['event_id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'event_id required']);
            break;
        }

        // Get all menu items for an event with joined data
        $stmt = $pdo->prepare("
            SELECT 
                emi.*,
                mi.name as menu_item_name,
                mi.category,
                mi.base_price,
                mi.description
            FROM event_menu_items emi
            LEFT JOIN menu_items mi ON emi.menu_item_id = mi.id
            WHERE emi.event_id = ?
            ORDER BY mi.category, mi.name
        ");
        $stmt->execute([$_GET['event_id']]);
        $data = $stmt->fetchAll();
        echo json_encode($data);
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);

        $sql = "INSERT INTO event_menu_items (
            event_id, menu_item_id, quantity, price_override, notes
        ) VALUES (?, ?, ?, ?, ?)";

        $stmt = $pdo->prepare($sql);
        try {
            $stmt->execute([
                $input['eventId'],
                $input['menuItemId'],
                $input['quantity'] ?? 1,
                $input['priceOverride'] ?? null,
                $input['notes'] ?? null
            ]);
            echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    case 'PUT':
        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'ID required']);
            break;
        }

        $updates = [];
        $params = [];

        if (isset($input['quantity'])) {
            $updates[] = "quantity = ?";
            $params[] = $input['quantity'];
        }
        if (isset($input['priceOverride'])) {
            $updates[] = "price_override = ?";
            $params[] = $input['priceOverride'];
        }
        if (isset($input['notes'])) {
            $updates[] = "notes = ?";
            $params[] = $input['notes'];
        }

        if (empty($updates)) {
            http_response_code(400);
            echo json_encode(['error' => 'No fields to update']);
            break;
        }

        $params[] = $input['id'];
        $sql = "UPDATE event_menu_items SET " . implode(', ', $updates) . " WHERE id = ?";

        try {
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            echo json_encode(['success' => true]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    case 'DELETE':
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'ID required']);
            break;
        }

        try {
            $stmt = $pdo->prepare("DELETE FROM event_menu_items WHERE id = ?");
            $stmt->execute([$_GET['id']]);
            echo json_encode(['success' => true]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
?>
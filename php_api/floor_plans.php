<?php
/**
 * Floor Plans API
 * 
 * Manage interactive map items (Tables, Exits, Etc).
 */

require_once 'db_connect.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $eventId = $_GET['event_id'] ?? null;
        if (!$eventId) {
            http_response_code(400);
            echo json_encode(['error' => 'Event ID required']);
            exit;
        }

        $stmt = $pdo->prepare("SELECT * FROM floor_plan_items WHERE event_id = ?");
        $stmt->execute([$eventId]);
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Decode metadata JSON
        foreach ($items as &$item) {
            if ($item['metadata']) {
                $item['metadata'] = json_decode($item['metadata']);
            }
        }

        echo json_encode(['data' => $items]);

    } elseif ($method === 'POST') {
        // Create Item
        $data = json_decode(file_get_contents('php://input'), true);

        $sql = "INSERT INTO floor_plan_items (event_id, type, label, x_position, y_position, shape, width, height, rotation, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['event_id'],
            $data['type'],
            $data['label'],
            $data['x'] ?? 0,
            $data['y'] ?? 0,
            $data['shape'] ?? 'rect',
            $data['width'] ?? 10,
            $data['height'] ?? 10,
            $data['rotation'] ?? 0,
            json_encode($data['metadata'] ?? [])
        ]);

        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);

    } elseif ($method === 'PUT') {
        // Update Item (Drag & Drop)
        $data = json_decode(file_get_contents('php://input'), true);

        $sql = "UPDATE floor_plan_items SET x_position = ?, y_position = ?, width = ?, height = ?, rotation = ? WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['x'],
            $data['y'],
            $data['width'],
            $data['height'],
            $data['rotation'],
            $data['id']
        ]);

        echo json_encode(['success' => true]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'message' => $e->getMessage()]);
}
?>
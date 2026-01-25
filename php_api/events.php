<?php
// events.php
require_once 'db_connect.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT * FROM events ORDER BY created_at DESC");
        $data = $stmt->fetchAll();
        echo json_encode($data);
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);

        $sql = "INSERT INTO events (
            name, client_id, status, event_type, start_date, end_date, 
            is_outdoors, location, guest_count, dietary_requirements, 
            estimated_budget, deposit_paid, notes, is_sample
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        $stmt = $pdo->prepare($sql);
        try {
            $stmt->execute([
                $input['name'],
                $input['clientId'] ?? null,
                $input['status'] ?? 'inquiry',
                $input['eventType'] ?? null,
                $input['startDate'] ?? null,
                $input['endDate'] ?? null,
                $input['isOutdoors'] ?? 0,
                $input['location'] ?? null,
                $input['guestCount'] ?? null,
                $input['dietaryRequirements'] ?? null,
                $input['estimatedBudget'] ?? null,
                $input['depositPaid'] ?? null,
                $input['notes'] ?? null,
                $input['isSample'] ?? 0
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? null;
        if (!$id || !is_numeric($id)) {
            http_response_code(400);
            echo json_encode(['error' => 'Valid event ID is required']);
            exit;
        }

        try {
            // Check existence
            $stmt = $pdo->prepare("SELECT id FROM events WHERE id = ?");
            $stmt->execute([$id]);
            if (!$stmt->fetch()) {
                http_response_code(404);
                echo json_encode(['error' => 'Event not found']);
                exit;
            }

            // Delete dependencies if necessary (event_menu_items, tasks)
            // Assuming strict foreign keys might block cancellation, but usually we cascade delete or delete manually
            // Let's delete FK deps first
            $pdo->prepare("DELETE FROM tasks WHERE event_id = ?")->execute([$id]);

            // Delete event_menu_items if that table exists (check setup.sql)
            // Setup.sql creates event_menu_items?
            // "CREATE TABLE IF NOT EXISTS `event_menu_items`" is in `create_event_menu_items_table.sql`, maybe not in setup.sql.
            // But if it exists, clear it.
            // Safest to try/catch or just attempt delete
            try {
                $pdo->prepare("DELETE FROM event_menu_items WHERE event_id = ?")->execute([$id]);
            } catch (Exception $e) {
                // Table might not exist
            }

            // Delete event
            $stmt = $pdo->prepare("DELETE FROM events WHERE id = ?");
            $stmt->execute([$id]);

            echo json_encode(['success' => true, 'message' => 'Event deleted']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
?>
<?php
// event_staff.php - Manage staff assignments for events
require_once 'db_connect.php';

// Auto-create table
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS `event_staff` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `event_id` int(11) NOT NULL,
      `user_id` int(11) NOT NULL,
      `role` varchar(100) DEFAULT NULL,
      `shift_start` datetime DEFAULT NULL,
      `shift_end` datetime DEFAULT NULL,
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

        // Get all staff for an event with joined user data
        $stmt = $pdo->prepare("
            SELECT 
                es.*,
                u.name as staff_name,
                u.email,
                u.phone_number
            FROM event_staff es
            LEFT JOIN users u ON es.user_id = u.id
            WHERE es.event_id = ?
        ");
        $stmt->execute([$_GET['event_id']]);
        $data = $stmt->fetchAll();
        echo json_encode($data);
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['eventId']) || !isset($input['userId'])) {
            http_response_code(400);
            echo json_encode(['error' => 'eventId and userId required']);
            break;
        }

        $sql = "INSERT INTO event_staff (
            event_id, user_id, role, shift_start, shift_end
        ) VALUES (?, ?, ?, ?, ?)";

        $stmt = $pdo->prepare($sql);
        try {
            $stmt->execute([
                $input['eventId'],
                $input['userId'],
                $input['role'] ?? null,
                $input['shiftStart'] ?? null,
                $input['shiftEnd'] ?? null
            ]);
            echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
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
            $stmt = $pdo->prepare("DELETE FROM event_staff WHERE id = ?");
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
<?php
/**
 * Incidents API - Safety & Logistics Reporting
 * 
 * Endpoints:
 * GET /incidents.php?event_id=123
 * POST /incidents.php (Multipart for photos)
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

        $stmt = $pdo->prepare("SELECT i.*, u.name as reporter_name 
                               FROM incidents i
                               JOIN users u ON i.reporter_id = u.id
                               WHERE i.event_id = ? 
                               ORDER BY i.created_at DESC");
        $stmt->execute([$eventId]);
        $incidents = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['data' => $incidents]);

    } elseif ($method === 'POST') {
        // Handle Multipart

        $eventId = $_POST['event_id'] ?? null;
        $reporterId = $_POST['reporter_id'] ?? null;
        $type = $_POST['type'] ?? 'other';
        $description = $_POST['description'] ?? '';

        if (!$eventId || !$reporterId) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing fields']);
            exit;
        }

        $photoUrl = null;
        if (!empty($_FILES['photo'])) {
            $uploadDir = '../public/uploads/incidents/';
            if (!is_dir($uploadDir))
                mkdir($uploadDir, 0777, true);

            $fileName = time() . '_' . basename($_FILES['photo']['name']);
            $targetPath = $uploadDir . $fileName;

            if (move_uploaded_file($_FILES['photo']['tmp_name'], $targetPath)) {
                $photoUrl = '/uploads/incidents/' . $fileName;
            }
        }

        $sql = "INSERT INTO incidents (event_id, reporter_id, type, description, photo_url, status, created_at)
                VALUES (?, ?, ?, ?, ?, 'open', NOW())";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([$eventId, $reporterId, $type, $description, $photoUrl]);

        echo json_encode(['success' => true, 'message' => 'Incident reported']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'message' => $e->getMessage()]);
}
?>
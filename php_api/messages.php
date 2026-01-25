<?php
/**
 * Messages API - Internal Communications
 * 
 * Handles sending and retrieving chat messages, with support for polling.
 * 
 * Endpoints:
 * GET /messages.php
 *   - event_id (optional): Filter by event
 *   - recipient_id (optional): Filter by DM recipient
 *   - after (optional): TIMESTAMP to fetch only new messages (Polling optimization)
 * 
 * POST /messages.php
 *   - JSON Body: { senderId, recipientId?, eventId?, content, transcription?, type }
 *   - Multipart/Form-Data: (For Audio/Image uploads + metadata)
 */

require_once 'db_connect.php';

header('Content-Type: application/json');

// --- Auto-Migration: Ensure table exists ---
// (Ideally this should be in migrate.php, but for dev speed we double check here or rely on create_messages_table.sql)
try {
    // Minimal check if table exists
    $check = $pdo->query("SHOW TABLES LIKE 'messages'");
    if ($check->rowCount() == 0) {
        $sql = file_get_contents('create_messages_table.sql');
        $pdo->exec($sql);
    }
} catch (Exception $e) {
    // Ignore, assume handled or concurrent issue
}
// -------------------------------------------

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $eventId = $_GET['event_id'] ?? null;
        $recipientId = $_GET['recipient_id'] ?? null;
        $senderId = $_GET['sender_id'] ?? null; // For context if needed
        $after = $_GET['after'] ?? null; // For polling: '2023-10-27 10:00:00'

        $where = [];
        $params = [];

        // Context Logic:
        // 1. Event Chat: WHERE event_id = ?
        // 2. DM: WHERE (sender_id = A AND recipient_id = B) OR (sender_id = B AND recipient_id = A)
        // 3. Global/General: WHERE event_id IS NULL AND recipient_id IS NULL (if we have a general channel)

        if ($eventId) {
            $where[] = "event_id = ?";
            $params[] = $eventId;
        } elseif ($recipientId && $senderId) {
            $where[] = "( (sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?) )";
            $params[] = $senderId;
            $params[] = $recipientId;
            $params[] = $recipientId;
            $params[] = $senderId;
        } else {
            // Default to 'General' (No event, no specific recipient) or just return all accessible (simple MVP)
            // For MVP, if no filters, return recent global messages
            $where[] = "event_id IS NULL AND recipient_id IS NULL";
        }

        if ($after) {
            $where[] = "created_at > ?";
            $params[] = $after;
        }

        $sql = "SELECT m.*, 
                       u.name as sender_name, 
                       u.profile_image as sender_avatar 
                FROM messages m
                JOIN users u ON m.sender_id = u.id";

        if (!empty($where)) {
            $sql .= " WHERE " . implode(' AND ', $where);
        }

        $sql .= " ORDER BY m.created_at ASC LIMIT 100";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['data' => $messages]);

    } elseif ($method === 'POST') {
        // Handle both JSON and Multipart
        $contentType = $_SERVER["CONTENT_TYPE"] ?? '';

        $data = [];
        if (strpos($contentType, 'application/json') !== false) {
            $data = json_decode(file_get_contents('php://input'), true);
        } else {
            // Form Data
            $data = $_POST;
        }

        // Output validation
        if (empty($data['senderId'])) {
            http_response_code(400);
            echo json_encode(['error' => 'senderId is required']);
            exit;
        }

        $senderId = (int) $data['senderId'];
        $recipientId = !empty($data['recipientId']) ? (int) $data['recipientId'] : null;
        $eventId = !empty($data['eventId']) ? (int) $data['eventId'] : null;
        $content = $data['content'] ?? '';
        $transcription = $data['transcription'] ?? null;
        $type = $data['type'] ?? 'text';

        // Handle File Upload (Audio/Image)
        if (!empty($_FILES['file'])) {
            $uploadDir = '../public/uploads/messages/';
            if (!is_dir($uploadDir))
                mkdir($uploadDir, 0777, true);

            $fileName = time() . '_' . basename($_FILES['file']['name']);
            $targetPath = $uploadDir . $fileName;

            if (move_uploaded_file($_FILES['file']['tmp_name'], $targetPath)) {
                // Save relative path for frontend
                $content = '/uploads/messages/' . $fileName;
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to upload file']);
                exit;
            }
        }

        $sql = "INSERT INTO messages (sender_id, recipient_id, event_id, content, transcription, type, created_at)
                VALUES (?, ?, ?, ?, ?, ?, NOW())";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([$senderId, $recipientId, $eventId, $content, $transcription, $type]);

        $newId = $pdo->lastInsertId();

        // fetch complete message back
        $stmt = $pdo->prepare("SELECT m.*, u.name as sender_name, u.profile_image as sender_avatar 
                               FROM messages m 
                               JOIN users u ON m.sender_id = u.id 
                               WHERE m.id = ?");
        $stmt->execute([$newId]);
        $message = $stmt->fetch(PDO::FETCH_ASSOC);

        http_response_code(201);
        echo json_encode(['data' => $message]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'message' => $e->getMessage()]);
}
?>
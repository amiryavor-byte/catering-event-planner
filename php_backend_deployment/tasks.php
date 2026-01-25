<?php
// tasks.php
require_once 'db_connect.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Optional: Filter by assigned_to or status
        $stmt = $pdo->query("SELECT * FROM tasks ORDER BY due_time ASC");
        $data = $stmt->fetchAll();
        echo json_encode($data);
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);

        $sql = "INSERT INTO tasks (title, description, status, assigned_to, created_at) VALUES (?, ?, ?, ?, NOW())";
        $stmt = $pdo->prepare($sql);
        try {
            $stmt->execute([
                $input['title'],
                $input['description'] ?? '',
                $input['status'] ?? 'pending',
                $input['assignedTo'] ?? null
            ]);
            echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
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
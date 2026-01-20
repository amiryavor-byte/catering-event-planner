<?php
// users.php
require_once 'db_connect.php';

// --- Auto-Migration: Ensure 'status' column exists ---
try {
    $check = $pdo->query("SHOW COLUMNS FROM users LIKE 'status'");
    if ($check->rowCount() == 0) {
        // Add status column if missing. Default to 'pending'
        $pdo->exec("ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'pending'");
        // Update existing users to 'active' (assuming they are legacy/trusted)
        $pdo->exec("UPDATE users SET status = 'active' WHERE status = 'pending'");
    }
} catch (Exception $e) {
    // Ignore error if table doesn't exist yet (setup.sql will handle) or other non-critical
}
// -----------------------------------------------------

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $email = $_GET['email'] ?? null;
        if ($email) {
            $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
            $stmt->execute([$email]);
        } else {
            // Filter by status if provided (e.g. ?status=pending)
            $status = $_GET['status'] ?? null;
            if ($status) {
                $stmt = $pdo->prepare("SELECT * FROM users WHERE status = ?");
                $stmt->execute([$status]);
            } else {
                $stmt = $pdo->query("SELECT * FROM users");
            }
        }
        $data = $stmt->fetchAll();
        echo json_encode($data);
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);

        // If ID is provided, it's an UPDATE (or we can use PUT)
        // Simple logic: if 'action' == 'approve'
        if (isset($input['action']) && $input['action'] === 'approve' && isset($input['email'])) {
            $stmt = $pdo->prepare("UPDATE users SET status = 'active' WHERE email = ?");
            $stmt->execute([$input['email']]);
            echo json_encode(['success' => true]);
            break;
        }

        // CREATE User
        $sql = "INSERT INTO users (name, email, role, status, created_at) VALUES (?, ?, ?, ?, NOW())";
        $stmt = $pdo->prepare($sql);
        try {
            $stmt->execute([
                $input['name'],
                $input['email'],
                $input['role'] ?? 'client', // Default role
                $input['status'] ?? 'pending' // Default status (Admin sets 'active', Self-signup sets 'pending')
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
<?php
/**
 * Business Plan API Endpoint
 * 
 * Manages versioned storage of the business plan data.
 * 
 * Supported Methods:
 * - GET    /business_plan.php          -> Get latest plan + version history list
 * - GET    /business_plan.php?id=X     -> Get specific version snapshot
 * - POST   /business_plan.php          -> Save new version
 */

require_once 'db_connect.php';

// --- Auto-Migration: Ensure 'business_plan_snapshots' table exists ---
try {
    $check = $pdo->query("SHOW TABLES LIKE 'business_plan_snapshots'");
    if ($check->rowCount() == 0) {
        $sql = "CREATE TABLE business_plan_snapshots (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user VARCHAR(50) NOT NULL COMMENT 'Amir or David',
            content JSON NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )";
        $pdo->exec($sql);
    }
} catch (Exception $e) {
    // Ignore if already exists race condition
}
// ---------------------------------------------------------------------

header('Content-Type: application/json');
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            $id = $_GET['id'] ?? null;

            if ($id) {
                // Get specific version
                $stmt = $pdo->prepare("SELECT * FROM business_plan_snapshots WHERE id = ?");
                $stmt->execute([$id]);
                $snapshot = $stmt->fetch(PDO::FETCH_ASSOC);

                if (!$snapshot) {
                    http_response_code(404);
                    echo json_encode(['error' => 'Version not found']);
                    exit;
                }
                echo json_encode($snapshot);
            } else {
                // Get Latest + History Log
                // 1. Get Latest
                $stmt = $pdo->query("SELECT * FROM business_plan_snapshots ORDER BY created_at DESC LIMIT 1");
                $latest = $stmt->fetch(PDO::FETCH_ASSOC);

                // 2. Get History (ID, User, Date only)
                $stmt = $pdo->query("SELECT id, user, created_at FROM business_plan_snapshots ORDER BY created_at DESC LIMIT 50");
                $history = $stmt->fetchAll(PDO::FETCH_ASSOC);

                echo json_encode([
                    'latest' => $latest,
                    'history' => $history
                ]);
            }
            break;

        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);

            if (!$input || empty($input['user']) || empty($input['content'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid input. User and Content required.']);
                exit;
            }

            $user = $input['user']; // 'Amir' or 'David'
            $content = json_encode($input['content']); // Store as JSON string in DB if column is JSON type, or just pass array if driver handles it. 
            // PDO + MySQL JSON column usually takes string.
            if (is_array($input['content']) || is_object($input['content'])) {
                $content = json_encode($input['content']);
            } else {
                $content = $input['content']; // Assume string passed
            }

            $stmt = $pdo->prepare("INSERT INTO business_plan_snapshots (user, content, created_at) VALUES (?, ?, NOW())");
            $stmt->execute([$user, $content]);

            $newId = $pdo->lastInsertId();

            echo json_encode([
                'success' => true,
                'message' => 'Version saved',
                'id' => $newId,
                'timestamp' => date('c')
            ]);
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'message' => $e->getMessage()]);
}
?>
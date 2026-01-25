<?php
// company.php
require_once 'db_connect.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        try {
            // Fetch the latest company settings (assuming single company for now)
            $stmt = $pdo->query("SELECT * FROM company_settings ORDER BY id DESC LIMIT 1");
            $data = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($data) {
                // Map snake_case to camelCase for frontend
                echo json_encode([
                    'id' => $data['id'],
                    'name' => $data['name'],
                    'logoUrl' => $data['logo_url'],
                    'primaryColor' => $data['primary_color']
                ]);
            } else {
                echo json_encode(null);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);

        // Basic validation
        if (empty($input['name'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Company name is required']);
            break;
        }

        try {
            // Check if a record exists
            $stmt = $pdo->query("SELECT id FROM company_settings ORDER BY id DESC LIMIT 1");
            $existing = $stmt->fetch();

            if ($existing) {
                // UPDATE
                $sql = "UPDATE company_settings SET name = ?, logo_url = ?, primary_color = ? WHERE id = ?";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([
                    $input['name'],
                    $input['logoUrl'] ?? null,
                    $input['primaryColor'] ?? '#6366f1',
                    $existing['id']
                ]);
            } else {
                // INSERT
                $sql = "INSERT INTO company_settings (name, logo_url, primary_color) VALUES (?, ?, ?)";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([
                    $input['name'],
                    $input['logoUrl'] ?? null,
                    $input['primaryColor'] ?? '#6366f1'
                ]);
            }

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
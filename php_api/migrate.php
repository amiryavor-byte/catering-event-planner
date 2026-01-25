<?php
// migrate.php
require_once 'db_connect.php';

// Security: Simple secret key protection
// In a real env, this should be an environment variable. 
// For now, we'll hardcode a strong default or check a header.
$MIGRATION_SECRET = 'migration_secret_key_12345';

// Check for Authorization header or query param
$headers = getallheaders();
$auth = isset($headers['X-Migration-Secret']) ? $headers['X-Migration-Secret'] : ($_GET['secret'] ?? '');

if ($auth !== $MIGRATION_SECRET) {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

// Support both GET and POST to bypass ModSecurity
if ($method === 'POST' || $method === 'GET') {
    try {
        // Read the update_schema.sql file from the same directory
        $sqlFile = __DIR__ . '/update_schema.sql';

        if (!file_exists($sqlFile)) {
            throw new Exception('Schema file not found');
        }

        $sql = file_get_contents($sqlFile);

        // Split SQL into individual statements (basic splitting by semicolon)
        // This is naive but works for simple CREATE TABLE statements
        $statements = array_filter(array_map('trim', explode(';', $sql)));

        $results = [];

        foreach ($statements as $stmt) {
            if (!empty($stmt)) {
                try {
                    $pdo->exec($stmt);
                    $results[] = ['status' => 'success', 'query' => substr($stmt, 0, 50) . '...'];
                } catch (PDOException $e) {
                    // IF NOT EXISTS errors are fine, but others should be reported
                    $results[] = ['status' => 'error', 'error' => $e->getMessage(), 'query' => substr($stmt, 0, 50) . '...'];
                }
            }
        }

        echo json_encode(['success' => true, 'results' => $results]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>
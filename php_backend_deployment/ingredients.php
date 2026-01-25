<?php
// ingredients.php
require_once 'db_connect.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT * FROM ingredients ORDER BY last_updated DESC");
        $data = $stmt->fetchAll();
        echo json_encode($data);
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);

        // Validation could go here

        $sql = "INSERT INTO ingredients (name, unit, price_per_unit, supplier_url, last_updated) VALUES (?, ?, ?, ?, NOW())";
        $stmt = $pdo->prepare($sql);
        try {
            $stmt->execute([
                $input['name'],
                $input['unit'],
                $input['pricePerUnit'],
                $input['supplierUrl']
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
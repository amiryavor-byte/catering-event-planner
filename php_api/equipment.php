<?php
require_once 'db_connect.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$method = $_SERVER['REQUEST_METHOD'];

// GET: List all equipment
if ($method === 'GET') {
    $sql = "SELECT * FROM equipment ORDER BY name ASC";
    $result = $conn->query($sql);

    $items = [];
    while ($row = $result->fetch_assoc()) {
        $items[] = [
            'id' => (int) $row['id'],
            'name' => $row['name'],
            'type' => $row['type'],
            'defaultRentalCost' => (float) $row['default_rental_cost'],
            'replacementCost' => (float) $row['replacement_cost'],
            'lastUpdated' => $row['last_updated']
        ];
    }
    echo json_encode($items);
    exit;
}

// POST: Add new equipment
if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['name'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Name is required']);
        exit;
    }

    $name = $conn->real_escape_string($data['name']);
    $type = isset($data['type']) ? $conn->real_escape_string($data['type']) : 'owned';
    $defaultRentalCost = isset($data['defaultRentalCost']) ? (float) $data['defaultRentalCost'] : 0;
    $replacementCost = isset($data['replacementCost']) ? (float) $data['replacementCost'] : 0;

    $sql = "INSERT INTO equipment (name, type, default_rental_cost, replacement_cost) 
            VALUES ('$name', '$type', $defaultRentalCost, $replacementCost)";

    if ($conn->query($sql) === TRUE) {
        echo json_encode(['success' => true, 'id' => $conn->insert_id]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Error creating equipment: ' . $conn->error]);
    }
    exit;
}

// PUT: Update equipment
if ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'ID is required']);
        exit;
    }

    $id = (int) $data['id'];
    $updates = [];

    if (isset($data['name'])) {
        $name = $conn->real_escape_string($data['name']);
        $updates[] = "name = '$name'";
    }
    if (isset($data['type'])) {
        $type = $conn->real_escape_string($data['type']);
        $updates[] = "type = '$type'";
    }
    if (isset($data['defaultRentalCost'])) {
        $defaultRentalCost = (float) $data['defaultRentalCost'];
        $updates[] = "default_rental_cost = $defaultRentalCost";
    }
    if (isset($data['replacementCost'])) {
        $replacementCost = (float) $data['replacementCost'];
        $updates[] = "replacement_cost = $replacementCost";
    }

    if (empty($updates)) {
        echo json_encode(['success' => true]); // Nothing to update
        exit;
    }

    $sql = "UPDATE equipment SET " . implode(', ', $updates) . " WHERE id = $id";

    if ($conn->query($sql) === TRUE) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Error updating equipment: ' . $conn->error]);
    }
    exit;
}

// DELETE: Remove equipment
if ($method === 'DELETE') {
    if (!isset($_GET['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'ID is required']);
        exit;
    }

    $id = (int) $_GET['id'];
    $sql = "DELETE FROM equipment WHERE id = $id";

    if ($conn->query($sql) === TRUE) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Error deleting equipment: ' . $conn->error]);
    }
    exit;
}
?>
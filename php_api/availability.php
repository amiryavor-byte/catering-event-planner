<?php
/**
 * Availability & Scheduling API Endpoint
 * 
 * Manages staff availability, blackout dates, open shifts, and shift bids.
 * 
 * Supported Methods:
 * 
 * --- Availability (action=availability or default context) ---
 * - GET    /availability.php?user_id=X            -> Get user availability
 * - POST   /availability.php                      -> Add availability (requires user_id in body)
 * - PUT    /availability.php                      -> Update availability
 * - DELETE /availability.php?id=X                 -> Delete availability entry
 * 
 * --- Blackout Dates (action=blackout) ---
 * - GET    /availability.php?action=blackout      -> List blackout dates (optional start/end date filter)
 * - POST   /availability.php                      -> Add blackout date (body must include action='blackout')
 * - DELETE /availability.php?action=blackout&id=X -> Delete blackout date
 * 
 * --- Open Shifts (action=shifts) ---
 * - GET    /availability.php?action=shifts        -> List open shifts (optional event_id filter)
 * - POST   /availability.php                      -> Add open shift (body must include action='shifts')
 * - PUT    /availability.php                      -> Update open shift
 * - DELETE /availability.php?action=shifts&id=X   -> Delete open shift
 * 
 * --- Shift Bids (action=bids) ---
 * - GET    /availability.php?action=bids          -> List bids (optional shift_id or user_id filter)
 * - POST   /availability.php                      -> Add bid (body must include action='bids')
 * - PUT    /availability.php                      -> Update bid status
 */

require_once 'db_connect.php';

header('Content-Type: application/json');
$method = $_SERVER['REQUEST_METHOD'];

// Helper to get 'action' from query or body
function getAction($input)
{
    if (isset($_GET['action']))
        return $_GET['action'];
    if (isset($input['action']))
        return $input['action'];
    return 'availability'; // Default
}

try {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $action = getAction($input);

    switch ($action) {

        // ==================== STAFF AVAILABILITY ====================
        case 'availability':
            if ($method === 'GET') {
                $userId = $_GET['user_id'] ?? null;
                $startDate = $_GET['start_date'] ?? null;
                $endDate = $_GET['end_date'] ?? null;

                $sql = "SELECT * FROM staff_availability";
                $conditions = [];
                $params = [];

                if ($userId) {
                    $conditions[] = "user_id = ?";
                    $params[] = $userId;
                }
                if ($startDate) {
                    $conditions[] = "date >= ?";
                    $params[] = $startDate;
                }
                if ($endDate) {
                    $conditions[] = "date <= ?";
                    $params[] = $endDate;
                }

                if (!empty($conditions)) {
                    $sql .= " WHERE " . implode(" AND ", $conditions);
                }

                $sql .= " ORDER BY date ASC, day_of_week ASC";

                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                echo json_encode($stmt->fetchAll());

            } elseif ($method === 'POST') {
                // Add Availability
                if (empty($input['user_id']) || empty($input['type'])) {
                    throw new Exception("Missing required fields: user_id, type");
                }

                $sql = "INSERT INTO staff_availability (user_id, date, day_of_week, start_time, end_time, type, status, reason, is_recurring)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

                $stmt = $pdo->prepare($sql);
                $stmt->execute([
                    $input['user_id'],
                    $input['date'] ?? null,
                    $input['day_of_week'] ?? null,
                    $input['start_time'] ?? null,
                    $input['end_time'] ?? null,
                    $input['type'],
                    $input['status'] ?? 'approved',
                    $input['reason'] ?? null,
                    isset($input['is_recurring']) && $input['is_recurring'] ? 1 : 0
                ]);

                $newId = $pdo->lastInsertId();
                echo json_encode(['success' => true, 'id' => $newId, 'message' => 'Availability added']);

            } elseif ($method === 'PUT') {
                // Update Availability
                if (empty($input['id'])) {
                    throw new Exception("Missing ID for update");
                }

                // Dynamic update builder
                $fields = ['date', 'day_of_week', 'start_time', 'end_time', 'type', 'status', 'reason', 'is_recurring'];
                $updates = [];
                $params = [];

                foreach ($fields as $field) {
                    if (array_key_exists($field, $input)) {
                        $updates[] = "$field = ?";
                        if ($field === 'is_recurring') {
                            $params[] = $input[$field] ? 1 : 0;
                        } else {
                            $params[] = $input[$field];
                        }
                    }
                }

                if (empty($updates)) {
                    throw new Exception("No fields to update");
                }

                $params[] = $input['id'];
                $sql = "UPDATE staff_availability SET " . implode(", ", $updates) . " WHERE id = ?";

                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                echo json_encode(['success' => true, 'message' => 'Availability updated']);

            } elseif ($method === 'DELETE') {
                $id = $_GET['id'] ?? null;
                if (!$id)
                    throw new Exception("Missing ID");

                $stmt = $pdo->prepare("DELETE FROM staff_availability WHERE id = ?");
                $stmt->execute([$id]);
                echo json_encode(['success' => true, 'message' => 'Availability deleted']);
            }
            break;

        // ==================== BLACKOUT DATES ====================
        case 'blackout':
            if ($method === 'GET') {
                $startDate = $_GET['start_date'] ?? null;
                $endDate = $_GET['end_date'] ?? null;

                $sql = "SELECT * FROM blackout_dates";
                $conditions = [];
                $params = [];

                if ($startDate) {
                    $conditions[] = "date >= ?";
                    $params[] = $startDate;
                }
                if ($endDate) {
                    $conditions[] = "date <= ?";
                    $params[] = $endDate;
                }

                if (!empty($conditions)) {
                    $sql .= " WHERE " . implode(" AND ", $conditions);
                }
                $sql .= " ORDER BY date ASC";

                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                echo json_encode($stmt->fetchAll());

            } elseif ($method === 'POST') {
                if (empty($input['date'])) {
                    throw new Exception("Missing date for blackout");
                }

                $sql = "INSERT INTO blackout_dates (date, description, is_global, user_id, created_by)
                        VALUES (?, ?, ?, ?, ?)";

                $stmt = $pdo->prepare($sql);
                $stmt->execute([
                    $input['date'],
                    $input['description'] ?? null,
                    isset($input['is_global']) && $input['is_global'] ? 1 : 0,
                    $input['user_id'] ?? null,
                    $input['created_by'] ?? null
                ]);

                $newId = $pdo->lastInsertId();
                echo json_encode(['success' => true, 'id' => $newId, 'message' => 'Blackout date added']);

            } elseif ($method === 'DELETE') {
                $id = $_GET['id'] ?? null;
                if (!$id)
                    throw new Exception("Missing ID");

                $stmt = $pdo->prepare("DELETE FROM blackout_dates WHERE id = ?");
                $stmt->execute([$id]);
                echo json_encode(['success' => true, 'message' => 'Blackout date deleted']);
            }
            break;

        // ==================== OPEN SHIFTS ====================
        case 'shifts':
            if ($method === 'GET') {
                $eventId = $_GET['event_id'] ?? null;

                $sql = "SELECT * FROM open_shifts";
                if ($eventId) {
                    $sql .= " WHERE event_id = ?";
                    $stmt = $pdo->prepare($sql);
                    $stmt->execute([$eventId]);
                } else {
                    $stmt = $pdo->query($sql);
                }
                echo json_encode($stmt->fetchAll());

            } elseif ($method === 'POST') {
                if (empty($input['event_id']) || empty($input['role'])) {
                    throw new Exception("Missing event_id or role");
                }

                $sql = "INSERT INTO open_shifts (event_id, role, start_time, end_time, description, status)
                        VALUES (?, ?, ?, ?, ?, ?)";

                $stmt = $pdo->prepare($sql);
                $stmt->execute([
                    $input['event_id'],
                    $input['role'],
                    $input['start_time'] ?? null,
                    $input['end_time'] ?? null,
                    $input['description'] ?? null,
                    $input['status'] ?? 'open'
                ]);

                $newId = $pdo->lastInsertId();
                echo json_encode(['success' => true, 'id' => $newId, 'message' => 'Shift added']);

            } elseif ($method === 'PUT') {
                if (empty($input['id']))
                    throw new Exception("Missing ID");

                $fields = ['role', 'start_time', 'end_time', 'description', 'status'];
                $updates = [];
                $params = [];

                foreach ($fields as $field) {
                    if (array_key_exists($field, $input)) {
                        $updates[] = "$field = ?";
                        $params[] = $input[$field];
                    }
                }

                if (empty($updates))
                    throw new Exception("No fields to update");

                $params[] = $input['id'];
                $stmt = $pdo->prepare("UPDATE open_shifts SET " . implode(", ", $updates) . " WHERE id = ?");
                $stmt->execute($params);
                echo json_encode(['success' => true, 'message' => 'Shift updated']);

            } elseif ($method === 'DELETE') {
                $id = $_GET['id'] ?? null;
                if (!$id)
                    throw new Exception("Missing ID");

                $stmt = $pdo->prepare("DELETE FROM open_shifts WHERE id = ?");
                $stmt->execute([$id]);
                echo json_encode(['success' => true, 'message' => 'Shift deleted']);
            }
            break;

        // ==================== SHIFT BIDS ====================
        case 'bids':
            if ($method === 'GET') {
                $shiftId = $_GET['shift_id'] ?? null;
                $userId = $_GET['user_id'] ?? null;

                $sql = "SELECT * FROM shift_bids";
                $conditions = [];
                $params = [];

                if ($shiftId) {
                    $conditions[] = "shift_id = ?";
                    $params[] = $shiftId;
                }
                if ($userId) {
                    $conditions[] = "user_id = ?";
                    $params[] = $userId;
                }

                if (!empty($conditions)) {
                    $sql .= " WHERE " . implode(" AND ", $conditions);
                }

                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                echo json_encode($stmt->fetchAll());

            } elseif ($method === 'POST') {
                if (empty($input['shift_id']) || empty($input['user_id'])) {
                    throw new Exception("Missing shift_id or user_id");
                }

                $sql = "INSERT INTO shift_bids (shift_id, user_id, status, notes, bid_time)
                        VALUES (?, ?, ?, ?, NOW())";

                $stmt = $pdo->prepare($sql);
                $stmt->execute([
                    $input['shift_id'],
                    $input['user_id'],
                    $input['status'] ?? 'pending',
                    $input['notes'] ?? null
                ]);

                $newId = $pdo->lastInsertId();
                echo json_encode(['success' => true, 'id' => $newId, 'message' => 'Bid placed']);

            } elseif ($method === 'PUT') {
                if (empty($input['id']))
                    throw new Exception("Missing ID");

                $fields = ['status', 'notes'];
                $updates = [];
                $params = [];

                foreach ($fields as $field) {
                    if (array_key_exists($field, $input)) {
                        $updates[] = "$field = ?";
                        $params[] = $input[$field];
                    }
                }

                if (empty($updates))
                    throw new Exception("No fields to update");

                $params[] = $input['id'];
                $stmt = $pdo->prepare("UPDATE shift_bids SET " . implode(", ", $updates) . " WHERE id = ?");
                $stmt->execute($params);
                echo json_encode(['success' => true, 'message' => 'Bid updated']);
            }
            break;

        default:
            http_response_code(400);
            echo json_encode(['error' => 'Invalid action ' . $action]);
            break;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
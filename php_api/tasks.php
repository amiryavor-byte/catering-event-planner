<?php
/**
 * Tasks API Endpoint - Complete CRUD
 * 
 * Manages tasks for staff assignments and event preparation.
 * 
 * Supported Methods:
 * - GET    /tasks.php        -> List all tasks (with optional filtering)
 * - GET    /tasks.php?id=X   -> Get single task
 * - POST   /tasks.php        -> Create new task
 * - PUT    /tasks.php        -> Update existing task
 * - DELETE /tasks.php?id=X   -> Delete task
 */

require_once 'db_connect.php';

// ==================== HELPER FUNCTIONS ====================

/**
 * Validate task input data
 * @param array $data Input data to validate
 * @param bool $isUpdate Whether this is an update operation (ID required)
 * @return array ['valid' => bool, 'errors' => array, 'sanitized' => array]
 */
function validateTask($data, $isUpdate = false)
{
    $errors = [];
    $sanitized = [];

    // ID validation (required for updates only)
    if ($isUpdate) {
        if (empty($data['id']) || !is_numeric($data['id'])) {
            $errors[] = "Valid task ID is required for updates";
        } else {
            $sanitized['id'] = (int) $data['id'];
        }
    }

    // Title validation (required)
    if (empty($data['title']) || !is_string($data['title'])) {
        $errors[] = "Task title is required";
    } else {
        $sanitized['title'] = trim($data['title']);
        if (strlen($sanitized['title']) < 3) {
            $errors[] = "Task title must be at least 3 characters";
        }
        if (strlen($sanitized['title']) > 255) {
            $errors[] = "Task title must not exceed 255 characters";
        }
    }

    // Description validation (optional)
    $sanitized['description'] = isset($data['description']) ? trim($data['description']) : '';

    // Status validation (required, must be from allowed list)
    $allowedStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
    if (empty($data['status'])) {
        $sanitized['status'] = 'pending'; // Default
    } elseif (!in_array($data['status'], $allowedStatuses)) {
        $errors[] = "Invalid status. Allowed: " . implode(', ', $allowedStatuses);
    } else {
        $sanitized['status'] = $data['status'];
    }

    // Assigned to validation (optional, but check if user exists if provided)
    $sanitized['assignedTo'] = isset($data['assignedTo']) ? (int) $data['assignedTo'] : null;

    // Due time validation (optional, but validate format if provided)
    if (isset($data['dueTime']) && !empty($data['dueTime'])) {
        $sanitized['dueTime'] = $data['dueTime'];
        // Basic validation - more sophisticated date validation could be added
        if (strtotime($sanitized['dueTime']) === false) {
            $errors[] = "Invalid due time format";
        }
    } else {
        $sanitized['dueTime'] = null;
    }

    return [
        'valid' => empty($errors),
        'errors' => $errors,
        'sanitized' => $sanitized
    ];
}

/**
 * Verify that assigned user exists
 * @param PDO $pdo Database connection
 * @param int $userId User ID to check
 * @return bool
 */
function userExists($pdo, $userId)
{
    if ($userId === null)
        return true; // Null is allowed (unassigned)

    try {
        $stmt = $pdo->prepare("SELECT id FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        return $stmt->fetch() !== false;
    } catch (Exception $e) {
        return true; // If users table doesn't exist, allow for now
    }
}

// ==================== MAIN REQUEST HANDLER ====================

header('Content-Type: application/json');
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {

        // ==================== GET: Retrieve Tasks ====================
        case 'GET':
            $id = $_GET['id'] ?? null;

            if ($id) {
                // Get single task by ID
                if (!is_numeric($id)) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Invalid task ID']);
                    exit;
                }

                $stmt = $pdo->prepare("SELECT * FROM tasks WHERE id = ?");
                $stmt->execute([$id]);
                $task = $stmt->fetch();

                if (!$task) {
                    http_response_code(404);
                    echo json_encode(['error' => 'Task not found']);
                    exit;
                }

                echo json_encode($task);
            } else {
                // Get all tasks (with optional filtering)
                $status = $_GET['status'] ?? null;
                $assignedTo = $_GET['assigned_to'] ?? null;
                $orderBy = $_GET['orderBy'] ?? 'due_time';
                $order = $_GET['order'] ?? 'ASC';

                // Whitelist allowed order columns for security
                $allowedOrderBy = ['id', 'title', 'status', 'due_time', 'created_at', 'assigned_to'];
                if (!in_array($orderBy, $allowedOrderBy)) {
                    $orderBy = 'due_time';
                }
                $order = strtoupper($order) === 'DESC' ? 'DESC' : 'ASC';

                // Build query
                $conditions = [];
                $params = [];

                if ($status) {
                    $conditions[] = "status = ?";
                    $params[] = $status;
                }

                if ($assignedTo) {
                    if ($assignedTo === 'unassigned') {
                        $conditions[] = "assigned_to IS NULL";
                    } else {
                        $conditions[] = "assigned_to = ?";
                        $params[] = (int) $assignedTo;
                    }
                }

                $sql = "SELECT * FROM tasks";
                if (!empty($conditions)) {
                    $sql .= " WHERE " . implode(" AND ", $conditions);
                }
                $sql .= " ORDER BY $orderBy $order";

                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                $data = $stmt->fetchAll();

                echo json_encode($data);
            }
            break;

        // ==================== POST: Create New Task ====================
        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);

            if (!$input) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid JSON input']);
                exit;
            }

            $validation = validateTask($input, false);

            if (!$validation['valid']) {
                http_response_code(400);
                echo json_encode(['error' => 'Validation failed', 'details' => $validation['errors']]);
                exit;
            }

            $sanitized = $validation['sanitized'];

            // Validate assigned user exists
            if ($sanitized['assignedTo'] !== null && !userExists($pdo, $sanitized['assignedTo'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Assigned user does not exist']);
                exit;
            }

            // Insert new task
            $sql = "INSERT INTO tasks (title, description, status, assigned_to, due_time, created_at) 
                    VALUES (?, ?, ?, ?, ?, NOW())";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $sanitized['title'],
                $sanitized['description'],
                $sanitized['status'],
                $sanitized['assignedTo'],
                $sanitized['dueTime']
            ]);

            $newId = $pdo->lastInsertId();

            // Return the created task
            $stmt = $pdo->prepare("SELECT * FROM tasks WHERE id = ?");
            $stmt->execute([$newId]);
            $newTask = $stmt->fetch();

            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Task created successfully',
                'data' => $newTask
            ]);
            break;

        // ==================== PUT: Update Existing Task ====================
        case 'PUT':
            $input = json_decode(file_get_contents('php://input'), true);

            if (!$input) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid JSON input']);
                exit;
            }

            $validation = validateTask($input, true);

            if (!$validation['valid']) {
                http_response_code(400);
                echo json_encode(['error' => 'Validation failed', 'details' => $validation['errors']]);
                exit;
            }

            $sanitized = $validation['sanitized'];

            // Check if task exists
            $stmt = $pdo->prepare("SELECT id FROM tasks WHERE id = ?");
            $stmt->execute([$sanitized['id']]);
            if (!$stmt->fetch()) {
                http_response_code(404);
                echo json_encode(['error' => 'Task not found']);
                exit;
            }

            // Validate assigned user exists
            if ($sanitized['assignedTo'] !== null && !userExists($pdo, $sanitized['assignedTo'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Assigned user does not exist']);
                exit;
            }

            // Update task
            $sql = "UPDATE tasks 
                    SET title = ?, description = ?, status = ?, assigned_to = ?, due_time = ? 
                    WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $sanitized['title'],
                $sanitized['description'],
                $sanitized['status'],
                $sanitized['assignedTo'],
                $sanitized['dueTime'],
                $sanitized['id']
            ]);

            // Return updated task
            $stmt = $pdo->prepare("SELECT * FROM tasks WHERE id = ?");
            $stmt->execute([$sanitized['id']]);
            $updatedTask = $stmt->fetch();

            echo json_encode([
                'success' => true,
                'message' => 'Task updated successfully',
                'data' => $updatedTask
            ]);
            break;

        // ==================== DELETE: Remove Task ====================
        case 'DELETE':
            $id = $_GET['id'] ?? null;

            if (!$id || !is_numeric($id)) {
                http_response_code(400);
                echo json_encode(['error' => 'Valid task ID is required']);
                exit;
            }

            // Check if task exists
            $stmt = $pdo->prepare("SELECT * FROM tasks WHERE id = ?");
            $stmt->execute([$id]);
            $task = $stmt->fetch();

            if (!$task) {
                http_response_code(404);
                echo json_encode(['error' => 'Task not found']);
                exit;
            }

            // Delete task (no cascade check needed - tasks are leaf nodes)
            $stmt = $pdo->prepare("DELETE FROM tasks WHERE id = ?");
            $stmt->execute([$id]);

            echo json_encode([
                'success' => true,
                'message' => 'Task deleted successfully',
                'deletedId' => (int) $id
            ]);
            break;

        // ==================== Invalid Method ====================
        default:
            http_response_code(405);
            echo json_encode([
                'error' => 'Method not allowed',
                'allowedMethods' => ['GET', 'POST', 'PUT', 'DELETE']
            ]);
            break;
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Database error',
        'message' => $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Server error',
        'message' => $e->getMessage()
    ]);
}
?>
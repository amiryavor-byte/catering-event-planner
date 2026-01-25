<?php
/**
 * Users API Endpoint - Complete CRUD
 * 
 * Manages user accounts for staff and clients.
 * 
 * Supported Methods:
 * - GET    /users.php         -> List all users (with optional filtering)
 * - GET    /users.php?id=X    -> Get single user
 * - GET    /users.php?email=X -> Get user by email
 * - POST   /users.php         -> Create new user OR approve user (action=approve)
 * - PUT    /users.php         -> Update existing user
 * - DELETE /users.php?id=X    -> Delete user (with cascade check)
 */

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

    // Check for profile_image
    $check = $pdo->query("SHOW COLUMNS FROM users LIKE 'profile_image'");
    if ($check->rowCount() == 0) {
        $pdo->exec("ALTER TABLE users ADD COLUMN profile_image TEXT NULL");
    }

    // Check for language
    $check = $pdo->query("SHOW COLUMNS FROM users LIKE 'language'");
    if ($check->rowCount() == 0) {
        $pdo->exec("ALTER TABLE users ADD COLUMN language VARCHAR(10) DEFAULT 'en'");
    }
} catch (Exception $e) {
    // Ignore error if table doesn't exist yet (setup.sql will handle) or other non-critical
}
// -----------------------------------------------------

// ==================== HELPER FUNCTIONS ====================

/**
 * Validate user input data
 * @param array $data Input data to validate
 * @param bool $isUpdate Whether this is an update operation (ID required)
 * @return array ['valid' => bool, 'errors' => array, 'sanitized' => array]
 */
function validateUser($data, $isUpdate = false)
{
    $errors = [];
    $sanitized = [];

    // Check if this is a deactivation (soft delete)
    // We relax validation rules for users being marked as inactive to allow cleaning up legacy/bad data
    $isDeactivation = isset($data['status']) && $data['status'] === 'inactive';

    // ID validation (required for updates only)
    if ($isUpdate) {
        if (empty($data['id']) || !is_numeric($data['id'])) {
            $errors[] = "Valid user ID is required for updates";
        } else {
            $sanitized['id'] = (int) $data['id'];
        }
    }

    // Name validation (required)
    if (empty($data['name']) || !is_string($data['name'])) {
        $errors[] = "User name is required";
    } else {
        $sanitized['name'] = trim($data['name']);
        // Only enforce length check if active/pending
        if (!$isDeactivation && strlen($sanitized['name']) < 2) {
            $errors[] = "User name must be at least 2 characters";
        }
    }

    // Email validation (required, must be valid format)
    if (empty($data['email']) || !is_string($data['email'])) {
        $errors[] = "Email is required";
    } else {
        $sanitized['email'] = trim(strtolower($data['email']));
        // Only enforce strict email format if active/pending
        if (!$isDeactivation && !filter_var($sanitized['email'], FILTER_VALIDATE_EMAIL)) {
            $errors[] = "Invalid email format";
        }
    }

    // Role validation (required, must be from allowed list)
    $allowedRoles = ['admin', 'staff', 'client'];
    if (empty($data['role'])) {
        $sanitized['role'] = 'client'; // Default
    } elseif (!in_array($data['role'], $allowedRoles)) {
        $errors[] = "Invalid role. Allowed: " . implode(', ', $allowedRoles);
    } else {
        $sanitized['role'] = $data['role'];
    }

    // Status validation (optional, must be from allowed list if provided)
    $allowedStatuses = ['active', 'pending', 'inactive'];
    if (empty($data['status'])) {
        $sanitized['status'] = 'pending'; // Default for new users
    } elseif (!in_array($data['status'], $allowedStatuses)) {
        $errors[] = "Invalid status. Allowed: " . implode(', ', $allowedStatuses);
    } else {
        $sanitized['status'] = $data['status'];
    }

    return [
        'valid' => empty($errors),
        'errors' => $errors,
        'sanitized' => $sanitized
    ];
}

/**
 * Check if user is assigned to any tasks
 * @param PDO $pdo Database connection
 * @param int $userId User ID to check
 * @return array ['inUse' => bool, 'taskCount' => int]
 */
function checkUserUsage($pdo, $userId)
{
    try {
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM tasks WHERE assigned_to = ?");
        $stmt->execute([$userId]);
        $count = (int) $stmt->fetch()['count'];

        return [
            'inUse' => $count > 0,
            'taskCount' => $count
        ];
    } catch (Exception $e) {
        return ['inUse' => false, 'taskCount' => 0];
    }
}

/**
 * Check if user is a client for any events
 * @param PDO $pdo Database connection
 * @param int $userId User ID to check
 * @return array ['inUse' => bool, 'eventCount' => int]
 */
function checkUserEvents($pdo, $userId)
{
    try {
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM events WHERE client_id = ?");
        $stmt->execute([$userId]);
        $count = (int) $stmt->fetch()['count'];

        return [
            'inUse' => $count > 0,
            'eventCount' => $count
        ];
    } catch (Exception $e) {
        return ['inUse' => false, 'eventCount' => 0];
    }
}

// ==================== MAIN REQUEST HANDLER ====================

header('Content-Type: application/json');
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {

        // ==================== GET: Retrieve Users ====================
        case 'GET':
            $id = $_GET['id'] ?? null;
            $email = $_GET['email'] ?? null;

            if ($id) {
                // Get single user by ID
                if (!is_numeric($id)) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Invalid user ID']);
                    exit;
                }

                $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
                $stmt->execute([$id]);
                $user = $stmt->fetch();

                if (!$user) {
                    http_response_code(404);
                    echo json_encode(['error' => 'User not found']);
                    exit;
                }

                echo json_encode($user);
            } elseif ($email) {
                // Get user by email
                $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
                $stmt->execute([$email]);
                $user = $stmt->fetch();

                if (!$user) {
                    http_response_code(404);
                    echo json_encode(['error' => 'User not found']);
                    exit;
                }

                echo json_encode($user);
            } else {
                // Get all users (with optional filtering)
                $status = $_GET['status'] ?? null;
                $role = $_GET['role'] ?? null;

                // Build query
                $conditions = [];
                $params = [];

                if ($status) {
                    $conditions[] = "status = ?";
                    $params[] = $status;
                }

                if ($role) {
                    $conditions[] = "role = ?";
                    $params[] = $role;
                }

                $sql = "SELECT * FROM users";
                if (!empty($conditions)) {
                    $sql .= " WHERE " . implode(" AND ", $conditions);
                }
                $sql .= " ORDER BY created_at DESC";

                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                $data = $stmt->fetchAll();

                echo json_encode($data);
            }
            break;

        // ==================== POST: Create User OR Approve User ====================
        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);

            if (!$input) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid JSON input']);
                exit;
            }

            // SPECIAL ACTION: Approve user
            if (isset($input['action']) && $input['action'] === 'approve' && isset($input['email'])) {
                $stmt = $pdo->prepare("UPDATE users SET status = 'active' WHERE email = ?");
                $stmt->execute([$input['email']]);
                echo json_encode(['success' => true, 'message' => 'User approved successfully']);
                break;
            }

            // CREATE User
            $validation = validateUser($input, false);

            if (!$validation['valid']) {
                http_response_code(400);
                echo json_encode(['error' => 'Validation failed', 'details' => $validation['errors']]);
                exit;
            }

            $sanitized = $validation['sanitized'];

            // Check for duplicate email
            $stmt = $pdo->prepare("SELECT id FROM users WHERE LOWER(email) = LOWER(?)");
            $stmt->execute([$sanitized['email']]);
            if ($stmt->fetch()) {
                http_response_code(409);
                echo json_encode(['error' => 'User with this email already exists']);
                exit;
            }

            // Job Title & Phone (Optional)
            $sanitized['job_title'] = isset($data['jobTitle']) ? trim($data['jobTitle']) : null;
            $sanitized['phone_number'] = isset($data['phoneNumber']) ? trim($data['phoneNumber']) : null;
            // Also accept snake_case
            if (isset($data['phone_number']))
                $sanitized['phone_number'] = trim($data['phone_number']);

            // Profile & Language
            $sanitized['profile_image'] = isset($data['profileImage']) ? trim($data['profileImage']) : (isset($data['profile_image']) ? trim($data['profile_image']) : null);
            $sanitized['language'] = isset($data['language']) ? trim($data['language']) : (isset($data['language']) ? trim($data['language']) : 'en');

            // Insert new user
            $sql = "INSERT INTO users (name, email, role, status, job_title, phone_number, profile_image, language, is_sample, created_at) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $sanitized['name'],
                $sanitized['email'],
                $sanitized['role'],
                $sanitized['status'],
                $sanitized['job_title'],
                $sanitized['phone_number'],
                $sanitized['profile_image'],
                $sanitized['language'],
                $input['isSample'] ?? 0
            ]);

            $newId = $pdo->lastInsertId();

            // Return the created user
            $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
            $stmt->execute([$newId]);
            $newUser = $stmt->fetch();

            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'User created successfully',
                'data' => $newUser
            ]);
            break;

        // ==================== PUT: Update Existing User ====================
        case 'PUT':
            $input = json_decode(file_get_contents('php://input'), true);

            if (!$input || empty($input['id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid JSON input or missing ID']);
                exit;
            }

            $id = (int) $input['id'];

            // Check if user exists FIRST
            $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
            $stmt->execute([$id]);
            $existingUser = $stmt->fetch();

            if (!$existingUser) {
                http_response_code(404);
                echo json_encode(['error' => 'User not found']);
                exit;
            }

            // Merge existing data with input (Input takes precedence)
            $mergedData = array_merge($existingUser, $input);
            $mergedData['id'] = $id;

            // Handle camelCase to snake_case mapping for optional fields if passed in input
            if (isset($input['jobTitle']))
                $mergedData['job_title'] = $input['jobTitle'];
            if (isset($input['phoneNumber']))
                $mergedData['phone_number'] = $input['phoneNumber'];

            // Validate the MERGED data
            $validation = validateUser($mergedData, true);

            if (!$validation['valid']) {
                http_response_code(400);
                echo json_encode(['error' => 'Validation failed', 'details' => $validation['errors']]);
                exit;
            }

            $sanitized = $validation['sanitized'];

            // Optional replacements
            if (isset($input['profileImage']))
                $mergedData['profile_image'] = $input['profileImage'];
            if (isset($input['language']))
                $mergedData['language'] = $input['language'];

            $sanitized['id'] = $id;

            // Extra sanitization for optionals
            $sanitized['job_title'] = $mergedData['job_title'] ?? null;
            $sanitized['phone_number'] = $mergedData['phone_number'] ?? null;
            $sanitized['profile_image'] = $mergedData['profile_image'] ?? null;
            $sanitized['language'] = $mergedData['language'] ?? 'en';

            // Check for duplicate email
            $stmt = $pdo->prepare("SELECT id FROM users WHERE LOWER(email) = LOWER(?) AND id != ?");
            $stmt->execute([$sanitized['email'], $sanitized['id']]);
            if ($stmt->fetch()) {
                http_response_code(409);
                echo json_encode(['error' => 'Another user with this email already exists']);
                exit;
            }

            // Update user
            $sql = "UPDATE users 
                    SET name = ?, email = ?, role = ?, status = ?, job_title = ?, phone_number = ?, profile_image = ?, language = ? 
                    WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $sanitized['name'],
                $sanitized['email'],
                $sanitized['role'],
                $sanitized['status'],
                $sanitized['job_title'],
                $sanitized['phone_number'],
                $sanitized['profile_image'],
                $sanitized['language'],
                $sanitized['id']
            ]);

            // Return updated user
            $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
            $stmt->execute([$sanitized['id']]);
            $updatedUser = $stmt->fetch();

            echo json_encode([
                'success' => true,
                'message' => 'User updated successfully',
                'data' => $updatedUser
            ]);
            break;

        // ==================== DELETE: Remove User ====================
        case 'DELETE':
            $id = $_GET['id'] ?? null;

            if (!$id || !is_numeric($id)) {
                http_response_code(400);
                echo json_encode(['error' => 'Valid user ID is required']);
                exit;
            }

            // Check if user exists
            $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
            $stmt->execute([$id]);
            $user = $stmt->fetch();

            if (!$user) {
                http_response_code(404);
                echo json_encode(['error' => 'User not found']);
                exit;
            }

            // Check if user is assigned to tasks (cascade check)
            $usage = checkUserUsage($pdo, $id);

            if ($usage['inUse']) {
                http_response_code(409);
                echo json_encode([
                    'error' => 'Cannot delete user',
                    'reason' => 'User is assigned to ' . $usage['taskCount'] . ' task(s)',
                    'suggestion' => 'Reassign or remove tasks first, or set user status to inactive instead'
                ]);
                exit;
                exit;
            }

            // Check if uses has events (as client)
            $eventUsage = checkUserEvents($pdo, $id);

            if ($eventUsage['inUse']) {
                http_response_code(409);
                echo json_encode([
                    'error' => 'Cannot delete user',
                    'reason' => 'User is a client for ' . $eventUsage['eventCount'] . ' event(s)',
                    'suggestion' => 'Reassign events or delete them first'
                ]);
                exit;
            }

            // Delete user
            $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
            $stmt->execute([$id]);

            echo json_encode([
                'success' => true,
                'message' => 'User deleted successfully',
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
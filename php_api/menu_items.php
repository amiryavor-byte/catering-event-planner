<?php
/**
 * Menu Items API Endpoint - Complete CRUD
 * 
 * Manages menu items (dishes) for the catering business.
 * 
 * Supported Methods:
 * - GET    /menu_items.php        -> List all menu items
 * - GET    /menu_items.php?id=X   -> Get single menu item
 * - POST   /menu_items.php        -> Create new menu item
 * - PUT    /menu_items.php        -> Update existing menu item
 * - DELETE /menu_items.php?id=X   -> Delete menu item (with cascade check)
 */

require_once 'db_connect.php';

// ==================== HELPER FUNCTIONS ====================

/**
 * Validate menu item input data
 * @param array $data Input data to validate
 * @param bool $isUpdate Whether this is an update operation (ID required)
 * @return array ['valid' => bool, 'errors' => array, 'sanitized' => array]
 */
function validateMenuItem($data, $isUpdate = false)
{
    $errors = [];
    $sanitized = [];

    // ID validation (required for updates only)
    if ($isUpdate) {
        if (empty($data['id']) || !is_numeric($data['id'])) {
            $errors[] = "Valid menu item ID is required for updates";
        } else {
            $sanitized['id'] = (int) $data['id'];
        }
    }

    // Name validation (required)
    if (empty($data['name']) || !is_string($data['name'])) {
        $errors[] = "Menu item name is required";
    } else {
        $sanitized['name'] = trim($data['name']);
        if (strlen($sanitized['name']) < 2) {
            $errors[] = "Menu item name must be at least 2 characters";
        }
        if (strlen($sanitized['name']) > 255) {
            $errors[] = "Menu item name must not exceed 255 characters";
        }
    }

    // Description validation (optional)
    $sanitized['description'] = isset($data['description']) ? trim($data['description']) : '';

    // Base price validation (required, must be numeric and non-negative)
    if (!isset($data['basePrice']) || !is_numeric($data['basePrice'])) {
        $errors[] = "Base price is required and must be a number";
    } else {
        $sanitized['basePrice'] = (float) $data['basePrice'];
        if ($sanitized['basePrice'] < 0) {
            $errors[] = "Base price cannot be negative";
        }
    }

    // Category validation (required, must be from allowed list)
    $allowedCategories = ['Appetizer', 'Main', 'Dessert', 'Beverage', 'Side', 'Other'];
    if (empty($data['category'])) {
        $errors[] = "Category is required";
    } elseif (!in_array($data['category'], $allowedCategories)) {
        $errors[] = "Invalid category. Allowed: " . implode(', ', $allowedCategories);
    } else {
        $sanitized['category'] = $data['category'];
    }

    return [
        'valid' => empty($errors),
        'errors' => $errors,
        'sanitized' => $sanitized
    ];
}

/**
 * Check if menu item is used in any recipes or events
 * @param PDO $pdo Database connection
 * @param int $menuItemId Menu item ID to check
 * @return array ['inUse' => bool, 'usageCount' => int, 'details' => string]
 */
function checkMenuItemUsage($pdo, $menuItemId)
{
    try {
        $recipeCount = 0;
        $eventCount = 0;

        // Check if menu item has recipes
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM recipes WHERE menu_item_id = ?");
        $stmt->execute([$menuItemId]);
        $recipeCount = (int) $stmt->fetch()['count'];

        // Check if menu item is in events (table might not exist yet)
        try {
            $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM event_menus WHERE menu_item_id = ?");
            $stmt->execute([$menuItemId]);
            $eventCount = (int) $stmt->fetch()['count'];
        } catch (PDOException $e) {
            // Table doesn't exist yet, ignore
        }

        $totalCount = $recipeCount + $eventCount;
        $details = [];
        if ($recipeCount > 0)
            $details[] = "$recipeCount recipe(s)";
        if ($eventCount > 0)
            $details[] = "$eventCount event(s)";

        return [
            'inUse' => $totalCount > 0,
            'usageCount' => $totalCount,
            'details' => implode(', ', $details)
        ];
    } catch (Exception $e) {
        return ['inUse' => false, 'usageCount' => 0, 'details' => ''];
    }
}

// ==================== MAIN REQUEST HANDLER ====================

header('Content-Type: application/json');
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {

        // ==================== GET: Retrieve Menu Items ====================
        case 'GET':
            $id = $_GET['id'] ?? null;

            if ($id) {
                // Get single menu item by ID
                if (!is_numeric($id)) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Invalid menu item ID']);
                    exit;
                }

                $stmt = $pdo->prepare("SELECT * FROM menu_items WHERE id = ?");
                $stmt->execute([$id]);
                $menuItem = $stmt->fetch();

                if (!$menuItem) {
                    http_response_code(404);
                    echo json_encode(['error' => 'Menu item not found']);
                    exit;
                }

                echo json_encode($menuItem);
            } else {
                // Get all menu items (with optional filtering)
                $search = $_GET['search'] ?? null;
                $category = $_GET['category'] ?? null;
                $orderBy = $_GET['orderBy'] ?? 'name';
                $order = $_GET['order'] ?? 'ASC';

                // Whitelist allowed order columns for security
                $allowedOrderBy = ['id', 'name', 'category', 'base_price'];
                if (!in_array($orderBy, $allowedOrderBy)) {
                    $orderBy = 'name';
                }
                $order = strtoupper($order) === 'DESC' ? 'DESC' : 'ASC';

                // Build query
                $conditions = [];
                $params = [];

                if ($search) {
                    $conditions[] = "(name LIKE ? OR description LIKE ?)";
                    $params[] = '%' . $search . '%';
                    $params[] = '%' . $search . '%';
                }

                if ($category) {
                    $conditions[] = "category = ?";
                    $params[] = $category;
                }

                $sql = "SELECT * FROM menu_items";
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

        // ==================== POST: Create New Menu Item ====================
        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);

            if (!$input) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid JSON input']);
                exit;
            }

            $validation = validateMenuItem($input, false);

            if (!$validation['valid']) {
                http_response_code(400);
                echo json_encode(['error' => 'Validation failed', 'details' => $validation['errors']]);
                exit;
            }

            $sanitized = $validation['sanitized'];

            // Check for duplicate name
            $stmt = $pdo->prepare("SELECT id FROM menu_items WHERE LOWER(name) = LOWER(?)");
            $stmt->execute([$sanitized['name']]);
            if ($stmt->fetch()) {
                http_response_code(409);
                echo json_encode(['error' => 'Menu item with this name already exists']);
                exit;
            }

            // Insert new menu item
            $sql = "INSERT INTO menu_items (name, description, base_price, category, is_sample) 
                    VALUES (?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $sanitized['name'],
                $sanitized['description'],
                $sanitized['basePrice'],
                $sanitized['category'],
                $input['isSample'] ?? 0
            ]);

            $newId = $pdo->lastInsertId();

            // Return the created menu item
            $stmt = $pdo->prepare("SELECT * FROM menu_items WHERE id = ?");
            $stmt->execute([$newId]);
            $newMenuItem = $stmt->fetch();

            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Menu item created successfully',
                'data' => $newMenuItem
            ]);
            break;

        // ==================== PUT: Update Existing Menu Item ====================
        case 'PUT':
            $input = json_decode(file_get_contents('php://input'), true);

            if (!$input) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid JSON input']);
                exit;
            }

            $validation = validateMenuItem($input, true);

            if (!$validation['valid']) {
                http_response_code(400);
                echo json_encode(['error' => 'Validation failed', 'details' => $validation['errors']]);
                exit;
            }

            $sanitized = $validation['sanitized'];

            // Check if menu item exists
            $stmt = $pdo->prepare("SELECT id FROM menu_items WHERE id = ?");
            $stmt->execute([$sanitized['id']]);
            if (!$stmt->fetch()) {
                http_response_code(404);
                echo json_encode(['error' => 'Menu item not found']);
                exit;
            }

            // Check for duplicate name (excluding current menu item)
            $stmt = $pdo->prepare("SELECT id FROM menu_items WHERE LOWER(name) = LOWER(?) AND id != ?");
            $stmt->execute([$sanitized['name'], $sanitized['id']]);
            if ($stmt->fetch()) {
                http_response_code(409);
                echo json_encode(['error' => 'Another menu item with this name already exists']);
                exit;
            }

            // Update menu item
            $sql = "UPDATE menu_items 
                    SET name = ?, description = ?, base_price = ?, category = ? 
                    WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $sanitized['name'],
                $sanitized['description'],
                $sanitized['basePrice'],
                $sanitized['category'],
                $sanitized['id']
            ]);

            // Return updated menu item
            $stmt = $pdo->prepare("SELECT * FROM menu_items WHERE id = ?");
            $stmt->execute([$sanitized['id']]);
            $updatedMenuItem = $stmt->fetch();

            echo json_encode([
                'success' => true,
                'message' => 'Menu item updated successfully',
                'data' => $updatedMenuItem
            ]);
            break;

        // ==================== DELETE: Remove Menu Item ====================
        case 'DELETE':
            $id = $_GET['id'] ?? null;

            if (!$id || !is_numeric($id)) {
                http_response_code(400);
                echo json_encode(['error' => 'Valid menu item ID is required']);
                exit;
            }

            // Check if menu item exists
            $stmt = $pdo->prepare("SELECT * FROM menu_items WHERE id = ?");
            $stmt->execute([$id]);
            $menuItem = $stmt->fetch();

            if (!$menuItem) {
                http_response_code(404);
                echo json_encode(['error' => 'Menu item not found']);
                exit;
            }

            // Check if menu item is used in recipes or events (cascade check)
            $usage = checkMenuItemUsage($pdo, $id);

            if ($usage['inUse']) {
                http_response_code(409);
                echo json_encode([
                    'error' => 'Cannot delete menu item',
                    'reason' => 'Menu item is used in ' . $usage['details'],
                    'suggestion' => 'Remove this menu item from all recipes and events first, or use cascade deletion'
                ]);
                exit;
            }

            // Delete menu item
            $stmt = $pdo->prepare("DELETE FROM menu_items WHERE id = ?");
            $stmt->execute([$id]);

            echo json_encode([
                'success' => true,
                'message' => 'Menu item deleted successfully',
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
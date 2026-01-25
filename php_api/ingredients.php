<?php
/**
 * Ingredients API Endpoint - Complete CRUD Template
 * 
 * This endpoint serves as the reference implementation for all backend PHP APIs.
 * Pattern includes: Full CRUD, validation, error handling, cascade checks, HTTP standards.
 * 
 * Supported Methods:
 * - GET    /ingredients.php        -> List all ingredients
 * - GET    /ingredients.php?id=X   -> Get single ingredient
 * - POST   /ingredients.php        -> Create new ingredient
 * - PUT    /ingredients.php        -> Update existing ingredient
 * - DELETE /ingredients.php?id=X   -> Delete ingredient (with cascade check)
 */

require_once 'db_connect.php';

// ==================== HELPER FUNCTIONS ====================

/**
 * Validate ingredient input data
 * @param array $data Input data to validate
 * @param bool $isUpdate Whether this is an update operation (ID required)
 * @return array ['valid' => bool, 'errors' => array, 'sanitized' => array]
 */
function validateIngredient($data, $isUpdate = false)
{
    $errors = [];
    $sanitized = [];

    // ID validation (required for updates only)
    if ($isUpdate) {
        if (empty($data['id']) || !is_numeric($data['id'])) {
            $errors[] = "Valid ingredient ID is required for updates";
        } else {
            $sanitized['id'] = (int) $data['id'];
        }
    }

    // Name validation (required)
    if (empty($data['name']) || !is_string($data['name'])) {
        $errors[] = "Ingredient name is required";
    } else {
        $sanitized['name'] = trim($data['name']);
        if (strlen($sanitized['name']) < 2) {
            $errors[] = "Ingredient name must be at least 2 characters";
        }
        if (strlen($sanitized['name']) > 255) {
            $errors[] = "Ingredient name must not exceed 255 characters";
        }
    }

    // Unit validation (required)
    if (empty($data['unit']) || !is_string($data['unit'])) {
        $errors[] = "Unit is required (e.g., 'kg', 'lbs', 'dozen')";
    } else {
        $sanitized['unit'] = trim($data['unit']);
    }

    // Price validation (required, must be numeric and positive)
    if (!isset($data['pricePerUnit']) || !is_numeric($data['pricePerUnit'])) {
        $errors[] = "Price per unit is required and must be a number";
    } else {
        $sanitized['pricePerUnit'] = (float) $data['pricePerUnit'];
        if ($sanitized['pricePerUnit'] < 0) {
            $errors[] = "Price per unit cannot be negative";
        }
    }

    // Supplier URL (optional)
    $sanitized['supplierUrl'] = isset($data['supplierUrl']) ? trim($data['supplierUrl']) : null;

    return [
        'valid' => empty($errors),
        'errors' => $errors,
        'sanitized' => $sanitized
    ];
}

/**
 * Check if ingredient is used in any recipes (cascade check)
 * @param PDO $pdo Database connection
 * @param int $ingredientId Ingredient ID to check
 * @return array ['inUse' => bool, 'recipeCount' => int]
 */
function checkIngredientUsage($pdo, $ingredientId)
{
    try {
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM recipes WHERE ingredient_id = ?");
        $stmt->execute([$ingredientId]);
        $result = $stmt->fetch();
        $count = (int) $result['count'];

        return [
            'inUse' => $count > 0,
            'recipeCount' => $count
        ];
    } catch (Exception $e) {
        return ['inUse' => false, 'recipeCount' => 0];
    }
}

// ==================== MAIN REQUEST HANDLER ====================

header('Content-Type: application/json');
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {

        // ==================== GET: Retrieve Ingredients ====================
        case 'GET':
            $id = $_GET['id'] ?? null;

            if ($id) {
                // Get single ingredient by ID
                if (!is_numeric($id)) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Invalid ingredient ID']);
                    exit;
                }

                $stmt = $pdo->prepare("SELECT * FROM ingredients WHERE id = ?");
                $stmt->execute([$id]);
                $ingredient = $stmt->fetch();

                if (!$ingredient) {
                    http_response_code(404);
                    echo json_encode(['error' => 'Ingredient not found']);
                    exit;
                }

                echo json_encode($ingredient);
            } else {
                // Get all ingredients (with optional filtering)
                $search = $_GET['search'] ?? null;
                $orderBy = $_GET['orderBy'] ?? 'last_updated';
                $order = $_GET['order'] ?? 'DESC';

                // Whitelist allowed order columns for security
                $allowedOrderBy = ['id', 'name', 'unit', 'price_per_unit', 'last_updated'];
                if (!in_array($orderBy, $allowedOrderBy)) {
                    $orderBy = 'last_updated';
                }
                $order = strtoupper($order) === 'ASC' ? 'ASC' : 'DESC';

                if ($search) {
                    $stmt = $pdo->prepare("SELECT * FROM ingredients WHERE name LIKE ? ORDER BY $orderBy $order");
                    $stmt->execute(['%' . $search . '%']);
                } else {
                    $stmt = $pdo->query("SELECT * FROM ingredients ORDER BY $orderBy $order");
                }

                $data = $stmt->fetchAll();
                echo json_encode($data);
            }
            break;

        // ==================== POST: Create New Ingredient ====================
        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);

            if (!$input) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid JSON input']);
                exit;
            }

            $validation = validateIngredient($input, false);

            if (!$validation['valid']) {
                http_response_code(400);
                echo json_encode(['error' => 'Validation failed', 'details' => $validation['errors']]);
                exit;
            }

            $sanitized = $validation['sanitized'];

            // Check for duplicate name
            $stmt = $pdo->prepare("SELECT id FROM ingredients WHERE LOWER(name) = LOWER(?)");
            $stmt->execute([$sanitized['name']]);
            if ($stmt->fetch()) {
                http_response_code(409);
                echo json_encode(['error' => 'Ingredient with this name already exists']);
                exit;
            }

            // Insert new ingredient
            $sql = "INSERT INTO ingredients (name, unit, price_per_unit, supplier_url, is_sample, last_updated) 
                    VALUES (?, ?, ?, ?, ?, NOW())";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $sanitized['name'],
                $sanitized['unit'],
                $sanitized['pricePerUnit'],
                $sanitized['supplierUrl'],
                $input['isSample'] ?? 0
            ]);

            $newId = $pdo->lastInsertId();

            // Return the created ingredient
            $stmt = $pdo->prepare("SELECT * FROM ingredients WHERE id = ?");
            $stmt->execute([$newId]);
            $newIngredient = $stmt->fetch();

            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Ingredient created successfully',
                'data' => $newIngredient
            ]);
            break;

        // ==================== PUT: Update Existing Ingredient ====================
        case 'PUT':
            $input = json_decode(file_get_contents('php://input'), true);

            if (!$input) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid JSON input']);
                exit;
            }

            $validation = validateIngredient($input, true);

            if (!$validation['valid']) {
                http_response_code(400);
                echo json_encode(['error' => 'Validation failed', 'details' => $validation['errors']]);
                exit;
            }

            $sanitized = $validation['sanitized'];

            // Check if ingredient exists
            $stmt = $pdo->prepare("SELECT id FROM ingredients WHERE id = ?");
            $stmt->execute([$sanitized['id']]);
            if (!$stmt->fetch()) {
                http_response_code(404);
                echo json_encode(['error' => 'Ingredient not found']);
                exit;
            }

            // Check for duplicate name (excluding current ingredient)
            $stmt = $pdo->prepare("SELECT id FROM ingredients WHERE LOWER(name) = LOWER(?) AND id != ?");
            $stmt->execute([$sanitized['name'], $sanitized['id']]);
            if ($stmt->fetch()) {
                http_response_code(409);
                echo json_encode(['error' => 'Another ingredient with this name already exists']);
                exit;
            }

            // Update ingredient
            $sql = "UPDATE ingredients 
                    SET name = ?, unit = ?, price_per_unit = ?, supplier_url = ?, last_updated = NOW() 
                    WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $sanitized['name'],
                $sanitized['unit'],
                $sanitized['pricePerUnit'],
                $sanitized['supplierUrl'],
                $sanitized['id']
            ]);

            // Return updated ingredient
            $stmt = $pdo->prepare("SELECT * FROM ingredients WHERE id = ?");
            $stmt->execute([$sanitized['id']]);
            $updatedIngredient = $stmt->fetch();

            echo json_encode([
                'success' => true,
                'message' => 'Ingredient updated successfully',
                'data' => $updatedIngredient
            ]);
            break;

        // ==================== DELETE: Remove Ingredient ====================
        case 'DELETE':
            $id = $_GET['id'] ?? null;

            if (!$id || !is_numeric($id)) {
                http_response_code(400);
                echo json_encode(['error' => 'Valid ingredient ID is required']);
                exit;
            }

            // Check if ingredient exists
            $stmt = $pdo->prepare("SELECT * FROM ingredients WHERE id = ?");
            $stmt->execute([$id]);
            $ingredient = $stmt->fetch();

            if (!$ingredient) {
                http_response_code(404);
                echo json_encode(['error' => 'Ingredient not found']);
                exit;
            }

            // Check if ingredient is used in recipes (cascade check)
            $usage = checkIngredientUsage($pdo, $id);

            if ($usage['inUse']) {
                http_response_code(409);
                echo json_encode([
                    'error' => 'Cannot delete ingredient',
                    'reason' => 'Ingredient is used in ' . $usage['recipeCount'] . ' recipe(s)',
                    'suggestion' => 'Remove this ingredient from all recipes first, or use cascade deletion'
                ]);
                exit;
            }

            // Delete ingredient
            $stmt = $pdo->prepare("DELETE FROM ingredients WHERE id = ?");
            $stmt->execute([$id]);

            echo json_encode([
                'success' => true,
                'message' => 'Ingredient deleted successfully',
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
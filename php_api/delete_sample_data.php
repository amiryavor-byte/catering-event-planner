<?php
/**
 * Delete Sample Data API Endpoint
 * 
 * Safely removes all data marked with is_sample = 1.
 * Handles deletion in correct order to respect foreign key constraints.
 * 
 * Supported Methods:
 * - DELETE /delete_sample_data.php
 */

require_once 'db_connect.php';

header('Content-Type: application/json');
$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'DELETE' && $method !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed. Use DELETE or POST.']);
    exit;
}

try {
    // Disable foreign key checks momentarily if cascade isn't perfect, 
    // but better to delete in order.
    // Order: 
    // 1. Shift Bids (linked to open_shifts + users)
    // 2. Open Shifts (linked to events)
    // 3. Staff Availability (linked to users)
    // 4. Blackout Dates (linked to users)
    // 5. Event Menu Items (linked to events + menu_items)
    // 6. Event Staff (linked to events + users)
    // 7. Recipes (linked to menu_items + ingredients)
    // 8. Menu Items (linked to menus)
    // 9. Tasks (linked to events + users)
    // 10. Events (linked to users - clients)
    // 11. Menus
    // 12. Users
    // 13. Ingredients

    $stats = [];

    // 1. Shift Bids (via Open Shifts via Events)
    $sql = "DELETE sb FROM shift_bids sb 
            INNER JOIN open_shifts os ON sb.shift_id = os.id
            INNER JOIN events e ON os.event_id = e.id
            WHERE e.is_sample = 1";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $stats['shift_bids'] = $stmt->rowCount();

    // 2. Open Shifts
    $sql = "DELETE os FROM open_shifts os 
            INNER JOIN events e ON os.event_id = e.id
            WHERE e.is_sample = 1";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $stats['open_shifts'] = $stmt->rowCount();

    // 3 & 4. Availability & Blackout (via Users)
    $sql = "DELETE sa FROM staff_availability sa 
            INNER JOIN users u ON sa.user_id = u.id 
            WHERE u.is_sample = 1";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $stats['availability'] = $stmt->rowCount();

    $sql = "DELETE bd FROM blackout_dates bd 
            INNER JOIN users u ON bd.created_by = u.id 
            WHERE u.is_sample = 1 OR bd.is_global = 1 AND bd.description LIKE '%(Sample)%'";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $stats['blackout'] = $stmt->rowCount();

    // 5 & 6. Event Junctions
    $sql = "DELETE em FROM event_menu_items em 
            INNER JOIN events e ON em.event_id = e.id 
            WHERE e.is_sample = 1";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $stats['event_menu_items'] = $stmt->rowCount();

    // If event_staff exists
    try {
        $sql = "DELETE es FROM event_staff es 
                INNER JOIN events e ON es.event_id = e.id 
                WHERE e.is_sample = 1";
        $pdo->exec($sql);
    } catch (Exception $e) {
    }

    // 7. Recipes (via Menu Items)
    $sql = "DELETE r FROM recipes r 
            INNER JOIN menu_items mi ON r.menu_item_id = mi.id 
            WHERE mi.is_sample = 1";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $stats['recipes'] = $stmt->rowCount();

    // 8. Menu Items
    $stmt = $pdo->prepare("DELETE FROM menu_items WHERE is_sample = 1");
    $stmt->execute();
    $stats['menu_items'] = $stmt->rowCount();

    // 9. Tasks
    $stmt = $pdo->prepare("DELETE FROM tasks WHERE is_sample = 1");
    $stmt->execute();
    $stats['tasks'] = $stmt->rowCount();

    // 10. Events
    $stmt = $pdo->prepare("DELETE FROM events WHERE is_sample = 1");
    $stmt->execute();
    $stats['events'] = $stmt->rowCount();

    // 11. Menus
    $stmt = $pdo->prepare("DELETE FROM menus WHERE is_sample = 1");
    $stmt->execute();
    $stats['menus'] = $stmt->rowCount();

    // 12. Users
    $stmt = $pdo->prepare("DELETE FROM users WHERE is_sample = 1");
    $stmt->execute();
    $stats['users'] = $stmt->rowCount();

    // 13. Ingredients
    $stmt = $pdo->prepare("DELETE FROM ingredients WHERE is_sample = 1");
    $stmt->execute();
    $stats['ingredients'] = $stmt->rowCount();

    echo json_encode([
        'success' => true,
        'message' => 'Sample data deleted',
        'stats' => $stats
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
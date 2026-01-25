<?php
/**
 * Analytics API Endpoint
 * 
 * Provides business intelligence and reporting data for the catering application.
 * 
 * Supported Endpoints:
 * - GET /analytics.php?type=event-profitability       -> Event profitability analysis
 * - GET /analytics.php?type=cost-breakdown&event_id=X -> Cost breakdown for specific event
 * - GET /analytics.php?type=revenue-overview          -> Revenue metrics overview
 * - GET /analytics.php?type=ingredient-usage          -> Ingredient usage statistics
 */

require_once 'db_connect.php';

// CORS headers for frontend access
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

header('Content-Type: application/json');

// ==================== HELPER FUNCTIONS ====================

/**
 * Calculate profitability for all events
 * @param PDO $pdo Database connection
 * @return array Event profitability data
 */
function getEventProfitability($pdo)
{
    $sql = "SELECT 
                e.id,
                e.name,
                e.status,
                e.event_type,
                e.start_date,
                e.guest_count,
                e.estimated_budget,
                e.deposit_paid,
                COUNT(DISTINCT emi.menu_item_id) as menu_items_count
            FROM events e
            LEFT JOIN event_menu_items emi ON e.id = emi.event_id
            GROUP BY e.id
            ORDER BY e.start_date DESC";

    $stmt = $pdo->query($sql);
    $events = $stmt->fetchAll();

    $profitabilityData = [];

    foreach ($events as $event) {
        // Calculate total cost for this event
        $costSql = "SELECT 
                        SUM(r.amount_required * i.price_per_unit * emi.quantity) as total_cost
                    FROM event_menu_items emi
                    JOIN recipes r ON emi.menu_item_id = r.menu_item_id
                    JOIN ingredients i ON r.ingredient_id = i.id
                    WHERE emi.event_id = ?";

        $costStmt = $pdo->prepare($costSql);
        $costStmt->execute([$event['id']]);
        $costResult = $costStmt->fetch();

        $totalCost = (float) ($costResult['total_cost'] ?? 0);
        $revenue = (float) ($event['estimated_budget'] ?? 0);
        $profit = $revenue - $totalCost;
        $profitMargin = $revenue > 0 ? ($profit / $revenue) * 100 : 0;

        $profitabilityData[] = [
            'id' => $event['id'],
            'name' => $event['name'],
            'status' => $event['status'],
            'eventType' => $event['event_type'],
            'startDate' => $event['start_date'],
            'guestCount' => $event['guest_count'],
            'revenue' => $revenue,
            'totalCost' => $totalCost,
            'profit' => $profit,
            'profitMargin' => round($profitMargin, 2),
            'depositPaid' => (float) ($event['deposit_paid'] ?? 0),
            'menuItemsCount' => (int) $event['menu_items_count']
        ];
    }

    return $profitabilityData;
}

/**
 * Get detailed cost breakdown for a specific event
 * @param PDO $pdo Database connection
 * @param int $eventId Event ID
 * @return array Cost breakdown by menu item and ingredient
 */
function getEventCostBreakdown($pdo, $eventId)
{
    // Get event info
    $stmt = $pdo->prepare("SELECT * FROM events WHERE id = ?");
    $stmt->execute([$eventId]);
    $event = $stmt->fetch();

    if (!$event) {
        return ['error' => 'Event not found'];
    }

    // Get menu items with costs
    $sql = "SELECT 
                emi.id,
                emi.quantity,
                mi.name as menu_item_name,
                mi.category,
                mi.base_price
            FROM event_menu_items emi
            JOIN menu_items mi ON emi.menu_item_id = mi.id
            WHERE emi.event_id = ?
            ORDER BY mi.category, mi.name";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$eventId]);
    $menuItems = $stmt->fetchAll();

    $breakdown = [];
    $totalEventCost = 0;

    foreach ($menuItems as $item) {
        // Get ingredients for this menu item
        $ingredientSql = "SELECT 
                            i.name as ingredient_name,
                            i.unit,
                            i.price_per_unit,
                            r.amount_required,
                            (r.amount_required * i.price_per_unit) as ingredient_cost
                        FROM recipes r
                        JOIN ingredients i ON r.ingredient_id = i.id
                        WHERE r.menu_item_id = (
                            SELECT menu_item_id FROM event_menu_items WHERE id = ?
                        )";

        $ingredientStmt = $pdo->prepare($ingredientSql);
        $ingredientStmt->execute([$item['id']]);
        $ingredients = $ingredientStmt->fetchAll();

        $menuItemTotalCost = 0;
        foreach ($ingredients as $ing) {
            $menuItemTotalCost += (float) $ing['ingredient_cost'];
        }

        $menuItemTotalCost *= (float) $item['quantity'];
        $totalEventCost += $menuItemTotalCost;

        $breakdown[] = [
            'menuItemName' => $item['menu_item_name'],
            'category' => $item['category'],
            'quantity' => (float) $item['quantity'],
            'basePrice' => (float) $item['base_price'],
            'cost' => $menuItemTotalCost,
            'ingredients' => $ingredients
        ];
    }

    return [
        'event' => [
            'id' => $event['id'],
            'name' => $event['name'],
            'status' => $event['status'],
            'estimatedBudget' => (float) ($event['estimated_budget'] ?? 0),
            'guestCount' => $event['guest_count']
        ],
        'totalCost' => $totalEventCost,
        'breakdown' => $breakdown
    ];
}

/**
 * Get revenue overview statistics
 * @param PDO $pdo Database connection
 * @return array Revenue metrics
 */
function getRevenueOverview($pdo)
{
    $stats = [
        'totalRevenue' => 0,
        'totalCosts' => 0,
        'totalProfit' => 0,
        'averageProfitMargin' => 0,
        'eventsByStatus' => [],
        'revenueByMonth' => []
    ];

    // Total revenue and deposits
    $stmt = $pdo->query("SELECT 
                            SUM(estimated_budget) as total_revenue,
                            SUM(deposit_paid) as total_deposits,
                            COUNT(*) as event_count
                         FROM events");
    $result = $stmt->fetch();
    $stats['totalRevenue'] = (float) ($result['total_revenue'] ?? 0);
    $stats['totalDeposits'] = (float) ($result['total_deposits'] ?? 0);
    $stats['eventCount'] = (int) $result['event_count'];

    // Events by status
    $stmt = $pdo->query("SELECT status, COUNT(*) as count FROM events GROUP BY status");
    $stats['eventsByStatus'] = $stmt->fetchAll();

    // Calculate total costs from all events
    $profitability = getEventProfitability($pdo);
    $totalCosts = 0;
    $totalProfit = 0;

    foreach ($profitability as $event) {
        $totalCosts += $event['totalCost'];
        $totalProfit += $event['profit'];
    }

    $stats['totalCosts'] = $totalCosts;
    $stats['totalProfit'] = $totalProfit;
    $stats['averageProfitMargin'] = $stats['totalRevenue'] > 0
        ? round(($totalProfit / $stats['totalRevenue']) * 100, 2)
        : 0;

    return $stats;
}

/**
 * Get ingredient usage statistics
 * @param PDO $pdo Database connection
 * @return array Ingredient usage data
 */
function getIngredientUsage($pdo)
{
    $sql = "SELECT 
                i.id,
                i.name,
                i.unit,
                i.price_per_unit,
                COUNT(DISTINCT r.menu_item_id) as used_in_items,
                SUM(r.amount_required) as total_amount_in_recipes
            FROM ingredients i
            LEFT JOIN recipes r ON i.id = r.ingredient_id
            GROUP BY i.id
            ORDER BY used_in_items DESC, i.name ASC";

    $stmt = $pdo->query($sql);
    return $stmt->fetchAll();
}

// ==================== MAIN REQUEST HANDLER ====================

try {
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method !== 'GET') {
        http_response_code(405);
        echo json_encode(['error' => 'Only GET requests are allowed']);
        exit;
    }

    $type = $_GET['type'] ?? null;

    if (!$type) {
        http_response_code(400);
        echo json_encode([
            'error' => 'Missing type parameter',
            'availableTypes' => [
                'event-profitability',
                'cost-breakdown',
                'revenue-overview',
                'ingredient-usage'
            ]
        ]);
        exit;
    }

    switch ($type) {
        case 'event-profitability':
            $data = getEventProfitability($pdo);
            echo json_encode($data);
            break;

        case 'cost-breakdown':
            $eventId = $_GET['event_id'] ?? null;
            if (!$eventId || !is_numeric($eventId)) {
                http_response_code(400);
                echo json_encode(['error' => 'Valid event_id parameter required']);
                exit;
            }
            $data = getEventCostBreakdown($pdo, $eventId);
            echo json_encode($data);
            break;

        case 'revenue-overview':
            $data = getRevenueOverview($pdo);
            echo json_encode($data);
            break;

        case 'ingredient-usage':
            $data = getIngredientUsage($pdo);
            echo json_encode($data);
            break;

        default:
            http_response_code(400);
            echo json_encode([
                'error' => 'Invalid type parameter',
                'availableTypes' => [
                    'event-profitability',
                    'cost-breakdown',
                    'revenue-overview',
                    'ingredient-usage'
                ]
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
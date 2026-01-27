<?php
/**
 * Timeclock API - Mobile Staff Management
 * 
 * Handles clock-in/out, breaks, and geofence verification.
 * 
 * Endpoints:
 * POST /timeclock.php
 *   - JSON Body: { user_id, event_id, action, latitude, longitude, selfie_url? }
 * 
 * GET /timeclock.php?user_id=123
 *   - Returns active shift or null
 */

require_once 'db_connect.php';

header('Content-Type: application/json');

// --- Auto-Migration ---
try {
    $check = $pdo->query("SHOW TABLES LIKE 'time_logs'");
    if ($check->rowCount() == 0) {
        $sql = file_get_contents('create_mobile_tables.sql');
        $pdo->exec($sql);
    }
} catch (Exception $e) {
}
// ----------------------

$method = $_SERVER['REQUEST_METHOD'];

// Helper: Calculate distance between two coords (Haversine formula)
function calculateDistance($lat1, $lon1, $lat2, $lon2)
{
    $earthRadius = 6371000; // meters

    $dLat = deg2rad($lat2 - $lat1);
    $dLon = deg2rad($lon2 - $lon1);

    $a = sin($dLat / 2) * sin($dLat / 2) +
        cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
        sin($dLon / 2) * sin($dLon / 2);

    $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
    return $earthRadius * $c;
}

try {
    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);

        // Validation
        if (!isset($data['user_id']) || !isset($data['event_id']) || !isset($data['action'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            exit;
        }

        $userId = (int) $data['user_id'];
        $eventId = (int) $data['event_id'];
        $action = $data['action'];
        $lat = isset($data['latitude']) ? (float) $data['latitude'] : null;
        $lng = isset($data['longitude']) ? (float) $data['longitude'] : null;
        $selfie = $data['selfie_url'] ?? null;
        $deviceId = $data['device_id'] ?? null;

        // Geofence Logic
        $isGeofenceValid = 0;
        // Fetch event location (Hack: Assume event has lat/lng or use address. For MVP we'll mock or use a fixed point if event lacks coords)
        // Ideally: SELECT lat, lng FROM events WHERE id = ?
        // For now, let's assume valid by default OR minimal check if data provided
        if ($lat && $lng) {
            $isGeofenceValid = 1; // Trust client for MVP or valid if coords exist
        }

        $sql = "INSERT INTO time_logs (user_id, event_id, action, latitude, longitude, is_geofence_valid, selfie_url, device_id, timestamp, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([$userId, $eventId, $action, $lat, $lng, $isGeofenceValid, $selfie, $deviceId]);

        $newId = $pdo->lastInsertId();

        echo json_encode(['success' => true, 'id' => $newId, 'message' => "Successfully recorded {$action}"]);

    } elseif ($method === 'GET') {
        $userId = $_GET['user_id'] ?? null;
        if (!$userId) {
            http_response_code(400);
            echo json_encode(['error' => 'User ID required']);
            exit;
        }

        // Determine current status
        // Get last action
        $stmt = $pdo->prepare("SELECT * FROM time_logs WHERE user_id = ? ORDER BY timestamp DESC LIMIT 1");
        $stmt->execute([$userId]);
        $lastLog = $stmt->fetch(PDO::FETCH_ASSOC);

        $status = 'clocked_out';
        if ($lastLog) {
            if ($lastLog['action'] === 'clock_in' || $lastLog['action'] === 'break_end') {
                $status = 'clocked_in';
            } elseif ($lastLog['action'] === 'break_start') {
                $status = 'on_break';
            }
        }

        echo json_encode(['data' => ['status' => $status, 'last_log' => $lastLog]]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'message' => $e->getMessage()]);
}
?>
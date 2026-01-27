-- Mobile App Tables

-- Timeclock & GPS Logs
CREATE TABLE IF NOT EXISTS time_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    action ENUM('clock_in', 'clock_out', 'break_start', 'break_end') NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_geofence_valid TINYINT(1) DEFAULT 0,
    selfie_url TEXT NULL,
    device_id VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Incidents & Safety
CREATE TABLE IF NOT EXISTS incidents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    reporter_id INT NOT NULL,
    type ENUM('spill', 'breakage', 'injury', 'other') NOT NULL,
    description TEXT,
    photo_url TEXT NULL,
    status ENUM('open', 'resolved') DEFAULT 'open',
    resolution_notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME NULL,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Floor Plan & Map Items
CREATE TABLE IF NOT EXISTS floor_plan_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    type ENUM('table', 'exit', 'kitchen', 'stage', 'bar') NOT NULL,
    label VARCHAR(100),
    x_position FLOAT NOT NULL, -- 0-100%
    y_position FLOAT NOT NULL, -- 0-100%
    shape VARCHAR(20) DEFAULT 'rect',
    width FLOAT DEFAULT 10,
    height FLOAT DEFAULT 10,
    rotation FLOAT DEFAULT 0,
    metadata JSON NULL, -- Guest count, VIPs, etc
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Guests (Enhancement or New)
CREATE TABLE IF NOT EXISTS guests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NULL,
    phone VARCHAR(50) NULL,
    dietary_restrictions TEXT NULL,
    is_vip TINYINT(1) DEFAULT 0,
    table_assignment VARCHAR(50) NULL,
    checked_in TINYINT(1) DEFAULT 0,
    check_in_time DATETIME NULL,
    qr_code VARCHAR(100) NULL, -- Unique token
    notes TEXT NULL,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

<?php
// update_schema.php - Run this ONCE to set up the database tables
require_once 'db_connect.php';

header('Content-Type: text/plain');

$queries = [
  // 1. Create Users Table
  "CREATE TABLE IF NOT EXISTS `users` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `name` varchar(255) NOT NULL,
      `email` varchar(255) NOT NULL UNIQUE,
      `role` varchar(50) DEFAULT 'client',
      `hourly_rate` float DEFAULT NULL,
      `job_title` varchar(100) DEFAULT NULL,
      `hire_date` text DEFAULT NULL,
      `status` varchar(20) DEFAULT 'active',
      `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`)
    )",

  // 2. Create Events Table
  "CREATE TABLE IF NOT EXISTS `events` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `name` varchar(255) NOT NULL,
      `client_id` int(11) DEFAULT NULL,
      `status` varchar(50) DEFAULT 'inquiry',
      `event_type` varchar(100) DEFAULT NULL,
      `start_date` datetime DEFAULT NULL,
      `end_date` datetime DEFAULT NULL,
      `is_outdoors` tinyint(1) DEFAULT 0,
      `location` text,
      `guest_count` int(11) DEFAULT NULL,
      `dietary_requirements` text,
      `estimated_budget` float DEFAULT NULL,
      `deposit_paid` float DEFAULT 0,
      `notes` text,
      `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`),
      FOREIGN KEY (`client_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
    )",

  // 3. Create Menu Items Table (Dependency for event_menu_items)
  "CREATE TABLE IF NOT EXISTS `menu_items` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `menu_id` int(11) DEFAULT NULL,
      `name` varchar(255) NOT NULL,
      `description` text,
      `base_price` float DEFAULT 0,
      `category` varchar(100),
      `is_kosher` tinyint(1) DEFAULT 1,
      `kosher_type` varchar(20) DEFAULT NULL,
      `is_gluten_free` tinyint(1) DEFAULT 0,
      `is_vegan` tinyint(1) DEFAULT 0,
      `prep_time` int(11) DEFAULT NULL,
      `serving_size` varchar(100) DEFAULT NULL,
      PRIMARY KEY (`id`)
    )",

  // 4. Create Event Menu Items Junction Table
  "CREATE TABLE IF NOT EXISTS `event_menu_items` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `event_id` int(11) NOT NULL,
      `menu_item_id` int(11) NOT NULL,
      `quantity` float NOT NULL DEFAULT 1,
      `price_override` float DEFAULT NULL,
      `notes` text,
      PRIMARY KEY (`id`),
      FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE,
      FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items`(`id`) ON DELETE CASCADE
    )",

  // 5. Create Tasks Table
  "CREATE TABLE IF NOT EXISTS `tasks` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `title` varchar(255) NOT NULL,
      `description` text,
      `status` varchar(50) DEFAULT 'pending',
      `assigned_to` int(11) DEFAULT NULL,
      `event_id` int(11) DEFAULT NULL,
      `start_time` datetime DEFAULT NULL,
      `due_time` datetime DEFAULT NULL,
      `location` text,
      PRIMARY KEY (`id`),
      FOREIGN KEY (`assigned_to`) REFERENCES `users`(`id`) ON DELETE SET NULL,
      FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE
    )",

  // 6. Create Staff Availability Table
  "CREATE TABLE IF NOT EXISTS `staff_availability` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `user_id` int(11) NOT NULL,
      `date` date DEFAULT NULL,
      `day_of_week` int(11) DEFAULT NULL,
      `start_time` time DEFAULT NULL,
      `end_time` time DEFAULT NULL,
      `type` varchar(50) NOT NULL,
      `status` varchar(20) DEFAULT 'approved',
      `reason` text,
      `is_recurring` tinyint(1) DEFAULT 0,
      `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`),
      FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
    )",

  // 7. Create Blackout Dates Table
  "CREATE TABLE IF NOT EXISTS `blackout_dates` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `date` date NOT NULL,
      `description` text,
      `is_global` tinyint(1) DEFAULT 0,
      `user_id` int(11) DEFAULT NULL,
      `created_by` int(11) DEFAULT NULL,
      `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`),
      FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
    )",

  // 8. Create Open Shifts Table
  "CREATE TABLE IF NOT EXISTS `open_shifts` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `event_id` int(11) NOT NULL,
      `role` varchar(100) NOT NULL,
      `start_time` datetime DEFAULT NULL,
      `end_time` datetime DEFAULT NULL,
      `description` text,
      `status` varchar(20) DEFAULT 'open',
      `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`),
      FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE
    )",

  // 9. Create Shift Bids Table
  "CREATE TABLE IF NOT EXISTS `shift_bids` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `shift_id` int(11) NOT NULL,
      `user_id` int(11) NOT NULL,
      `status` varchar(20) DEFAULT 'pending',
      `bid_time` timestamp DEFAULT CURRENT_TIMESTAMP,
      `notes` text,
      PRIMARY KEY (`id`),
      FOREIGN KEY (`shift_id`) REFERENCES `open_shifts`(`id`) ON DELETE CASCADE,
      FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
    )",

  // 10. Add is_sample column to Users
  "ALTER TABLE `users` ADD COLUMN `is_sample` tinyint(1) DEFAULT 0",

  // 11. Add is_sample column to Events
  "ALTER TABLE `events` ADD COLUMN `is_sample` tinyint(1) DEFAULT 0",

  // 12. Add is_sample column to Menus
  "ALTER TABLE `menus` ADD COLUMN `is_sample` tinyint(1) DEFAULT 0",

  // 13. Add is_sample column to Menu Items
  "ALTER TABLE `menu_items` ADD COLUMN `is_sample` tinyint(1) DEFAULT 0",

  // 14. Add is_sample column to Tasks
  "ALTER TABLE `tasks` ADD COLUMN `is_sample` tinyint(1) DEFAULT 0",

  // 15. Add is_sample column to Ingredients
  "ALTER TABLE `ingredients` ADD COLUMN `is_sample` tinyint(1) DEFAULT 0"
];

echo "Starting Database Migration...\n\n";

foreach ($queries as $index => $sql) {
  try {
    $pdo->exec($sql);
    echo "✅ Table setup success (Query " . ($index + 1) . ")\n";
  } catch (PDOException $e) {
    echo "❌ Error in Query " . ($index + 1) . ": " . $e->getMessage() . "\n";
  }
}

echo "\nMigration Complete.";
?>
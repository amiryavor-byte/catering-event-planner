-- Add these new tables to HostGator phpMyAdmin

CREATE TABLE IF NOT EXISTS `menus` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `menu_type` varchar(50),
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `tasks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  `status` varchar(50) DEFAULT 'pending',
  `assigned_to` int(11),
  `event_id` int(11),
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `menu_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `base_price` float DEFAULT 0,
  `category` varchar(100),
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `company_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `logo_url` text,
  `primary_color` varchar(50) DEFAULT '#6366f1',
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- Add is_sample column to track generated data
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_sample TINYINT(1) DEFAULT 0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_sample TINYINT(1) DEFAULT 0;
ALTER TABLE menus ADD COLUMN IF NOT EXISTS is_sample TINYINT(1) DEFAULT 0;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS is_sample TINYINT(1) DEFAULT 0;
ALTER TABLE ingredients ADD COLUMN IF NOT EXISTS is_sample TINYINT(1) DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_sample TINYINT(1) DEFAULT 0;
CREATE TABLE IF NOT EXISTS `equipment` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type` enum('owned', 'rental') DEFAULT 'owned',
  `default_rental_cost` float DEFAULT 0,
  `replacement_cost` float DEFAULT 0,
  `last_updated` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

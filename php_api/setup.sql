-- Run this in HostGator phpMyAdmin to create the tables

CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL UNIQUE,
  `role` varchar(50) DEFAULT 'client',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `ingredients` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `unit` varchar(50) NOT NULL,
  `price_per_unit` float NOT NULL,
  `supplier_url` text,
  `last_updated` timestamp DEFAULT CURRENT_TIMESTAMP,
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

CREATE TABLE IF NOT EXISTS `events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `client_id` int(11),
  `status` varchar(50) DEFAULT 'inquiry',
  `event_type` varchar(100),
  `start_date` datetime,
  `end_date` datetime,
  `is_outdoors` tinyint(1) DEFAULT 0,
  `location` text,
  `guest_count` int(11),
  `dietary_requirements` text,
  `estimated_budget` float,
  `deposit_paid` float,
  `notes` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`client_id`) REFERENCES `users`(`id`)
);

CREATE TABLE IF NOT EXISTS `menu_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `menu_id` int(11),
  `name` varchar(255) NOT NULL,
  `description` text,
  `base_price` float,
  `category` varchar(100),
  `is_kosher` tinyint(1) DEFAULT 1,
  `kosher_type` varchar(50),
  `is_gluten_free` tinyint(1) DEFAULT 0,
  `is_vegan` tinyint(1) DEFAULT 0,
  `prep_time` int(11),
  `serving_size` varchar(100),
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `recipes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `menu_item_id` int(11) NOT NULL,
  `ingredient_id` int(11) NOT NULL,
  `amount_required` float NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items`(`id`),
  FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients`(`id`)
);

CREATE TABLE IF NOT EXISTS `tasks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  `status` varchar(50) DEFAULT 'pending',
  `assigned_to` int(11),
  `event_id` int(11),
  `start_time` datetime,
  `due_time` datetime,
  `location` varchar(255),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`assigned_to`) REFERENCES `users`(`id`),
  FOREIGN KEY (`event_id`) REFERENCES `events`(`id`)
);

-- Additional tables can be added as needed

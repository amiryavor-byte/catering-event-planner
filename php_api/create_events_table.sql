CREATE TABLE IF NOT EXISTS `events` (
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
);

CREATE TABLE IF NOT EXISTS `event_menu_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `event_id` int(11) NOT NULL,
  `menu_item_id` int(11) NOT NULL,
  `quantity` float NOT NULL DEFAULT 1,
  `price_override` float DEFAULT NULL,
  `notes` text,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items`(`id`) ON DELETE CASCADE
);

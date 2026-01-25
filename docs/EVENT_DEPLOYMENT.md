# Event Management System API Deployment Guide

## 🚀 Quick Deployment Steps

### Required Files to Upload to HostGator

Upload these files to `https://api.jewishingenuity.com/catering_app/`:

1. **events.php** (Full CRUD for events)
2. **event_menu_items.php** (Menu assignment management)

---

## 📋 Database Setup

Run these SQL commands in HostGator phpMyAdmin:

```sql
-- Step 1: Create events table
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

-- Step 2: Create event_menu_items junction table
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

-- Step 3: Update tasks table (if event_id column doesn't exist)
ALTER TABLE `tasks` ADD COLUMN IF NOT EXISTS `event_id` int(11) DEFAULT NULL;
-- Note: MySQL doesn't support IF NOT EXISTS for ALTER TABLE, so run this separately if needed
```

---

## ✅ Verification

Test endpoints after deployment:

```bash
# Test events endpoint
curl https://api.jewishingenuity.com/catering_app/events.php

# Test event_menu_items endpoint
curl https://api.jewishingenuity.com/catering_app/event_menu_items.php?event_id=1
```

Expected response: `[]` (empty array) or existing events in JSON format.

---

## 🔧 Files to Deploy

### File Locations:
- **Source:** `/Users/amir/Documents/ai workspace/Catering event planner/catering-app/php_api/`
  - `events.php`
  - `event_menu_items.php`

- **Destination:** `https://api.jewishingenuity.com/catering_app/`
  - `events.php`
  - `event_menu_items.php`

### Deployment Method:
Use your existing FTP/cPanel deployment process (same as previous PHP backend deployments).

---

## 📊 Once Deployed

The application will automatically:
1. Connect to the events API endpoints
2. Display real event data in `/dashboard/events`
3. Enable event creation via `/dashboard/events/new`
4. Allow menu item assignments (once Menu Builder UI is added)

---

## 🎯 Next Steps After Deployment

1. Create a test event via the UI
2. Verify it appears in the events list
3. Test the AI parser with a sample description
4. Build the Menu Builder interface (next priority feature)

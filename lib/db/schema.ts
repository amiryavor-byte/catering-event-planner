import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// --- Users ---
export const users = sqliteTable("users", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    role: text("role", { enum: ["admin", "manager", "staff", "client"] }).default("client"),
    hourlyRate: real("hourly_rate"), // Staff wage per hour
    jobTitle: text("job_title"), // Specific role (Chef, Server, etc.)
    phoneNumber: text("phone_number"),
    address: text("address"),
    hireDate: text("hire_date"), // Employment start date
    status: text("status", { enum: ["active", "inactive", "pending"] }).default("active"),
    profileImage: text("profile_image"),
    language: text("language").default("en"),
    lastActiveAt: text("last_active_at"),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    password: text("password"),
    isSample: integer("is_sample", { mode: 'boolean' }).default(false),
});

// --- Events ---
export const events = sqliteTable("events", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    clientId: integer("client_id").references(() => users.id),
    status: text("status", { enum: ["inquiry", "quote", "approved", "active", "completed"] }).default("inquiry"),
    eventType: text("event_type", { enum: ["wedding", "corporate", "bar_mitzvah", "bat_mitzvah", "bris", "baby_naming", "shiva", "shabbat", "holiday_party", "fundraiser", "other"] }),
    startDate: text("start_date"),
    endDate: text("end_date"),
    isOutdoors: integer("is_outdoors", { mode: 'boolean' }).default(false),
    location: text("location"),
    guestCount: integer("guest_count"),
    dietaryRequirements: text("dietary_requirements"), // JSON string
    estimatedBudget: real("estimated_budget"),
    depositPaid: real("deposit_paid"),
    notes: text("notes"),
    // Advanced Quoting Fields
    quoteToken: text("quote_token").unique(), // UUID for public access
    quoteConfig: text("quote_config", { mode: "json" }), // JSON for layout, deposit rules, permissions
    quoteViewedAt: text("quote_viewed_at"), // Timestamp when client first opened
    quoteExpiresAt: text("quote_expires_at"), // Expiration date
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    isSample: integer("is_sample", { mode: 'boolean' }).default(false),
});

// --- Tasks ---
export const tasks = sqliteTable("tasks", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    description: text("description"),
    status: text("status", { enum: ["pending", "in_progress", "done"] }).default("pending"),
    assignedTo: integer("assigned_to").references(() => users.id),
    eventId: integer("event_id").references(() => events.id),
    startTime: text("start_time"),
    dueTime: text("due_time"),
    location: text("location"),
    isSample: integer("is_sample", { mode: 'boolean' }).default(false),
});

// --- Inventory & Menu ---
export const ingredients = sqliteTable("ingredients", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    unit: text("unit").notNull(), // kg, lbs, count
    pricePerUnit: real("price_per_unit").notNull(),
    supplierUrl: text("supplier_url"),
    lastUpdated: text("last_updated").default(sql`CURRENT_TIMESTAMP`),
    isSample: integer("is_sample", { mode: 'boolean' }).default(false),
});

// Menu Collections (Dairy, Meat, Parve, etc.)
export const menus = sqliteTable("menus", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    menuType: text("menu_type", { enum: ["dairy", "meat", "parve", "pescatarian", "vegan", "glutenfree"] }).notNull(),
    description: text("description"),
    isActive: integer("is_active", { mode: 'boolean' }).default(true),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    isSample: integer("is_sample", { mode: 'boolean' }).default(false),
});

export const menuItems = sqliteTable("menu_items", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    menuId: integer("menu_id").references(() => menus.id),
    name: text("name").notNull(),
    description: text("description"),
    basePrice: real("base_price"), // override calculated price
    category: text("category"), // Appetizer, Main, etc.
    isKosher: integer("is_kosher", { mode: 'boolean' }).default(true),
    kosherType: text("kosher_type", { enum: ["parve", "dairy", "meat"] }),
    isGlutenFree: integer("is_gluten_free", { mode: 'boolean' }).default(false),
    isVegan: integer("is_vegan", { mode: 'boolean' }).default(false),
    prepTime: integer("prep_time"), // Minutes
    servingSize: text("serving_size"), // e.g., "Serves 10-12"
    isSample: integer("is_sample", { mode: 'boolean' }).default(false),
});

// Join table for Recipe logic
export const recipes = sqliteTable("recipes", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    menuItemId: integer("menu_item_id").references(() => menuItems.id),
    ingredientId: integer("ingredient_id").references(() => ingredients.id),
    amountRequired: real("amount_required").notNull(),
});

// Join table for Event Menu Items
export const eventMenuItems = sqliteTable("event_menu_items", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    eventId: integer("event_id").references(() => events.id),
    menuItemId: integer("menu_item_id").references(() => menuItems.id),
    quantity: real("quantity").default(1),
    priceOverride: real("price_override"),
    notes: text("notes"),
    status: text("status", { enum: ["prep", "cooking", "ready", "served"] }).default("prep"),
});

// --- Notifications ---
export const notifications = sqliteTable("notifications", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id").references(() => users.id).notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    type: text("type", { enum: ["info", "warning", "success", "error"] }).default("info"),
    isRead: integer("is_read", { mode: 'boolean' }).default(false),
    link: text("link"),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// --- Equipment ---
export const equipment = sqliteTable("equipment", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    type: text("type", { enum: ["owned", "rental"] }).default("owned"),
    defaultRentalCost: real("default_rental_cost"), // Cost per unit if rental
    replacementCost: real("replacement_cost"), // For owned items
    lastUpdated: text("last_updated").default(sql`CURRENT_TIMESTAMP`),
});

// --- Junction Tables ---

export const eventEquipment = sqliteTable("event_equipment", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    eventId: integer("event_id").references(() => events.id),
    equipmentId: integer("equipment_id").references(() => equipment.id),
    quantity: integer("quantity").default(1),
    rentalCostOverride: real("rental_cost_override"), // Specific cost for this event
});

export const eventStaff = sqliteTable("event_staff", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    eventId: integer("event_id").references(() => events.id),
    userId: integer("user_id").references(() => users.id),
    role: text("role"), // Optional override of user's default role
    shiftStart: text("shift_start"),
    shiftEnd: text("shift_end"),
});

export const guests = sqliteTable("guests", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    eventId: integer("event_id").references(() => events.id),
    name: text("name").notNull(),
    email: text("email"),
    dietaryRequirements: text("dietary_requirements"),
    rsvpStatus: text("rsvp_status", { enum: ["pending", "attending", "declined"] }).default("pending"),
    tableNumber: text("table_number"),
    notes: text("notes"),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// --- Availability & Scheduling ---

export const staffAvailability = sqliteTable("staff_availability", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id").references(() => users.id).notNull(),
    date: text("date"), // YYYY-MM-DD for specific dates
    dayOfWeek: integer("day_of_week"), // 0-6 for recurring
    startTime: text("start_time"), // HH:MM
    endTime: text("end_time"), // HH:MM
    type: text("type", { enum: ["unavailable", "preferred_off", "available"] }).notNull(),
    status: text("status", { enum: ["approved", "pending", "rejected"] }).default("approved"),
    reason: text("reason"),
    isRecurring: integer("is_recurring", { mode: 'boolean' }).default(false),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const blackoutDates = sqliteTable("blackout_dates", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    date: text("date").notNull(), // YYYY-MM-DD
    description: text("description"),
    isGlobal: integer("is_global", { mode: 'boolean' }).default(false),
    userId: integer("user_id").references(() => users.id), // Nullable for global
    createdBy: integer("created_by").references(() => users.id),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const openShifts = sqliteTable("open_shifts", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    eventId: integer("event_id").references(() => events.id).notNull(),
    role: text("role").notNull(),
    startTime: text("start_time"),
    endTime: text("end_time"),
    description: text("description"),
    status: text("status", { enum: ["open", "filled", "cancelled"] }).default("open"),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const shiftBids = sqliteTable("shift_bids", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    shiftId: integer("shift_id").references(() => openShifts.id).notNull(),
    userId: integer("user_id").references(() => users.id).notNull(),
    status: text("status", { enum: ["pending", "approved", "rejected"] }).default("pending"),
    bidTime: text("bid_time").default(sql`CURRENT_TIMESTAMP`),
    notes: text("notes"),
});

// --- Messaging ---
export const messages = sqliteTable("messages", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    senderId: integer("sender_id").references(() => users.id).notNull(),
    recipientId: integer("recipient_id").references(() => users.id), // Nullable for broadcast/channel
    eventId: integer("event_id").references(() => events.id), // Optional: Link to specific event context
    content: text("content"), // Text or URL to audio
    transcription: text("transcription"), // For audio messages
    type: text("type", { enum: ["text", "image", "audio"] }).default("text"),
    isRead: integer("is_read", { mode: 'boolean' }).default(false),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

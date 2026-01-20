import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// --- Users ---
export const users = sqliteTable("users", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    role: text("role", { enum: ["admin", "staff", "client"] }).default("client"),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// --- Events ---
export const events = sqliteTable("events", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    clientId: integer("client_id").references(() => users.id),
    status: text("status", { enum: ["inquiry", "quote", "approved", "active", "completed"] }).default("inquiry"),
    startDate: text("start_date"),
    endDate: text("end_date"),
    isOutdoors: integer("is_outdoors", { mode: 'boolean' }).default(false),
    location: text("location"),
    guestCount: integer("guest_count"),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
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
});

// --- Inventory & Menu ---
export const ingredients = sqliteTable("ingredients", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    unit: text("unit").notNull(), // kg, lbs, count
    pricePerUnit: real("price_per_unit").notNull(),
    supplierUrl: text("supplier_url"),
    lastUpdated: text("last_updated").default(sql`CURRENT_TIMESTAMP`),
});

export const menuItems = sqliteTable("menu_items", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    description: text("description"),
    basePrice: real("base_price"), // override calculated price
    category: text("category"), // Appetizer, Main, etc.
});

// Join table for Recipe logic
export const recipes = sqliteTable("recipes", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    menuItemId: integer("menu_item_id").references(() => menuItems.id),
    ingredientId: integer("ingredient_id").references(() => ingredients.id),
    amountRequired: real("amount_required").notNull(),
});

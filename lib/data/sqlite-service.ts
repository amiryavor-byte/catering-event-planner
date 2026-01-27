import { db } from '@/lib/db';
import { ingredients, users, tasks, menuItems, recipes, events, menus, staffAvailability, blackoutDates, openShifts, shiftBids, eventMenuItems, eventStaff } from '@/lib/db/schema';
import { desc, eq, sql as drizzleSql, and, gte, lte, sum } from 'drizzle-orm';
import { IDataService, Ingredient, User, Task, MenuItem, RecipeItem, Event, Menu, EventMenuItem, StaffAvailability, BlackoutDate, OpenShift, ShiftBid } from './types';

export class SqliteDataService implements IDataService {

    async getIngredients(): Promise<Ingredient[]> {
        try {
            const rows = await db.select().from(ingredients).orderBy(desc(ingredients.lastUpdated));
            return rows.map(row => ({
                ...row,
                // Ensure strict type compatibility if Drizzle returns varied types
                lastUpdated: row.lastUpdated || null,
                supplierUrl: row.supplierUrl || null,
                isSample: row.isSample === true
            }));
        } catch (error) {
            console.warn('Failed to fetch ingredients from database:', error);
            return [];
        }
    }

    async addIngredient(data: Omit<Ingredient, 'id' | 'lastUpdated'>): Promise<Ingredient> {
        const result = await db.insert(ingredients).values({
            name: data.name,
            unit: data.unit,
            pricePerUnit: data.pricePerUnit,
            supplierUrl: data.supplierUrl,
            isSample: data.isSample || false
        }).returning();

        // SQLite returns array, MySQL might not support .returning() the same way, 
        // but for Local SQLite this is fine.
        const row = result[0];
        return {
            ...row,
            lastUpdated: row.lastUpdated || null,
            supplierUrl: row.supplierUrl || null,
            isSample: row.isSample === true
        };
    }

    async updateIngredientPrice(id: number, price: number): Promise<void> {
        await db.update(ingredients)
            .set({ pricePerUnit: price, lastUpdated: new Date().toISOString() })
            .where(eq(ingredients.id, id));
    }

    async getUsers(status?: string): Promise<User[]> {
        const rows = await db.select().from(users);
        // @ts-ignore
        return status ? rows.filter(u => u.status === status) : rows;
    }

    async getUserByEmail(email: string): Promise<User | null> {
        const rows = await db.select().from(users).where(eq(users.email, email));
        // @ts-ignore
        return rows.length > 0 ? rows[0] : null;
    }

    async getUser(id: number): Promise<User | null> {
        const rows = await db.select().from(users).where(eq(users.id, id));
        // @ts-ignore
        return rows.length > 0 ? rows[0] : null;
    }

    async approveUser(email: string): Promise<void> {
        // Mock approval for local dev
        // In real app, we need to update status column, but schema might not have it yet locally
        console.log(`[Local Mock] Approved user ${email}`);
    }

    async addUser(data: Omit<User, 'id'>): Promise<User> {
        const result = await db.insert(users).values({
            ...data,
            isSample: data.isSample || false
        }).returning();
        // @ts-ignore
        return result[0];
    }

    async updateUser(id: number, data: Partial<User>): Promise<void> {
        await db.update(users).set(data).where(eq(users.id, id));
    }

    async deleteUser(id: number): Promise<void> {
        await db.delete(users).where(eq(users.id, id));
    }

    async resetPassword(id: number): Promise<void> {
        console.log(`[SqliteDataService] Resetting password for user ${id}`);
        // Placeholder for real logic (e.g. sending email, generating temp pass)
    }

    async addTask(data: Omit<Task, 'id'>): Promise<Task> {
        const result = await db.insert(tasks).values({
            ...data,
            assignedTo: data.assignedTo ?? null
        }).returning();
        // @ts-ignore
        return result[0];
    }

    // Menus


    async addMenuItem(data: Omit<MenuItem, 'id'>): Promise<MenuItem> {
        const result = await db.insert(menuItems).values({
            ...data,
            isSample: data.isSample || false
        }).returning();
        const row = result[0];
        return {
            ...row,
            isKosher: row.isKosher ?? undefined,
            kosherType: row.kosherType ?? undefined,
            isGlutenFree: row.isGlutenFree ?? undefined,
            isVegan: row.isVegan ?? undefined,
            menuId: row.menuId ?? undefined,
            isSample: row.isSample === true
        } as MenuItem;
    }

    // Recipes
    async getRecipe(menuId: number): Promise<RecipeItem[]> {
        try {
            // We need to join
            const rows = await db.select({
                id: recipes.id,
                menuItemId: recipes.menuItemId,
                ingredientId: recipes.ingredientId,
                amountRequired: recipes.amountRequired,
                ingredientName: ingredients.name,
                unit: ingredients.unit,
                pricePerUnit: ingredients.pricePerUnit
            })
                .from(recipes)
                .leftJoin(ingredients, eq(recipes.ingredientId, ingredients.id))
                .where(eq(recipes.menuItemId, menuId));

            // @ts-ignore
            return rows;
        } catch (error) {
            console.warn('Failed to fetch recipe from database:', error);
            return [];
        }
    }

    async addRecipeItem(menuId: number, ingredientId: number, amount: number): Promise<void> {
        await db.insert(recipes).values({
            menuItemId: menuId,
            ingredientId: ingredientId,
            amountRequired: amount
        });
    }

    async updateRecipeItem(id: number, amount: number): Promise<void> {
        await db.update(recipes).set({ amountRequired: amount }).where(eq(recipes.id, id));
    }

    async deleteRecipeItem(id: number): Promise<void> {
        await db.delete(recipes).where(eq(recipes.id, id));
    }

    // Events
    async getEvents(): Promise<Event[]> {
        try {
            const rows = await db.select().from(events);
            // @ts-ignore
            return rows.map(r => ({
                ...r,
                isSample: r.isSample === true
            }));
        } catch (error) {
            console.warn('Failed to fetch events from database:', error);
            return [];
        }
    }

    async getEvent(id: number): Promise<Event | null> {
        const rows = await db.select().from(events).where(eq(events.id, id));
        if (rows.length === 0) return null;
        // @ts-ignore
        return {
            ...rows[0],
            isSample: rows[0].isSample === true
        };
    }

    async addEvent(data: Omit<Event, 'id' | 'createdAt'>): Promise<Event> {
        const payload: any = { ...data };
        if (payload.quoteExpiresAt instanceof Date) payload.quoteExpiresAt = payload.quoteExpiresAt.toISOString();
        if (payload.quoteViewedAt instanceof Date) payload.quoteViewedAt = payload.quoteViewedAt.toISOString();
        const result = await db.insert(events).values({
            ...payload,
            eventType: payload.eventType as any,
            isSample: payload.isSample || false
        }).returning();
        // @ts-ignore
        return result[0];
    }

    async updateEvent(id: number, data: Partial<Event>): Promise<void> {
        await db.update(events).set(data as any).where(eq(events.id, id));
    }

    async getEventByToken(token: string): Promise<Event | null> {
        const rows = await db.select().from(events).where(eq(events.quoteToken, token));
        if (rows.length === 0) return null;
        // @ts-ignore
        return { ...rows[0], isSample: rows[0].isSample === true };
    }

    // Event Menu Items
    async getEventMenuItems(eventId: number): Promise<EventMenuItem[]> {
        try {
            // Need to import eventMenuItems from schema if using it
            const { eventMenuItems } = await import('@/lib/db/schema');

            const rows = await db.select({
                id: eventMenuItems.id,
                eventId: eventMenuItems.eventId,
                menuItemId: eventMenuItems.menuItemId,
                quantity: eventMenuItems.quantity,
                priceOverride: eventMenuItems.priceOverride,
                notes: eventMenuItems.notes,
                menuItemName: menuItems.name,
                category: menuItems.category,
                basePrice: menuItems.basePrice,
                description: menuItems.description
            })
                .from(eventMenuItems)
                .leftJoin(menuItems, eq(eventMenuItems.menuItemId, menuItems.id))
                .where(eq(eventMenuItems.eventId, eventId));

            // @ts-ignore
            return rows.map(row => ({
                ...row,
                quantity: row.quantity || 1, // Ensure default
            }));
        } catch (error) {
            console.warn('Failed to fetch event menu items:', error);
            return [];
        }
    }

    async addEventMenuItem(data: Omit<EventMenuItem, 'id'>): Promise<EventMenuItem> {
        const { eventMenuItems } = await import('@/lib/db/schema');
        const result = await db.insert(eventMenuItems).values({
            eventId: data.eventId,
            menuItemId: data.menuItemId,
            quantity: data.quantity,
            priceOverride: data.priceOverride,
            notes: data.notes
        }).returning();
        // @ts-ignore
        return result[0];
    }

    async updateEventMenuItem(id: number, data: Partial<EventMenuItem>): Promise<void> {
        const { eventMenuItems } = await import('@/lib/db/schema');
        await db.update(eventMenuItems).set(data).where(eq(eventMenuItems.id, id));
    }

    async deleteEventMenuItem(id: number): Promise<void> {
        const { eventMenuItems } = await import('@/lib/db/schema');
        await db.delete(eventMenuItems).where(eq(eventMenuItems.id, id));
    }

    async getEventStaff(eventId: number): Promise<any[]> {
        const { eventStaff } = await import('@/lib/db/schema');
        const rows = await db.select().from(eventStaff).where(eq(eventStaff.eventId, eventId));
        return rows;
    }

    async getEventEquipment(eventId: number): Promise<any[]> {
        // Implement if schema exists
        return [];
    }

    async addEventStaff(data: { eventId: number; userId: number; role?: string; shiftStart?: string; shiftEnd?: string }): Promise<void> {
        const { eventStaff } = await import('@/lib/db/schema');
        await db.insert(eventStaff).values({
            eventId: data.eventId,
            userId: data.userId,
            role: data.role,
            shiftStart: data.shiftStart,
            shiftEnd: data.shiftEnd
        });
    }

    // Menu Collections
    async getMenus(): Promise<Menu[]> {
        try {
            const rows = await db.select().from(menus);
            return rows.map(row => ({
                ...row,
                isActive: row.isActive ?? undefined,
                isSample: row.isSample === true
            })) as Menu[];
        } catch (error) {
            console.warn('Failed to fetch menus from database:', error);
            return [];
        }
    }

    async addMenu(data: Omit<Menu, 'id' | 'createdAt'>): Promise<Menu> {
        const result = await db.insert(menus).values({
            ...data,
            isSample: data.isSample || false
        }).returning();
        const row = result[0];
        return {
            ...row,
            isActive: row.isActive ?? undefined
        } as Menu;
    }

    // Updated getMenuItems to support filtering by menuId
    async getMenuItems(menuId?: number): Promise<MenuItem[]> {
        try {
            let query = db.select({
                item: menuItems,
                calculatedCost: sum(drizzleSql`${recipes.amountRequired} * ${ingredients.pricePerUnit}`).mapWith(Number)
            })
                .from(menuItems)
                .leftJoin(recipes, eq(menuItems.id, recipes.menuItemId))
                .leftJoin(ingredients, eq(recipes.ingredientId, ingredients.id))
                .groupBy(menuItems.id);

            if (menuId) {
                // @ts-ignore
                query = query.where(eq(menuItems.menuId, menuId));
            }

            const rows = await query;

            return rows.map(({ item, calculatedCost }) => ({
                ...item,
                calculatedCost: calculatedCost || 0,
                isKosher: item.isKosher ?? undefined,
                kosherType: item.kosherType ?? undefined,
                isGlutenFree: item.isGlutenFree ?? undefined,
                isVegan: item.isVegan ?? undefined,
                menuId: item.menuId ?? undefined,
                isSample: item.isSample === true
            })) as MenuItem[];
        } catch (error) {
            console.warn('Failed to fetch menu items from database:', error);
            return [];
        }
    }

    // Sample Data Management
    async clearAllData(): Promise<void> {
        try {
            // Legacy support: Clears everything
            await db.delete(recipes);
            await db.delete(menuItems);
            await db.delete(menus);
            await db.delete(tasks);
            await db.delete(events);
            await db.delete(users);
            await db.delete(ingredients);
            console.log('✅ All data cleared successfully');
        } catch (error) {
            console.error('Failed to clear data:', error);
            throw error;
        }
    }

    async clearSampleData(): Promise<void> {
        try {
            // Only delete rows marked as sample
            // Note: Recipes are deleted via cascade or simplistic assumption they belong to sample menu items.
            // Since recipes don't have is_sample, we rely on them being deleted if we delete menu items?
            // SQLite doesn't always cascade by default unless enabled. 
            // Better to select IDs first or just rely on 'orphaned' recipes logic later.
            // For now, we will add 'is_sample' to recipes implicitly by association? No, we added is_sample to tables.
            // Wait, I didn't add is_sample to recipes in the migration. 
            // "users, events, menus, menu_items, ingredients, tasks"

            // Delete Menu Items (Sample)
            // 1. Delete deeply nested / leaf nodes first
            // Note: We use raw SQL for performance and to handle subqueries that Drizzle might simplify too much

            // Availability & Blackout Dates (Linked to Users)
            await db.run(drizzleSql`DELETE FROM ${staffAvailability} WHERE user_id IN (SELECT id FROM ${users} WHERE is_sample = 1)`);
            await db.run(drizzleSql`DELETE FROM ${blackoutDates} WHERE created_by IN (SELECT id FROM ${users} WHERE is_sample = 1) OR user_id IN (SELECT id FROM ${users} WHERE is_sample = 1) OR is_global = 1`);
            // await db.run(drizzleSql`DELETE FROM ${notifications} WHERE user_id IN (SELECT id FROM ${users} WHERE is_sample = 1)`);

            // Shifts & Bids (Linked to Events and Users)
            await db.run(drizzleSql`DELETE FROM ${shiftBids} WHERE shift_id IN (SELECT id FROM ${openShifts} WHERE event_id IN (SELECT id FROM ${events} WHERE is_sample = 1)) OR user_id IN (SELECT id FROM ${users} WHERE is_sample = 1)`);
            await db.run(drizzleSql`DELETE FROM ${openShifts} WHERE event_id IN (SELECT id FROM ${events} WHERE is_sample = 1)`);

            // Event Junctions (Linked to Events and Users)
            await db.run(drizzleSql`DELETE FROM ${eventMenuItems} WHERE event_id IN (SELECT id FROM ${events} WHERE is_sample = 1)`);
            await db.run(drizzleSql`DELETE FROM ${eventStaff} WHERE event_id IN (SELECT id FROM ${events} WHERE is_sample = 1) OR user_id IN (SELECT id FROM ${users} WHERE is_sample = 1)`);
            // await db.run(drizzleSql`DELETE FROM ${guests} WHERE event_id IN (SELECT id FROM ${events} WHERE is_sample = 1)`);
            // await db.run(drizzleSql`DELETE FROM ${eventEquipment} WHERE event_id IN (SELECT id FROM ${events} WHERE is_sample = 1)`);

            // Recipes (Linked to Menu Items) 
            // Also handle orphaned recipes if ingredients are deleted
            await db.run(drizzleSql`DELETE FROM ${recipes} WHERE menu_item_id IN (SELECT id FROM ${menuItems} WHERE is_sample = 1) OR ingredient_id IN (SELECT id FROM ${ingredients} WHERE is_sample = 1)`);

            // 2. Delete Main Entities
            await db.delete(menuItems).where(eq(menuItems.isSample, true));
            await db.delete(menus).where(eq(menus.isSample, true));
            await db.delete(tasks).where(eq(tasks.isSample, true));
            await db.delete(events).where(eq(events.isSample, true));
            await db.delete(users).where(eq(users.isSample, true));
            await db.delete(ingredients).where(eq(ingredients.isSample, true));

            console.log('✅ Sample data cleared successfully');
        } catch (error) {
            console.error('Failed to clear sample data:', error);
            throw error;
        }
    }


    // --- Availability & Scheduling ---

    // Staff Availability
    async getStaffAvailability(userId?: number, startDate?: string, endDate?: string): Promise<StaffAvailability[]> {
        const conditions = [];
        if (userId) conditions.push(eq(staffAvailability.userId, userId));
        if (startDate) conditions.push(gte(staffAvailability.date, startDate));
        if (endDate) conditions.push(lte(staffAvailability.date, endDate));

        const query = db.select().from(staffAvailability)
            .where(conditions.length > 0 ? and(...conditions) : undefined);

        const rows = await query;
        return rows.map(r => ({
            ...r,
            isRecurring: r.isRecurring === true
        })) as StaffAvailability[];
    }

    async addStaffAvailability(data: Omit<StaffAvailability, 'id' | 'createdAt'>): Promise<StaffAvailability> {
        const result = await db.insert(staffAvailability).values({
            ...data,
            isRecurring: data.isRecurring || false
        }).returning();
        const row = result[0];
        return {
            ...row,
            isRecurring: row.isRecurring === true
        } as StaffAvailability;
    }

    async updateStaffAvailability(id: number, data: Partial<StaffAvailability>): Promise<void> {
        // Ensure dates are strings for SQLite
        const payload: any = { ...data };
        if (payload.createdAt instanceof Date) payload.createdAt = payload.createdAt.toISOString();
        await db.update(staffAvailability).set(payload).where(eq(staffAvailability.id, id));
    }

    async deleteStaffAvailability(id: number): Promise<void> {
        await db.delete(staffAvailability).where(eq(staffAvailability.id, id));
    }

    // Blackout Dates
    async getBlackoutDates(startDate?: string, endDate?: string): Promise<BlackoutDate[]> {
        let query = db.select().from(blackoutDates);
        if (startDate) {
            // @ts-ignore
            query = query.where(gte(blackoutDates.date, startDate));
        }
        if (endDate) {
            // @ts-ignore
            query = query.where(lte(blackoutDates.date, endDate));
        }
        const rows = await query;
        return rows.map(r => ({
            ...r,
            isGlobal: r.isGlobal === true
        })) as BlackoutDate[];
    }

    async addBlackoutDate(data: Omit<BlackoutDate, 'id' | 'createdAt'>): Promise<BlackoutDate> {
        const result = await db.insert(blackoutDates).values({
            ...data,
            isGlobal: data.isGlobal || false
        }).returning();
        const row = result[0];
        return {
            ...row,
            isGlobal: row.isGlobal === true
        } as BlackoutDate;
    }

    async deleteBlackoutDate(id: number): Promise<void> {
        await db.delete(blackoutDates).where(eq(blackoutDates.id, id));
    }

    // Open Shifts
    async getOpenShifts(eventId?: number): Promise<OpenShift[]> {
        if (eventId) {
            const rows = await db.select().from(openShifts).where(eq(openShifts.eventId, eventId));
            return rows as OpenShift[];
        }
        const rows = await db.select().from(openShifts);
        return rows as OpenShift[];
    }

    async addOpenShift(data: Omit<OpenShift, 'id' | 'createdAt'>): Promise<OpenShift> {
        const result = await db.insert(openShifts).values(data).returning();
        return result[0] as OpenShift;
    }

    async updateOpenShift(id: number, data: Partial<OpenShift>): Promise<void> {
        const payload: any = { ...data };
        if (payload.createdAt instanceof Date) payload.createdAt = payload.createdAt.toISOString();
        await db.update(openShifts).set(payload).where(eq(openShifts.id, id));
    }

    async deleteOpenShift(id: number): Promise<void> {
        await db.delete(openShifts).where(eq(openShifts.id, id));
    }

    // Shift Bids
    async getShiftBids(shiftId?: number, userId?: number): Promise<ShiftBid[]> {
        const conditions = [];
        if (shiftId) conditions.push(eq(shiftBids.shiftId, shiftId));
        if (userId) conditions.push(eq(shiftBids.userId, userId));

        const query = db.select().from(shiftBids)
            .where(conditions.length > 0 ? and(...conditions) : undefined);

        const rows = await query;
        return rows as ShiftBid[];
    }

    async addShiftBid(data: Omit<ShiftBid, 'id' | 'bidTime'>): Promise<ShiftBid> {
        const result = await db.insert(shiftBids).values(data).returning();
        return result[0] as ShiftBid;
    }

    async updateShiftBid(id: number, data: Partial<ShiftBid>): Promise<void> {
        const payload: any = { ...data };
        if (payload.bidTime instanceof Date) payload.bidTime = payload.bidTime.toISOString();
        await db.update(shiftBids).set(payload).where(eq(shiftBids.id, id));
    }

    async getDataStats(): Promise<{
        events: number;
        users: number;
        menus: number;
        menuItems: number;
        ingredients: number;
        recipes: number;
        tasks: number;
    }> {
        try {
            const [eventsCount] = await db.select({ count: drizzleSql<number>`count(*)` }).from(events);
            const [usersCount] = await db.select({ count: drizzleSql<number>`count(*)` }).from(users);
            const [menusCount] = await db.select({ count: drizzleSql<number>`count(*)` }).from(menus);
            const [menuItemsCount] = await db.select({ count: drizzleSql<number>`count(*)` }).from(menuItems);
            const [ingredientsCount] = await db.select({ count: drizzleSql<number>`count(*)` }).from(ingredients);
            const [recipesCount] = await db.select({ count: drizzleSql<number>`count(*)` }).from(recipes);
            const [tasksCount] = await db.select({ count: drizzleSql<number>`count(*)` }).from(tasks);

            return {
                events: Number(eventsCount.count) || 0,
                users: Number(usersCount.count) || 0,
                menus: Number(menusCount.count) || 0,
                menuItems: Number(menuItemsCount.count) || 0,
                ingredients: Number(ingredientsCount.count) || 0,
                recipes: Number(recipesCount.count) || 0,
                tasks: Number(tasksCount.count) || 0,
            };
        } catch (error) {
            console.warn('Failed to get data stats:', error);
            return {
                events: 0,
                users: 0,
                menus: 0,
                menuItems: 0,
                ingredients: 0,
                recipes: 0,
                tasks: 0,
            };
        }
    }
}

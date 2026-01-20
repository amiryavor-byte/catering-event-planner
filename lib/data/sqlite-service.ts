import { db } from '@/lib/db';
import { ingredients, users, tasks, menuItems, recipes } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { IDataService, Ingredient, User, Task, MenuItem, RecipeItem } from './types';

export class SqliteDataService implements IDataService {

    async getIngredients(): Promise<Ingredient[]> {
        const rows = await db.select().from(ingredients).orderBy(desc(ingredients.lastUpdated));
        return rows.map(row => ({
            ...row,
            // Ensure strict type compatibility if Drizzle returns varied types
            lastUpdated: row.lastUpdated || null,
            supplierUrl: row.supplierUrl || null
        }));
    }

    async addIngredient(data: Omit<Ingredient, 'id' | 'lastUpdated'>): Promise<Ingredient> {
        const result = await db.insert(ingredients).values({
            name: data.name,
            unit: data.unit,
            pricePerUnit: data.pricePerUnit,
            supplierUrl: data.supplierUrl
        }).returning();

        // SQLite returns array, MySQL might not support .returning() the same way, 
        // but for Local SQLite this is fine.
        const row = result[0];
        return {
            ...row,
            lastUpdated: row.lastUpdated || null,
            supplierUrl: row.supplierUrl || null
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

    async approveUser(email: string): Promise<void> {
        // Mock approval for local dev
        // In real app, we need to update status column, but schema might not have it yet locally
        console.log(`[Local Mock] Approved user ${email}`);
    }

    async addUser(data: Omit<User, 'id'>): Promise<User> {
        const result = await db.insert(users).values(data).returning();
        // @ts-ignore
        return result[0];
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
    async getMenuItems(): Promise<MenuItem[]> {
        return await db.select().from(menuItems);
    }

    async addMenuItem(data: Omit<MenuItem, 'id'>): Promise<MenuItem> {
        const result = await db.insert(menuItems).values(data).returning();
        return result[0];
    }

    // Recipes
    async getRecipe(menuId: number): Promise<RecipeItem[]> {
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
    }

    async addRecipeItem(menuId: number, ingredientId: number, amount: number): Promise<void> {
        await db.insert(recipes).values({
            menuItemId: menuId,
            ingredientId: ingredientId,
            amountRequired: amount
        });
    }
}

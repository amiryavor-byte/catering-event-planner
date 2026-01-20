import { IDataService, Ingredient, User, Task, MenuItem, RecipeItem } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.jewishingenuity.com/catering_app';

export class ApiDataService implements IDataService {

    private async fetchJson(endpoint: string, options?: RequestInit) {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            cache: 'no-store' // Always fresh data for admin
        });
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        return res.json();
    }

    async getIngredients(): Promise<Ingredient[]> {
        return this.fetchJson('/ingredients.php');
    }

    async addIngredient(data: Omit<Ingredient, 'id' | 'lastUpdated'>): Promise<Ingredient> {
        const res = await this.fetchJson('/ingredients.php', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        });
        // API returns { success: true, id: 123 }
        // We construct the object optimistically or re-fetch
        return {
            id: res.id,
            ...data,
            lastUpdated: new Date()
        };
    }

    async updateIngredientPrice(id: number, price: number): Promise<void> {
        // We need to implement update endpoint in PHP later
        console.warn('API update not implemented yet');
    }

    async getUsers(status?: string): Promise<User[]> {
        const query = status ? `?status=${status}` : '';
        return this.fetchJson(`/users.php${query}`);
    }

    async getUserByEmail(email: string): Promise<User | null> {
        const users = await this.fetchJson(`/users.php?email=${encodeURIComponent(email)}`);
        return users.length > 0 ? users[0] : null;
    }

    async approveUser(email: string): Promise<void> {
        await this.fetchJson('/users.php', {
            method: 'POST',
            body: JSON.stringify({ action: 'approve', email }),
            headers: { 'Content-Type': 'application/json' }
        });
    }

    async addUser(data: Omit<User, 'id'>): Promise<User> {
        const res = await this.fetchJson('/users.php', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        });
        return {
            id: res.id,
            ...data
        };
    }

    async addTask(data: Omit<Task, 'id'>): Promise<Task> {
        const res = await this.fetchJson('/tasks.php', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        });
        return { id: res.id, ...data };
    }

    async getMenuItems(): Promise<MenuItem[]> {
        return this.fetchJson('/menu_items.php');
    }

    async addMenuItem(data: Omit<MenuItem, 'id'>): Promise<MenuItem> {
        const res = await this.fetchJson('/menu_items.php', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        });
        return { id: res.id, ...data };
    }

    async getRecipe(menuId: number): Promise<RecipeItem[]> {
        return this.fetchJson(`/recipes.php?menu_item_id=${menuId}`);
    }

    async addRecipeItem(menuId: number, ingredientId: number, amount: number): Promise<void> {
        await this.fetchJson('/recipes.php', {
            method: 'POST',
            body: JSON.stringify({
                menuItemId: menuId,
                ingredientId: ingredientId,
                amountRequired: amount
            }),
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

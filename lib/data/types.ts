export interface Ingredient {
    id: number;
    name: string;
    unit: string;
    pricePerUnit: number;
    supplierUrl: string | null;
    lastUpdated: string | Date | null;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'staff' | 'client';
    status?: 'active' | 'pending' | 'rejected';
}

export interface Task {
    id: number;
    title: string;
    description: string | null;
    status: 'pending' | 'in_progress' | 'done';
    assignedTo: number | null;
}

export interface MenuItem {
    id: number;
    name: string;
    description: string | null;
    basePrice: number | null;
    category: string | null;
}

export interface RecipeItem {
    id: number;
    menuItemId: number;
    ingredientId: number;
    amountRequired: number;
    // Joined fields
    ingredientName?: string;
    unit?: string;
    pricePerUnit?: number;
}

export interface IDataService {
    // Ingredients
    getIngredients(): Promise<Ingredient[]>;
    addIngredient(data: Omit<Ingredient, 'id' | 'lastUpdated'>): Promise<Ingredient>;
    updateIngredientPrice(id: number, price: number): Promise<void>;

    // Users (Partial for now)
    getUsers(status?: string): Promise<User[]>;
    getUserByEmail(email: string): Promise<User | null>;
    addUser(data: Omit<User, 'id'>): Promise<User>;
    approveUser(email: string): Promise<void>;

    // Tasks
    addTask(data: Omit<Task, 'id'>): Promise<Task>;

    // Menus
    getMenuItems(): Promise<MenuItem[]>;
    addMenuItem(data: Omit<MenuItem, 'id'>): Promise<MenuItem>;

    // Recipes
    getRecipe(menuId: number): Promise<RecipeItem[]>;
    addRecipeItem(menuId: number, ingredientId: number, amount: number): Promise<void>;
}

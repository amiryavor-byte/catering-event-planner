import { IDataService, Ingredient, User, Task, MenuItem, RecipeItem, Event, Menu, EventMenuItem, StaffAvailability, BlackoutDate, OpenShift, ShiftBid, Equipment } from './types';

/**
 * Mock service that returns empty data
 * Used as fallback when database/API is unavailable
 */
export class MockDataService implements IDataService {

    // --- Users ---
    async getUser(id: number): Promise<User | null> { return null; }
    async getUsers(status?: string): Promise<User[]> { return []; }
    async getUserByEmail(email: string): Promise<User | null> { return null; }
    async addUser(data: Omit<User, 'id'>): Promise<User> { return { ...data, id: 0 } as User; }
    async updateUser(id: number, data: Partial<User>): Promise<void> { }
    async deleteUser(id: number): Promise<void> { }
    async approveUser(email: string): Promise<void> { }
    async resetPassword(id: number): Promise<void> { }

    // --- Events ---
    async getEvents(): Promise<Event[]> { return []; }
    async getEvent(id: number): Promise<Event | null> { return null; }
    async addEvent(data: Omit<Event, 'id' | 'createdAt'>): Promise<Event> { return { ...data, id: 0 }; }
    async updateEvent(id: number, data: Partial<Event>): Promise<void> { }

    // --- Event Staff ---
    async getEventStaff(eventId: number): Promise<any[]> { return []; }
    async addEventStaff(data: any): Promise<void> { }
    async removeEventStaff(id: number): Promise<void> { }

    // --- Event Equipment ---
    async getEventEquipment(eventId: number): Promise<any[]> { return []; }
    async addEventEquipment(data: any): Promise<void> { }
    async removeEventEquipment(id: number): Promise<void> { }

    // --- Event Menu Items ---
    async getEventMenuItems(eventId: number): Promise<EventMenuItem[]> { return []; }
    async addEventMenuItem(data: Omit<EventMenuItem, 'id'>): Promise<EventMenuItem> { return { ...data, id: 0 }; }
    async updateEventMenuItem(id: number, data: Partial<EventMenuItem>): Promise<void> { }
    async deleteEventMenuItem(id: number): Promise<void> { }

    // --- Ingredients ---
    async getIngredients(): Promise<Ingredient[]> { return []; }
    async addIngredient(data: Omit<Ingredient, 'id' | 'lastUpdated'>): Promise<Ingredient> { return { ...data, id: 0, lastUpdated: new Date().toISOString() }; }
    async updateIngredientPrice(id: number, price: number): Promise<void> { }

    // --- Menus ---
    async getMenus(): Promise<Menu[]> { return []; }
    async addMenu(data: Omit<Menu, 'id' | 'createdAt'>): Promise<Menu> { return { ...data, id: 0 }; }

    // --- Menu Items ---
    async getMenuItems(menuId?: number): Promise<MenuItem[]> { return []; }
    async addMenuItem(data: Omit<MenuItem, 'id'>): Promise<MenuItem> { return { ...data, id: 0 }; }

    // --- Recipes ---
    async getRecipe(menuId: number): Promise<RecipeItem[]> { return []; }
    async addRecipeItem(menuId: number, ingredientId: number, amount: number): Promise<void> { }
    async updateRecipeItem(id: number, amount: number): Promise<void> { }
    async deleteRecipeItem(id: number): Promise<void> { }

    // --- Tasks ---
    async getTasks(eventId?: number, assignedTo?: number): Promise<Task[]> { return []; }
    async addTask(data: Omit<Task, 'id'>): Promise<Task> { return { ...data, id: 0 }; }

    // --- Equipment (Inventory) ---
    async getEquipment(): Promise<Equipment[]> { return []; }
    async addEquipment(data: Omit<Equipment, 'id' | 'lastUpdated'>): Promise<Equipment> { return { ...data, id: 0 }; }
    async updateEquipment(id: number, data: Partial<Equipment>): Promise<void> { }
    async deleteEquipment(id: number): Promise<void> { }

    // --- Availability & Scheduling ---
    async getStaffAvailability(userId?: number, startDate?: string, endDate?: string): Promise<StaffAvailability[]> { return []; }
    async addStaffAvailability(data: Omit<StaffAvailability, 'id' | 'createdAt'>): Promise<StaffAvailability> { return { ...data, id: 0 }; }
    async updateStaffAvailability(id: number, data: Partial<StaffAvailability>): Promise<void> { }
    async deleteStaffAvailability(id: number): Promise<void> { }

    async getBlackoutDates(startDate?: string, endDate?: string): Promise<BlackoutDate[]> { return []; }
    async addBlackoutDate(data: Omit<BlackoutDate, 'id' | 'createdAt'>): Promise<BlackoutDate> { return { ...data, id: 0 }; }
    async deleteBlackoutDate(id: number): Promise<void> { }

    async getOpenShifts(eventId?: number): Promise<OpenShift[]> { return []; }
    async addOpenShift(data: Omit<OpenShift, 'id' | 'createdAt'>): Promise<OpenShift> { return { ...data, id: 0 }; }
    async updateOpenShift(id: number, data: Partial<OpenShift>): Promise<void> { }
    async deleteOpenShift(id: number): Promise<void> { }

    async getShiftBids(shiftId?: number, userId?: number): Promise<ShiftBid[]> { return []; }
    async addShiftBid(data: Omit<ShiftBid, 'id' | 'bidTime'>): Promise<ShiftBid> { return { ...data, id: 0 }; }
    async updateShiftBid(id: number, data: Partial<ShiftBid>): Promise<void> { }

    // --- Messaging ---
    async getMessages(params: any): Promise<any[]> { return []; }
    async sendMessage(data: any): Promise<any> { return {}; }

    // --- Admin / Stats ---
    async getDataStats(): Promise<any> {
        return { events: 0, users: 0, menus: 0, menuItems: 0, ingredients: 0, recipes: 0, tasks: 0 };
    }
    async clearAllData(): Promise<void> { }
    async clearSampleData(): Promise<void> { }
}

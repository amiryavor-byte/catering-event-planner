import { IDataService, Ingredient, User, Task, MenuItem, RecipeItem, StaffAvailability, BlackoutDate, OpenShift, ShiftBid } from './types';

/**
 * Mock service that returns empty data
 * Used as fallback when database/API is unavailable
 */
export class MockDataService implements IDataService {

    async getIngredients(): Promise<Ingredient[]> {
        console.warn('[MockService] getIngredients called - returning empty array');
        return [];
    }

    async addIngredient(data: Omit<Ingredient, 'id' | 'lastUpdated'>): Promise<Ingredient> {
        console.warn('[MockService] addIngredient called');
        return {
            id: Date.now(),
            ...data,
            lastUpdated: new Date().toISOString()
        };
    }

    async updateIngredientPrice(id: number, price: number): Promise<void> {
        console.warn(`[MockService] updateIngredientPrice called for id ${id}`);
    }

    async getUsers(status?: string): Promise<User[]> {
        console.warn('[MockService] getUsers called - returning empty array');
        return [];
    }

    async getUserByEmail(email: string): Promise<User | null> {
        console.warn(`[MockService] getUserByEmail called for ${email}`);
        return null;
    }

    async addUser(data: Omit<User, 'id'>): Promise<User> {
        console.warn('[MockService] addUser called');
        return {
            id: Date.now(),
            ...data
        };
    }

    async updateUser(id: number, data: Partial<User>): Promise<void> {
        console.warn(`[MockService] updateUser called for id ${id}`);
    }

    async deleteUser(id: number): Promise<void> {
        console.warn(`[MockService] deleteUser called for id ${id}`);
    }

    async approveUser(email: string): Promise<void> {
        console.warn(`[MockService] approveUser called for ${email}`);
    }

    async addTask(data: Omit<Task, 'id'>): Promise<Task> {
        console.warn('[MockService] addTask called');
        return {
            id: Date.now(),
            ...data
        };
    }

    async getMenuItems(): Promise<MenuItem[]> {
        console.warn('[MockService] getMenuItems called - returning empty array');
        return [];
    }

    async addMenuItem(data: Omit<MenuItem, 'id'>): Promise<MenuItem> {
        console.warn('[MockService] addMenuItem called');
        return {
            id: Date.now(),
            ...data
        };
    }

    async getRecipe(menuId: number): Promise<RecipeItem[]> {
        console.warn(`[MockService] getRecipe called for menu ${menuId} - returning empty array`);
        return [];
    }

    async addRecipeItem(menuId: number, ingredientId: number, amount: number): Promise<void> {
        console.warn(`[MockService] addRecipeItem called for menu ${menuId}`);
    }

    async getEvents(): Promise<any[]> {
        console.warn('[MockService] getEvents called - returning empty array');
        return [];
    }

    async addEvent(data: any): Promise<any> {
        console.warn('[MockService] addEvent called');
        return {
            id: Date.now(),
            ...data
        };
    }

    async getMenus(): Promise<any[]> {
        console.warn('[MockService] getMenus called - returning empty array');
        return [];
    }

    async addMenu(data: any): Promise<any> {
        console.warn('[MockService] addMenu called');
        return {
            id: Date.now(),
            ...data
        };
    }

    // --- Availability & Scheduling ---

    // Staff Availability
    async getStaffAvailability(userId?: number, startDate?: string, endDate?: string): Promise<StaffAvailability[]> {
        console.warn('[MockService] getStaffAvailability called - returning empty array');
        return [];
    }

    async addStaffAvailability(data: Omit<StaffAvailability, 'id' | 'createdAt'>): Promise<StaffAvailability> {
        console.warn('[MockService] addStaffAvailability called');
        return {
            id: Date.now(),
            ...data,
            createdAt: new Date().toISOString()
        } as StaffAvailability;
    }

    async updateStaffAvailability(id: number, data: Partial<StaffAvailability>): Promise<void> {
        console.warn(`[MockService] updateStaffAvailability called for id ${id}`);
    }

    async deleteStaffAvailability(id: number): Promise<void> {
        console.warn(`[MockService] deleteStaffAvailability called for id ${id}`);
    }

    // Blackout Dates
    async getBlackoutDates(startDate?: string, endDate?: string): Promise<BlackoutDate[]> {
        console.warn('[MockService] getBlackoutDates called - returning empty array');
        return [];
    }

    async addBlackoutDate(data: Omit<BlackoutDate, 'id' | 'createdAt'>): Promise<BlackoutDate> {
        console.warn('[MockService] addBlackoutDate called');
        return {
            id: Date.now(),
            ...data,
            createdAt: new Date().toISOString()
        } as BlackoutDate;
    }

    async deleteBlackoutDate(id: number): Promise<void> {
        console.warn(`[MockService] deleteBlackoutDate called for id ${id}`);
    }

    // Open Shifts
    async getOpenShifts(eventId?: number): Promise<OpenShift[]> {
        console.warn('[MockService] getOpenShifts called - returning empty array');
        return [];
    }

    async addOpenShift(data: Omit<OpenShift, 'id' | 'createdAt'>): Promise<OpenShift> {
        console.warn('[MockService] addOpenShift called');
        return {
            id: Date.now(),
            ...data,
            createdAt: new Date().toISOString()
        } as OpenShift;
    }

    async updateOpenShift(id: number, data: Partial<OpenShift>): Promise<void> {
        console.warn(`[MockService] updateOpenShift called for id ${id}`);
    }

    async deleteOpenShift(id: number): Promise<void> {
        console.warn(`[MockService] deleteOpenShift called for id ${id}`);
    }

    // Shift Bids
    async getShiftBids(shiftId?: number, userId?: number): Promise<ShiftBid[]> {
        console.warn('[MockService] getShiftBids called - returning empty array');
        return [];
    }

    async addShiftBid(data: Omit<ShiftBid, 'id' | 'bidTime'>): Promise<ShiftBid> {
        console.warn('[MockService] addShiftBid called');
        return {
            id: Date.now(),
            ...data,
            bidTime: new Date().toISOString()
        } as ShiftBid;
    }

    async updateShiftBid(id: number, data: Partial<ShiftBid>): Promise<void> {
        console.warn(`[MockService] updateShiftBid called for id ${id}`);
    }
}

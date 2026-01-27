import { IDataService, Ingredient, User, Task, MenuItem, RecipeItem, Event, Menu, EventMenuItem, StaffAvailability, BlackoutDate, OpenShift, ShiftBid, Equipment } from './types';
import { ApiDataService } from './api-service';
// import { SqliteDataService } from './sqlite-service'; // REMOVED STATIC IMPORT


export class HybridDataService implements IDataService {
    private api: ApiDataService;
    private sqlite: IDataService;


    constructor() {
        this.api = new ApiDataService();

        // Dynamically load SQLite service to prevent Vercel build crash
        if (process.env.VERCEL === '1') {
            // Fallback to mock on serverless
            const { MockDataService } = require('./mock-service');
            this.sqlite = new MockDataService();
        } else {
            const { SqliteDataService } = require('./sqlite-service');
            this.sqlite = new SqliteDataService();
        }
    }


    private toLocalId(id: number): number {
        return id > 0 ? -id : id;
    }

    private toOriginalId(id: number): number {
        return Math.abs(id);
    }

    private mapLocalData<T extends { id: number }>(item: T): T {
        return {
            ...item,
            id: this.toLocalId(item.id)
        };
    }

    // Ingredients
    async getIngredients(): Promise<Ingredient[]> {
        const [apiData, localData] = await Promise.all([
            this.api.getIngredients().catch(e => {
                console.error("Failed to fetch ingredients from API:", e);
                return [];
            }),
            this.sqlite.getIngredients()
        ]);
        return [...apiData, ...localData.map(i => this.mapLocalData(i))];
    }

    async addIngredient(data: Omit<Ingredient, 'id' | 'lastUpdated'>): Promise<Ingredient> {
        if ((data as any).isSample) {
            return this.sqlite.addIngredient(data).then(i => this.mapLocalData(i));
        }
        return this.api.addIngredient(data);
    }

    async updateIngredientPrice(id: number, price: number): Promise<void> {
        if (id < 0) {
            await this.sqlite.updateIngredientPrice(this.toOriginalId(id), price);
        } else {
            await this.api.updateIngredientPrice(id, price);
        }
    }

    // Users
    async getUsers(status?: string): Promise<User[]> {
        const [apiData, localData] = await Promise.all([
            this.api.getUsers(status).catch(e => {
                console.error("Failed to fetch users from API:", e);
                return [];
            }),
            this.sqlite.getUsers(status)
        ]);
        return [...apiData, ...localData.map(u => this.mapLocalData(u))];
    }

    async getUserByEmail(email: string): Promise<User | null> {
        const apiUser = await this.api.getUserByEmail(email);
        if (apiUser) return apiUser;

        const localUser = await this.sqlite.getUserByEmail(email);
        return localUser ? this.mapLocalData(localUser) : null;
    }

    async getUser(id: number): Promise<User | null> {
        if (id < 0) {
            const localUser = await this.sqlite.getUser(this.toOriginalId(id));
            return localUser ? this.mapLocalData(localUser) : null;
        }
        return this.api.getUser(id);
    }

    async resetPassword(id: number): Promise<void> {
        if (id < 0) {
            await this.sqlite.resetPassword(this.toOriginalId(id));
        } else {
            await this.api.resetPassword(id);
        }
    }

    async addUser(data: Omit<User, 'id'>): Promise<User> {
        if (data.isSample) {
            return this.sqlite.addUser(data).then(u => this.mapLocalData(u));
        }
        return this.api.addUser(data);
    }

    async updateUser(id: number, data: Partial<User>): Promise<void> {
        if (id < 0) {
            await this.sqlite.updateUser(this.toOriginalId(id), data);
        } else {
            await this.api.updateUser(id, data);
        }
    }

    async deleteUser(id: number): Promise<void> {
        if (id < 0) {
            await this.sqlite.deleteUser(this.toOriginalId(id));
        } else {
            await this.api.deleteUser(id);
        }
    }

    async approveUser(email: string): Promise<void> {
        // Try both
        await Promise.all([
            this.api.approveUser(email).catch(() => { }),
            this.sqlite.approveUser(email).catch(() => { })
        ]);
    }

    // Tasks
    async addTask(data: Omit<Task, 'id'>): Promise<Task> {
        // If assignedTo is negative, it's a local user, so maybe we should store task locally?
        // But requested rule is "manual enter data should save to hostgator".
        // If we assign a task to a local sample user, API won't know that user ID.
        // For now, let's stick to rule: Manual = API.
        // If assignment fails on API because user ID -123 doesn't exist, we might have an issue.
        // But likely sample data users are for sample data events.
        // Strategy: If related entities are local, store local.
        if ((data.assignedTo && data.assignedTo < 0) || (data.eventId && data.eventId < 0)) {
            const localTask = await this.sqlite.addTask({
                ...data,
                assignedTo: data.assignedTo ? this.toOriginalId(data.assignedTo) : null,
                eventId: data.eventId ? this.toOriginalId(data.eventId) : null
            } as any);
            return this.mapLocalData(localTask);
        }
        return this.api.addTask(data);
    }

    // Events
    async getEvents(): Promise<Event[]> {
        const [apiData, localData] = await Promise.all([
            this.api.getEvents().catch(e => {
                console.error("Failed to fetch events from API:", e);
                return [];
            }),
            this.sqlite.getEvents()
        ]);
        return [...apiData, ...localData.map(e => {
            const mapped = this.mapLocalData(e);
            if (mapped.clientId) mapped.clientId = this.toLocalId(mapped.clientId);
            return mapped;
        })];
    }

    async getEvent(id: number): Promise<Event | null> {
        if (id < 0) {
            const localEvent = await this.sqlite.getEvent(this.toOriginalId(id));
            return localEvent ? this.mapLocalData(localEvent) : null;
        }
        return this.api.getEvent(id);
    }

    async addEvent(data: Omit<Event, 'id' | 'createdAt'>): Promise<Event> {
        if ((data as any).isSample || (data.clientId && data.clientId < 0)) {
            const localEvent = await this.sqlite.addEvent({
                ...data,
                clientId: data.clientId ? this.toOriginalId(data.clientId) : null
            });
            return this.mapLocalData(localEvent);
        }
        return this.api.addEvent(data);
    }

    async updateEvent(id: number, data: Partial<Event>): Promise<void> {
        if (id < 0) {
            await this.sqlite.updateEvent(this.toOriginalId(id), data);
        } else {
            await this.api.updateEvent(id, data);
        }
    }

    // Event Menu Items
    async getEventMenuItems(eventId: number): Promise<EventMenuItem[]> {
        if (eventId < 0) {
            const data = await this.sqlite.getEventMenuItems(this.toOriginalId(eventId));
            return data.map(item => ({
                ...item,
                id: this.toLocalId(item.id),
                eventId: this.toLocalId(item.eventId), // should match input
                menuItemId: this.toLocalId(item.menuItemId) // assuming menu items are also hybrid mapped
            }));
        } else {
            return this.api.getEventMenuItems(eventId);
        }
    }

    async addEventMenuItem(data: Omit<EventMenuItem, 'id'>): Promise<EventMenuItem> {
        if (data.eventId < 0) {
            const local = await this.sqlite.addEventMenuItem({
                ...data,
                eventId: this.toOriginalId(data.eventId),
                menuItemId: this.toOriginalId(data.menuItemId)
            });
            return {
                ...local,
                id: this.toLocalId(local.id),
                eventId: this.toLocalId(local.eventId),
                menuItemId: this.toLocalId(local.menuItemId)
            };
        }
        return this.api.addEventMenuItem(data);
    }

    // Menus
    async getMenus(): Promise<Menu[]> {
        const [apiData, localData] = await Promise.all([
            this.api.getMenus().catch(e => {
                console.error("Failed to fetch menus from API:", e);
                return [];
            }),
            this.sqlite.getMenus()
        ]);
        return [...apiData, ...localData.map(m => this.mapLocalData(m))];
    }

    async addMenu(data: Omit<Menu, 'id' | 'createdAt'>): Promise<Menu> {
        if (data.isSample) {
            return this.sqlite.addMenu(data).then(m => this.mapLocalData(m));
        }
        return this.api.addMenu(data);
    }

    async getMenuItems(menuId?: number): Promise<MenuItem[]> {
        if (menuId && menuId < 0) {
            const localData = await this.sqlite.getMenuItems(this.toOriginalId(menuId));
            return localData.map(i => {
                const mapped = this.mapLocalData(i);
                if (mapped.menuId) mapped.menuId = this.toLocalId(mapped.menuId);
                return mapped;
            });
        }

        // If menuId is positive or undefined, we might want combined if undefined?
        if (!menuId) {
            const [apiData, localData] = await Promise.all([
                this.api.getMenuItems().catch(e => {
                    console.error("Failed to fetch menu items from API:", e);
                    return [];
                }),
                this.sqlite.getMenuItems()
            ]);
            return [...apiData, ...localData.map(i => {
                const mapped = this.mapLocalData(i);
                if (mapped.menuId) mapped.menuId = this.toLocalId(mapped.menuId);
                return mapped;
            })];
        }

        return this.api.getMenuItems(menuId);
    }

    async addMenuItem(data: Omit<MenuItem, 'id'>): Promise<MenuItem> {
        if (data.isSample || (data.menuId && data.menuId < 0)) {
            const local = await this.sqlite.addMenuItem({
                ...data,
                menuId: data.menuId ? this.toOriginalId(data.menuId) : null
            });
            const mapped = this.mapLocalData(local);
            if (mapped.menuId) mapped.menuId = this.toLocalId(mapped.menuId);
            return mapped;
        }
        return this.api.addMenuItem(data);
    }

    // Recipes
    async getRecipe(menuId: number): Promise<RecipeItem[]> {
        if (menuId < 0) {
            const data = await this.sqlite.getRecipe(this.toOriginalId(menuId));
            return data.map(r => ({
                ...r,
                id: this.toLocalId(r.id),
                menuItemId: this.toLocalId(r.menuItemId),
                ingredientId: this.toLocalId(r.ingredientId)
            }));
        }
        return this.api.getRecipe(menuId).catch(e => {
            console.error("Failed to fetch recipe from API:", e);
            return [];
        });
    }

    async addRecipeItem(menuId: number, ingredientId: number, amount: number): Promise<void> {
        if (menuId < 0) {
            await this.sqlite.addRecipeItem(this.toOriginalId(menuId), this.toOriginalId(ingredientId), amount);
        } else {
            await this.api.addRecipeItem(menuId, ingredientId, amount);
        }
    }

    // Sample Data Management
    async clearAllData(): Promise<void> {
        // Only clear local data as requested
        console.log('🧹 Clearing local sample data only...');
        await this.sqlite.clearAllData();
    }

    async clearSampleData(): Promise<void> {
        console.log('🧹 Clearing sample data (Local & API)...');
        await Promise.all([
            this.sqlite.clearSampleData(),
            this.api.clearSampleData().catch(e => console.warn("API clearSampleData failed:", e))
        ]);
    }

    async getDataStats(): Promise<any> {
        const [apiStats, localStats] = await Promise.all([
            this.api.getDataStats(),
            this.sqlite.getDataStats()
        ]);

        // Combine stats
        return {
            events: (apiStats.events || 0) + (localStats.events || 0),
            users: (apiStats.users || 0) + (localStats.users || 0),
            menus: (apiStats.menus || 0) + (localStats.menus || 0),
            menuItems: (apiStats.menuItems || 0) + (localStats.menuItems || 0),
            ingredients: (apiStats.ingredients || 0) + (localStats.ingredients || 0),
            recipes: (apiStats.recipes || 0) + (localStats.recipes || 0),
            tasks: (apiStats.tasks || 0) + (localStats.tasks || 0),
        };
    }

    // --- Availability & Scheduling ---

    // Staff Availability
    async getStaffAvailability(userId?: number, startDate?: string, endDate?: string): Promise<StaffAvailability[]> {
        // If searching a specific user, check if it's local (negative) or remote (positive)
        if (userId && userId < 0) {
            return this.sqlite.getStaffAvailability(this.toOriginalId(userId), startDate, endDate);
        }

        // For remote users or all users, try API first.
        // We could merge results if we want hybrid availability for hybrid staff lists.
        try {
            const apiData = await this.api.getStaffAvailability(userId, startDate, endDate);

            // If fetching all users, also get local availability
            if (!userId) {
                const localData = await this.sqlite.getStaffAvailability(undefined, startDate, endDate);
                return [...apiData, ...localData.map(d => ({ ...d, userId: this.toLocalId(d.userId) }))];
            }
            return apiData;
        } catch (e) {
            console.error("Failed to fetch availability from API:", e);
            return [];
        }
    }

    async addStaffAvailability(data: Omit<StaffAvailability, 'id' | 'createdAt'>): Promise<StaffAvailability> {
        if (data.userId < 0) {
            const local = await this.sqlite.addStaffAvailability({
                ...data,
                userId: this.toOriginalId(data.userId)
            });
            return {
                ...local,
                userId: this.toLocalId(local.userId)
            };
        }
        return this.api.addStaffAvailability(data);
    }

    async updateStaffAvailability(id: number, data: Partial<StaffAvailability>): Promise<void> {
        // We don't easily know if an ID is local or remote just by the ID number for availability 
        // unless we enforced negative IDs for local availability records too.
        // But auto-increment IDs are usually positive in both DBs.
        // Use a heuristic or try both? Or maybe we can rely on catching 404s?
        // Better strategy: Attempt API first, if failed/not found, try local?
        // Or assume ID collisions are possible and we should have mapped availability IDs too.
        // For simplicity now: Try API, if error, try local.

        try {
            await this.api.updateStaffAvailability(id, data);
        } catch (e) {
            await this.sqlite.updateStaffAvailability(id, data);
        }
    }

    async deleteStaffAvailability(id: number): Promise<void> {
        try {
            await this.api.deleteStaffAvailability(id);
        } catch (e) {
            await this.sqlite.deleteStaffAvailability(id);
        }
    }

    // Blackout Dates
    async getBlackoutDates(startDate?: string, endDate?: string): Promise<BlackoutDate[]> {
        const [apiData, localData] = await Promise.all([
            this.api.getBlackoutDates(startDate, endDate).catch(() => []),
            this.sqlite.getBlackoutDates(startDate, endDate)
        ]);
        return [...apiData, ...localData];
    }

    async addBlackoutDate(data: Omit<BlackoutDate, 'id' | 'createdAt'>): Promise<BlackoutDate> {
        if ((data as any).isSample) {
            // Blackout dates don't have isSample in types yet, but we track it via createdBy usually
            return this.sqlite.addBlackoutDate(data);
        }
        return this.api.addBlackoutDate(data);
    }

    async deleteBlackoutDate(id: number): Promise<void> {
        try {
            await this.api.deleteBlackoutDate(id);
        } catch (e) {
            await this.sqlite.deleteBlackoutDate(id);
        }
    }

    // Open Shifts
    async getOpenShifts(eventId?: number): Promise<OpenShift[]> {
        if (eventId && eventId < 0) {
            return this.sqlite.getOpenShifts(this.toOriginalId(eventId));
        }

        try {
            const apiData = await this.api.getOpenShifts(eventId);
            if (!eventId) {
                const localData = await this.sqlite.getOpenShifts();
                return [...apiData, ...localData.map(s => ({
                    ...s,
                    eventId: this.toLocalId(s.eventId)
                }))];
            }
            return apiData;
        } catch (e) {
            console.error("Failed to fetch open shifts from API:", e);
            return [];
        }
    }

    async addOpenShift(data: Omit<OpenShift, 'id' | 'createdAt'>): Promise<OpenShift> {
        if (data.eventId < 0) {
            const local = await this.sqlite.addOpenShift({
                ...data,
                eventId: this.toOriginalId(data.eventId)
            });
            return { ...local, eventId: this.toLocalId(local.eventId) };
        }
        return this.api.addOpenShift(data);
    }

    async updateOpenShift(id: number, data: Partial<OpenShift>): Promise<void> {
        try {
            await this.api.updateOpenShift(id, data);
        } catch (e) {
            await this.sqlite.updateOpenShift(id, data);
        }
    }

    async deleteOpenShift(id: number): Promise<void> {
        try {
            await this.api.deleteOpenShift(id);
        } catch (e) {
            await this.sqlite.deleteOpenShift(id);
        }
    }

    // Shift Bids
    async getShiftBids(shiftId?: number, userId?: number): Promise<ShiftBid[]> {
        // Complex routing needed if mixing local/remote.
        // Simply try API first.
        const apiData = await this.api.getShiftBids(shiftId, userId).catch(() => []);
        return apiData;
    }

    async addShiftBid(data: Omit<ShiftBid, 'id' | 'bidTime'>): Promise<ShiftBid> {
        if (data.userId < 0) {
            // Local user bidding?
            // Allowed only if shift is also local probably.
            const local = await this.sqlite.addShiftBid({
                ...data,
                userId: this.toOriginalId(data.userId)
            });
            return local;
        }
        return this.api.addShiftBid(data);
    }

    async updateShiftBid(id: number, data: Partial<ShiftBid>): Promise<void> {
        try {
            await this.api.updateShiftBid(id, data);
        } catch (e) {
            await this.sqlite.updateShiftBid(id, data);
        }
    }

    async updateRecipeItem(id: number, amount: number): Promise<void> {
        if (id < 0) {
            await this.sqlite.updateRecipeItem(this.toOriginalId(id), amount);
        } else {
            await this.api.updateRecipeItem(id, amount);
        }
    }

    async deleteRecipeItem(id: number): Promise<void> {
        if (id < 0) {
            await this.sqlite.deleteRecipeItem(this.toOriginalId(id));
        } else {
            await this.api.deleteRecipeItem(id);
        }
    }

    async getEventStaff(eventId: number): Promise<any[]> {
        if (eventId < 0) {
            return this.sqlite.getEventStaff(this.toOriginalId(eventId));
        }
        return this.api.getEventStaff(eventId);
    }

    async getEventEquipment(eventId: number): Promise<any[]> {
        if (eventId < 0) {
            return this.sqlite.getEventEquipment(this.toOriginalId(eventId));
        }
        return this.api.getEventEquipment(eventId);
    }

    async getMessages(params: any): Promise<any[]> {
        return this.api.getMessages(params);
    }

    async sendMessage(data: any): Promise<any> {
        return this.api.sendMessage(data);
    }
    async getTasks(eventId?: number, assignedTo?: number): Promise<Task[]> {
        // Simple routing: Try API, if empty/fail, try local? 
        // Or assume tasks are partitioned.
        // For now, return API tasks.
        return this.api.getTasks(eventId, assignedTo);
    }

    // Equipment
    async getEquipment(): Promise<Equipment[]> {
        // Combine?
        const local = await this.sqlite.getEquipment();
        const api = await this.api.getEquipment();
        return [...api, ...local.map(e => ({ ...e, id: this.toLocalId(e.id) }))];
    }

    async addEquipment(data: Omit<Equipment, 'id' | 'lastUpdated'>): Promise<Equipment> {
        // Always local for now since API stubbed?
        // Or follow convention:
        return this.sqlite.addEquipment(data).then(e => ({ ...e, id: this.toLocalId(e.id) }));
    }

    async updateEquipment(id: number, data: Partial<Equipment>): Promise<void> {
        if (id < 0) return this.sqlite.updateEquipment(this.toOriginalId(id), data);
        return this.api.updateEquipment(id, data);
    }

    async deleteEquipment(id: number): Promise<void> {
        if (id < 0) return this.sqlite.deleteEquipment(this.toOriginalId(id));
        return this.api.deleteEquipment(id);
    }

    async removeEventStaff(id: number): Promise<void> {
        // ID determines source. But eventStaff ids?
        // Assume negative ID for local.
        if (id < 0) return this.sqlite.removeEventStaff(this.toOriginalId(id));
        return this.api.removeEventStaff(id);
    }

    async addEventEquipment(data: { eventId: number; equipmentId: number; quantity: number; rentalCostOverride?: number }): Promise<void> {
        if (data.eventId < 0) {
            return this.sqlite.addEventEquipment({
                ...data,
                eventId: this.toOriginalId(data.eventId),
                equipmentId: this.toOriginalId(data.equipmentId) // assuming equipment also local
            });
        }
        return this.api.addEventEquipment(data);
    }

    async removeEventEquipment(id: number): Promise<void> {
        if (id < 0) return this.sqlite.removeEventEquipment(this.toOriginalId(id));
        return this.api.removeEventEquipment(id);
    }
}

import { IDataService, Ingredient, User, Task, MenuItem, RecipeItem, Event, EventMenuItem, StaffAvailability, BlackoutDate, OpenShift, ShiftBid, Message } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.jewishingenuity.com/catering_app';

export class ApiDataService implements IDataService {

    private async fetchJson(endpoint: string, options?: RequestInit) {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            cache: 'no-store' // Always fresh data for admin
        });
        if (!res.ok) {
            let errorMessage = `API Error: ${res.statusText}`;
            try {
                const errorBody = await res.json();
                if (errorBody.error) {
                    errorMessage = errorBody.error;
                    if (errorBody.reason) errorMessage += ` (${errorBody.reason})`;
                }
            } catch (e) {
                // Ignore json parse error, stick to status text
            }
            throw new Error(`${errorMessage} (Endpoint: ${endpoint})`);
        }
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

    async updateUser(id: number, data: Partial<User>): Promise<void> {
        await this.fetchJson('/users.php', {
            method: 'PUT',
            body: JSON.stringify({ id, ...data }),
            headers: { 'Content-Type': 'application/json' }
        });
    }

    async deleteUser(id: number): Promise<void> {
        await this.fetchJson(`/users.php?id=${id}`, {
            method: 'DELETE'
        });
    }

    async resetPassword(id: number): Promise<void> {
        await this.fetchJson('/users.php', {
            method: 'POST',
            body: JSON.stringify({ action: 'reset_password', id }),
            headers: { 'Content-Type': 'application/json' }
        });
    }

    async addTask(data: Omit<Task, 'id'>): Promise<Task> {
        const res = await this.fetchJson('/tasks.php', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        });
        return { id: res.id, ...data };
    }

    async getMenuItems(menuId?: number): Promise<MenuItem[]> {
        const query = menuId ? `?menu_id=${menuId}` : '';
        return this.fetchJson(`/menu_items.php${query}`);
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

    async updateRecipeItem(id: number, amount: number): Promise<void> {
        await this.fetchJson('/recipes.php', {
            method: 'PUT',
            body: JSON.stringify({ id, amountRequired: amount }),
            headers: { 'Content-Type': 'application/json' }
        });
    }

    async deleteRecipeItem(id: number): Promise<void> {
        await this.fetchJson(`/recipes.php?id=${id}`, {
            method: 'DELETE'
        });
    }

    // Events
    async getEvents(): Promise<any[]> {
        return this.fetchJson('/events.php');
    }

    async addEvent(data: any): Promise<any> {
        const res = await this.fetchJson('/events.php', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        });
        return { id: res.id, ...data };
    }

    async updateEvent(id: number, data: Partial<Event>): Promise<void> {
        await this.fetchJson('/events.php', {
            method: 'PUT',
            body: JSON.stringify({ id, ...data }),
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Event Menu Items
    async getEventMenuItems(eventId: number): Promise<EventMenuItem[]> {
        return this.fetchJson(`/event_menu_items.php?event_id=${eventId}`);
    }

    async addEventMenuItem(data: Omit<EventMenuItem, 'id'>): Promise<EventMenuItem> {
        const res = await this.fetchJson('/event_menu_items.php', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        });
        return { id: res.id, ...data };
    }

    async updateEventMenuItem(id: number, data: Partial<EventMenuItem>): Promise<void> {
        await this.fetchJson('/event_menu_items.php', {
            method: 'PUT',
            body: JSON.stringify({ id, ...data }),
            headers: { 'Content-Type': 'application/json' }
        });
    }

    async deleteEventMenuItem(id: number): Promise<void> {
        await this.fetchJson(`/event_menu_items.php?id=${id}`, {
            method: 'DELETE'
        });
    }

    // Menus
    async getMenus(): Promise<any[]> {
        return this.fetchJson('/menus.php');
    }

    async addMenu(data: any): Promise<any> {
        const res = await this.fetchJson('/menus.php', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        });
        return { id: res.id, ...data };
    }
    // Sample Data Management
    async clearAllData(): Promise<void> {
        throw new Error("Clearing all data is NOT supported in API Mode. Use 'Clear Sample Data' instead.");
    }

    async clearSampleData(): Promise<void> {
        await this.fetchJson('/delete_sample_data.php', {
            method: 'DELETE'
        });
    }
    async getDataStats(): Promise<{ events: number; users: number; menus: number; menuItems: number; ingredients: number; recipes: number; tasks: number; }> {
        return {
            events: 0,
            users: 0,
            menus: 0,
            menuItems: 0,
            ingredients: 0,
            recipes: 0,
            tasks: 0
        };
    }

    // Availability & Scheduling
    // Staff Availability
    async getStaffAvailability(userId?: number, startDate?: string, endDate?: string): Promise<StaffAvailability[]> {
        let query = userId ? `?user_id=${userId}` : '?';
        if (startDate) query += `&start_date=${startDate}`;
        if (endDate) query += `&end_date=${endDate}`;
        return this.fetchJson(`/availability.php${query}`);
    }

    async addStaffAvailability(data: Omit<StaffAvailability, 'id' | 'createdAt'>): Promise<StaffAvailability> {
        const res = await this.fetchJson('/availability.php', {
            method: 'POST',
            body: JSON.stringify({ ...data, action: 'availability' }),
            headers: { 'Content-Type': 'application/json' }
        });
        return {
            id: res.id,
            ...data,
            createdAt: new Date().toISOString()
        } as StaffAvailability;
    }

    async updateStaffAvailability(id: number, data: Partial<StaffAvailability>): Promise<void> {
        await this.fetchJson('/availability.php', {
            method: 'PUT',
            body: JSON.stringify({ id, ...data, action: 'availability' }),
            headers: { 'Content-Type': 'application/json' }
        });
    }

    async deleteStaffAvailability(id: number): Promise<void> {
        await this.fetchJson(`/availability.php?action=availability&id=${id}`, {
            method: 'DELETE'
        });
    }

    // Blackout Dates
    async getBlackoutDates(startDate?: string, endDate?: string): Promise<BlackoutDate[]> {
        let query = '?action=blackout';
        if (startDate) query += `&start_date=${startDate}`;
        if (endDate) query += `&end_date=${endDate}`;
        return this.fetchJson(`/availability.php${query}`);
    }

    async addBlackoutDate(data: Omit<BlackoutDate, 'id' | 'createdAt'>): Promise<BlackoutDate> {
        const res = await this.fetchJson('/availability.php', {
            method: 'POST',
            body: JSON.stringify({ ...data, action: 'blackout' }),
            headers: { 'Content-Type': 'application/json' }
        });
        return {
            id: res.id,
            ...data,
            createdAt: new Date().toISOString()
        } as BlackoutDate;
    }

    async deleteBlackoutDate(id: number): Promise<void> {
        await this.fetchJson(`/availability.php?action=blackout&id=${id}`, {
            method: 'DELETE'
        });
    }

    // Open Shifts
    async getOpenShifts(eventId?: number): Promise<OpenShift[]> {
        const query = eventId ? `&event_id=${eventId}` : '';
        return this.fetchJson(`/availability.php?action=shifts${query}`);
    }

    async addOpenShift(data: Omit<OpenShift, 'id' | 'createdAt'>): Promise<OpenShift> {
        const res = await this.fetchJson('/availability.php', {
            method: 'POST',
            body: JSON.stringify({ ...data, action: 'shifts' }),
            headers: { 'Content-Type': 'application/json' }
        });
        return {
            id: res.id,
            ...data,
            createdAt: new Date().toISOString()
        } as OpenShift;
    }

    async updateOpenShift(id: number, data: Partial<OpenShift>): Promise<void> {
        await this.fetchJson('/availability.php', {
            method: 'PUT',
            body: JSON.stringify({ id, ...data, action: 'shifts' }),
            headers: { 'Content-Type': 'application/json' }
        });
    }

    async deleteOpenShift(id: number): Promise<void> {
        await this.fetchJson(`/availability.php?action=shifts&id=${id}`, {
            method: 'DELETE'
        });
    }

    // Shift Bids
    async getShiftBids(shiftId?: number, userId?: number): Promise<ShiftBid[]> {
        let query = '?action=bids';
        if (shiftId) query += `&shift_id=${shiftId}`;
        if (userId) query += `&user_id=${userId}`;
        return this.fetchJson(`/availability.php${query}`);
    }

    async addShiftBid(data: Omit<ShiftBid, 'id' | 'bidTime'>): Promise<ShiftBid> {
        const res = await this.fetchJson('/availability.php', {
            method: 'POST',
            body: JSON.stringify({ ...data, action: 'bids' }),
            headers: { 'Content-Type': 'application/json' }
        });
        return {
            id: res.id,
            ...data,
            bidTime: new Date().toISOString()
        } as ShiftBid;
    }

    async updateShiftBid(id: number, data: Partial<ShiftBid>): Promise<void> {
        await this.fetchJson('/availability.php', {
            method: 'PUT',
            body: JSON.stringify({ id, ...data, action: 'bids' }),
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Messages
    async getMessages(params: { eventId?: number; recipientId?: number; senderId?: number; after?: string; }): Promise<Message[]> {
        let query = '?';
        if (params.eventId) query += `&event_id=${params.eventId}`;
        if (params.recipientId) query += `&recipient_id=${params.recipientId}`;
        if (params.senderId) query += `&sender_id=${params.senderId}`;
        if (params.after) query += `&after=${encodeURIComponent(params.after)}`;

        const res = await this.fetchJson(`/messages.php${query}`);
        return res.data;
    }

    async sendMessage(data: { senderId: number; recipientId?: number; eventId?: number; content?: string; transcription?: string; type: 'text' | 'image' | 'audio'; file?: File }): Promise<Message> {
        if (data.file) {
            // Multipart upload
            const formData = new FormData();
            formData.append('senderId', data.senderId.toString());
            if (data.recipientId) formData.append('recipientId', data.recipientId.toString());
            if (data.eventId) formData.append('eventId', data.eventId.toString());
            if (data.content) formData.append('content', data.content); // Use content as backup or metadata
            if (data.transcription) formData.append('transcription', data.transcription);
            formData.append('type', data.type);
            formData.append('file', data.file);

            const res = await fetch(`${API_BASE}/messages.php`, {
                method: 'POST',
                body: formData
            });
            if (!res.ok) throw new Error('Failed to upload message');
            const json = await res.json();
            return json.data;
        } else {
            // JSON
            const res = await this.fetchJson('/messages.php', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json' }
            });
            return res.data;
        }
    }
}

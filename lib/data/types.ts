export interface Ingredient {
    id: number;
    name: string;
    unit: string;
    pricePerUnit: number;
    supplierUrl: string | null;
    lastUpdated: string | Date | null;
    isSample?: boolean;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'staff' | 'client';
    status: 'active' | 'inactive' | 'pending';
    jobTitle?: string;
    phoneNumber?: string;
    address?: string;
    hireDate?: string;
    profileImage?: string;
    language?: string;
    lastActiveAt?: string;
    createdAt?: string;
    password?: string; // Optional for security
    isSample?: boolean;
    hourlyRate?: number;
}

export interface Message {
    id: number;
    senderId: number;
    recipientId?: number;
    eventId?: number;
    content?: string;
    transcription?: string;
    type: 'text' | 'image' | 'audio';
    isRead: boolean;
    createdAt: string;
    senderName?: string;
    senderAvatar?: string;
}

export interface Task {
    id: number;
    title: string;
    description: string | null;
    status: 'pending' | 'in_progress' | 'done';
    assignedTo: number | null;
    eventId?: number | null;
    startTime?: string | null;
    dueTime?: string | null;
    location?: string | null;
    isSample?: boolean;
}

export interface Event {
    id: number;
    name: string;
    clientId: number | null;
    status: 'inquiry' | 'quote' | 'approved' | 'active' | 'completed';
    eventType?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    isOutdoors?: boolean;
    location?: string | null;
    guestCount?: number | null;
    dietaryRequirements?: string | null;
    estimatedBudget?: number | null;
    depositPaid?: number | null;
    notes?: string | null;
    // Advanced Quoting
    quoteToken?: string | null;
    quoteConfig?: any | null; // Typed as any to avoid circular deps with actions, or string if raw
    quoteViewedAt?: string | Date | null;
    quoteExpiresAt?: string | Date | null;
    createdAt?: string | Date | null;
    isSample?: boolean;
}

export interface Menu {
    id: number;
    name: string;
    menuType: 'dairy' | 'meat' | 'parve' | 'pescatarian' | 'vegan' | 'glutenfree';
    description?: string | null;
    isActive?: boolean;
    createdAt?: string | Date | null;
    isSample?: boolean;
}

export interface MenuItem {
    id: number;
    menuId?: number | null;
    name: string;
    description: string | null;
    basePrice: number | null;
    category: string | null;
    isKosher?: boolean;
    kosherType?: 'parve' | 'dairy' | 'meat' | null;
    isGlutenFree?: boolean;
    isVegan?: boolean;
    prepTime?: number | null;
    servingSize?: string | null;
    calculatedCost?: number | null;
    isSample?: boolean;
}

export interface EventMenuItem {
    id: number;
    eventId: number;
    menuItemId: number;
    quantity: number;
    priceOverride?: number | null;
    notes?: string | null;
    // Joined fields from menu_items
    menuItemName?: string;
    category?: string;
    basePrice?: number;
    description?: string;
    item?: MenuItem;
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

export interface StaffAvailability {
    id: number;
    userId: number;
    date?: string | null;
    dayOfWeek?: number | null;
    startTime?: string | null;
    endTime?: string | null;
    type: 'unavailable' | 'preferred_off' | 'available';
    status: 'approved' | 'pending' | 'rejected';
    reason?: string | null;
    isRecurring?: boolean;
    createdAt?: string | Date | null;
}

export interface BlackoutDate {
    id: number;
    date: string;
    description?: string | null;
    isGlobal?: boolean;
    userId?: number | null;
    createdBy?: number | null;
    createdAt?: string | Date | null;
}

export interface OpenShift {
    id: number;
    eventId: number;
    role: string;
    startTime?: string | null;
    endTime?: string | null;
    description?: string | null;
    status: 'open' | 'filled' | 'cancelled';
    createdAt?: string | Date | null;
}

export interface ShiftBid {
    id: number;
    shiftId: number;
    userId: number;
    status: 'pending' | 'approved' | 'rejected';
    bidTime?: string | Date | null;
    notes?: string | null;
}

export interface Equipment {
    id: number;
    name: string;
    type: 'owned' | 'rental';
    defaultRentalCost?: number | null;
    replacementCost?: number | null;
    lastUpdated?: string | Date | null;
}

export interface IDataService {
    // Ingredients
    getIngredients(): Promise<Ingredient[]>;
    addIngredient(data: Omit<Ingredient, 'id' | 'lastUpdated'>): Promise<Ingredient>;
    updateIngredientPrice(id: number, price: number): Promise<void>;

    // Users
    getUsers(status?: string): Promise<User[]>;
    getUser(id: number): Promise<User | null>; // Added
    getUserByEmail(email: string): Promise<User | null>;
    addUser(data: Omit<User, 'id'>): Promise<User>;
    updateUser(id: number, data: Partial<User>): Promise<void>;
    deleteUser(id: number): Promise<void>;
    approveUser(email: string): Promise<void>;
    resetPassword(id: number): Promise<void>;

    // Tasks
    getTasks(eventId?: number, assignedTo?: number): Promise<Task[]>; // Added
    addTask(data: Omit<Task, 'id'>): Promise<Task>;

    // Events
    getEvents(): Promise<Event[]>;
    getEvent(id: number): Promise<Event | null>;
    addEvent(data: Omit<Event, 'id' | 'createdAt'>): Promise<Event>;
    updateEvent(id: number, data: Partial<Event>): Promise<void>; // Made required
    getEventByToken?(token: string): Promise<Event | null>;

    // Event Menu Items
    getEventMenuItems(eventId: number): Promise<EventMenuItem[]>; // Made required
    addEventMenuItem?(data: Omit<EventMenuItem, 'id'>): Promise<EventMenuItem>;
    updateEventMenuItem?(id: number, data: Partial<EventMenuItem>): Promise<void>;
    deleteEventMenuItem?(id: number): Promise<void>;

    // Event Staff
    getEventStaff(eventId: number): Promise<any[]>; // Added
    addEventStaff?(data: { eventId: number; userId: number; role?: string; shiftStart?: string; shiftEnd?: string }): Promise<void>;
    removeEventStaff?(id: number): Promise<void>; // Added

    // Equipment (Inventory)
    getEquipment(): Promise<Equipment[]>; // Added
    addEquipment(data: Omit<Equipment, 'id' | 'lastUpdated'>): Promise<Equipment>; // Added
    updateEquipment(id: number, data: Partial<Equipment>): Promise<void>; // Added
    deleteEquipment(id: number): Promise<void>; // Added

    // Event Equipment
    getEventEquipment(eventId: number): Promise<any[]>; // Added
    addEventEquipment(data: { eventId: number; equipmentId: number; quantity: number; rentalCostOverride?: number }): Promise<void>; // Added
    removeEventEquipment(id: number): Promise<void>; // Added

    // Menus
    getMenus(): Promise<Menu[]>;
    addMenu(data: Omit<Menu, 'id' | 'createdAt'>): Promise<Menu>;
    getMenuItems(menuId?: number): Promise<MenuItem[]>;
    addMenuItem(data: Omit<MenuItem, 'id'>): Promise<MenuItem>;

    // Recipes
    getRecipe(menuId: number): Promise<RecipeItem[]>;
    addRecipeItem(menuId: number, ingredientId: number, amount: number): Promise<void>;
    updateRecipeItem(id: number, amount: number): Promise<void>;
    deleteRecipeItem(id: number): Promise<void>;


    // Sample Data
    clearAllData?(): Promise<void>;
    clearSampleData?(): Promise<void>;
    getDataStats?(): Promise<{
        events: number;
        users: number;
        menus: number;
        menuItems: number;
        ingredients: number;
        recipes: number;
        tasks: number;
    }>;

    // Availability & Scheduling
    // Staff Availability
    getStaffAvailability(userId?: number, startDate?: string, endDate?: string): Promise<StaffAvailability[]>;
    addStaffAvailability(data: Omit<StaffAvailability, 'id' | 'createdAt'>): Promise<StaffAvailability>;
    updateStaffAvailability(id: number, data: Partial<StaffAvailability>): Promise<void>;
    deleteStaffAvailability(id: number): Promise<void>;

    // Blackout Dates
    getBlackoutDates(startDate?: string, endDate?: string): Promise<BlackoutDate[]>;
    addBlackoutDate(data: Omit<BlackoutDate, 'id' | 'createdAt'>): Promise<BlackoutDate>;
    deleteBlackoutDate(id: number): Promise<void>;

    // Open Shifts
    getOpenShifts(eventId?: number): Promise<OpenShift[]>;
    addOpenShift(data: Omit<OpenShift, 'id' | 'createdAt'>): Promise<OpenShift>;
    updateOpenShift(id: number, data: Partial<OpenShift>): Promise<void>;
    deleteOpenShift(id: number): Promise<void>;

    // Shift Bids
    getShiftBids(shiftId?: number, userId?: number): Promise<ShiftBid[]>;
    addShiftBid(data: Omit<ShiftBid, 'id' | 'bidTime'>): Promise<ShiftBid>;
    updateShiftBid(id: number, data: Partial<ShiftBid>): Promise<void>;
}

export interface QuoteConfig {
    showImages: boolean;
    showDescription: boolean;
    showTotals: boolean;
    depositAmount: number;
    depositType: 'percentage' | 'fixed';
    termsAndConditions?: string;
    validUntil?: string;
    sectionsOrder?: string[];
    editableFields?: string[];
    allowClientEdit?: boolean;
    requireDeposit?: boolean;
    internalNotes?: string;
}

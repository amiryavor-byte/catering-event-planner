
import { ApiDataService } from '@/lib/data/api-service';

// Sample data identifiers
const SAMPLE_EMAILS = [
    'sarah.goldman@example.com', 'david.rosenberg@example.com', 'rachel.cohen@example.com',
    'michael.levy@example.com', 'rebecca.schwartz@example.com', 'joshua.friedman@example.com',
    'hannah.klein@example.com', 'aaron.berg@example.com', 'leah.kaplan@example.com',
    'ethan.shapiro@example.com', 'miriam.blum@example.com', 'jacob.stein@example.com',
    'eliana.wolf@example.com', 'benjamin.harris@example.com', 'tamar.weiss@example.com',
    'noah.green@example.com', 'esther.miller@example.com', 'samuel.davis@example.com',
    'abigail.brown@example.com', 'isaac.wilson@example.com',
    'jennifer.goldstein@example.com', 'robert.katz@example.com', 'lisa.silverman@example.com',
    'mark.rosenthal@example.com', 'susan.feldman@example.com', 'daniel.newman@example.com',
    'karen.adler@example.com', 'steven.marcus@example.com'
];

const SAMPLE_MENU_NAMES = [
    'Premium Meat Menu', 'Elegant Dairy Menu', 'Parve Excellence Menu',
    'Gluten-Free Kosher Menu', 'Vegan Kosher Menu'
];

const SAMPLE_EVENT_NAMES = [
    'Goldman-Sachs Corporate Gala', 'Cohen Bar Mitzvah', 'Levine Wedding',
    'Shabbat Dinner Fundraiser', 'Stein Baby Naming'
];

const API_BASE = 'https://api.jewishingenuity.com/catering_app';

async function cleanup() {
    console.log('🧹 Starting HostGator Sample Data Cleanup...');
    const api = new ApiDataService();

    // 1. Delete Events
    console.log('\n--- Cleaning Events ---');
    try {
        const events = await api.getEvents();
        const sampleEvents = events.filter(e => SAMPLE_EVENT_NAMES.includes(e.name)); // Adjust matching logic if needed
        console.log(`Found ${sampleEvents.length} sample events.`);

        for (const event of sampleEvents) {
            console.log(`Deleting event: ${event.name} (ID: ${event.id})`);
            await deleteResource('/events.php', event.id);
        }
    } catch (e) { console.error('Error cleaning events:', e); }

    // 2. Delete Menus (and cascade delete items/recipes?)
    // Note: API for menus.php delete needs to support cascade or we delete items first.
    // My updated events.php supports cascade for tasks/event_items.
    // I didn't verify menus.php cascade logic fully (I implemented a check usage block). 
    // "Cannot delete menu containing items. Delete items first."
    // So I must delete items first.

    console.log('\n--- Cleaning Menu Items ---');
    try {
        const menus = await api.getMenus();
        const sampleMenus = menus.filter(m => SAMPLE_MENU_NAMES.includes(m.name));

        // Fetch all menu items first? Or fetch by menu?
        // ApiDataService getMenuItems returns all.
        const allItems = await api.getMenuItems();

        // Identify items belonging to sample menus
        const sampleMenuIds = sampleMenus.map(m => m.id);
        const sampleItems = allItems.filter(item => sampleMenuIds.includes(item.menuId));

        console.log(`Found ${sampleItems.length} sample menu items.`);

        // Delete recipes for these items first?
        // Recipes are deleted by ID. Retrieve recipes for each item?
        // This is getting expensive.
        // Alternative: Sample Menu Items have specific names too?
        // Yes, "Beef Sliders...", etc.
        // But deleting by Menu ID association is safer.

        for (const item of sampleItems) {
            // Delete recipes for this item first
            try {
                const recipes = await api.getRecipe(item.id); // getRecipe(menuItemId) alias
                for (const r of recipes) {
                    await deleteResource('/recipes.php', r.id);
                }
            } catch (e) { }

            console.log(`Deleting item: ${item.name} (ID: ${item.id})`);
            await deleteResource('/menu_items.php', item.id);
        }

    } catch (e) { console.error('Error cleaning menu items:', e); }

    console.log('\n--- Cleaning Menus ---');
    try {
        const menus = await api.getMenus();
        const sampleMenus = menus.filter(m => SAMPLE_MENU_NAMES.includes(m.name));
        console.log(`Found ${sampleMenus.length} sample menus.`);

        for (const menu of sampleMenus) {
            console.log(`Deleting menu: ${menu.name} (ID: ${menu.id})`);
            await deleteResource('/menus.php', menu.id);
        }
    } catch (e) { console.error('Error cleaning menus:', e); }


    // 3. Delete Users (Staff & Clients)
    console.log('\n--- Cleaning Users ---');
    try {
        const users = await api.getUsers();
        // Check both email and name? Email is unique.
        const sampleUsers = users.filter(u => SAMPLE_EMAILS.includes(u.email));
        console.log(`Found ${sampleUsers.length} sample users.`);

        for (const user of sampleUsers) {
            console.log(`Deleting user: ${user.name} (${user.email}) ID: ${user.id}`);
            await deleteResource('/users.php', user.id);
        }
    } catch (e) { console.error('Error cleaning users:', e); }

    console.log('\n✅ Cleanup Complete.');
}

async function deleteResource(endpoint: string, id: number) {
    try {
        const res = await fetch(`${API_BASE}${endpoint}?id=${id}`, {
            method: 'DELETE'
        });
        const json = await res.json();
        if (!json.success) {
            console.error(`Failed to delete ${endpoint}?id=${id}:`, json.error);
        }
    } catch (e) {
        console.error(`Network error deleting ${endpoint}?id=${id}:`, e);
    }
}

cleanup();


const Database = require('better-sqlite3');
const db = new Database('sqlite.db');

try {
    // Check if column exists
    const tableInfo = db.pragma('table_info(event_menu_items)');
    const hasStatus = tableInfo.some(col => col.name === 'status');

    if (!hasStatus) {
        console.log('Adding status column to event_menu_items...');
        db.prepare("ALTER TABLE event_menu_items ADD COLUMN status TEXT DEFAULT 'prep'").run();
        console.log('Successfully added status column.');
    } else {
        console.log('Column status already exists.');
    }
} catch (error) {
    console.error('Error modifying database:', error);
}

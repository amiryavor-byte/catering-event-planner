const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../sqlite.db');
console.log(`Opening database at ${dbPath}`);

const db = new Database(dbPath);

try {
    console.log('Attempting to add column last_active_at to users table...');
    db.prepare('ALTER TABLE users ADD COLUMN last_active_at text').run();
    console.log('Successfully added column last_active_at.');
} catch (error) {
    if (error.message.includes('duplicate column name')) {
        console.log('Column last_active_at already exists.');
    } else {
        console.error('Error adding column:', error);
    }
}

db.close();

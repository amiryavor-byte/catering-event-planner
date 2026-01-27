const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../sqlite.db');
const db = new Database(dbPath, { readonly: true });

try {
    const table = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='equipment'").get();
    if (table) {
        console.log("✅ Table 'equipment' exists.");
    } else {
        console.log("❌ Table 'equipment' DOES NOT exist.");
    }
} catch (e) {
    console.error("Error checking DB:", e);
}
db.close();

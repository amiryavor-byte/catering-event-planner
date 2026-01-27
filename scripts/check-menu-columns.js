const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../sqlite.db');
const db = new Database(dbPath, { readonly: true });

try {
    const columns = db.prepare("PRAGMA table_info(menus)").all();
    const hasIsSample = columns.some(c => c.name === 'is_sample');

    console.log("Columns in 'menus':", columns.map(c => c.name));

    if (hasIsSample) {
        console.log("✅ Column 'is_sample' exists in 'menus'.");
    } else {
        console.log("❌ Column 'is_sample' DOES NOT exist in 'menus'.");
    }
} catch (e) {
    console.error("Error checking DB:", e);
}
db.close();

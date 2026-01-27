const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../sqlite.db');
const db = new Database(dbPath, { readonly: true });

try {
    const columns = db.prepare("PRAGMA table_info(menus)").all();
    console.table(columns);
    console.log(JSON.stringify(columns, null, 2));
} catch (e) {
    console.error("Error checking DB:", e);
}
db.close();

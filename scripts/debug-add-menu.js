const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../sqlite.db');
const db = new Database(dbPath); // Read-write

try {
    const stmt = db.prepare(`
        INSERT INTO menus (name, menu_type, description, is_active, is_sample)
        VALUES (?, ?, ?, ?, ?)
    `);

    // Using dummy data
    const info = stmt.run('Debug Menu', 'meat', 'Debug Desc', 1, 1);

    console.log("✅ Insert successful:", info);
    console.log("Last Insert ID:", info.lastInsertRowid);

    // Clean up
    if (info.lastInsertRowid) {
        db.prepare("DELETE FROM menus WHERE id = ?").run(info.lastInsertRowid);
        console.log("✅ Cleaned up debug row.");
    }

} catch (e) {
    console.error("❌ Failed to insert menu:", e);
}
db.close();


const Database = require('better-sqlite3');
const db = new Database('sqlite.db');

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables:', tables.map(t => t.name));

const equipment = tables.find(t => t.name === 'equipment');
if (equipment) {
    const columns = db.prepare("PRAGMA table_info(equipment)").all();
    console.log('Equipment Columns:', columns);
}

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../sqlite.db');
console.log(`Connecting to: ${dbPath}`);
const db = new Database(dbPath);

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables:', tables);

try {
    const row = db.prepare('SELECT * FROM users LIMIT 1').get();
    console.log('Users row:', row);
} catch (e) {
    console.log('Error querying users:', e.message);
}

db.close();

// scripts/init-db.js
import Database from "better-sqlite3";
const db = new Database("database.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS nonces (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wallet TEXT,
    nonce INTEGER,
    createdAt TEXT,
    updatedAt TEXT
  );
`);

console.log("✅ Tables 'users' and 'nonces' initialized.");

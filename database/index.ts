import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';

// Get the user data path, where we'll store the database
const userDataPath = app.getPath('userData');
const dbPath = path.join(userDataPath, 'vaultmind.db');

// Create a new SQLite database connection
const db = new Database(dbPath, { verbose: console.log });

/**
 * Initializes the database and creates the necessary tables and indexes
 * if they don't already exist.
 */
function initializeDatabase() {
  console.log('Initializing database...');

  // Create the 'files' table
  const createTableStatement = db.prepare(`
    CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_name TEXT NOT NULL,
      full_path TEXT NOT NULL UNIQUE,
      file_size INTEGER NOT NULL,
      creation_date TEXT NOT NULL,
      modified_date TEXT NOT NULL,
      file_type TEXT NOT NULL,
      drive_name TEXT NOT NULL,
      sha256_hash TEXT
    )
  `);
  createTableStatement.run();

  // Create indexes for faster queries
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_file_size ON files (file_size);
    CREATE INDEX IF NOT EXISTS idx_creation_date ON files (creation_date);
    CREATE INDEX IF NOT EXISTS idx_sha256_hash ON files (sha256_hash);
    CREATE INDEX IF NOT EXISTS idx_drive_name ON files (drive_name);
  `);

  console.log('Database initialized successfully.');
}

// Initialize the database when this module is loaded
initializeDatabase();

// Export the database instance for use in other parts of the application
export default db;


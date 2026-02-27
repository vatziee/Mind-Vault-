import Database from 'better-sqlite3';
import path from 'path';
import { FileMetadata } from '../types';

const dbPath = path.join(process.cwd(), 'vaultmind.db');
const db = new Database(dbPath);

// Initialize Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS drives (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    path TEXT UNIQUE,
    total_space INTEGER,
    free_space INTEGER,
    last_indexed INTEGER
  );

  CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_name TEXT,
    full_path TEXT UNIQUE,
    file_size INTEGER,
    creation_date INTEGER,
    modified_date INTEGER,
    last_access_date INTEGER,
    file_type TEXT,
    drive_name TEXT,
    sha256_hash TEXT,
    year INTEGER
  );

  CREATE INDEX IF NOT EXISTS idx_files_path ON files(full_path);
  CREATE INDEX IF NOT EXISTS idx_files_hash ON files(sha256_hash);
  CREATE INDEX IF NOT EXISTS idx_files_size ON files(file_size);
  CREATE INDEX IF NOT EXISTS idx_files_year ON files(year);
`);

export const DB = {
  upsertFile: (file: FileMetadata) => {
    const stmt = db.prepare(`
      INSERT INTO files (file_name, full_path, file_size, creation_date, modified_date, last_access_date, file_type, drive_name, year)
      VALUES (@file_name, @full_path, @file_size, @creation_date, @modified_date, @last_access_date, @file_type, @drive_name, @year)
      ON CONFLICT(full_path) DO UPDATE SET
        file_size = excluded.file_size,
        modified_date = excluded.modified_date,
        last_access_date = excluded.last_access_date
    `);
    return stmt.run(file);
  },

  updateHash: (full_path: string, hash: string) => {
    return db.prepare('UPDATE files SET sha256_hash = ? WHERE full_path = ?').run(hash, full_path);
  },

  getFilesBySize: (size: number) => {
    return db.prepare('SELECT * FROM files WHERE file_size = ?').all(size) as FileMetadata[];
  },

  getDuplicateCandidates: () => {
    return db.prepare(`
      SELECT file_size, COUNT(*) as count 
      FROM files 
      GROUP BY file_size 
      HAVING count > 1
    `).all();
  },

  getFilesByYear: (year: number) => {
    return db.prepare('SELECT * FROM files WHERE year = ?').all(year) as FileMetadata[];
  },

  getStorageStats: () => {
    return db.prepare(`
      SELECT drive_name, SUM(file_size) as total_size, COUNT(*) as file_count 
      FROM files 
      GROUP BY drive_name
    `).all();
  },

  searchFiles: (query: string) => {
    return db.prepare('SELECT * FROM files WHERE file_name LIKE ? LIMIT 100').all(`%${query}%`) as FileMetadata[];
  }
};

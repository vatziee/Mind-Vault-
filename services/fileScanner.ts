import { Worker } from 'worker_threads';
import path from 'path';
import db from '../database';
import { Statement } from 'better-sqlite3';

const BATCH_SIZE = 100; // Insert 100 files at a time

/**
 * Starts a file scan in a worker thread.
 * @param drivePath The path of the drive to scan.
 * @param driveName The name of the drive.
 * @param onProgress Callback to report progress.
 * @param onDone Callback when the scan is complete.
 */
export function scanDriveWithWorker(
  drivePath: string,
  driveName: string,
  onProgress: (progress: any) => void,
  onDone: () => void
) {
  const worker = new Worker(path.join(__dirname, '..', 'workers', 'scanner.js'));

  let fileBatch: any[] = [];

  const insertMany = db.transaction((files) => {
    const insertStmt: Statement = db.prepare(`
      INSERT OR IGNORE INTO files 
      (file_name, full_path, file_size, creation_date, modified_date, file_type, drive_name)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const file of files) {
      try {
        insertStmt.run(file.file_name, file.full_path, file.file_size, file.creation_date, file.modified_date, file.file_type, file.drive_name);
      } catch (err) {
        console.error(`Error inserting file: ${file.full_path}`, err);
      }
    }
  });

  worker.on('message', (message) => {
    if (message.type === 'file') {
      fileBatch.push(message.data);
      if (fileBatch.length >= BATCH_SIZE) {
        insertMany(fileBatch);
        onProgress({ type: 'progress', count: fileBatch.length });
        fileBatch = [];
      }
    } else if (message.type === 'error') {
      onProgress({ type: 'error', message: message.data });
    } else if (message.type === 'done') {
      if (fileBatch.length > 0) {
        insertMany(fileBatch);
        onProgress({ type: 'progress', count: fileBatch.length });
      }
      worker.terminate();
      onDone();
    }
  });

  worker.postMessage({ type: 'start-scan', data: { drivePath, driveName } });
}



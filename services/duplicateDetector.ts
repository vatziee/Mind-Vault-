import db from '../database';
import { Worker } from 'worker_threads';
import path from 'path';

/**
 * Finds potential duplicates (files with the same size) and calculates their hashes.
 */
export function findAndHashDuplicates(onProgress: (progress: any) => void) {
  const potentialDuplicates = db.prepare(`
    SELECT file_size, GROUP_CONCAT(id) as ids, GROUP_CONCAT(full_path) as paths
    FROM files
    WHERE sha256_hash IS NULL
    GROUP BY file_size
    HAVING COUNT(*) > 1
  `).all();

  const updateHashStmt = db.prepare('UPDATE files SET sha256_hash = ? WHERE id = ?');

  for (const group of potentialDuplicates) {
    const ids = (group.ids as string).split(',');
    const paths = (group.paths as string).split(',');

    for (let i = 0; i < paths.length; i++) {
      const fileId = parseInt(ids[i], 10);
      const filePath = paths[i];

      const worker = new Worker(path.join(__dirname, '..', 'workers', 'hashing.js'));

      worker.on('message', (message) => {
        if (message.type === 'hash-result') {
          updateHashStmt.run(message.data.hash, message.data.fileId);
          onProgress({ type: 'hashed', fileId: message.data.fileId });
          worker.terminate();
        } else if (message.type === 'hash-error') {
          console.error(`Error hashing file ${filePath}:`, message.data.error);
          onProgress({ type: 'error', fileId: message.data.fileId, error: message.data.error });
          worker.terminate();
        }
      });

      worker.postMessage({ type: 'hash-file', data: { filePath, fileId } });
    }
  }
}

/**
 * Retrieves all sets of duplicate files from the database.
 */
export function getDuplicateFiles() {
  return db.prepare(`
    SELECT sha256_hash, GROUP_CONCAT(full_path) as paths, COUNT(*) as count
    FROM files
    WHERE sha256_hash IS NOT NULL
    GROUP BY sha256_hash
    HAVING COUNT(*) > 1
  `).all();
}

import { parentPort } from 'worker_threads';
import fs from 'fs/promises';
import path from 'path';

async function scan(directoryPath: string, driveName: string) {
  try {
    const dirents = await fs.readdir(directoryPath, { withFileTypes: true });
    for (const dirent of dirents) {
      const fullPath = path.join(directoryPath, dirent.name);
      if (dirent.isDirectory()) {
        await scan(fullPath, driveName);
      } else if (dirent.isFile()) {
        try {
          const stats = await fs.stat(fullPath);
          const fileData = {
            file_name: dirent.name,
            full_path: fullPath,
            file_size: stats.size,
            creation_date: stats.birthtime.toISOString(),
            modified_date: stats.mtime.toISOString(),
            file_type: path.extname(dirent.name) || 'unknown',
            drive_name: driveName,
          };
          parentPort?.postMessage({ type: 'file', data: fileData });
        } catch (err) {
          parentPort?.postMessage({ type: 'error', data: `Could not stat file: ${fullPath}` });
        }
      }
    }
  } catch (err) {
    parentPort?.postMessage({ type: 'error', data: `Error reading directory: ${directoryPath}` });
  }
}

parentPort?.on('message', async (message) => {
  if (message.type === 'start-scan') {
    const { drivePath, driveName } = message.data;
    await scan(drivePath, driveName);
    parentPort?.postMessage({ type: 'done' });
  }
});

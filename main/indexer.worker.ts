import { parentPort, workerData } from 'worker_threads';
import fs from 'fs';
import path from 'path';

const { drivePath, driveName } = workerData;

function walk(dir: string) {
  let results: any[] = [];
  try {
    const list = fs.readdirSync(dir);
    for (let file of list) {
      file = path.resolve(dir, file);
      const stat = fs.statSync(file);
      if (stat && stat.isDirectory()) {
        results = results.concat(walk(file));
      } else {
        const metadata = {
          file_name: path.basename(file),
          full_path: file,
          file_size: stat.size,
          creation_date: stat.birthtimeMs,
          modified_date: stat.mtimeMs,
          last_access_date: stat.atimeMs,
          file_type: path.extname(file).toLowerCase(),
          drive_name: driveName,
          year: new Date(stat.birthtime).getFullYear()
        };
        results.push(metadata);
        
        // Batch send every 100 files to keep main thread responsive
        if (results.length >= 100) {
          parentPort?.postMessage({ type: 'progress', files: results });
          results = [];
        }
      }
    }
  } catch (e) {
    // Skip inaccessible directories
  }
  return results;
}

const finalFiles = walk(drivePath);
parentPort?.postMessage({ type: 'done', files: finalFiles });

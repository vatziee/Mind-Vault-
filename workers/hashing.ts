import { parentPort } from 'worker_threads';
import crypto from 'crypto';
import fs from 'fs';

/**
 * Calculates the SHA-256 hash of a file.
 * @param filePath The path to the file.
 */
function calculateHash(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);

    stream.on('data', (data) => {
      hash.update(data);
    });

    stream.on('end', () => {
      resolve(hash.digest('hex'));
    });

    stream.on('error', (err) => {
      reject(err);
    });
  });
}

parentPort?.on('message', async (message) => {
  if (message.type === 'hash-file') {
    const { filePath, fileId } = message.data;
    try {
      const hash = await calculateHash(filePath);
      parentPort?.postMessage({ type: 'hash-result', data: { fileId, hash } });
    } catch (error) {
      parentPort?.postMessage({ type: 'hash-error', data: { fileId, error: (error as Error).message } });
    }
  }
});


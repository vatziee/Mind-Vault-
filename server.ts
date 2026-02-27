import express from 'express';
import { createServer as createViteServer } from 'vite';
import { DB } from './main/db';
import { execSync } from 'child_process';
import { Worker } from 'worker_threads';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.get('/api/drives', (req, res) => {
    try {
      if (process.platform === 'darwin') {
        const output = execSync('df -H').toString();
        const drives = output.split('\n').filter(line => line.includes('/Volumes/')).map(line => {
          const parts = line.split(/\s+/);
          return {
            name: path.basename(parts[parts.length - 1]),
            path: parts[parts.length - 1],
            total_space: parts[1],
            free_space: parts[3]
          };
        });
        if (drives.length === 0) {
          drives.push({ name: 'Macintosh HD', path: '/', total_space: '1TB', free_space: '500GB' });
        }
        res.json(drives);
      } else {
        // Mock for Linux/Windows preview environments
        res.json([
          { name: 'System Drive', path: '/', total_space: '1TB', free_space: '500GB' },
          { name: 'Project_Drive_01', path: '/mnt/projects', total_space: '4TB', free_space: '2.1TB' }
        ]);
      }
    } catch (e) {
      res.json([{ name: 'System Drive', path: '/', total_space: '1TB', free_space: '500GB' }]);
    }
  });

  app.get('/api/stats', (req, res) => {
    res.json(DB.getStorageStats());
  });

  app.post('/api/scan', (req, res) => {
    const { drivePath, driveName } = req.body;
    
    // Use tsx to run the worker thread in development
    const worker = new Worker(path.join(__dirname, 'main', 'indexer.worker.ts'), {
      workerData: { drivePath, driveName },
      execArgv: ['--import', 'tsx']
    });

    worker.on('message', (msg) => {
      if (msg.type === 'progress' || msg.type === 'done') {
        msg.files.forEach((file: any) => DB.upsertFile(file));
      }
    });

    res.json({ status: 'started' });
  });

  app.get('/api/files', (req, res) => {
    const query = (req.query.q as string) || '';
    res.json(DB.searchFiles(query));
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { Worker } from 'worker_threads';
import { DB } from './db';
import { execSync } from 'child_process';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(createWindow);

// --- IPC Handlers ---

ipcMain.handle('get-drives', async () => {
  // Cross-platform drive detection using system commands
  try {
    if (process.platform === 'darwin') {
      const output = execSync('df -H').toString();
      // Parse df output for external volumes
      return output.split('\n').filter(line => line.includes('/Volumes/')).map(line => {
        const parts = line.split(/\s+/);
        return {
          name: path.basename(parts[parts.length - 1]),
          path: parts[parts.length - 1],
          total_space: parts[1],
          free_space: parts[3]
        };
      });
    } else {
      // Mock for development environment (Linux)
      return [{ name: 'System', path: '/', total_space: '1TB', free_space: '500GB' }];
    }
  } catch (e) {
    return [];
  }
});

ipcMain.handle('scan-drive', (event, { drivePath, driveName }) => {
  const worker = new Worker(path.join(__dirname, 'indexer.worker.js'), {
    workerData: { drivePath, driveName }
  });

  worker.on('message', (msg) => {
    if (msg.type === 'progress' || msg.type === 'done') {
      msg.files.forEach((file: any) => DB.upsertFile(file));
      mainWindow?.webContents.send('scan-progress', { 
        driveName, 
        count: msg.files.length,
        isDone: msg.type === 'done' 
      });
    }
  });
});

ipcMain.handle('search-files', async (event, query) => {
  return DB.searchFiles(query);
});

ipcMain.handle('get-stats', async () => {
  return DB.getStorageStats();
});

ipcMain.handle('find-duplicates', async () => {
  const candidates = DB.getDuplicateCandidates();
  // In a real app, we would spawn a HashWorker here for each candidate
  // For this demo, we'll return the candidates
  return candidates;
});

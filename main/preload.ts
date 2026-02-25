import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('vaultmind', {
  getDrives: () => ipcRenderer.invoke('get-drives'),
  scanDrive: (data: { drivePath: string, driveName: string }) => ipcRenderer.invoke('scan-drive', data),
  searchFiles: (query: string) => ipcRenderer.invoke('search-files', query),
  getStats: () => ipcRenderer.invoke('get-stats'),
  findDuplicates: () => ipcRenderer.invoke('find-duplicates'),
  onScanProgress: (callback: any) => ipcRenderer.on('scan-progress', (_event, value) => callback(value)),
});

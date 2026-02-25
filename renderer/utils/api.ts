// This utility module centralizes all communication with the main process.

// We need to declare the ipcRenderer on the window object
// as it's injected by the preload script.
declare global {
  interface Window {
    ipcRenderer: {
      invoke: (channel: string, ...args: any[]) => Promise<any>;
      on: (channel: string, listener: (event: any, ...args: any[]) => void) => () => void;
    };
  }
}

export const getDrives = () => {
  return window.ipcRenderer.invoke('get-drives');
};

export const scanDrive = (drivePath: string) => {
  return window.ipcRenderer.invoke('scan-drive', drivePath);
};

export const findDuplicates = () => {
  return window.ipcRenderer.invoke('find-duplicates');
};

export const getDuplicates = () => {
  return window.ipcRenderer.invoke('get-duplicates');
};

export const searchFiles = (params: any) => {
  return window.ipcRenderer.invoke('search-files', params);
};

export const onScanProgress = (listener: (event: any, progress: any) => void) => {
  return window.ipcRenderer.on('scan-progress', listener);
};

export const onScanDone = (listener: (event: any, result: any) => void) => {
  return window.ipcRenderer.on('scan-done', listener);
};

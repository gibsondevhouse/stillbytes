import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
    selectDirectory: () => ipcRenderer.invoke('select-directory'),
    scanDirectory: (path: string) => ipcRenderer.invoke('scan-directory', path),
    readImage: (path: string) => ipcRenderer.invoke('read-image', path),
    getAppPath: () => ipcRenderer.invoke('get-app-path'),
    ensureDirectory: (path: string) => ipcRenderer.invoke('ensure-directory', path),
    copyFile: (src: string, dest: string) => ipcRenderer.invoke('copy-file', src, dest),
    getFileStats: (path: string) => ipcRenderer.invoke('get-file-stats', path),
    generateThumbnail: (path: string) => ipcRenderer.invoke('generate-thumbnail', path),
    generateCacheArtifacts: (path: string, cacheDir: string) => ipcRenderer.invoke('generate-cache-artifacts', path, cacheDir),
});

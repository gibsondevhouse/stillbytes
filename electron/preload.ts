import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
    selectDirectory: () => ipcRenderer.invoke('select-directory'),
    scanDirectory: (path: string) => ipcRenderer.invoke('scan-directory', path),
});

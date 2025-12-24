import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let mainWindow: BrowserWindow | null = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
        titleBarStyle: 'hiddenInset',
        backgroundColor: '#1a1a1a',
    });

    if (process.env.VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// IPC Handlers
ipcMain.handle('select-directory', async () => {
    const result = await dialog.showOpenDialog(mainWindow!, {
        properties: ['openDirectory'],
    });
    return result.filePaths[0];
});

ipcMain.handle('scan-directory', async (_event, dirPath: string) => {
    const supportedExtensions = ['.CR2', '.NEF', '.ARW', '.DNG', '.RAF', '.ORF', '.RW2'];
    const files: string[] = [];

    async function walk(dir: string) {
        const list = await fs.promises.readdir(dir);
        for (const file of list) {
            const filePath = path.join(dir, file);
            const stat = await fs.promises.stat(filePath);
            if (stat.isDirectory()) {
                await walk(filePath);
            } else {
                const ext = path.extname(filePath).toUpperCase();
                if (supportedExtensions.includes(ext)) {
                    files.push(filePath);
                }
            }
        }
    }

    try {
        await walk(dirPath);
        return files;
    } catch (error) {
        console.error('Scan failed:', error);
        throw error;
    }
});

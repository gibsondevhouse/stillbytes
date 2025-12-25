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
            preload: path.join(__dirname, 'preload.cjs'),
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
    const supportedExtensions = ['.CR2', '.NEF', '.ARW', '.DNG', '.RAF', '.ORF', '.RW2', '.JPG', '.PNG'];
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

// Native Image Reader (Zero-Copy flow)
// Native Image Reader (Zero-Copy flow)
ipcMain.handle('read-image', async (_event, filePath: string) => {
    try {
        const buffer = await fs.promises.readFile(filePath);
        return buffer;
    } catch (error) {
        console.error('Failed to read image:', error);
        throw error;
    }
});

// Thumbnail Generation (Accelerated)
ipcMain.handle('generate-thumbnail', async (_event, filePath: string) => {
    try {
        const sharp = (await import('sharp')).default;
        const pipeline = sharp(filePath)
            .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 70 });

        const buffer = await pipeline.toBuffer();
        return `data:image/jpeg;base64,${buffer.toString('base64')}`;
    } catch (error) {
        // console.error('Failed to generate thumbnail (likely unsupported RAW format without global libvips):', error);
        // Fallback: Return empty or handle gracefully.
        // For RAWs, sharp often needs extra setup. If it fails, we return null, 
        // and the frontend keeps the placeholder or tries another way.
        return '';
    }
});

// Library Management IPCs
ipcMain.handle('get-app-path', () => {
    return path.join(app.getPath('pictures'), 'Stillbytes');
});

ipcMain.handle('ensure-directory', async (_event, dirPath: string) => {
    await fs.promises.mkdir(dirPath, { recursive: true });
});

ipcMain.handle('copy-file', async (_event, src: string, dest: string) => {
    await fs.promises.copyFile(src, dest);
});

ipcMain.handle('get-file-stats', async (_event, filePath: string) => {
    const stats = await fs.promises.stat(filePath);
    return {
        birthtime: stats.birthtime,
        mtime: stats.mtime,
        size: stats.size
    };
});
// Phase 2: High-Performance Cache Artifact Generation
ipcMain.handle('generate-cache-artifacts', async (_event, filePath: string, cacheDir: string) => {
    try {
        const sharp = (await import('sharp')).default;

        // Ensure the directory exists
        await fs.promises.mkdir(cacheDir, { recursive: true });

        const thumbPath = path.join(cacheDir, 'thumb.jpg');
        const previewPath = path.join(cacheDir, 'preview.jpg');
        const proxyPath = path.join(cacheDir, 'smart_proxy.jpg');

        // Generate Thumb (360px long edge, Q60)
        const thumbPromise = sharp(filePath)
            .resize(360, 360, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 60 })
            .toFile(thumbPath);

        // Generate Preview (1920px long edge, Q80)
        const previewPromise = sharp(filePath)
            .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 80 })
            .toFile(previewPath);

        // Generate Smart Proxy (2560px long edge, Q90)
        const proxyPromise = sharp(filePath)
            .resize(2560, 2560, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 90 })
            .toFile(proxyPath);

        // Run in parallel
        await Promise.all([thumbPromise, previewPromise, proxyPromise]);

        return {
            thumbPath,
            previewPath,
            proxyPath
        };
    } catch (error) {
        console.error('Failed to generate cache artifacts:', error);
        throw error;
    }
});

import React, { useState } from 'react';
import { addPhotos } from '@/services/db';
import { Photo } from '@/types';
import { toast } from 'react-hot-toast';

interface ImportDialogProps {
    onImportComplete: () => void;
    onClose: () => void;
}

export const ImportDialog: React.FC<ImportDialogProps> = ({ onImportComplete, onClose }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [selectedPath, setSelectedPath] = useState<string | null>(null);
    const [foundFiles, setFoundFiles] = useState<{ path: string; file?: File }[]>([]);
    const [copyToLibrary, setCopyToLibrary] = useState(true);
    const [progress, setProgress] = useState<{ current: number; total: number; status: string } | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const isElectron = 'electron' in window;

    const handleSelectFolder = async () => {
        if (isElectron) {
            try {
                const path = await window.electron.selectDirectory();
                if (path) {
                    setSelectedPath(path);
                    setIsScanning(true);
                    const files = await window.electron.scanDirectory(path);
                    setFoundFiles(files.map(f => ({ path: f })));
                }
            } catch (error) {
                toast.error('Failed to select or scan folder');
                console.error(error);
            } finally {
                setIsScanning(false);
            }
        } else {
            // Web Mode Fallback
            fileInputRef.current?.click();
        }
    };

    const handleWebFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setIsScanning(true);
        const supportedExtensions = ['.CR2', '.NEF', '.ARW', '.DNG', '.RAF', '.ORF', '.RW2', '.JPG', '.PNG']; // added JPG/PNG for dev convenience
        const validFiles: { path: string; file: File }[] = [];

        // In web mode, we can't get full path, but we get relative path
        // We act as if we scanned it.
        // We assume the first file's parent folder name is the "path"
        if (files.length > 0) {
            const firstPath = files[0].webkitRelativePath;
            const folderName = firstPath.split('/')[0];
            setSelectedPath(folderName || 'Selected Folder');
        }

        Array.from(files).forEach(file => {
            const ext = '.' + file.name.split('.').pop()?.toUpperCase();
            if (supportedExtensions.includes(ext) && file.name.charAt(0) !== '.') {
                validFiles.push({
                    path: file.webkitRelativePath || file.name,
                    file: file
                });
            }
        });

        setFoundFiles(validFiles);
        setIsScanning(false);
    };

    const handleImport = async () => {
        if (foundFiles.length === 0) return;

        setProgress({ current: 0, total: foundFiles.length, status: 'Initializing import...' });

        try {
            // LIBRARY DESTINATION LOGIC (Native Only)
            let libraryRoot = '';
            if (isElectron && copyToLibrary) {
                libraryRoot = await window.electron.getAppPath();
                await window.electron.ensureDirectory(libraryRoot);
            }

            const photosToImport = [];

            for (let i = 0; i < foundFiles.length; i++) {
                const item = foundFiles[i];
                let finalPath = item.path;
                let finalStats = { size: item.file ? item.file.size : 0, mtime: item.file ? new Date(item.file.lastModified) : new Date() };

                // 1. COPY PHASE (Native)
                if (isElectron && copyToLibrary) {
                    try {
                        const baseName = item.path.split(/[\\/]/).pop() || 'unknown';
                        setProgress({ current: i + 1, total: foundFiles.length, status: `Copying ${baseName}...` });

                        // Get stats for sorting
                        const stats = await window.electron.getFileStats(item.path);
                        finalStats = { size: stats.size, mtime: stats.mtime };

                        // Create date-based folder: YYYY/MM/DD
                        const date = stats.mtime;
                        const year = date.getFullYear().toString();
                        const month = (date.getMonth() + 1).toString().padStart(2, '0');
                        const day = date.getDate().toString().padStart(2, '0');

                        const destDir = `${libraryRoot}\\${year}\\${month}\\${day}`;
                        // We need path.join logic but in renderer we might rely on string manip if 'path' module missing
                        // Assuming Windows backslashes for now based on user context, or simple template literal
                        // Ideally we expose path.join via preload, but string concat is often enough for simple cases if careful
                        // Let's use the OS separator from item.path if possible, or just standard forward slash which usually works in node

                        // To be safe, let's ask main process to ensure dir, we pass string.
                        await window.electron.ensureDirectory(destDir);

                        // File Name
                        const fileName = item.path.split(/[\\/]/).pop() || `photo_${i}.dat`;
                        const destPath = `${destDir}\\${fileName}`;

                        // Copy
                        await window.electron.copyFile(item.path, destPath);
                        finalPath = destPath;
                    } catch (err) {
                        console.error(`Failed to copy ${item.path}`, err);
                        // Continue? Or abort? Let's continue and leave in place
                    }
                } else if (isElectron) {
                    // Index in place: Get real stats
                    const stats = await window.electron.getFileStats(item.path);
                    finalStats = { size: stats.size, mtime: stats.mtime };
                }


                // 2. THUMBNAIL PHASE
                let thumbnail = '';
                if (isElectron) {
                    try {
                        thumbnail = await window.electron.generateThumbnail(finalPath);
                    } catch (e) {
                        console.warn('Failed to generate native thumbnail', e);
                    }
                } else if (item.file && (item.path.toLowerCase().endsWith('.jpg') || item.path.toLowerCase().endsWith('.png'))) {
                    // Web Mode Fallback (Canvas)
                    try {
                        const bitmap = await createImageBitmap(item.file);
                        const canvas = document.createElement('canvas');
                        const scale = Math.min(300 / bitmap.width, 300 / bitmap.height, 1);
                        canvas.width = bitmap.width * scale;
                        canvas.height = bitmap.height * scale;
                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                            ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
                            thumbnail = canvas.toDataURL('image/jpeg', 0.7);
                        }
                    } catch (e) {
                        console.warn('Failed to generate web thumbnail', e);
                    }
                }

                // 3. OBJECT CREATION
                const photo: Omit<Photo, 'id'> = {
                    filePath: finalPath,
                    blob: item.file,
                    fileName: finalPath.split(/[\\/]/).pop() || 'unknown',
                    fileSize: finalStats.size,
                    format: finalPath.split('.').pop()?.toUpperCase() as any || 'DNG',
                    thumbnail: thumbnail,
                    dateTaken: finalStats.mtime,
                    dateImported: new Date(),
                    rating: 0,
                    starred: false,
                    colorLabel: null,
                    flag: null,
                    tags: [],
                    exif: { width: 0, height: 0, camera: 'Imported', iso: 0, aperture: 0, shutterSpeed: 0, focalLength: 0 },
                    editHistory: [],
                    hasUnsavedEdits: false,
                };

                photosToImport.push(photo);

                // Update Progress UI every few items to avoid react thrashing if needed, but per item is fine for < 1000
                if (i % 5 === 0) setProgress({ current: i + 1, total: foundFiles.length, status: `Importing...` });
            }

            // Bulk Add to DB
            setProgress({ current: foundFiles.length, total: foundFiles.length, status: 'Saving to database...' });
            await addPhotos(photosToImport);

            toast.success(`Broadcasting ${photosToImport.length} photos!`);
            onImportComplete();
            onClose();
        } catch (error) {
            toast.error('Import failed');
            console.error(error);
        } finally {
            setProgress(null);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl max-w-lg w-full p-6 shadow-2xl">
                <h2 className="text-2xl font-serif font-bold text-vintage-accent mb-4">Import Photos</h2>

                {/* Hidden Input for Web Mode */}
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    // @ts-ignore - directory support is standard but Typescript complains
                    webkitdirectory=""
                    directory=""
                    multiple
                    onChange={handleWebFileSelect}
                />

                <div className="space-y-6">
                    <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center bg-gray-900/50">
                        {selectedPath ? (
                            <div className="space-y-2">
                                <p className="text-gray-300 font-mono text-sm truncate">{selectedPath}</p>
                                <p className="text-vintage-accent font-bold">
                                    {isScanning ? 'Scanning...' : `${foundFiles.length} photos found`}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-gray-400">Select a folder containing RAW images</p>
                                <button
                                    onClick={handleSelectFolder}
                                    className="bg-vintage-accent hover:opacity-90 text-black px-6 py-2 rounded-full font-bold transition-all"
                                >
                                    Choose Folder
                                </button>
                                {!isElectron && <p className="text-[10px] text-gray-600 uppercase tracking-widest mt-2">Web Dev Mode</p>}
                            </div>
                        )}
                    </div>

                    {isElectron && selectedPath && (
                        <div className="flex items-center space-x-2 px-2">
                            <input
                                type="checkbox"
                                id="copyToLibrary"
                                checked={copyToLibrary}
                                onChange={(e) => setCopyToLibrary(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-vintage-accent focus:ring-offset-gray-900"
                            />
                            <label htmlFor="copyToLibrary" className="text-sm text-gray-300 select-none cursor-pointer">
                                Copy photos to Library <span className="text-gray-500 text-xs ml-1">(~/Pictures/Stillbytes)</span>
                            </label>
                        </div>
                    )}

                    {progress ? (
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-gray-400">
                                <span>{progress.status}</span>
                                <span>{Math.round((progress.current / progress.total) * 100)}%</span>
                            </div>
                            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-vintage-accent transition-all duration-300 ease-out"
                                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleImport}
                                disabled={foundFiles.length === 0 || isScanning}
                                className="bg-white text-black px-6 py-2 rounded-lg font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 transition-all"
                            >
                                Import {foundFiles.length > 0 ? `(${foundFiles.length})` : ''}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

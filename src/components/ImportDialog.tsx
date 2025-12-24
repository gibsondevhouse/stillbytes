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
    const [foundFiles, setFoundFiles] = useState<string[]>([]);

    const handleSelectFolder = async () => {
        try {
            const path = await window.electron.selectDirectory();
            if (path) {
                setSelectedPath(path);
                setIsScanning(true);
                const files = await window.electron.scanDirectory(path);
                setFoundFiles(files);
            }
        } catch (error) {
            toast.error('Failed to select or scan folder');
            console.error(error);
        } finally {
            setIsScanning(false);
        }
    };

    const handleImport = async () => {
        if (foundFiles.length === 0) return;

        try {
            const photosToImport: Omit<Photo, 'id'>[] = foundFiles.map(filePath => ({
                filePath,
                fileName: filePath.split(/[\\/]/).pop() || 'unknown',
                fileSize: 0, // In a real app, we'd get this via fs.stat in main process
                format: filePath.split('.').pop()?.toUpperCase() as any || 'DNG',
                thumbnail: '', // Generated later
                dateTaken: new Date(),
                dateImported: new Date(),
                rating: 0,
                starred: false,
                tags: [],
                exif: { width: 0, height: 0 },
                editHistory: [],
                hasUnsavedEdits: false,
            }));

            await addPhotos(photosToImport);
            toast.success(`Successfully imported ${photosToImport.length} photos!`);
            onImportComplete();
            onClose();
        } catch (error) {
            toast.error('Import failed');
            console.error(error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl max-w-lg w-full p-6 shadow-2xl">
                <h2 className="text-2xl font-serif font-bold text-vintage-accent mb-4">Import Photos</h2>

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
                            </div>
                        )}
                    </div>

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
                </div>
            </div>
        </div>
    );
};

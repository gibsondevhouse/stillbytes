import React, { useRef, useState, useEffect } from 'react';
import { Photo, EditOperation } from '@/types';
import { AdjustmentPanel } from './AdjustmentPanel';
import { BeforeAfterToggle } from './BeforeAfterToggle';
import { Filmstrip } from './Filmstrip';
import { ArrowLeft, Maximize2, ChevronLeft, ChevronRight, X, Minimize2, PanelRightClose, PanelRightOpen, Image as ImageIcon, Crop } from 'lucide-react';
import toast from 'react-hot-toast';
import { useEditing } from '@/hooks/useEditing';
import { useShortcuts } from '@/hooks/useShortcuts';
import { useCanvasEditor } from '@/hooks/useCanvasEditor';

interface DetailViewProps {
    photo: Photo;
    onClose: () => void;
    onUpdatePhoto: (id: number, changes: Partial<Photo>) => void;
    onNextPhoto: () => void;
    onPrevPhoto: () => void;
    onSelectPhoto: (photo: Photo) => void;
}

export const DetailView: React.FC<DetailViewProps> = ({ photo, onClose, onUpdatePhoto, onNextPhoto, onPrevPhoto, onSelectPhoto }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [zoom, setZoom] = useState(1);
    const [isComparing, setIsComparing] = useState(false);
    const [isPanelOpen, setIsPanelOpen] = useState(true);
    const [isCropping, setIsCropping] = useState(false);

    // Web Mode: Create ObjectURL for blob if available
    const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

    useEffect(() => {
        let activeUrl: string | undefined;

        const load = async () => {
            if (photo.blob) {
                // WEB MODE: Use in-memory blob
                activeUrl = URL.createObjectURL(photo.blob);
                setImageUrl(activeUrl);
            } else if ('electron' in window) {
                // NATIVE MODE: Read from disk without importing
                try {
                    const buffer = await window.electron.readImage(photo.filePath);
                    const blob = new Blob([buffer]);
                    activeUrl = URL.createObjectURL(blob);
                    setImageUrl(activeUrl);
                } catch (e) {
                    console.error('Failed to load native image', e);
                    toast.error('Could not load image from disk');
                }
            } else {
                // Fallback / Static assets
                setImageUrl(photo.filePath);
            }
        };

        load();

        return () => {
            if (activeUrl) URL.revokeObjectURL(activeUrl);
        };
    }, [photo]);

    // Editing State (The "Brain")
    const {
        operations,
        setOperations,
        hasUnsavedChanges
    } = useEditing(photo.editHistory || []);

    // Filter out crop operation for display when cropping
    const displayOperations = React.useMemo(() => {
        return isCropping ? operations.filter(op => op.type !== 'crop_rotate') : operations;
    }, [operations, isCropping]);

    // Canvas Logic (The "Renderer")
    const { isProcessing, exportImage } = useCanvasEditor(
        canvasRef,
        imageUrl,
        displayOperations,
        isComparing
    );

    // ... (Sync state effect - keeping existing)

    const handleApplyCrop = (crop: { x: number, y: number, width: number, height: number }, rotation: number) => {
        // Remove existing crop
        const newOps = operations.filter(op => op.type !== 'crop_rotate');
        // Add new
        newOps.push({
            id: crypto.randomUUID(),
            type: 'crop_rotate',
            timestamp: new Date(),
            version: 1,
            parameters: { crop, rotation }
        });
        setOperations(newOps);
    };

    // Helper to toggle crop mode
    const toggleCrop = () => {
        setIsCropping(!isCropping);
        // If entering crop mode, reset zoom for better UX?
        if (!isCropping) setZoom(0.8);
        else setZoom(1);
    };

    // Sync state with parent (db persistence)
    // We only update the parent when operations change
    useEffect(() => {
        if (operations !== photo.editHistory) {
            onUpdatePhoto(photo.id!, { editHistory: operations, hasUnsavedEdits: hasUnsavedChanges });
        }
    }, [operations, hasUnsavedChanges, photo.id]);

    const handleExport = async () => {
        try {
            await exportImage(photo.fileName);
            toast.success('Exported ' + photo.fileName);
        } catch (err) {
            toast.error('Failed to export photo');
        }
    };

    const handleReset = () => {
        setOperations([]);
        toast.success('Edits reset to original');
    };

    // Keyboard Shortcuts
    useShortcuts({
        onRate: (rating) => onUpdatePhoto(photo.id!, { rating }),
        onFlag: (flag) => onUpdatePhoto(photo.id!, { flag }),
        onNext: onNextPhoto,
        onPrev: onPrevPhoto,
        onClose: onClose,
        onCompare: setIsComparing,
        onEnter: () => { }, // Maybe open loupe if we had one, but currently we are in loupe
    }, {
        autoAdvance: 'capsLock'
    });

    // Handle Tab manually as it's UI specific and not in standard shortcut manager yet?
    // Actually we can add it or keep local listener. Tab is tricky because it handles focus.
    // Keeping local listener for Tab for now as useShortcuts might need an update for it.
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                setIsPanelOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);


    return (
        <div className="flex h-full bg-[#111] overflow-hidden animate-in fade-in duration-300">
            {/* Main Content Column */}
            <div className="flex-1 flex flex-col relative min-w-0">
                {/* Header */}
                <header className="h-11 border-b border-pro-border flex items-center justify-between px-4 bg-pro-panel z-10">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={onClose}
                            className="p-1.5 hover:bg-pro-border rounded-sm text-gray-400 hover:text-white transition-colors"
                            title="Back to Gallery (Esc)"
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-gray-200 truncate max-w-[200px]">{photo.fileName}</span>
                            <span className="text-[9px] text-gray-500 uppercase font-mono tracking-wider">{photo.format} &bull; {photo.exif.camera}</span>
                        </div>
                        {isComparing && (
                            <span className="bg-pro-accent text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm animate-pulse">
                                ORIGINAL
                            </span>
                        )}
                    </div>

                    <div className="flex items-center space-x-2">
                        <BeforeAfterToggle
                            isComparing={isComparing}
                            onToggle={setIsComparing}
                        />
                        <div className="w-px h-4 bg-gray-800 mx-2"></div>
                        <div className="flex items-center bg-black/30 rounded-lg p-1">
                            <button onClick={() => setZoom(Math.max(0.1, zoom - 0.1))} className="p-1 px-2 text-gray-500 hover:text-white">-</button>
                            <span className="text-[10px] font-mono w-10 text-center text-gray-300">{Math.round(zoom * 100)}%</span>
                            <button onClick={() => setZoom(Math.min(2, zoom + 0.1))} className="p-1 px-2 text-gray-500 hover:text-white">+</button>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button
                            onClick={toggleCrop}
                            className={`p-2 rounded-sm transition-colors bg-pro-card text-gray-300 hover:bg-pro-border ${isCropping ? 'ring-1 ring-pro-accent text-pro-accent' : ''}`}
                            title="Crop & Rotate (C)"
                        >
                            <Crop size={16} />
                        </button>
                        <button
                            onClick={() => setIsPanelOpen(!isPanelOpen)}
                            className={`p-2 rounded-sm transition-colors ${!isPanelOpen ? 'bg-pro-accent text-white' : 'bg-pro-card text-gray-300 hover:bg-pro-border'}`}
                            title="Toggle Side Panel (Tab)"
                        >
                            {isPanelOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
                        </button>
                    </div>
                </header>

                {/* Crop & Rotate Controls Overlay */}
                {isCropping && (
                    <div className="absolute top-16 left-6 z-20 bg-[#222] border border-gray-700 p-2 rounded-lg shadow-xl flex flex-col space-y-2 animate-in slide-in-from-left-2">
                        <span className="text-[10px] uppercase font-bold text-gray-500">Aspect Ratio</span>
                        <div className="grid grid-cols-2 gap-1 text-[10px]">
                            <button onClick={() => handleApplyCrop({ x: 0, y: 0, width: 1, height: 1 }, 0)} className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded">Original</button>
                            <button onClick={() => handleApplyCrop({ x: 0.125, y: 0, width: 0.75, height: 1 }, 0)} className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded">3:4</button>
                            <button onClick={() => handleApplyCrop({ x: 0, y: 0.125, width: 1, height: 0.75 }, 0)} className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded">4:3</button>
                            <button onClick={() => handleApplyCrop({ x: 0, y: 0.21875, width: 1, height: 0.5625 }, 0)} className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded">16:9</button>
                            <button onClick={() => handleApplyCrop({ x: 0.25, y: 0.25, width: 0.5, height: 0.5 }, 0)} className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded">1:1</button>
                        </div>
                        <div className="h-px bg-gray-700 my-1" />
                        <span className="text-[10px] uppercase font-bold text-gray-500">Rotation</span>
                        <div className="flex space-x-1">
                            <button onClick={() => handleApplyCrop({ x: 0, y: 0, width: 1, height: 1 }, 90)} className="bg-gray-700 hover:bg-gray-600 p-1 rounded"><ImageIcon size={12} className="rotate-90" /></button>
                            <button onClick={() => handleApplyCrop({ x: 0, y: 0, width: 1, height: 1 }, -90)} className="bg-gray-700 hover:bg-gray-600 p-1 rounded"><ImageIcon size={12} className="-rotate-90" /></button>
                        </div>
                    </div>
                )}

                {/* Canvas Area */}
                <main className="flex-1 relative flex items-center justify-center p-8 overflow-hidden bg-pro-bg select-none">
                    <div
                        className="relative shadow-2xl border border-pro-border transition-transform duration-200 ease-out will-change-transform"
                        style={{ transform: `scale(${zoom})` }}
                    >
                        <canvas
                            ref={canvasRef}
                            className="max-w-full max-h-full block"
                        />
                        {isProcessing && (
                            <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                <div className="w-1 h-1 bg-pro-accent animate-ping rounded-full"></div>
                            </div>
                        )}
                    </div>

                    {/* Compare Hint Overlay */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none opacity-50 text-[10px] uppercase font-mono tracking-widest text-gray-600">
                        Hold \ to Compare
                    </div>
                </main>

                {/* Footer Info */}
                <footer className="h-8 border-t border-pro-border bg-pro-panel flex items-center px-4 justify-between z-10 text-[10px] text-gray-500 font-mono">
                    <div className="flex space-x-4">
                        <span>ISO {photo.exif.iso}</span>
                        <span>{photo.exif.shutterSpeed}s</span>
                        <span>{photo.exif.aperture}</span>
                        <span>{photo.exif.focalLength}mm</span>
                    </div>
                    <div>
                        {photo.exif.width} x {photo.exif.height}
                    </div>
                </footer>

                {/* Filmstrip */}
                <Filmstrip
                    activePhotoId={photo.id}
                    onSelectPhoto={onSelectPhoto}
                />
            </div>

            {/* Adjustments Sidebar */}
            {isPanelOpen && (
                <div className="w-[320px] border-l border-pro-border flex-shrink-0 bg-pro-panel flex flex-col transition-all">
                    <AdjustmentPanel
                        operations={operations}
                        onChange={setOperations}
                        onReset={handleReset}
                        onExport={handleExport}
                    />
                </div>
            )}
        </div>
    );
};

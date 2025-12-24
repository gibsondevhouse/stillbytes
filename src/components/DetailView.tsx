import React, { useEffect, useRef, useState } from 'react';
import { Photo, EditOperation } from '@/types';
import { imageEditor } from '@/services/imageEditor';
import { AdjustmentPanel } from './AdjustmentPanel';
import { ArrowLeft, Maximize2, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface DetailViewProps {
    photo: Photo;
    onClose: () => void;
    onUpdatePhoto: (id: number, changes: Partial<Photo>) => void;
    onNextPhoto: () => void;
    onPrevPhoto: () => void;
}

export const DetailView: React.FC<DetailViewProps> = ({ photo, onClose, onUpdatePhoto, onNextPhoto, onPrevPhoto }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [editStack, setEditStack] = useState<EditOperation[]>(photo.editHistory || []);
    const [isProcessing, setIsProcessing] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [isComparing, setIsComparing] = useState(false); // Toggle for Before/After

    // Initialize image editor and render
    useEffect(() => {
        let isMounted = true;

        async function initAndRender() {
            if (!photo.thumbnail) return;

            const img = new Image();
            img.src = photo.thumbnail;
            await new Promise((resolve) => (img.onload = resolve));

            if (!isMounted) return;

            await imageEditor.init(img);
            render(editStack);
        }

        initAndRender();
        return () => { isMounted = false; };
    }, [photo.id]);

    // Handle render updates
    const render = (ops: EditOperation[]) => {
        if (!canvasRef.current) return;

        setIsProcessing(true);
        requestAnimationFrame(() => {
            // If comparing, render with NO operations
            imageEditor.applyOperations(isComparing ? [] : ops, canvasRef.current!);
            setIsProcessing(false);
        });
    };

    // Re-render when edits or compare state changes
    useEffect(() => {
        render(editStack);
    }, [editStack, isComparing]);

    const handleEditChange = (newStack: EditOperation[]) => {
        setEditStack(newStack);
        onUpdatePhoto(photo.id!, { editHistory: newStack, hasUnsavedEdits: true });
    };

    const handleReset = () => {
        handleEditChange([]);
        toast.success('Edits reset to original');
    };

    const handleExport = async () => {
        if (!canvasRef.current) return;
        try {
            const blob = await imageEditor.exportCanvas(canvasRef.current);
            if (!blob) throw new Error('Export failed');

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `stillbytes_${photo.fileName}.jpg`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success(`Exported ${photo.fileName}`);
        } catch (err) {
            toast.error('Failed to export photo');
        }
    };

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === '\\') setIsComparing(true);
            if (e.key === 'ArrowRight') onNextPhoto();
            if (e.key === 'ArrowLeft') onPrevPhoto();
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === '\\') setIsComparing(false);
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [onClose]);


    return (
        <div className="flex h-full bg-[#111] overflow-hidden animate-in fade-in duration-300">
            {/* Main Canvas Area */}
            <div className="flex-1 flex flex-col relative text-gray-300">
                <header className="h-14 border-b border-gray-800 flex items-center justify-between px-6 bg-[#1a1a1a]">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                            title="Back to Gallery (Esc)"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-200 truncate max-w-[200px]">{photo.fileName}</span>
                            <span className="text-[10px] text-gray-500 uppercase font-mono">{photo.format} &bull; {photo.exif.camera}</span>
                        </div>
                        {isComparing && (
                            <span className="bg-vintage-accent text-black text-[10px] font-bold px-2 py-0.5 rounded animate-pulse">
                                ORIGINAL
                            </span>
                        )}
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            className={`p-2 rounded-lg transition-colors ${isComparing ? 'bg-vintage-accent text-black' : 'hover:bg-gray-800 text-gray-500 hover:text-white'}`}
                            onMouseDown={() => setIsComparing(true)}
                            onMouseUp={() => setIsComparing(false)}
                            onMouseLeave={() => setIsComparing(false)}
                            title="Hold to Compare (\)"
                        >
                            {isComparing ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        <button
                            onClick={onPrevPhoto}
                            className="p-2 hover:bg-gray-800 rounded-lg text-gray-500 hover:text-white transition-colors"
                            title="Previous (Left Arrow)"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={onNextPhoto}
                            className="p-2 hover:bg-gray-800 rounded-lg text-gray-500 hover:text-white transition-colors"
                            title="Next (Right Arrow)"
                        >
                            <ChevronRight size={18} />
                        </button>
                        <div className="w-px h-4 bg-gray-800 mx-2"></div>
                        <div className="flex items-center bg-black/30 rounded-lg p-1">
                            <button onClick={() => setZoom(Math.max(0.1, zoom - 0.1))} className="p-1 px-2 text-gray-500 hover:text-white">-</button>
                            <span className="text-[10px] font-mono w-10 text-center text-gray-300">{Math.round(zoom * 100)}%</span>
                            <button onClick={() => setZoom(Math.min(2, zoom + 0.1))} className="p-1 px-2 text-gray-500 hover:text-white">+</button>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button className="p-2 bg-gray-800 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors">
                            <Maximize2 size={16} />
                        </button>
                    </div>
                </header>

                <main className="flex-1 relative flex items-center justify-center p-12 overflow-hidden bg-[radial-gradient(#222_1px,transparent_1px)] [background-size:20px_20px] select-none">
                    <div
                        className="relative shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-gray-800 transition-transform duration-200 ease-out will-change-transform"
                        style={{ transform: `scale(${zoom})` }}
                    >
                        <canvas
                            ref={canvasRef}
                            className="max-w-full max-h-full block"
                        />
                        {isProcessing && (
                            <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                <div className="w-1 h-1 bg-vintage-accent animate-ping rounded-full"></div>
                            </div>
                        )}
                    </div>

                    {/* Compare Hint Overlay */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none opacity-50 text-[10px] uppercase font-mono tracking-widest text-gray-600">
                        Hold \ to Compare
                    </div>
                </main>

                <footer className="h-10 border-t border-gray-800 bg-[#1a1a1a] flex items-center px-4 justify-between">
                    <div className="flex space-x-4">
                        <span className="text-[10px] text-gray-500 font-mono">ISO {photo.exif.iso} &bull; {photo.exif.shutterSpeed}s &bull; {photo.exif.aperture}</span>
                    </div>
                    <div className="text-[10px] text-gray-600 font-mono">
                        {photo.exif.width} x {photo.exif.height} PX
                    </div>
                </footer>
            </div>

            {/* Adjustments Sidebar */}
            <AdjustmentPanel
                operations={editStack}
                onChange={handleEditChange}
                onReset={handleReset}
                onExport={handleExport}
            />
        </div>
    );
};

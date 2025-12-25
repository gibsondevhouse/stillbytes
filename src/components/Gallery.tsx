import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, getAllVirtualCopies, updateVirtualCopy } from '@/services/db';
import { PhotoCard } from './PhotoCard';
import { MasterPhoto, VirtualCopy } from '@/types';
import { Grid, List, Filter, Star, Flag, X } from 'lucide-react';
import { useShortcuts } from '@/hooks/useShortcuts';
import toast from 'react-hot-toast';

type VirtualCopyFull = VirtualCopy & { master: MasterPhoto };

interface GalleryProps {
    onSelectPhoto: (photo: VirtualCopyFull) => void;
    onImportClick: () => void;
}

export const Gallery: React.FC<GalleryProps> = ({ onSelectPhoto, onImportClick }) => {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<{ rating?: number; flag?: 'pick' | 'reject' | null }>({});

    // Use a custom live query that handles Virtual Copies
    const virtualCopies = useLiveQuery(async () => {
        const all = await getAllVirtualCopies();
        // Simple client-side filtering for now
        return all.filter(p => {
            if (filters.rating !== undefined && p.rating < filters.rating) return false;
            if (filters.flag !== undefined && p.flag !== filters.flag) return false;
            return true;
        }).sort((a, b) => b.master.dateTaken.getTime() - a.master.dateTaken.getTime());
    }, [filters]);

    const handleDelete = async () => {
        if (selectedIds.size === 0) return;

        if (!confirm(`Are you sure you want to remove ${selectedIds.size} photo version${selectedIds.size > 1 ? 's' : ''} from the library?`)) {
            return;
        }

        try {
            const idsToDelete = Array.from(selectedIds);
            // In Phase 2, we usually delete the Master (and all copies) or just the virtual copy.
            // For now, let's delete the Master associated with these copies if they are the last copy.
            for (const id of idsToDelete) {
                const copy = virtualCopies?.find(c => c.id === id);
                if (copy) {
                    await db.virtualCopies.delete(id);
                }
            }

            // Clear selection
            setSelectedIds(new Set());
            toast.success(`Removed ${idsToDelete.length} items`);
        } catch (error) {
            console.error('Failed to delete photos:', error);
            toast.error('Failed to delete photos');
        }
    };

    // Keyboard Shortcuts
    useShortcuts({
        onRate: async (rating) => {
            if (selectedIds.size === 0) return;
            await Promise.all(
                Array.from(selectedIds).map(id => updateVirtualCopy(id, { rating: rating as any }))
            );
            toast.success(`Rated ${selectedIds.size} photo${selectedIds.size > 1 ? 's' : ''}`);
        },
        onFlag: async (flag) => {
            if (selectedIds.size === 0) return;
            await Promise.all(
                Array.from(selectedIds).map(id => updateVirtualCopy(id, { flag: flag as any }))
            );
            const label = flag === 'pick' ? 'Picked' : flag === 'reject' ? 'Rejected' : 'Unflagged';
            toast.success(`${label} ${selectedIds.size} photo${selectedIds.size > 1 ? 's' : ''}`);
        },
        onNext: () => {
            if (selectedIds.size !== 1 || !virtualCopies) return;
            const currentId = selectedIds.values().next().value;
            const index = virtualCopies.findIndex(p => p.id === currentId);
            if (index !== -1 && index < virtualCopies.length - 1) {
                const nextId = virtualCopies[index + 1].id;
                if (nextId) setSelectedIds(new Set([nextId]));
            }
        },
        onPrev: () => {
            if (selectedIds.size !== 1 || !virtualCopies) return;
            const currentId = selectedIds.values().next().value;
            const index = virtualCopies.findIndex(p => p.id === currentId);
            if (index > 0) {
                const prevId = virtualCopies[index - 1].id;
                if (prevId) setSelectedIds(new Set([prevId]));
            }
        },
        onEnter: () => {
            if (selectedIds.size === 1 && virtualCopies) {
                const currentId = selectedIds.values().next().value;
                const photo = virtualCopies.find(p => p.id === currentId);
                if (photo) onSelectPhoto(photo);
            }
        },
        onDelete: handleDelete,
        onDevelop: () => {
            if (selectedIds.size === 1 && virtualCopies) {
                const currentId = selectedIds.values().next().value;
                const photo = virtualCopies.find(p => p.id === currentId);
                if (photo) onSelectPhoto(photo);
            }
        },
        onCompare: () => { } // No compare in Grid yet
    });

    const handlePhotoClick = (photo: VirtualCopyFull, metaKey: boolean, shiftKey: boolean) => {
        if (!photo.id) return;
        const newSelected = new Set(metaKey ? selectedIds : []);

        if (shiftKey && virtualCopies && selectedIds.size > 0) {
            // Simple range selection
            const lastSelectedId = Array.from(selectedIds).pop();
            const lastIndex = virtualCopies.findIndex(p => p.id === lastSelectedId);
            const currentIndex = virtualCopies.findIndex(p => p.id === photo.id);

            if (lastIndex !== -1 && currentIndex !== -1) {
                const start = Math.min(lastIndex, currentIndex);
                const end = Math.max(lastIndex, currentIndex);
                const range = virtualCopies.slice(start, end + 1);
                range.forEach(p => { if (p.id) newSelected.add(p.id) });
                setSelectedIds(newSelected);
                return;
            }
        }

        if (metaKey) {
            if (newSelected.has(photo.id)) {
                newSelected.delete(photo.id);
            } else {
                newSelected.add(photo.id);
            }
        } else {
            newSelected.add(photo.id);
        }

        setSelectedIds(newSelected);
    };

    if (!virtualCopies) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-vintage-accent"></div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-pro-bg">
            {/* Toolbar */}
            <header className="flex flex-col border-b border-pro-border bg-pro-panel">
                <div className="h-11 flex items-center justify-between px-4">
                    <div className="flex items-center space-x-4">
                        <h2 className="text-xs font-bold text-gray-300 uppercase tracking-widest">Gallery</h2>
                        <div className="flex items-center bg-black/30 rounded-sm p-0.5">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1 rounded-sm ${viewMode === 'grid' ? 'bg-pro-border text-pro-accent' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <Grid size={14} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-1 rounded-sm ${viewMode === 'list' ? 'bg-pro-border text-pro-accent' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <List size={14} />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        {selectedIds.size > 0 && (
                            <button
                                onClick={handleDelete}
                                className="px-3 py-1 rounded-sm bg-red-900/30 text-red-400 hover:bg-red-900/50 hover:text-red-300 transition-colors text-[10px] font-medium uppercase mr-2"
                            >
                                Remove ({selectedIds.size})
                            </button>
                        )}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center space-x-2 px-3 py-1 rounded-sm transition-colors group ${showFilters ? 'bg-pro-border text-pro-accent' : 'bg-pro-card text-gray-400 hover:bg-pro-border'}`}
                        >
                            <Filter size={12} className={showFilters ? 'text-pro-accent' : 'group-hover:text-pro-accent'} />
                            <span className="text-[10px] font-medium uppercase">Filter</span>
                        </button>
                    </div>
                </div>

                {/* Filter Bar */}
                {showFilters && (
                    <div className="h-12 border-t border-pro-border bg-pro-panel px-6 flex items-center space-x-6 animate-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center space-x-2">
                            <span className="text-[10px] uppercase font-bold text-gray-500">Rating</span>
                            <div className="flex space-x-1">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                        key={star}
                                        onClick={() => setFilters({ ...filters, rating: filters.rating === star ? undefined : star })}
                                        className={`w-6 h-6 rounded flex items-center justify-center transition-all ${filters.rating && filters.rating >= star ? 'text-yellow-500' : 'text-gray-600 hover:text-gray-400'}`}
                                    >
                                        <Star size={14} fill={filters.rating && filters.rating >= star ? "currentColor" : "none"} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="w-px h-6 bg-gray-700" />

                        <div className="flex items-center space-x-2">
                            <span className="text-[10px] uppercase font-bold text-gray-500">Flag</span>
                            <div className="flex space-x-1">
                                <button
                                    onClick={() => setFilters({ ...filters, flag: filters.flag === 'pick' ? undefined : 'pick' })}
                                    className={`p-1.5 rounded ${filters.flag === 'pick' ? 'bg-green-900/50 text-green-400 border border-green-500/30' : 'text-gray-500 hover:text-gray-300'}`}
                                    title="Picked"
                                >
                                    <Flag size={14} fill={filters.flag === 'pick' ? "currentColor" : "none"} />
                                </button>
                                <button
                                    onClick={() => setFilters({ ...filters, flag: filters.flag === 'reject' ? undefined : 'reject' })}
                                    className={`p-1.5 rounded ${filters.flag === 'reject' ? 'bg-red-900/50 text-red-500 border border-red-500/30' : 'text-gray-500 hover:text-gray-300'}`}
                                    title="Rejected"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>

                        {(filters.rating !== undefined || filters.flag !== undefined) && (
                            <button
                                onClick={() => setFilters({})}
                                className="text-[10px] text-red-400 hover:text-red-300 underline ml-auto"
                            >
                                Clear All
                            </button>
                        )}
                    </div>
                )}
            </header>

            {/* Grid Area */}
            <main className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-800">
                {virtualCopies.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                        <div className="p-8 bg-[#1a1a1a] border border-gray-800 rounded-2xl border-dashed">
                            <p className="text-gray-400 mb-4">No photos in library yet.</p>
                            <button
                                onClick={onImportClick}
                                className="bg-pro-accent hover:opacity-90 text-white px-6 py-2 rounded-sm font-bold shadow-sm transition-all"
                            >
                                Start Importing
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-4 items-start">
                        {virtualCopies.map((photo) => (
                            <PhotoCard
                                key={photo.id}
                                photo={photo as any}
                                selected={selectedIds.has(photo.id)}
                                onClick={handlePhotoClick as any}
                                onDoubleClick={onSelectPhoto as any}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* StatusBar */}
            <footer className="h-8 border-t border-pro-border bg-pro-panel flex items-center px-4 justify-between">
                <span className="text-[10px] font-mono text-gray-500 uppercase">
                    {virtualCopies.length} item{virtualCopies.length !== 1 ? 's' : ''} in library
                    {selectedIds.size > 0 && ` • ${selectedIds.size} selected`}
                </span>
                <div className="flex items-center space-x-4">
                    <span className="text-[10px] text-gray-600">Storage usage: {(virtualCopies.length * 0.5).toFixed(1)}MB (Estimated)</span>
                </div>
            </footer>
        </div>
    );
};


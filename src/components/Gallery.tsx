import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/services/db';
import { PhotoCard } from './PhotoCard';
import { Photo } from '@/types';
import { Grid, List, Filter } from 'lucide-react';

interface GalleryProps {
    onSelectPhoto: (photo: Photo) => void;
    onImportClick: () => void;
}

export const Gallery: React.FC<GalleryProps> = ({ onSelectPhoto, onImportClick }) => {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const photos = useLiveQuery(() => db.photos.orderBy('dateTaken').reverse().toArray());

    if (!photos) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-vintage-accent"></div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-[#151515]">
            {/* Toolbar */}
            <header className="h-14 border-b border-gray-800 flex items-center justify-between px-6 bg-[#1a1a1a]">
                <div className="flex items-center space-x-6">
                    <h2 className="text-lg font-bold text-gray-200 uppercase tracking-widest text-sm">Gallery</h2>
                    <div className="flex items-center bg-black/30 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-[#333] text-vintage-accent' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <Grid size={16} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-[#333] text-vintage-accent' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <List size={16} />
                        </button>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <button className="flex items-center space-x-2 px-3 py-1.5 bg-[#252525] hover:bg-[#333] rounded-lg transition-colors text-gray-400 group">
                        <Filter size={14} className="group-hover:text-vintage-accent" />
                        <span className="text-xs font-medium">Filter</span>
                    </button>
                    <button
                        onClick={onImportClick}
                        className="bg-vintage-accent hover:opacity-90 text-black px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-lg"
                    >
                        + Import
                    </button>
                </div>
            </header>

            {/* Grid Area */}
            <main className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-800">
                {photos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                        <div className="p-8 bg-[#1a1a1a] border border-gray-800 rounded-2xl border-dashed">
                            <p className="text-gray-400 mb-4">No photos in library yet.</p>
                            <button
                                onClick={onImportClick}
                                className="bg-vintage-accent hover:opacity-90 text-black px-6 py-2 rounded-full font-bold shadow-lg transition-all"
                            >
                                Start Importing
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 items-start">
                        {photos.map((photo) => (
                            <PhotoCard
                                key={photo.id}
                                photo={photo}
                                onClick={onSelectPhoto}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* StatusBar */}
            <footer className="h-8 border-t border-gray-800 bg-[#1a1a1a] flex items-center px-4 justify-between">
                <span className="text-[10px] font-mono text-gray-500 uppercase">
                    {photos.length} item{photos.length !== 1 ? 's' : ''} in library
                </span>
                <div className="flex items-center space-x-4">
                    <span className="text-[10px] text-gray-600">Storage usage: {(photos.length * 0.5).toFixed(1)}MB (Estimated)</span>
                </div>
            </footer>
        </div>
    );
};

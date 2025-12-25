import React, { useRef, useEffect } from 'react';
import { Photo } from '@/types';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/services/db';

interface FilmstripProps {
    currentUserId?: number; // Not used yet
    activePhotoId?: number;
    onSelectPhoto: (photo: Photo) => void;
}

export const Filmstrip: React.FC<FilmstripProps> = ({ activePhotoId, onSelectPhoto }) => {
    const photos = useLiveQuery(() => db.photos.orderBy('dateTaken').reverse().toArray());
    const scrollRef = useRef<HTMLDivElement>(null);
    const activeItemRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to active photo
    useEffect(() => {
        if (activeItemRef.current && scrollRef.current) {
            activeItemRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
    }, [activePhotoId]);

    if (!photos) return null;

    return (
        <div className="h-28 bg-[#1a1a1a] border-t border-gray-800 flex flex-col">
            <div className="flex items-center justify-between px-4 py-1 bg-black/20 text-[10px] text-gray-500 font-mono uppercase tracking-wider">
                <span>Filmstrip ({photos.length})</span>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 overflow-x-auto flex items-center p-2 space-x-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
            >
                {photos.map(photo => (
                    <div
                        key={photo.id}
                        ref={photo.id === activePhotoId ? activeItemRef : null}
                        onClick={() => onSelectPhoto(photo)}
                        className={`flex-shrink-0 cursor-pointer transition-all duration-200 relative group
                            ${photo.id === activePhotoId
                                ? 'ring-2 ring-vintage-accent ring-offset-1 ring-offset-[#1a1a1a] opacity-100 scale-105'
                                : 'opacity-60 hover:opacity-100'}`}
                        style={{ width: '80px', height: '60px' }}
                    >
                        {photo.thumbnail ? (
                            <img
                                src={photo.thumbnail}
                                alt={photo.fileName}
                                className="w-full h-full object-cover rounded-sm"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-800 flex items-center justify-center text-[8px] text-gray-500 rounded-sm">
                                No Thumb
                            </div>
                        )}

                        {/* Tiny Indicators */}
                        <div className="absolute bottom-0 right-0 left-0 h-1 flex justify-end px-1 space-x-1 translate-y-2 group-hover:translate-y-0 transition-transform">
                            {photo.rating > 0 && (
                                <span className={`text-[6px] ${photo.rating >= 4 ? 'text-yellow-500' : 'text-white'}`}>
                                    {'★'.repeat(photo.rating)}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

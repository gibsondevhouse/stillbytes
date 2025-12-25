import React, { useRef, useEffect, useState } from 'react';
import { MasterPhoto, VirtualCopy } from '@/types';
import { useLiveQuery } from 'dexie-react-hooks';
import { getAllVirtualCopies } from '@/services/db';

type VirtualCopyFull = VirtualCopy & { master: MasterPhoto };

interface FilmstripProps {
    activePhotoId?: string;
    onSelectPhoto: (photo: VirtualCopyFull) => void;
}

const FilmstripItem: React.FC<{ photo: VirtualCopyFull; isActive: boolean; onClick: () => void }> = ({ photo, isActive, onClick }) => {
    const [thumbUrl, setThumbUrl] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        async function loadThumb() {
            if (photo.master.thumbnailPath) {
                try {
                    const buffer = await window.electron.readImage(photo.master.thumbnailPath);
                    if (isMounted) {
                        const blob = new Blob([buffer], { type: 'image/jpeg' });
                        setThumbUrl(URL.createObjectURL(blob));
                    }
                } catch (e) {
                    console.error('Filmstrip thumb load fail', e);
                }
            }
        }
        loadThumb();
        return () => {
            isMounted = false;
            if (thumbUrl) URL.revokeObjectURL(thumbUrl);
        };
    }, [photo.master.thumbnailPath]);

    return (
        <div
            onClick={onClick}
            className={`flex-shrink-0 cursor-pointer transition-all duration-200 relative group
                ${isActive
                    ? 'ring-2 ring-pro-accent ring-offset-1 ring-offset-pro-panel opacity-100 scale-105'
                    : 'opacity-60 hover:opacity-100'}`}
            style={{ width: '80px', height: '60px' }}
        >
            {thumbUrl ? (
                <img
                    src={thumbUrl}
                    alt={photo.master.fileName}
                    className="w-full h-full object-cover rounded-sm"
                />
            ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center text-[8px] text-gray-500 rounded-sm">
                    {photo.master.format}
                </div>
            )}

            <div className="absolute bottom-0 right-0 left-0 h-1 flex justify-end px-1 space-x-1 translate-y-2 group-hover:translate-y-0 transition-transform">
                {photo.rating > 0 && (
                    <span className="text-[6px] text-yellow-500">
                        {'★'.repeat(photo.rating)}
                    </span>
                )}
            </div>
        </div>
    );
};

export const Filmstrip: React.FC<FilmstripProps> = ({ activePhotoId, onSelectPhoto }) => {
    const virtualCopies = useLiveQuery(() => getAllVirtualCopies());
    const scrollRef = useRef<HTMLDivElement>(null);
    const activeItemRef = useRef<HTMLDivElement>(null);

    // Sort by dateTaken reverse to match Gallery
    const sortedCopies = virtualCopies?.sort((a, b) => b.master.dateTaken.getTime() - a.master.dateTaken.getTime());

    useEffect(() => {
        if (activeItemRef.current && scrollRef.current) {
            activeItemRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
    }, [activePhotoId]);

    if (!sortedCopies) return null;

    return (
        <div className="h-28 bg-pro-panel border-t border-pro-border flex flex-col">
            <div className="flex items-center justify-between px-4 py-1 bg-pro-bg text-[10px] text-gray-500 font-mono uppercase tracking-wider">
                <span>Filmstrip ({sortedCopies.length})</span>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 overflow-x-auto flex items-center p-2 space-x-2 custom-scrollbar"
            >
                {sortedCopies.map(photo => (
                    <div key={photo.id} ref={photo.id === activePhotoId ? activeItemRef : null}>
                        <FilmstripItem
                            photo={photo}
                            isActive={photo.id === activePhotoId}
                            onClick={() => onSelectPhoto(photo)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

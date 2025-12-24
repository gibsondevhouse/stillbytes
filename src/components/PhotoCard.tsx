import React from 'react';
import { Photo } from '@/types';
import { Star, MoreVertical } from 'lucide-react';

interface PhotoCardProps {
    photo: Photo;
    onClick: (photo: Photo) => void;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({ photo, onClick }) => {
    return (
        <div
            onClick={() => onClick(photo)}
            className="group relative bg-[#2a2a2a] rounded-lg overflow-hidden border border-gray-800 hover:border-vintage-accent transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl flex flex-col h-full"
        >
            {/* Thumbnail Container */}
            <div className="aspect-[3/2] overflow-hidden bg-black flex items-center justify-center relative">
                {photo.thumbnail ? (
                    <img
                        src={photo.thumbnail}
                        alt={photo.fileName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="text-gray-600 font-mono text-xs">No Thumbnail</div>
                )}

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-start justify-end p-2">
                    <button className="p-1 hover:bg-white/20 rounded-full transition-colors">
                        <MoreVertical size={16} className="text-white" />
                    </button>
                </div>

                {photo.starred && (
                    <div className="absolute top-2 left-2 bg-black/60 p-1 rounded-full text-yellow-500">
                        <Star size={14} fill="currentColor" />
                    </div>
                )}
            </div>

            {/* Metadata */}
            <div className="p-3 space-y-1">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-gray-400 truncate flex-1" title={photo.fileName}>
                        {photo.fileName}
                    </span>
                    <span className="text-[10px] bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded ml-2">
                        {photo.format}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex space-x-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <span
                                key={s}
                                className={`w-1.5 h-1.5 rounded-full ${s <= photo.rating ? 'bg-vintage-accent' : 'bg-gray-700'
                                    }`}
                            />
                        ))}
                    </div>
                    <span className="text-[10px] text-gray-600 italic">
                        {photo.exif.camera ? photo.exif.camera.split(' ').slice(-1) : ''}
                    </span>
                </div>
            </div>
        </div>
    );
};

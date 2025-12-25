import React from 'react';
import { Photo } from '@/types';
import { Star, MoreVertical, Flag, X } from 'lucide-react';

interface PhotoCardProps {
    photo: Photo;
    selected: boolean;
    onClick: (photo: Photo, metaKey: boolean, shiftKey: boolean) => void;
    onDoubleClick: (photo: Photo) => void;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({ photo, selected, onClick, onDoubleClick }) => {
    return (
        <div
            onClick={(e) => onClick(photo, e.ctrlKey || e.metaKey, e.shiftKey)}
            onDoubleClick={() => onDoubleClick(photo)}
            className={`group relative bg-pro-card rounded-sm overflow-hidden border transition-all duration-150 cursor-pointer flex flex-col h-full 
            ${selected ? 'border-pro-accent ring-1 ring-pro-accent/50' : 'border-transparent hover:border-pro-border'}`}
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
                    <div className="flex flex-col items-center justify-center space-y-2 opacity-50">
                        {/* Placeholder for RAW files without embedded preview extraction in Web Mode */}
                        <div className="border-2 border-gray-700 rounded p-2">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{photo.format}</span>
                        </div>
                    </div>
                )}

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-start justify-end p-2">
                    <button className="p-1 hover:bg-white/20 rounded-full transition-colors">
                        <MoreVertical size={16} className="text-white" />
                    </button>
                </div>

                {/* Color Label Border/Indicator */}
                {photo.colorLabel && (
                    <div className={`absolute bottom-0 left-0 right-0 h-1.5 z-10 
                        ${photo.colorLabel === 'red' ? 'bg-red-500' :
                            photo.colorLabel === 'yellow' ? 'bg-yellow-500' :
                                photo.colorLabel === 'green' ? 'bg-green-500' :
                                    photo.colorLabel === 'blue' ? 'bg-blue-500' :
                                        photo.colorLabel === 'purple' ? 'bg-purple-500' : 'hidden'
                        }`}
                    />
                )}

                {/* Status Icons Overlay */}
                <div className="absolute top-2 left-2 flex flex-col space-y-1">
                    {photo.flag === 'pick' && (
                        <div className="bg-black/60 p-1 rounded-full text-green-400">
                            <Flag size={14} fill="currentColor" />
                        </div>
                    )}
                    {photo.flag === 'reject' && (
                        <div className="bg-black/60 p-1 rounded-full text-red-500">
                            <X size={14} />
                        </div>
                    )}
                    {photo.starred && (
                        <div className="bg-black/60 p-1 rounded-full text-yellow-500">
                            <Star size={14} fill="currentColor" />
                        </div>
                    )}
                </div>
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
                                className={`w-1.5 h-1.5 rounded-full ${s <= photo.rating ? 'bg-pro-accent' : 'bg-pro-border'
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

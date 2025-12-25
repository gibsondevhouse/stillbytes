import React from 'react';
import { Image, Folder, Calendar, Plus, ChevronRight, HardDrive } from 'lucide-react';

interface SidebarLeftProps {
    totalPhotos: number;
    onImportClick: () => void;
}

export const SidebarLeft: React.FC<SidebarLeftProps> = ({ totalPhotos, onImportClick }) => {
    return (
        <div className="w-[260px] bg-pro-panel border-r border-pro-border flex flex-col h-full text-gray-300">
            {/* Branding Area (Optional, or just Title) */}
            <div className="h-9 flex items-center px-3 border-b border-pro-border shrink-0">
                <span className="font-bold text-pro-accent tracking-wider uppercase text-[10px]">Library</span>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">

                {/* Catalog Section */}
                <div className="mb-3">
                    <div className="px-3 py-1 flex items-center justify-between group cursor-pointer text-gray-400 hover:text-white mb-0.5">
                        <div className="flex items-center space-x-1.5">
                            <ChevronRight size={10} className="transform rotate-90" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Catalog</span>
                        </div>
                    </div>

                    <div className="mt-0.5">
                        <div className="px-6 py-1 bg-pro-accent/10 border-l-2 border-pro-accent text-white flex items-center justify-between cursor-pointer">
                            <div className="flex items-center space-x-2">
                                <Image size={12} />
                                <span className="text-[11px]">All Photos</span>
                            </div>
                            <span className="text-[11px] text-gray-500">{totalPhotos}</span>
                        </div>
                        <div className="px-6 py-1 hover:bg-white/5 flex items-center justify-between cursor-pointer text-gray-400">
                            <div className="flex items-center space-x-2">
                                <Calendar size={12} />
                                <span className="text-[11px]">Recent Imports</span>
                            </div>
                        </div>
                        <div className="px-6 py-1 hover:bg-white/5 flex items-center justify-between cursor-pointer text-gray-400">
                            <div className="flex items-center space-x-2">
                                <Folder size={12} />
                                <span className="text-[11px]">Quick Collection</span>
                            </div>
                            <span className="text-[11px] text-gray-500">0</span>
                        </div>
                    </div>
                </div>

                {/* Folders Section */}
                <div className="mb-3">
                    <div className="px-3 py-1 flex items-center justify-between group cursor-pointer text-gray-400 hover:text-white mb-0.5">
                        <div className="flex items-center space-x-1.5">
                            <ChevronRight size={10} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Folders</span>
                        </div>
                        <Plus size={10} className="opacity-0 group-hover:opacity-100" />
                    </div>
                    {/* Placeholder Drive */}
                    <div className="px-6 py-1 text-gray-500 text-[11px] italic">
                        No folders added
                    </div>
                </div>

                {/* Storage Section (Optional) */}
                <div className="mb-6 px-4">
                    <div className="bg-black/20 rounded p-3 border border-white/5">
                        <div className="flex items-center mb-2 space-x-2 text-gray-400">
                            <HardDrive size={12} />
                            <span className="text-[10px] font-bold uppercase">Local Storage</span>
                        </div>
                        <div className="w-full bg-gray-700 h-1 rounded-full overflow-hidden">
                            <div className="bg-pro-accent h-full w-[45%]"></div>
                        </div>
                        <div className="flex justify-between mt-1 text-[9px] text-gray-600 font-mono">
                            <span>245GB Free</span>
                            <span>1TB Total</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* Import Button (Fixed Bottom) */}
            <div className="p-4 border-t border-pro-border shrink-0 bg-pro-panel">
                <button
                    onClick={onImportClick}
                    className="w-full flex items-center justify-center space-x-2 bg-pro-card border border-pro-border hover:bg-pro-border hover:text-white text-gray-300 py-2 rounded-sm transition-all shadow-sm group"
                >
                    <Plus size={14} className="group-hover:text-pro-accent transition-colors" />
                    <span className="text-[11px] font-bold uppercase tracking-wide">Import Photos</span>
                </button>
            </div>
        </div>
    );
};

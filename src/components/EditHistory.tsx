import React from 'react';
import { EditOperation } from '@/types';
import { Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface EditHistoryProps {
    operations: EditOperation[];
    onRestore: (operations: EditOperation[]) => void;
}

export const EditHistory: React.FC<EditHistoryProps> = ({ operations, onRestore }) => {
    // Helper to get a readable name for the operation
    const getOpName = (type: string) => {
        switch (type) {
            case 'exposure': return 'Exposure';
            case 'brightness_contrast': return 'Brightness / Contrast';
            case 'hsl_adjust': return 'HSL Color';
            default: return type;
        }
    };

    // Helper to get a summary of changes
    const getOpSummary = (op: EditOperation) => {
        if (op.type === 'exposure') {
            const p = op.parameters as { exposure: number };
            return `${p.exposure > 0 ? '+' : ''}${p.exposure}`;
        }
        if (op.type === 'brightness_contrast') {
            const p = op.parameters as { brightness: number; contrast: number };
            return `B:${p.brightness} C:${p.contrast}`;
        }
        if (op.type === 'hsl_adjust') {
            const p = op.parameters as { hue: number; saturation: number; lightness: number };
            return `H:${p.hue} S:${p.saturation} L:${p.lightness}`;
        }
        return '';
    };

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-800 flex items-center space-x-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                <Clock size={14} />
                <span>History</span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {/* Original State */}
                <button
                    onClick={() => onRestore([])}
                    className={`w-full text-left p-3 rounded-lg text-xs transition-colors flex items-center space-x-3 ${operations.length === 0 ? 'bg-vintage-accent text-black font-bold' : 'hover:bg-gray-800 text-gray-400'}`}
                >
                    <div className={`w-2 h-2 rounded-full ${operations.length === 0 ? 'bg-black' : 'bg-gray-600'}`} />
                    <span>Original</span>
                </button>

                {/* History Items */}
                {operations.map((op, index) => {
                    // Create a slice up to this operation (inclusive)
                    const stateAtThisPoint = operations.slice(0, index + 1);
                    const isCurrent = index === operations.length - 1;

                    return (
                        <button
                            key={op.id}
                            onClick={() => onRestore(stateAtThisPoint)}
                            className={`w-full text-left p-3 rounded-lg text-xs transition-colors group ${isCurrent ? 'bg-gray-800 text-white border-l-2 border-vintage-accent' : 'hover:bg-gray-800 text-gray-400'}`}
                        >
                            <div className="flex justify-between items-start">
                                <span className="font-medium">{getOpName(op.type)}</span>
                                <span className="text-[10px] opacity-50">{formatDistanceToNow(op.timestamp, { addSuffix: true })}</span>
                            </div>
                            <div className="mt-1 text-[10px] font-mono opacity-70 truncate">
                                {getOpSummary(op)}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

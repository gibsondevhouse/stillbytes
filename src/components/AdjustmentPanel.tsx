import React from 'react';
import { EditOperation, BrightnessContrastOperation, HSLAdjustOperation, ExposureOperation } from '@/types';
import { Sun, Contrast, Palette, RotateCcw } from 'lucide-react';

interface AdjustmentPanelProps {
    operations: EditOperation[];
    onChange: (operations: EditOperation[]) => void;
    onReset: () => void;
    onExport: () => void;
}

export const AdjustmentPanel: React.FC<AdjustmentPanelProps> = ({ operations, onChange, onReset, onExport }) => {
    const findOp = <T extends EditOperation>(type: string): T | undefined =>
        operations.find(op => op.type === type) as T;

    const updateOp = (type: string, parameters: any) => {
        const existing = operations.findIndex(op => op.type === type);
        const newOp: EditOperation = {
            id: crypto.randomUUID(),
            type: type as any,
            timestamp: new Date(),
            version: 1,
            parameters
        };

        const newOps = [...operations];
        if (existing >= 0) {
            newOps[existing] = newOp;
        } else {
            newOps.push(newOp);
        }
        onChange(newOps);
    };

    const bc = findOp<BrightnessContrastOperation>('brightness_contrast')?.parameters || { brightness: 0, contrast: 0 };
    const hsl = findOp<HSLAdjustOperation>('hsl_adjust')?.parameters || { hue: 0, saturation: 0, lightness: 0 };
    const exp = findOp<ExposureOperation>('exposure')?.parameters || { exposure: 0 };

    return (
        <div className="w-80 border-l border-gray-800 bg-[#1a1a1a] flex flex-col h-full overflow-y-auto">
            <header className="p-4 border-b border-gray-800 flex items-center justify-between">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Adjustments</h3>
                <button
                    onClick={onReset}
                    className="p-1.5 hover:bg-white/10 rounded-full text-gray-500 hover:text-white transition-colors"
                    title="Reset all"
                >
                    <RotateCcw size={14} />
                </button>
            </header>

            <div className="p-6 space-y-8">
                {/* Exposure */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs font-medium text-gray-300">
                        <div className="flex items-center space-x-2">
                            <Sun size={14} className="text-gray-500" />
                            <span>Exposure</span>
                        </div>
                        <span className="font-mono text-vintage-accent">{(exp.exposure > 0 ? '+' : '') + exp.exposure.toFixed(2)}</span>
                    </div>
                    <input
                        type="range" min="-3" max="3" step="0.05"
                        value={exp.exposure}
                        onChange={(e) => updateOp('exposure', { exposure: parseFloat(e.target.value) })}
                        className="w-full accent-vintage-accent bg-gray-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                </div>

                {/* Brightness & Contrast */}
                <div className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-xs text-gray-300">
                            <div className="flex items-center space-x-2">
                                <Sun size={14} className="text-gray-500" />
                                <span>Brightness</span>
                            </div>
                            <span className="font-mono">{bc.brightness}</span>
                        </div>
                        <input
                            type="range" min="-100" max="100"
                            value={bc.brightness}
                            onChange={(e) => updateOp('brightness_contrast', { ...bc, brightness: parseInt(e.target.value) })}
                            className="w-full accent-vintage-accent bg-gray-800 h-1 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-xs text-gray-300">
                            <div className="flex items-center space-x-2">
                                <Contrast size={14} className="text-gray-500" />
                                <span>Contrast</span>
                            </div>
                            <span className="font-mono">{bc.contrast}</span>
                        </div>
                        <input
                            type="range" min="-100" max="100"
                            value={bc.contrast}
                            onChange={(e) => updateOp('brightness_contrast', { ...bc, contrast: parseInt(e.target.value) })}
                            className="w-full accent-vintage-accent bg-gray-800 h-1 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                </div>

                {/* HSL */}
                <div className="pt-4 border-t border-gray-800/50 space-y-6">
                    <div className="flex items-center space-x-2 text-xs font-bold text-gray-500 uppercase">
                        <Palette size={14} />
                        <span>Color (HSL)</span>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-xs text-gray-300">
                            <span>Hue</span>
                            <span className="font-mono">{hsl.hue}°</span>
                        </div>
                        <input
                            type="range" min="-180" max="180"
                            value={hsl.hue}
                            onChange={(e) => updateOp('hsl_adjust', { ...hsl, hue: parseInt(e.target.value) })}
                            className="w-full accent-vintage-accent bg-gray-800 h-1 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-xs text-gray-300">
                            <span>Saturation</span>
                            <span className="font-mono">{hsl.saturation}</span>
                        </div>
                        <input
                            type="range" min="-100" max="100"
                            value={hsl.saturation}
                            onChange={(e) => updateOp('hsl_adjust', { ...hsl, saturation: parseInt(e.target.value) })}
                            className="w-full accent-vintage-accent bg-gray-800 h-1 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-xs text-gray-300">
                            <span>Lightness</span>
                            <span className="font-mono">{hsl.lightness}</span>
                        </div>
                        <input
                            type="range" min="-100" max="100"
                            value={hsl.lightness}
                            onChange={(e) => updateOp('hsl_adjust', { ...hsl, lightness: parseInt(e.target.value) })}
                            className="w-full accent-vintage-accent bg-gray-800 h-1 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-auto p-4 border-t border-gray-800 flex flex-col space-y-2">
                <button
                    onClick={onExport}
                    className="w-full py-2 bg-white text-black rounded-lg font-bold text-xs hover:bg-gray-200 transition-colors"
                >
                    Export Final JPG
                </button>
            </div>
        </div>
    );
};

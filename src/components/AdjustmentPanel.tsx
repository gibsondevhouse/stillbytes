import React, { useState } from 'react';
import { EditOperation, BrightnessContrastOperation, HSLAdjustOperation, ExposureOperation } from '@/types';
import { Sun, RotateCcw, Sliders, History } from 'lucide-react';
import { HSLSlider } from './HSLSlider';
import { BrightnessContrast } from './BrightnessContrast';
import { EditHistory } from './EditHistory';

interface AdjustmentPanelProps {
    operations: EditOperation[];
    onChange: (operations: EditOperation[]) => void;
    onReset: () => void;
    onExport: () => void;
}

type Tab = 'adjust' | 'history';

export const AdjustmentPanel: React.FC<AdjustmentPanelProps> = ({ operations, onChange, onReset, onExport }) => {
    const [activeTab, setActiveTab] = useState<Tab>('adjust');

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
        <div className="w-[300px] border-l border-pro-border bg-pro-panel flex flex-col h-full overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex border-b border-pro-border shrink-0 h-8">
                <button
                    onClick={() => setActiveTab('adjust')}
                    className={`flex-1 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-colors border-r border-pro-border ${activeTab === 'adjust' ? 'bg-pro-card text-pro-accent' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <Sliders size={12} />
                    <span>Adjust</span>
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex-1 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-colors ${activeTab === 'history' ? 'bg-pro-card text-pro-accent' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <History size={12} />
                    <span>History</span>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {activeTab === 'adjust' ? (
                    <>
                        <header className="px-3 py-2 border-b border-pro-border flex items-center justify-between shrink-0 bg-pro-panel">
                            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Global</h3>
                            <button
                                onClick={onReset}
                                className="p-1 hover:bg-white/10 rounded-sm text-gray-500 hover:text-white transition-colors"
                                title="Reset all"
                            >
                                <RotateCcw size={10} />
                            </button>
                        </header>

                        <div className="p-3 space-y-4">
                            {/* Exposure */}
                            <div className="space-y-1">
                                <div className="flex justify-between items-center text-[10px] font-medium text-gray-400">
                                    <div className="flex items-center space-x-1.5">
                                        <Sun size={10} />
                                        <span>Exposure</span>
                                    </div>
                                    <span className="font-mono text-pro-accent text-[10px]">{(exp.exposure > 0 ? '+' : '') + exp.exposure.toFixed(2)}</span>
                                </div>
                                <input
                                    type="range" min="-3" max="3" step="0.05"
                                    value={exp.exposure}
                                    onChange={(e) => updateOp('exposure', { exposure: parseFloat(e.target.value) })}
                                    className="range-pro"
                                />
                            </div>

                            <BrightnessContrast
                                values={bc}
                                onChange={(vals) => updateOp('brightness_contrast', vals)}
                            />

                            <HSLSlider
                                values={hsl}
                                onChange={(vals) => updateOp('hsl_adjust', vals)}
                            />
                        </div>
                    </>
                ) : (
                    <EditHistory
                        operations={operations}
                        onRestore={onChange}
                    />
                )}
            </div>

            <div className="mt-auto p-3 border-t border-pro-border flex flex-col space-y-2 bg-pro-panel shrink-0">
                <button
                    onClick={onExport}
                    className="w-full py-1.5 bg-white text-black rounded-sm font-bold text-[10px] uppercase tracking-wide hover:bg-gray-200 transition-colors border border-transparent"
                >
                    Export Final JPG
                </button>
            </div>
        </div>
    );
};

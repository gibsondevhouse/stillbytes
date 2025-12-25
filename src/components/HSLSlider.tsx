import React from 'react';
import { Palette } from 'lucide-react';

interface HSLValues {
    hue: number;
    saturation: number;
    lightness: number;
}

interface HSLSliderProps {
    values: HSLValues;
    onChange: (values: HSLValues) => void;
}

export const HSLSlider: React.FC<HSLSliderProps> = ({ values, onChange }) => {
    const handleChange = (key: keyof HSLValues, value: number) => {
        onChange({ ...values, [key]: value });
    };

    return (
        <div className="pt-2 border-t border-pro-border space-y-3">
            <div className="flex items-center space-x-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                <Palette size={10} />
                <span>Color (HSL)</span>
            </div>

            <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] text-gray-400">
                    <span>Hue</span>
                    <span className="font-mono text-pro-accent">{values.hue}°</span>
                </div>
                <input
                    type="range" min="-180" max="180"
                    value={values.hue}
                    onChange={(e) => handleChange('hue', parseInt(e.target.value))}
                    className="range-pro"
                />
            </div>

            <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] text-gray-400">
                    <span>Saturation</span>
                    <span className="font-mono text-pro-accent">{values.saturation}</span>
                </div>
                <input
                    type="range" min="-100" max="100"
                    value={values.saturation}
                    onChange={(e) => handleChange('saturation', parseInt(e.target.value))}
                    className="range-pro"
                />
            </div>

            <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] text-gray-400">
                    <span>Lightness</span>
                    <span className="font-mono text-pro-accent">{values.lightness}</span>
                </div>
                <input
                    type="range" min="-100" max="100"
                    value={values.lightness}
                    onChange={(e) => handleChange('lightness', parseInt(e.target.value))}
                    className="range-pro"
                />
            </div>
        </div>
    );
};

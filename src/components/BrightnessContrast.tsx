import React from 'react';
import { Sun, Contrast } from 'lucide-react';

interface BCValues {
    brightness: number;
    contrast: number;
}

interface BrightnessContrastProps {
    values: BCValues;
    onChange: (values: BCValues) => void;
}

export const BrightnessContrast: React.FC<BrightnessContrastProps> = ({ values, onChange }) => {
    const handleChange = (key: keyof BCValues, value: number) => {
        onChange({ ...values, [key]: value });
    };

    return (
        <div className="space-y-3">
            <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] text-gray-400">
                    <div className="flex items-center space-x-1.5">
                        <Sun size={10} className="text-gray-500" />
                        <span>Brightness</span>
                    </div>
                    <span className="font-mono text-pro-accent">{values.brightness}</span>
                </div>
                <input
                    type="range" min="-100" max="100"
                    value={values.brightness}
                    onChange={(e) => handleChange('brightness', parseInt(e.target.value))}
                    className="range-pro"
                />
            </div>

            <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] text-gray-400">
                    <div className="flex items-center space-x-1.5">
                        <Contrast size={10} className="text-gray-500" />
                        <span>Contrast</span>
                    </div>
                    <span className="font-mono text-pro-accent">{values.contrast}</span>
                </div>
                <input
                    type="range" min="-100" max="100"
                    value={values.contrast}
                    onChange={(e) => handleChange('contrast', parseInt(e.target.value))}
                    className="range-pro"
                />
            </div>
        </div>
    );
};
